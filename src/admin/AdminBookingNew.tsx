import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { MEAL_PLANS, VILLAS, type MealPlan } from '../data/inn'
import { createAdminBooking, getAdminQuote } from '../lib/adminApi'
import { getAvailability } from '../lib/api'
import { addDays, formatFullDate, formatYen, todayJst, toDateString } from '../lib/booking'
import { BOOKING_SOURCE } from './labels'

function monthKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

function daysInMonth(date: Date) {
  const first = new Date(date.getFullYear(), date.getMonth(), 1)
  const days = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  const cells: (string | null)[] = Array(first.getDay()).fill(null)
  for (let day = 1; day <= days; day += 1) {
    cells.push(toDateString(new Date(date.getFullYear(), date.getMonth(), day)))
  }
  return cells
}

export function AdminBookingNew() {
  const navigate = useNavigate()
  const [villaId, setVillaId] = useState(VILLAS[0].id)
  const [month, setMonth] = useState(() => new Date(`${todayJst()}T00:00:00`))
  const [occupied, setOccupied] = useState<string[]>([])
  const [checkIn, setCheckIn] = useState('')
  const [checkOut, setCheckOut] = useState('')
  const [guests, setGuests] = useState(2)
  const [mealPlan, setMealPlan] = useState<MealPlan>('both')
  const [quoteText, setQuoteText] = useState('')
  const [available, setAvailable] = useState<boolean | null>(null)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const villa = VILLAS.find((item) => item.id === villaId) ?? VILLAS[0]
  const cells = useMemo(() => daysInMonth(month), [month])

  useEffect(() => {
    getAvailability(villaId, monthKey(month))
      .then((data) => setOccupied(data.occupied))
      .catch(() => setOccupied([]))
  }, [villaId, month])

  useEffect(() => {
    if (!checkIn || !checkOut) {
      setQuoteText('')
      setAvailable(null)
      return
    }
    getAdminQuote({ villaId, checkIn, checkOut, guests, mealPlan })
      .then((data) => {
        setAvailable(data.available)
        setQuoteText(
          `${data.quote.nights}泊 ${data.quote.guests}名 ${formatYen(data.quote.total)}（宿泊${formatYen(data.quote.lodging)} / 食事${formatYen(data.quote.meals)} / 税${formatYen(data.quote.tax)}）`,
        )
      })
      .catch((err: Error) => {
        setQuoteText('')
        setAvailable(null)
        setError(err.message)
      })
  }, [villaId, checkIn, checkOut, guests, mealPlan])

  function pickDate(date: string) {
    if (occupied.includes(date)) return
    if (!checkIn || (checkIn && checkOut) || date <= checkIn) {
      setCheckIn(date)
      setCheckOut('')
      return
    }
    const nights: string[] = []
    let cursor = checkIn
    while (cursor < date) {
      nights.push(cursor)
      cursor = addDays(cursor, 1)
    }
    if (nights.some((night) => occupied.includes(night))) return
    setCheckOut(date)
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!checkIn || !checkOut || available === false) return
    const form = new FormData(event.currentTarget)
    setSaving(true)
    setError('')
    try {
      const result = await createAdminBooking({
        villaId,
        checkIn,
        checkOut,
        guests,
        mealPlan,
        guestName: String(form.get('guestName')),
        guestKana: String(form.get('guestKana')),
        email: String(form.get('email')),
        phone: String(form.get('phone')),
        notes: String(form.get('notes')),
        staffNotes: String(form.get('staffNotes')),
        source: String(form.get('source')),
      })
      navigate(`/admin/bookings/${result.booking.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : '登録に失敗しました。')
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <div className="admin-head">
        <div>
          <h1>予約を登録</h1>
          <p>電話・来館の予約を台帳へ直接入れます。灰色は満室または休業です。</p>
        </div>
      </div>
      {error ? <p className="admin-error">{error}</p> : null}
      <section className="admin-panel">
        <div className="admin-filters">
          {VILLAS.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`admin-btn ${item.id === villaId ? 'gold' : 'ghost'}`}
              onClick={() => {
                setVillaId(item.id)
                setCheckIn('')
                setCheckOut('')
              }}
            >
              {item.name}
            </button>
          ))}
        </div>
        <div className="admin-filters">
          <button
            className="admin-btn ghost"
            type="button"
            onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}
          >
            前の月
          </button>
          <strong>
            {month.getFullYear()}年{month.getMonth() + 1}月
          </strong>
          <button
            className="admin-btn ghost"
            type="button"
            onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}
          >
            次の月
          </button>
        </div>
        <div className="admin-cal">
          {['日', '月', '火', '水', '木', '金', '土'].map((label) => (
            <span key={label} className="dow">
              {label}
            </span>
          ))}
          {cells.map((date, index) =>
            date ? (
              <button
                key={date}
                type="button"
                className={[
                  occupied.includes(date) ? 'is-busy' : '',
                  date === checkIn || date === checkOut ? 'is-pick' : '',
                  checkIn && checkOut && date > checkIn && date < checkOut ? 'is-range' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                disabled={occupied.includes(date)}
                onClick={() => pickDate(date)}
              >
                <span className="num">{Number(date.slice(-2))}</span>
                {occupied.includes(date) ? '満' : ''}
              </button>
            ) : (
              <span key={`e-${index}`} />
            ),
          )}
        </div>
        <p className="admin-note">
          到着 {checkIn ? formatFullDate(checkIn) : '未選択'} ／ 出発 {checkOut ? formatFullDate(checkOut) : '未選択'}
          {quoteText ? ` ／ ${quoteText}` : ''}
          {available === false ? ' ／ この日程は使えません' : ''}
        </p>
        <form className="admin-form" onSubmit={onSubmit}>
          <label>
            人数
            <select value={guests} onChange={(event) => setGuests(Number(event.target.value))}>
              {Array.from({ length: villa.capacity }, (_, index) => index + 1).map((count) => (
                <option key={count} value={count}>
                  {count}名
                </option>
              ))}
            </select>
          </label>
          <label>
            食事
            <select value={mealPlan} onChange={(event) => setMealPlan(event.target.value as MealPlan)}>
              {MEAL_PLANS.map((plan) => (
                <option key={plan.id} value={plan.id}>
                  {plan.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            経路
            <select name="source" defaultValue="phone">
              {Object.entries(BOOKING_SOURCE).map(([id, label]) => (
                <option key={id} value={id}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <label>
            氏名
            <input name="guestName" required />
          </label>
          <label>
            ふりがな
            <input name="guestKana" />
          </label>
          <label>
            メール
            <input name="email" type="email" required />
          </label>
          <label>
            電話
            <input name="phone" required />
          </label>
          <label className="wide">
            お客様からのご要望
            <textarea name="notes" />
          </label>
          <label className="wide">
            社内メモ
            <textarea name="staffNotes" />
          </label>
          <div className="wide">
            <button className="admin-btn gold" type="submit" disabled={!checkIn || !checkOut || available === false || saving}>
              {saving ? '登録中…' : '台帳に登録する'}
            </button>
          </div>
        </form>
      </section>
    </>
  )
}
