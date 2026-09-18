import { MEAL_PLANS, VILLAS, type MealPlan } from '../src/data/inn'
import { addDays, eachNight, quoteStay, todayJst } from '../src/lib/booking'
import {
  changePassword,
  login,
  logout,
  requireAdmin,
  writeAudit,
  type AdminUser,
} from './auth'
import {
  isAvailable,
  parseBookingBody,
  serializeBooking,
  validateGuest,
  type BookingRow,
} from './bookings'

const STATUSES = ['confirmed', 'cancelled', 'completed', 'noshow'] as const
const INQUIRY_STATUSES = ['new', 'in_progress', 'closed'] as const
const SOURCES = ['web', 'phone', 'walkin', 'other'] as const

function jsonError(message: string, status = 400) {
  return Response.json({ error: message }, { status })
}

async function readJson(request: Request) {
  try {
    return await request.json()
  } catch {
    return null
  }
}

function asRecord(data: unknown) {
  return data && typeof data === 'object' ? (data as Record<string, unknown>) : {}
}

function str(value: unknown) {
  return typeof value === 'string' ? value : ''
}

type InquiryRow = {
  id: string
  name: string
  email: string
  phone: string | null
  message: string
  created_at: string
  status: string
  staff_notes: string | null
  updated_at: string | null
}

function serializeInquiry(row: InquiryRow) {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone ?? '',
    message: row.message,
    createdAt: row.created_at,
    status: row.status || 'new',
    staffNotes: row.staff_notes ?? '',
    updatedAt: row.updated_at ?? '',
  }
}

async function overview(env: Env) {
  const today = todayJst()
  const weekEnd = addDays(today, 7)
  const month = today.slice(0, 7)
  const [year, mon] = month.split('-').map(Number)
  const monthStart = `${month}-01`
  const monthEnd = mon === 12 ? `${year + 1}-01-01` : `${year}-${String(mon + 1).padStart(2, '0')}-01`

  const [
    arrivals,
    departures,
    staying,
    upcoming,
    newInquiries,
    monthStats,
    pendingInquiries,
  ] = await env.DB.batch([
    env.DB.prepare(
      `SELECT * FROM bookings WHERE check_in = ? AND status = 'confirmed' ORDER BY villa_id`,
    ).bind(today),
    env.DB.prepare(
      `SELECT * FROM bookings WHERE check_out = ? AND status IN ('confirmed', 'completed') ORDER BY villa_id`,
    ).bind(today),
    env.DB.prepare(
      `SELECT * FROM bookings WHERE check_in <= ? AND check_out > ? AND status = 'confirmed' ORDER BY villa_id`,
    ).bind(today, today),
    env.DB.prepare(
      `SELECT * FROM bookings WHERE check_in > ? AND check_in < ? AND status = 'confirmed' ORDER BY check_in, villa_id LIMIT 12`,
    ).bind(today, weekEnd),
    env.DB.prepare(`SELECT COUNT(*) AS n FROM inquiries WHERE status = 'new'`),
    env.DB.prepare(
      `SELECT COUNT(*) AS n, COALESCE(SUM(total), 0) AS revenue
       FROM bookings
       WHERE status IN ('confirmed', 'completed') AND check_in >= ? AND check_in < ?`,
    ).bind(monthStart, monthEnd),
    env.DB.prepare(`SELECT COUNT(*) AS n FROM inquiries WHERE status != 'closed'`),
  ])

  const monthBookings = await env.DB.prepare(
    `SELECT villa_id, check_in, check_out FROM bookings
     WHERE status NOT IN ('cancelled', 'noshow') AND check_in < ? AND check_out > ?`,
  )
    .bind(monthEnd, monthStart)
    .all<{ villa_id: string; check_in: string; check_out: string }>()

  const nightsInMonth = eachNight(monthStart, monthEnd).length
  let occupiedNights = 0
  for (const row of monthBookings.results) {
    for (const night of eachNight(row.check_in, row.check_out)) {
      if (night >= monthStart && night < monthEnd) occupiedNights += 1
    }
  }
  const capacityNights = nightsInMonth * VILLAS.length

  return Response.json({
    today,
    month,
    arrivals: (arrivals.results as BookingRow[]).map((row) => serializeBooking(row, true)),
    departures: (departures.results as BookingRow[]).map((row) => serializeBooking(row, true)),
    staying: (staying.results as BookingRow[]).map((row) => serializeBooking(row, true)),
    upcoming: (upcoming.results as BookingRow[]).map((row) => serializeBooking(row, true)),
    newInquiries: Number((newInquiries.results[0] as { n: number } | undefined)?.n ?? 0),
    openInquiries: Number((pendingInquiries.results[0] as { n: number } | undefined)?.n ?? 0),
    monthBookings: Number((monthStats.results[0] as { n: number } | undefined)?.n ?? 0),
    monthRevenue: Number((monthStats.results[0] as { revenue: number } | undefined)?.revenue ?? 0),
    occupancy: capacityNights === 0 ? 0 : Math.round((occupiedNights / capacityNights) * 1000) / 10,
  })
}

async function listBookings(env: Env, url: URL) {
  const q = (url.searchParams.get('q') ?? '').trim()
  const villaId = url.searchParams.get('villa') ?? ''
  const status = url.searchParams.get('status') ?? ''
  const from = url.searchParams.get('from') ?? ''
  const to = url.searchParams.get('to') ?? ''
  const page = Math.max(1, Number(url.searchParams.get('page') ?? '1') || 1)
  const limit = Math.min(100, Math.max(10, Number(url.searchParams.get('limit') ?? '30') || 30))
  const offset = (page - 1) * limit

  const where: string[] = []
  const binds: (string | number)[] = []
  if (q) {
    where.push(`(guest_name LIKE ? OR email LIKE ? OR phone LIKE ? OR confirmation_code LIKE ?)`)
    const like = `%${q}%`
    binds.push(like, like, like, like)
  }
  if (villaId && VILLAS.some((villa) => villa.id === villaId)) {
    where.push('villa_id = ?')
    binds.push(villaId)
  }
  if (status && STATUSES.includes(status as (typeof STATUSES)[number])) {
    where.push('status = ?')
    binds.push(status)
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(from)) {
    where.push('check_out > ?')
    binds.push(from)
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(to)) {
    where.push('check_in < ?')
    binds.push(to)
  }
  const clause = where.length ? `WHERE ${where.join(' AND ')}` : ''

  const count = await env.DB.prepare(`SELECT COUNT(*) AS n FROM bookings ${clause}`)
    .bind(...binds)
    .first<{ n: number }>()
  const rows = await env.DB.prepare(
    `SELECT * FROM bookings ${clause} ORDER BY check_in DESC, created_at DESC LIMIT ? OFFSET ?`,
  )
    .bind(...binds, limit, offset)
    .all<BookingRow>()

  return Response.json({
    bookings: rows.results.map((row) => serializeBooking(row, true)),
    total: count?.n ?? 0,
    page,
    limit,
  })
}

async function createAdminBooking(env: Env, user: AdminUser, body: unknown) {
  const parsed = parseBookingBody(body)
  if (parsed instanceof Response) return parsed
  const record = asRecord(body)
  const source = SOURCES.includes(str(record.source) as (typeof SOURCES)[number])
    ? str(record.source)
    : 'phone'

  const quote = quoteStay({
    villaId: parsed.villaId,
    checkIn: parsed.checkIn,
    checkOut: parsed.checkOut,
    guests: parsed.guests,
    mealPlan: parsed.mealPlan,
    allowPast: true,
  })
  if (typeof quote === 'string') return jsonError(quote)

  const guestName = parsed.guestName.trim()
  const email = parsed.email.trim()
  const phone = parsed.phone.trim()
  const guestError = validateGuest(guestName, email, phone)
  if (guestError) return jsonError(guestError)

  const available = await isAvailable(env, quote.villaId, quote.checkIn, quote.checkOut)
  if (!available) return jsonError('選択された日程は満室または休業です。', 409)

  const id = crypto.randomUUID()
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  const bytes = crypto.getRandomValues(new Uint8Array(6))
  const code = `SOMA-${[...bytes].map((byte) => alphabet[byte % alphabet.length]).join('')}`

  await env.DB.prepare(
    `INSERT INTO bookings (
      id, confirmation_code, villa_id, check_in, check_out, guests,
      guest_name, guest_kana, email, phone, meal_plan, notes,
      lodging, meals, tax, total, status, staff_notes, source, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'confirmed', ?, ?, datetime('now'))`,
  )
    .bind(
      id,
      code,
      quote.villaId,
      quote.checkIn,
      quote.checkOut,
      quote.guests,
      guestName,
      parsed.guestKana?.trim() || null,
      email,
      phone,
      quote.mealPlan,
      parsed.notes?.trim() || null,
      quote.lodging,
      quote.meals,
      quote.tax,
      quote.total,
      str(record.staffNotes).trim() || null,
      source,
    )
    .run()

  await writeAudit(env, user, 'booking.create', 'booking', id, JSON.stringify({ code, source }))
  const row = await env.DB.prepare(`SELECT * FROM bookings WHERE id = ?`).bind(id).first<BookingRow>()
  return Response.json({ booking: serializeBooking(row!, true) }, { status: 201 })
}

async function patchBooking(env: Env, user: AdminUser, id: string, body: unknown) {
  const row = await env.DB.prepare(`SELECT * FROM bookings WHERE id = ?`).bind(id).first<BookingRow>()
  if (!row) return jsonError('ご予約が見つかりません。', 404)
  const record = asRecord(body)

  let status = row.status
  if (record.status !== undefined) {
    const next = str(record.status)
    if (!STATUSES.includes(next as (typeof STATUSES)[number])) return jsonError('予約状態が正しくありません。')
    status = next
  }

  const villaId = str(record.villaId) || row.villa_id
  const checkIn = str(record.checkIn) || row.check_in
  const checkOut = str(record.checkOut) || row.check_out
  const guests = record.guests !== undefined ? Number(record.guests) : row.guests
  const mealPlan = (str(record.mealPlan) || row.meal_plan) as MealPlan
  if (!MEAL_PLANS.some((plan) => plan.id === mealPlan)) return jsonError('お食事プランを選択してください。')

  const datesChanged =
    villaId !== row.villa_id || checkIn !== row.check_in || checkOut !== row.check_out || guests !== row.guests || mealPlan !== row.meal_plan

  let lodging = row.lodging
  let meals = row.meals
  let tax = row.tax
  let total = row.total

  if (datesChanged) {
    const quote = quoteStay({ villaId, checkIn, checkOut, guests, mealPlan, allowPast: true })
    if (typeof quote === 'string') return jsonError(quote)
    if (status !== 'cancelled' && status !== 'noshow') {
      const available = await isAvailable(env, quote.villaId, quote.checkIn, quote.checkOut, row.id)
      if (!available) return jsonError('選択された日程は満室または休業です。', 409)
    }
    lodging = quote.lodging
    meals = quote.meals
    tax = quote.tax
    total = quote.total
  } else if (status === 'confirmed' && row.status !== 'confirmed') {
    const available = await isAvailable(env, villaId, checkIn, checkOut, row.id)
    if (!available) return jsonError('この日程は他の予約または休業と重なっています。', 409)
  }

  const guestName = record.guestName !== undefined ? str(record.guestName).trim() : row.guest_name
  const email = record.email !== undefined ? str(record.email).trim() : row.email
  const phone = record.phone !== undefined ? str(record.phone).trim() : row.phone
  const guestError = validateGuest(guestName, email, phone)
  if (guestError) return jsonError(guestError)

  const cancelledAt = status === 'cancelled' ? row.cancelled_at || new Date().toISOString() : null

  await env.DB.prepare(
    `UPDATE bookings SET
      villa_id = ?, check_in = ?, check_out = ?, guests = ?, guest_name = ?, guest_kana = ?,
      email = ?, phone = ?, meal_plan = ?, notes = ?, lodging = ?, meals = ?, tax = ?, total = ?,
      status = ?, staff_notes = ?, source = ?, updated_at = datetime('now'), cancelled_at = ?
     WHERE id = ?`,
  )
    .bind(
      villaId,
      checkIn,
      checkOut,
      guests,
      guestName,
      record.guestKana !== undefined ? str(record.guestKana).trim() || null : row.guest_kana,
      email,
      phone,
      mealPlan,
      record.notes !== undefined ? str(record.notes).trim() || null : row.notes,
      lodging,
      meals,
      tax,
      total,
      status,
      record.staffNotes !== undefined ? str(record.staffNotes).trim() || null : row.staff_notes ?? null,
      record.source !== undefined && SOURCES.includes(str(record.source) as (typeof SOURCES)[number])
        ? str(record.source)
        : row.source || 'web',
      cancelledAt,
      id,
    )
    .run()

  await writeAudit(env, user, 'booking.update', 'booking', id, JSON.stringify({ status, datesChanged }))
  const updated = await env.DB.prepare(`SELECT * FROM bookings WHERE id = ?`).bind(id).first<BookingRow>()
  return Response.json({ booking: serializeBooking(updated!, true) })
}

async function calendar(env: Env, url: URL) {
  const villaId = url.searchParams.get('villa') ?? ''
  const month = url.searchParams.get('month') ?? ''
  const villa = VILLAS.find((item) => item.id === villaId)
  if (!villa) return jsonError('客室が見つかりません。', 404)
  if (!/^\d{4}-\d{2}$/.test(month)) return jsonError('月の指定が正しくありません。')

  const start = `${month}-01`
  const [year, mon] = month.split('-').map(Number)
  const next = mon === 12 ? `${year + 1}-01-01` : `${year}-${String(mon + 1).padStart(2, '0')}-01`

  const [booked, blocked] = await env.DB.batch([
    env.DB.prepare(
      `SELECT * FROM bookings WHERE villa_id = ? AND status NOT IN ('cancelled', 'noshow')
       AND check_in < ? AND check_out > ?`,
    ).bind(villaId, next, start),
    env.DB.prepare(`SELECT date, reason FROM blocked_dates WHERE villa_id = ? AND date >= ? AND date < ?`).bind(
      villaId,
      start,
      next,
    ),
  ])

  const nights = eachNight(start, next)
  const bookingByNight = new Map<string, ReturnType<typeof serializeBooking>>()
  for (const row of booked.results as BookingRow[]) {
    const dto = serializeBooking(row, true)
    for (const night of eachNight(row.check_in, row.check_out)) bookingByNight.set(night, dto)
  }
  const blockByNight = new Map((blocked.results as { date: string; reason: string | null }[]).map((row) => [row.date, row.reason ?? '']))

  return Response.json({
    villaId,
    villaName: villa.name,
    month,
    days: nights.map((date) => ({
      date,
      booking: bookingByNight.get(date) ?? null,
      blockedReason: blockByNight.has(date) ? blockByNight.get(date) : null,
    })),
  })
}

async function setBlocks(env: Env, user: AdminUser, body: unknown, remove = false) {
  const record = asRecord(body)
  const villaId = str(record.villaId)
  const from = str(record.from)
  const to = str(record.to) || from
  const reason = str(record.reason).trim() || '休業'
  if (!VILLAS.some((villa) => villa.id === villaId)) return jsonError('客室が見つかりません。', 404)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(from) || !/^\d{4}-\d{2}-\d{2}$/.test(to)) {
    return jsonError('日付の形式が正しくありません。')
  }
  const last = to < from ? from : to
  const dates = eachNight(from, addDays(last, 1))
  if (!dates.length) return jsonError('日付を指定してください。')

  if (!remove) {
    const occupied = await env.DB.prepare(
      `SELECT confirmation_code, guest_name, check_in, check_out FROM bookings
       WHERE villa_id = ? AND status NOT IN ('cancelled', 'noshow') AND check_in < ? AND check_out > ?`,
    )
      .bind(villaId, addDays(last, 1), from)
      .first()
    if (occupied) return jsonError('予約が入っている日は休業にできません。先に予約を変更してください。', 409)

    const statements = dates.map((date) =>
      env.DB.prepare(`INSERT OR REPLACE INTO blocked_dates (villa_id, date, reason) VALUES (?, ?, ?)`).bind(
        villaId,
        date,
        reason,
      ),
    )
    await env.DB.batch(statements)
    await writeAudit(env, user, 'block.create', 'blocked_dates', villaId, JSON.stringify({ from, to: last, reason }))
    return Response.json({ ok: true, dates })
  }

  const statements = dates.map((date) =>
    env.DB.prepare(`DELETE FROM blocked_dates WHERE villa_id = ? AND date = ?`).bind(villaId, date),
  )
  await env.DB.batch(statements)
  await writeAudit(env, user, 'block.delete', 'blocked_dates', villaId, JSON.stringify({ from, to: last }))
  return Response.json({ ok: true, dates })
}

async function listInquiries(env: Env, url: URL) {
  const status = url.searchParams.get('status') ?? ''
  const q = (url.searchParams.get('q') ?? '').trim()
  const where: string[] = []
  const binds: string[] = []
  if (status && INQUIRY_STATUSES.includes(status as (typeof INQUIRY_STATUSES)[number])) {
    where.push('status = ?')
    binds.push(status)
  }
  if (q) {
    where.push(`(name LIKE ? OR email LIKE ? OR message LIKE ?)`)
    const like = `%${q}%`
    binds.push(like, like, like)
  }
  const clause = where.length ? `WHERE ${where.join(' AND ')}` : ''
  const rows = await env.DB.prepare(`SELECT * FROM inquiries ${clause} ORDER BY created_at DESC LIMIT 200`)
    .bind(...binds)
    .all<InquiryRow>()
  return Response.json({ inquiries: rows.results.map(serializeInquiry) })
}

async function patchInquiry(env: Env, user: AdminUser, id: string, body: unknown) {
  const row = await env.DB.prepare(`SELECT * FROM inquiries WHERE id = ?`).bind(id).first<InquiryRow>()
  if (!row) return jsonError('お問い合わせが見つかりません。', 404)
  const record = asRecord(body)
  const status =
    record.status !== undefined && INQUIRY_STATUSES.includes(str(record.status) as (typeof INQUIRY_STATUSES)[number])
      ? str(record.status)
      : row.status || 'new'
  const staffNotes = record.staffNotes !== undefined ? str(record.staffNotes).trim() || null : row.staff_notes
  await env.DB.prepare(
    `UPDATE inquiries SET status = ?, staff_notes = ?, updated_at = datetime('now') WHERE id = ?`,
  )
    .bind(status, staffNotes, id)
    .run()
  await writeAudit(env, user, 'inquiry.update', 'inquiry', id, JSON.stringify({ status }))
  const updated = await env.DB.prepare(`SELECT * FROM inquiries WHERE id = ?`).bind(id).first<InquiryRow>()
  return Response.json({ inquiry: serializeInquiry(updated!) })
}

async function listAudit(env: Env, url: URL) {
  const action = (url.searchParams.get('action') ?? '').trim()
  if (action) {
    const rows = await env.DB.prepare(
      `SELECT * FROM admin_audit WHERE action = ? ORDER BY created_at DESC LIMIT 200`,
    )
      .bind(action)
      .all()
    return Response.json({ events: rows.results })
  }
  const rows = await env.DB.prepare(`SELECT * FROM admin_audit ORDER BY created_at DESC LIMIT 200`).all()
  return Response.json({ events: rows.results })
}

export async function handleAdmin(request: Request, env: Env) {
  const url = new URL(request.url)
  const { pathname } = url

  if (pathname === '/api/admin/login' && request.method === 'POST') {
    const body = asRecord(await readJson(request))
    return login(env, request, str(body.username), str(body.password))
  }

  const auth = await requireAdmin(env, request)
  if (auth instanceof Response) return auth
  const user = auth

  if (pathname === '/api/admin/logout' && request.method === 'POST') {
    return logout(env, request, user)
  }
  if (pathname === '/api/admin/me' && request.method === 'GET') {
    return Response.json({ user })
  }
  if (pathname === '/api/admin/password' && request.method === 'POST') {
    const body = asRecord(await readJson(request))
    return changePassword(env, request, user, str(body.currentPassword), str(body.newPassword))
  }
  if (pathname === '/api/admin/overview' && request.method === 'GET') {
    return overview(env)
  }
  if (pathname === '/api/admin/bookings' && request.method === 'GET') {
    return listBookings(env, url)
  }
  if (pathname === '/api/admin/bookings' && request.method === 'POST') {
    return createAdminBooking(env, user, await readJson(request))
  }
  if (pathname === '/api/admin/quote' && request.method === 'POST') {
    const record = asRecord(await readJson(request))
    const quote = quoteStay({
      villaId: str(record.villaId),
      checkIn: str(record.checkIn),
      checkOut: str(record.checkOut),
      guests: Number(record.guests),
      mealPlan: str(record.mealPlan) as MealPlan,
      allowPast: true,
    })
    if (typeof quote === 'string') return jsonError(quote)
    const excludeId = str(record.excludeBookingId)
    const available = await isAvailable(env, quote.villaId, quote.checkIn, quote.checkOut, excludeId)
    return Response.json({ quote, available })
  }
  if (pathname === '/api/admin/calendar' && request.method === 'GET') {
    return calendar(env, url)
  }
  if (pathname === '/api/admin/blocks' && request.method === 'POST') {
    return setBlocks(env, user, await readJson(request), false)
  }
  if (pathname === '/api/admin/blocks' && request.method === 'DELETE') {
    return setBlocks(env, user, await readJson(request), true)
  }
  if (pathname === '/api/admin/inquiries' && request.method === 'GET') {
    return listInquiries(env, url)
  }
  if (pathname === '/api/admin/audit' && request.method === 'GET') {
    return listAudit(env, url)
  }

  const booking = pathname.match(/^\/api\/admin\/bookings\/([^/]+)$/)
  if (booking && request.method === 'GET') {
    const row = await env.DB.prepare(`SELECT * FROM bookings WHERE id = ? OR confirmation_code = ?`)
      .bind(decodeURIComponent(booking[1]), decodeURIComponent(booking[1]))
      .first<BookingRow>()
    if (!row) return jsonError('ご予約が見つかりません。', 404)
    return Response.json({ booking: serializeBooking(row, true) })
  }
  if (booking && request.method === 'PATCH') {
    return patchBooking(env, user, decodeURIComponent(booking[1]), await readJson(request))
  }

  const inquiry = pathname.match(/^\/api\/admin\/inquiries\/([^/]+)$/)
  if (inquiry && request.method === 'GET') {
    const row = await env.DB.prepare(`SELECT * FROM inquiries WHERE id = ?`)
      .bind(decodeURIComponent(inquiry[1]))
      .first<InquiryRow>()
    if (!row) return jsonError('お問い合わせが見つかりません。', 404)
    return Response.json({ inquiry: serializeInquiry(row) })
  }
  if (inquiry && request.method === 'PATCH') {
    return patchInquiry(env, user, decodeURIComponent(inquiry[1]), await readJson(request))
  }

  return jsonError('Not found', 404)
}
