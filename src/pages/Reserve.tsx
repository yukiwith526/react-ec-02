import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Hero } from '../components/Hero'
import { IMAGES, INN, MEAL_PLANS, VILLAS, type MealPlan } from '../data/inn'
import { createBooking, getAvailability, getQuote, type Quote } from '../lib/api'
import { addDays, formatFullDate, formatYen, todayJst, toDateString } from '../lib/booking'

function monthKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

function monthLabel(date: Date) {
  return `${date.getFullYear()}年${date.getMonth() + 1}月`
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

export function Reserve() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const initialVilla = VILLAS.some((villa) => villa.slug === params.get('villa'))
    ? (params.get('villa') as string)
    : VILLAS[0].id

  const [villaId, setVillaId] = useState(initialVilla)
  const [month, setMonth] = useState(() => new Date(`${todayJst()}T00:00:00`))
  const [occupied, setOccupied] = useState<string[]>([])
  const [checkIn, setCheckIn] = useState('')
  const [checkOut, setCheckOut] = useState('')
  const [guests, setGuests] = useState(2)
  const [mealPlan, setMealPlan] = useState<MealPlan>('both')
  const [quote, setQuote] = useState<Quote | null>(null)
  const [available, setAvailable] = useState<boolean | null>(null)
  const [quoteError, setQuoteError] = useState('')
  const [submitError, setSubmitError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const villa = VILLAS.find((item) => item.id === villaId) ?? VILLAS[0]
  const today = todayJst()
  const cells = useMemo(() => daysInMonth(month), [month])

  useEffect(() => {
    let ignore = false
    getAvailability(villaId, monthKey(month))
      .then((data) => {
        if (!ignore) setOccupied(data.occupied)
      })
      .catch(() => {
        if (!ignore) setOccupied([])
      })
    return () => {
      ignore = true
    }
  }, [villaId, month])

  useEffect(() => {
    if (guests > villa.capacity) setGuests(villa.capacity)
  }, [villa.capacity, guests])

  useEffect(() => {
    if (!checkIn || !checkOut) {
      setQuote(null)
      setAvailable(null)
      return
    }
    let ignore = false
    setQuoteError('')
    getQuote({ villaId, checkIn, checkOut, guests, mealPlan })
      .then((data) => {
        if (ignore) return
        setQuote(data.quote)
        setAvailable(data.available)
      })
      .catch((error: Error) => {
        if (ignore) return
        setQuote(null)
        setAvailable(null)
        setQuoteError(error.message)
      })
    return () => {
      ignore = true
    }
  }, [villaId, checkIn, checkOut, guests, mealPlan])

  function pickDate(date: string) {
    if (date < today || occupied.includes(date)) return
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

  function inRange(date: string) {
    return Boolean(checkIn && checkOut && date >= checkIn && date < checkOut)
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!quote || available === false) return
    const form = new FormData(event.currentTarget)
    setSubmitting(true)
    setSubmitError('')
    try {
      const result = await createBooking({
        villaId,
        checkIn,
        checkOut,
        guests,
        mealPlan,
        guestName: String(form.get('guestName') ?? ''),
        guestKana: String(form.get('guestKana') ?? ''),
        email: String(form.get('email') ?? ''),
        phone: String(form.get('phone') ?? ''),
        notes: String(form.get('notes') ?? ''),
      })
      navigate(`/reserve/${result.booking.id}`)
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : '予約に失敗しました。')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <Hero image={IMAGES.teaRoom} kicker="RESERVATION" title="ご予約・空室検索" lead="公式サイトからのご予約がもっとも確実です。" compact />
      <section className="section reserve-page">
        <div className="reserve-grid">
          <div>
            <h2>客室を選ぶ</h2>
            <div className="villa-select">
              {VILLAS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={item.id === villaId ? 'is-active' : ''}
                  onClick={() => {
                    setVillaId(item.id)
                    setCheckIn('')
                    setCheckOut('')
                  }}
                >
                  <strong>{item.name}</strong>
                  <span>定員 {item.capacity}名 / {formatYen(item.weekdayRate)}〜</span>
                </button>
              ))}
            </div>

            <div className="calendar-head">
              <button type="button" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}>
                前の月
              </button>
              <h3>{monthLabel(month)}</h3>
              <button type="button" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}>
                次の月
              </button>
            </div>
            <p className="calendar-help">到着日を押し、続けて出発日を選んでください。灰色は満室または休業です。</p>
            <div className="calendar">
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
                      occupied.includes(date) || date < today ? 'is-busy' : '',
                      date === checkIn ? 'is-start' : '',
                      date === checkOut ? 'is-end' : '',
                      inRange(date) ? 'is-range' : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                    disabled={occupied.includes(date) || date < today}
                    onClick={() => pickDate(date)}
                  >
                    {Number(date.slice(-2))}
                  </button>
                ) : (
                  <span key={`empty-${index}`} />
                ),
              )}
            </div>

            <div className="stay-fields">
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
                お食事
                <select value={mealPlan} onChange={(event) => setMealPlan(event.target.value as MealPlan)}>
                  {MEAL_PLANS.map((plan) => (
                    <option key={plan.id} value={plan.id}>
                      {plan.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          <aside className="reserve-summary">
            <p className="kicker">YOUR STAY</p>
            <h3>{villa.name}</h3>
            <p>
              {checkIn ? formatFullDate(checkIn) : '到着日未選択'}
              <br />
              {checkOut ? `${formatFullDate(checkOut)} 出発` : '出発日未選択'}
            </p>
            {quote ? (
              <ul className="quote-list">
                <li>
                  <span>
                    宿泊 {quote.nights}泊 / {quote.guests}名
                  </span>
                  <strong>{formatYen(quote.lodging)}</strong>
                </li>
                <li>
                  <span>{quote.mealPlanName}</span>
                  <strong>{formatYen(quote.meals)}</strong>
                </li>
                <li>
                  <span>宿泊税</span>
                  <strong>{formatYen(quote.tax)}</strong>
                </li>
                <li className="total">
                  <span>合計</span>
                  <strong>{formatYen(quote.total)}</strong>
                </li>
              </ul>
            ) : (
              <p className="footer-note">日程を選ぶと料金が表示されます。</p>
            )}
            {available === false ? <p className="form-error">この日程は満室です。</p> : null}
            {quoteError ? <p className="form-error">{quoteError}</p> : null}

            <form className="form" onSubmit={onSubmit}>
              <label>
                代表者氏名
                <input name="guestName" required autoComplete="name" placeholder="山田 太郎" />
              </label>
              <label>
                ふりがな
                <input name="guestKana" autoComplete="name" placeholder="やまだ たろう" />
              </label>
              <label>
                メールアドレス
                <input name="email" type="email" required autoComplete="email" />
              </label>
              <label>
                電話番号
                <input name="phone" type="tel" required autoComplete="tel" placeholder="090-0000-0000" />
              </label>
              <label>
                ご要望（任意）
                <textarea name="notes" rows={4} placeholder="送迎、アレルギー、記念日など" />
              </label>
              <p className="footer-note">
                チェックイン {INN.checkIn} / チェックアウト {INN.checkOut}。お支払いは現地精算です。
              </p>
              <button
                className="btn btn-gold"
                type="submit"
                disabled={!quote || available === false || submitting}
              >
                {submitting ? '送信中…' : '予約を確定する'}
              </button>
              {submitError ? <p className="form-error">{submitError}</p> : null}
            </form>
          </aside>
        </div>
      </section>
    </>
  )
}
