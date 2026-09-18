import type { Booking, Quote } from './api'

export class AdminAuthError extends Error {
  constructor() {
    super('ログインが必要です。')
    this.name = 'AdminAuthError'
  }
}

export type AdminUser = {
  id: string
  username: string
  displayName: string
}

export type AdminBooking = Booking & {
  staffNotes: string
  source: string
  updatedAt: string
  cancelledAt: string
}

export type AdminInquiry = {
  id: string
  name: string
  email: string
  phone: string
  message: string
  createdAt: string
  status: string
  staffNotes: string
  updatedAt: string
}

export type AdminOverview = {
  today: string
  month: string
  arrivals: AdminBooking[]
  departures: AdminBooking[]
  staying: AdminBooking[]
  upcoming: AdminBooking[]
  newInquiries: number
  openInquiries: number
  monthBookings: number
  monthRevenue: number
  occupancy: number
}

export type CalendarDay = {
  date: string
  booking: AdminBooking | null
  blockedReason: string | null
}

export type AuditEvent = {
  id: string
  user_id: string | null
  username: string | null
  action: string
  entity: string | null
  entity_id: string | null
  detail: string | null
  created_at: string
}

async function adminJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    credentials: 'include',
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
  })
  if (response.status === 401) throw new AdminAuthError()
  const data = (await response.json()) as T & { error?: string }
  if (!response.ok) throw new Error(data.error || '通信に失敗しました。')
  return data
}

export function adminLogin(username: string, password: string) {
  return adminJson<{ user: AdminUser }>('/api/admin/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  })
}

export function adminLogout() {
  return adminJson<{ ok: boolean }>('/api/admin/logout', { method: 'POST' })
}

export function getAdminMe() {
  return adminJson<{ user: AdminUser }>('/api/admin/me')
}

export function changeAdminPassword(currentPassword: string, newPassword: string) {
  return adminJson<{ ok: boolean }>('/api/admin/password', {
    method: 'POST',
    body: JSON.stringify({ currentPassword, newPassword }),
  })
}

export function getAdminOverview() {
  return adminJson<AdminOverview>('/api/admin/overview')
}

export function listAdminBookings(params: Record<string, string | number>) {
  const query = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value !== '' && value !== undefined) query.set(key, String(value))
  }
  return adminJson<{ bookings: AdminBooking[]; total: number; page: number; limit: number }>(
    `/api/admin/bookings?${query}`,
  )
}

export function getAdminBooking(id: string) {
  return adminJson<{ booking: AdminBooking }>(`/api/admin/bookings/${encodeURIComponent(id)}`)
}

export function createAdminBooking(body: Record<string, unknown>) {
  return adminJson<{ booking: AdminBooking }>('/api/admin/bookings', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export function patchAdminBooking(id: string, body: Record<string, unknown>) {
  return adminJson<{ booking: AdminBooking }>(`/api/admin/bookings/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  })
}

export function getAdminQuote(body: Record<string, unknown>) {
  return adminJson<{ quote: Quote; available: boolean }>('/api/admin/quote', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export function getAdminCalendar(villa: string, month: string) {
  return adminJson<{ villaId: string; villaName: string; month: string; days: CalendarDay[] }>(
    `/api/admin/calendar?villa=${encodeURIComponent(villa)}&month=${encodeURIComponent(month)}`,
  )
}

export function createBlocks(body: Record<string, string>) {
  return adminJson<{ ok: boolean; dates: string[] }>('/api/admin/blocks', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export function deleteBlocks(body: Record<string, string>) {
  return adminJson<{ ok: boolean; dates: string[] }>('/api/admin/blocks', {
    method: 'DELETE',
    body: JSON.stringify(body),
  })
}

export function listInquiries(params: Record<string, string>) {
  const query = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value) query.set(key, value)
  }
  return adminJson<{ inquiries: AdminInquiry[] }>(`/api/admin/inquiries?${query}`)
}

export function getInquiry(id: string) {
  return adminJson<{ inquiry: AdminInquiry }>(`/api/admin/inquiries/${encodeURIComponent(id)}`)
}

export function patchInquiry(id: string, body: Record<string, string>) {
  return adminJson<{ inquiry: AdminInquiry }>(`/api/admin/inquiries/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  })
}

export function listAudit(action = '') {
  const query = action ? `?action=${encodeURIComponent(action)}` : ''
  return adminJson<{ events: AuditEvent[] }>(`/api/admin/audit${query}`)
}
