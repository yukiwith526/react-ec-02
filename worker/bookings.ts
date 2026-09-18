import { getMealPlan, VILLAS, type MealPlan } from '../src/data/inn'
import { eachNight, nightCount, quoteStay } from '../src/lib/booking'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE_RE = /^[0-9+\-() ]{8,20}$/

export type BookingStatus = 'confirmed' | 'cancelled' | 'completed' | 'noshow'

export type BookingRow = {
  id: string
  confirmation_code: string
  villa_id: string
  check_in: string
  check_out: string
  guests: number
  guest_name: string
  guest_kana: string | null
  email: string
  phone: string
  meal_plan: MealPlan
  notes: string | null
  lodging: number
  meals: number
  tax: number
  total: number
  status: string
  created_at: string
  staff_notes?: string | null
  source?: string | null
  updated_at?: string | null
  cancelled_at?: string | null
}

export type CreateBookingInput = {
  villaId: string
  checkIn: string
  checkOut: string
  guests: number
  guestName: string
  guestKana?: string
  email: string
  phone: string
  mealPlan: MealPlan
  notes?: string
}

function jsonError(message: string, status = 400) {
  return Response.json({ error: message }, { status })
}

function confirmationCode() {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  const bytes = new Uint8Array(6)
  crypto.getRandomValues(bytes)
  return `SOMA-${[...bytes].map((byte) => alphabet[byte % alphabet.length]).join('')}`
}

export function validateGuest(guestName: string, email: string, phone: string) {
  if (guestName.trim().length < 2) return 'お名前を入力してください。'
  if (!EMAIL_RE.test(email.trim())) return 'メールアドレスの形式が正しくありません。'
  if (!PHONE_RE.test(phone.trim())) return '電話番号の形式が正しくありません。'
  return null
}

export function serializeBooking(row: BookingRow, includeStaff = false) {
  const villa = VILLAS.find((item) => item.id === row.villa_id)
  const plan = getMealPlan(row.meal_plan)
  return {
    id: row.id,
    confirmationCode: row.confirmation_code,
    villaId: row.villa_id,
    villaName: villa?.name ?? row.villa_id,
    checkIn: row.check_in,
    checkOut: row.check_out,
    nights: nightCount(row.check_in, row.check_out),
    guests: row.guests,
    mealPlan: row.meal_plan,
    mealPlanName: plan?.name ?? row.meal_plan,
    lodging: row.lodging,
    meals: row.meals,
    tax: row.tax,
    total: row.total,
    guestName: row.guest_name,
    guestKana: row.guest_kana ?? '',
    email: row.email,
    phone: row.phone,
    notes: row.notes ?? '',
    status: row.status,
    createdAt: row.created_at,
    source: row.source || 'web',
    updatedAt: row.updated_at ?? '',
    cancelledAt: row.cancelled_at ?? '',
    staffNotes: includeStaff ? (row.staff_notes ?? '') : undefined,
    perNight: [] as { date: string; rate: number; weekend: boolean }[],
  }
}

export async function occupiedDates(env: Env, villaId: string, from: string, to: string, excludeBookingId = '') {
  const [booked, blocked] = await env.DB.batch([
    env.DB.prepare(
      `SELECT check_in, check_out FROM bookings
       WHERE villa_id = ? AND status NOT IN ('cancelled', 'noshow')
         AND check_in < ? AND check_out > ? AND id != ?`,
    ).bind(villaId, to, from, excludeBookingId),
    env.DB.prepare(
      `SELECT date FROM blocked_dates WHERE villa_id = ? AND date >= ? AND date < ?`,
    ).bind(villaId, from, to),
  ])

  const occupied = new Set<string>()
  for (const row of booked.results as { check_in: string; check_out: string }[]) {
    for (const night of eachNight(row.check_in, row.check_out)) occupied.add(night)
  }
  for (const row of blocked.results as { date: string }[]) occupied.add(row.date)
  return occupied
}

export async function isAvailable(
  env: Env,
  villaId: string,
  checkIn: string,
  checkOut: string,
  excludeBookingId = '',
) {
  const occupied = await occupiedDates(env, villaId, checkIn, checkOut, excludeBookingId)
  return eachNight(checkIn, checkOut).every((night) => !occupied.has(night))
}

export async function getAvailability(env: Env, villaId: string, month: string) {
  const villa = VILLAS.find((item) => item.id === villaId)
  if (!villa) return jsonError('客室が見つかりません。', 404)
  if (!/^\d{4}-\d{2}$/.test(month)) return jsonError('月の指定が正しくありません。')

  const start = `${month}-01`
  const [year, mon] = month.split('-').map(Number)
  const nextMonth = mon === 12 ? `${year + 1}-01-01` : `${year}-${String(mon + 1).padStart(2, '0')}-01`
  const occupied = await occupiedDates(env, villaId, start, nextMonth)
  return Response.json({
    villaId,
    month,
    occupied: [...occupied].sort(),
  })
}

export async function quoteRequest(env: Env, input: CreateBookingInput) {
  const quote = quoteStay({
    villaId: input.villaId,
    checkIn: input.checkIn,
    checkOut: input.checkOut,
    guests: input.guests,
    mealPlan: input.mealPlan,
  })
  if (typeof quote === 'string') return jsonError(quote)

  const available = await isAvailable(env, quote.villaId, quote.checkIn, quote.checkOut)
  return Response.json({ quote, available })
}

export async function createBooking(env: Env, input: CreateBookingInput) {
  const quote = quoteStay({
    villaId: input.villaId,
    checkIn: input.checkIn,
    checkOut: input.checkOut,
    guests: input.guests,
    mealPlan: input.mealPlan,
  })
  if (typeof quote === 'string') return jsonError(quote)

  const guestName = input.guestName.trim()
  const email = input.email.trim()
  const phone = input.phone.trim()
  const guestError = validateGuest(guestName, email, phone)
  if (guestError) return jsonError(guestError)

  const available = await isAvailable(env, quote.villaId, quote.checkIn, quote.checkOut)
  if (!available) return jsonError('選択された日程は満室です。別の日または客室をお選びください。', 409)

  const id = crypto.randomUUID()
  const code = confirmationCode()

  await env.DB.prepare(
    `INSERT INTO bookings (
      id, confirmation_code, villa_id, check_in, check_out, guests,
      guest_name, guest_kana, email, phone, meal_plan, notes,
      lodging, meals, tax, total, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'confirmed')`,
  )
    .bind(
      id,
      code,
      quote.villaId,
      quote.checkIn,
      quote.checkOut,
      quote.guests,
      guestName,
      input.guestKana?.trim() || null,
      email,
      phone,
      quote.mealPlan,
      input.notes?.trim() || null,
      quote.lodging,
      quote.meals,
      quote.tax,
      quote.total,
    )
    .run()

  return Response.json(
    {
      booking: {
        id,
        confirmationCode: code,
        ...quote,
        guestName,
        guestKana: input.guestKana?.trim() || '',
        email,
        phone,
        notes: input.notes?.trim() || '',
        status: 'confirmed',
      },
    },
    { status: 201 },
  )
}

export async function getBooking(env: Env, id: string) {
  const row = await env.DB.prepare(`SELECT * FROM bookings WHERE id = ? OR confirmation_code = ?`)
    .bind(id, id)
    .first<BookingRow>()
  if (!row) return jsonError('ご予約が見つかりません。', 404)
  return Response.json({ booking: serializeBooking(row, false) })
}

export async function createInquiry(
  env: Env,
  body: { name?: string; email?: string; phone?: string; message?: string },
) {
  const name = body.name?.trim() ?? ''
  const email = body.email?.trim() ?? ''
  const message = body.message?.trim() ?? ''
  if (name.length < 2) return jsonError('お名前を入力してください。')
  if (!EMAIL_RE.test(email)) return jsonError('メールアドレスの形式が正しくありません。')
  if (message.length < 10) return jsonError('お問い合わせ内容を入力してください。')

  await env.DB.prepare(
    `INSERT INTO inquiries (id, name, email, phone, message) VALUES (?, ?, ?, ?, ?)`,
  )
    .bind(crypto.randomUUID(), name, email, body.phone?.trim() || null, message)
    .run()

  return Response.json({ ok: true }, { status: 201 })
}

export function parseBookingBody(data: unknown): CreateBookingInput | Response {
  if (!data || typeof data !== 'object') return jsonError('送信内容を確認できませんでした。')
  const body = data as Record<string, unknown>
  const villaId = String(body.villaId ?? '')
  const mealPlan = String(body.mealPlan ?? 'none') as MealPlan
  if (!['none', 'breakfast', 'dinner', 'both'].includes(mealPlan)) {
    return jsonError('お食事プランを選択してください。')
  }
  return {
    villaId,
    checkIn: String(body.checkIn ?? ''),
    checkOut: String(body.checkOut ?? ''),
    guests: Number(body.guests),
    guestName: String(body.guestName ?? ''),
    guestKana: body.guestKana ? String(body.guestKana) : undefined,
    email: String(body.email ?? ''),
    phone: String(body.phone ?? ''),
    mealPlan,
    notes: body.notes ? String(body.notes) : undefined,
  }
}
