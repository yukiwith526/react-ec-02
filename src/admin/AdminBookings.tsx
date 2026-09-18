import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { VILLAS } from '../data/inn'
import { listAdminBookings, type AdminBooking } from '../lib/adminApi'
import { formatFullDate, formatYen } from '../lib/booking'
import { BOOKING_SOURCE, BOOKING_STATUS } from './labels'

export function AdminBookings() {
  const [params, setParams] = useSearchParams()
  const [rows, setRows] = useState<AdminBooking[]>([])
  const [total, setTotal] = useState(0)
  const [error, setError] = useState('')
  const page = Number(params.get('page') ?? '1') || 1
  const q = params.get('q') ?? ''
  const villa = params.get('villa') ?? ''
  const status = params.get('status') ?? ''

  useEffect(() => {
    setError('')
    listAdminBookings({ q, villa, status, page, limit: 30 })
      .then((data) => {
        setRows(data.bookings)
        setTotal(data.total)
      })
      .catch((err: Error) => setError(err.message))
  }, [q, villa, status, page])

  function update(next: Record<string, string>) {
    const merged = new URLSearchParams(params)
    for (const [key, value] of Object.entries(next)) {
      if (value) merged.set(key, value)
      else merged.delete(key)
    }
    if (!next.page) merged.delete('page')
    setParams(merged)
  }

  const pages = Math.max(1, Math.ceil(total / 30))

  return (
    <>
      <div className="admin-head">
        <div>
          <h1>予約台帳</h1>
          <p>{total}件。氏名・予約番号・電話・メールで検索できます。</p>
        </div>
        <Link className="admin-btn gold" to="/admin/bookings/new">
          予約を登録
        </Link>
      </div>
      <div className="admin-filters">
        <input
          value={q}
          placeholder="氏名 / 予約番号 / 連絡先"
          onChange={(event) => update({ q: event.target.value })}
        />
        <select value={villa} onChange={(event) => update({ villa: event.target.value })}>
          <option value="">すべての客室</option>
          {VILLAS.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </select>
        <select value={status} onChange={(event) => update({ status: event.target.value })}>
          <option value="">すべての状態</option>
          {Object.entries(BOOKING_STATUS).map(([id, label]) => (
            <option key={id} value={id}>
              {label}
            </option>
          ))}
        </select>
      </div>
      {error ? <p className="admin-error">{error}</p> : null}
      <section className="admin-panel">
        <table className="admin-table">
          <thead>
            <tr>
              <th>到着</th>
              <th>客室</th>
              <th>お客様</th>
              <th>人数</th>
              <th>状態</th>
              <th>経路</th>
              <th>合計</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <td>
                  {formatFullDate(row.checkIn)}
                  <div className="admin-note">{row.nights}泊</div>
                </td>
                <td>{row.villaName}</td>
                <td>
                  <Link to={`/admin/bookings/${row.id}`}>{row.guestName}</Link>
                  <div className="admin-note">{row.confirmationCode}</div>
                </td>
                <td>{row.guests}名</td>
                <td>
                  <span className={`admin-badge ${row.status}`}>{BOOKING_STATUS[row.status] ?? row.status}</span>
                </td>
                <td>{BOOKING_SOURCE[row.source] ?? row.source}</td>
                <td>{formatYen(row.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 ? <p className="admin-empty">予約はありません。</p> : null}
        <div className="admin-pager">
          <button className="admin-btn ghost" type="button" disabled={page <= 1} onClick={() => update({ page: String(page - 1) })}>
            前へ
          </button>
          <span>
            {page} / {pages}
          </span>
          <button
            className="admin-btn ghost"
            type="button"
            disabled={page >= pages}
            onClick={() => update({ page: String(page + 1) })}
          >
            次へ
          </button>
        </div>
      </section>
    </>
  )
}
