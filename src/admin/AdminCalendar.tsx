import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { VILLAS } from '../data/inn'
import { createBlocks, deleteBlocks, getAdminCalendar, type CalendarDay } from '../lib/adminApi'
import { addDays, toDateString } from '../lib/booking'
import { monthKeyFromDate } from './labels'

function daysInMonth(date: Date) {
  const first = new Date(date.getFullYear(), date.getMonth(), 1)
  const days = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  const cells: (string | null)[] = Array(first.getDay()).fill(null)
  for (let day = 1; day <= days; day += 1) {
    cells.push(toDateString(new Date(date.getFullYear(), date.getMonth(), day)))
  }
  return cells
}

export function AdminCalendar() {
  const navigate = useNavigate()
  const [villaId, setVillaId] = useState(VILLAS[0].id)
  const [month, setMonth] = useState(() => new Date())
  const [days, setDays] = useState<CalendarDay[]>([])
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [reason, setReason] = useState('休業')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const cells = useMemo(() => daysInMonth(month), [month])
  const byDate = useMemo(() => new Map(days.map((day) => [day.date, day])), [days])

  useEffect(() => {
    let ignore = false
    setError('')
    getAdminCalendar(villaId, monthKeyFromDate(month))
      .then((data) => {
        if (!ignore) setDays(data.days)
      })
      .catch((err: Error) => {
        if (!ignore) setError(err.message)
      })
    return () => {
      ignore = true
    }
  }, [villaId, month])

  function pick(date: string) {
    const day = byDate.get(date)
    if (day?.booking) {
      navigate(`/admin/bookings/${day.booking.id}`)
      return
    }
    if (!from || (from && to) || date < from) {
      setFrom(date)
      setTo('')
      return
    }
    setTo(date)
  }

  async function block(remove = false) {
    if (!from) return
    setError('')
    setMessage('')
    try {
      const body = { villaId, from, to: to || from, reason }
      if (remove) await deleteBlocks(body)
      else await createBlocks(body)
      setMessage(remove ? '休業を解除しました。' : '休業日を登録しました。')
      setFrom('')
      setTo('')
      const data = await getAdminCalendar(villaId, monthKeyFromDate(month))
      setDays(data.days)
    } catch (err) {
      setError(err instanceof Error ? err.message : '更新に失敗しました。')
    }
  }

  return (
    <>
      <div className="admin-head">
        <div>
          <h1>空室カレンダー</h1>
          <p>予約は日付を押すと台帳へ。空室または休業日は範囲選択して休業を設定できます。</p>
        </div>
      </div>
      <div className="admin-filters">
        {VILLAS.map((villa) => (
          <button
            key={villa.id}
            type="button"
            className={`admin-btn ${villa.id === villaId ? 'gold' : 'ghost'}`}
            onClick={() => setVillaId(villa.id)}
          >
            {villa.name}
          </button>
        ))}
        <button className="admin-btn ghost" type="button" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}>
          前の月
        </button>
        <strong>
          {month.getFullYear()}年{month.getMonth() + 1}月
        </strong>
        <button className="admin-btn ghost" type="button" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}>
          次の月
        </button>
      </div>
      {error ? <p className="admin-error">{error}</p> : null}
      {message ? <p className="admin-ok">{message}</p> : null}
      <section className="admin-panel">
        <div className="admin-cal">
          {['日', '月', '火', '水', '木', '金', '土'].map((label) => (
            <span key={label} className="dow">
              {label}
            </span>
          ))}
          {cells.map((date, index) => {
            if (!date) return <span key={`e-${index}`} />
            const day = byDate.get(date)
            const selected = date === from || date === to || (from && to && date > from && date < addDays(to, 1) && date >= from)
            return (
              <button
                key={date}
                type="button"
                className={[
                  day?.booking ? 'is-busy' : '',
                  day?.blockedReason != null ? 'is-blocked' : '',
                  selected ? 'is-pick' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                onClick={() => pick(date)}
              >
                <span className="num">{Number(date.slice(-2))}</span>
                {day?.booking ? day.booking.guestName : day?.blockedReason != null ? day.blockedReason || '休業' : '空'}
              </button>
            )
          })}
        </div>
        <div className="admin-filters" style={{ marginTop: 16 }}>
          <input value={reason} onChange={(event) => setReason(event.target.value)} placeholder="休業理由" />
          <button className="admin-btn" type="button" disabled={!from} onClick={() => void block(false)}>
            {from ? `${from}${to ? `〜${to}` : ''} を休業` : '日付を選択'}
          </button>
          <button className="admin-btn ghost" type="button" disabled={!from} onClick={() => void block(true)}>
            休業を解除
          </button>
          <button
            className="admin-btn ghost"
            type="button"
            onClick={() => {
              setFrom('')
              setTo('')
            }}
          >
            選択解除
          </button>
        </div>
      </section>
    </>
  )
}
