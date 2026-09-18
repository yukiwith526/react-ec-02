export type Quote = {
  villaId: string
  villaName: string
  checkIn: string
  checkOut: string
  nights: number
  guests: number
  mealPlan: string
  mealPlanName: string
  lodging: number
  meals: number
  tax: number
  total: number
  perNight: { date: string; rate: number; weekend: boolean }[]
}

export type Booking = Quote & {
  id: string
  confirmationCode: string
  guestName: string
  guestKana: string
  email: string
  phone: string
  notes: string
  status: string
  createdAt?: string
}

async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
  })
  const data = (await response.json()) as T & { error?: string }
  if (!response.ok) {
    throw new Error(data.error || '通信に失敗しました。')
  }
  return data
}

export function getAvailability(villa: string, month: string) {
  return requestJson<{ villaId: string; month: string; occupied: string[] }>(
    `/api/availability?villa=${encodeURIComponent(villa)}&month=${encodeURIComponent(month)}`,
  )
}

export function getQuote(body: Record<string, unknown>) {
  return requestJson<{ quote: Quote; available: boolean }>('/api/quote', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export function createBooking(body: Record<string, unknown>) {
  return requestJson<{ booking: Booking }>('/api/bookings', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export function getBooking(id: string) {
  return requestJson<{ booking: Booking }>(`/api/bookings/${encodeURIComponent(id)}`)
}

export function sendInquiry(body: Record<string, string>) {
  return requestJson<{ ok: boolean }>('/api/inquiries', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}
