import { INN, getMealPlan, getVilla, type MealPlan } from '../data/inn'

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/

function parseDateParts(value: string) {
  const [year, month, day] = value.split('-').map(Number)
  return { year, month, day }
}

function fromUtcParts(year: number, month: number, day: number) {
  const date = new Date(Date.UTC(year, month - 1, day))
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}-${String(date.getUTCDate()).padStart(2, '0')}`
}

export function isDateString(value: string) {
  if (!DATE_RE.test(value)) return false
  const { year, month, day } = parseDateParts(value)
  return fromUtcParts(year, month, day) === value
}

export function toDateString(date: Date) {
  return fromUtcParts(date.getFullYear(), date.getMonth() + 1, date.getDate())
}

export function todayJst() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Tokyo' }).format(new Date())
}

export function addDays(dateStr: string, days: number) {
  const { year, month, day } = parseDateParts(dateStr)
  return fromUtcParts(year, month, day + days)
}

export function eachNight(checkIn: string, checkOut: string) {
  const nights: string[] = []
  let cursor = checkIn
  while (cursor < checkOut) {
    nights.push(cursor)
    cursor = addDays(cursor, 1)
    if (nights.length > 31) break
  }
  return nights
}

export function isWeekend(dateStr: string) {
  const { year, month, day } = parseDateParts(dateStr)
  const weekday = new Date(Date.UTC(year, month - 1, day)).getUTCDay()
  return weekday === 5 || weekday === 6
}

export function nightCount(checkIn: string, checkOut: string) {
  return eachNight(checkIn, checkOut).length
}

export function formatYen(value: number) {
  return new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY', maximumFractionDigits: 0 }).format(value)
}

export function formatMd(dateStr: string) {
  const { month, day } = parseDateParts(dateStr)
  return `${month}月${day}日`
}

export function formatFullDate(dateStr: string) {
  const { year, month, day } = parseDateParts(dateStr)
  const week = ['日', '月', '火', '水', '木', '金', '土'][new Date(Date.UTC(year, month - 1, day)).getUTCDay()]
  return `${year}年${month}月${day}日（${week}）`
}

export type QuoteInput = {
  villaId: string
  checkIn: string
  checkOut: string
  guests: number
  mealPlan: MealPlan
  allowPast?: boolean
}

export type Quote = {
  villaId: string
  villaName: string
  checkIn: string
  checkOut: string
  nights: number
  guests: number
  mealPlan: MealPlan
  mealPlanName: string
  lodging: number
  meals: number
  tax: number
  total: number
  perNight: { date: string; rate: number; weekend: boolean }[]
}

export function quoteStay(input: QuoteInput): Quote | string {
  const villa = getVilla(input.villaId)
  if (!villa) return '客室が見つかりません。'
  if (!isDateString(input.checkIn) || !isDateString(input.checkOut)) return '日付の形式が正しくありません。'
  if (!input.allowPast && input.checkIn < todayJst()) return '過去の日付はご予約いただけません。'
  if (input.checkOut <= input.checkIn) return 'チェックアウトはチェックインより後の日付を指定してください。'
  const nights = eachNight(input.checkIn, input.checkOut)
  if (nights.length < 1) return '1泊以上でご予約ください。'
  if (nights.length > INN.maxNights) return `ご宿泊は最長${INN.maxNights}泊までです。`
  if (!Number.isInteger(input.guests) || input.guests < 1) return '人数を入力してください。'
  if (input.guests > villa.capacity) return `${villa.name}の定員は${villa.capacity}名です。`

  const plan = getMealPlan(input.mealPlan)
  if (!plan) return 'お食事プランを選択してください。'

  const perNight = nights.map((date) => {
    const weekend = isWeekend(date)
    return { date, rate: weekend ? villa.weekendRate : villa.weekdayRate, weekend }
  })
  const lodging = perNight.reduce((sum, night) => sum + night.rate, 0)
  const meals = plan.pricePerPerson * input.guests * nights.length
  const tax = INN.lodgingTaxPerPerson * input.guests * nights.length

  return {
    villaId: villa.id,
    villaName: villa.name,
    checkIn: input.checkIn,
    checkOut: input.checkOut,
    nights: nights.length,
    guests: input.guests,
    mealPlan: plan.id,
    mealPlanName: plan.name,
    lodging,
    meals,
    tax,
    total: lodging + meals + tax,
    perNight,
  }
}
