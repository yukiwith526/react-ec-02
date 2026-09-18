import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getAdminOverview, type AdminOverview } from '../lib/adminApi'
import { formatYen, formatFullDate } from '../lib/booking'
import { BOOKING_STATUS } from './labels'

function StayList({ title, items }: { title: string; items: AdminOverview['arrivals'] }) {
  return (
    <section className="admin-panel">
      <h2>{title}</h2>
      {items.length === 0 ? <p className="admin-empty">該当はありません。</p> : null}
      {items.length ? (
        <table className="admin-table">
          <thead>
            <tr>
              <th>客室</th>
              <th>お客様</th>
              <th>日程</th>
              <th>人数</th>
              <th>食事</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td>{item.villaName}</td>
                <td>
                  <Link to={`/admin/bookings/${item.id}`}>{item.guestName}</Link>
                  <div className="admin-note">{item.confirmationCode}</div>
                </td>
                <td>
                  {formatFullDate(item.checkIn)}
                  <br />
                  {formatFullDate(item.checkOut)} 出発
                </td>
                <td>{item.guests}名</td>
                <td>{item.mealPlanName}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : null}
    </section>
  )
}

export function AdminHome() {
  const [data, setData] = useState<AdminOverview | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    getAdminOverview()
      .then(setData)
      .catch((err: Error) => setError(err.message))
  }, [])

  if (error) return <p className="admin-error">{error}</p>
  if (!data) return <p className="admin-loading">集計しています…</p>

  return (
    <>
      <div className="admin-head">
        <div>
          <h1>本日の動き</h1>
          <p>{formatFullDate(data.today)} ／ フロント業務の起点です。</p>
        </div>
        <div className="admin-actions">
          <Link className="admin-btn gold" to="/admin/bookings/new">
            予約を登録
          </Link>
          <Link className="admin-btn ghost" to="/admin/calendar">
            カレンダー
          </Link>
        </div>
      </div>
      <div className="admin-cards">
        <article className="admin-card">
          <span className="label">本日到着</span>
          <span className="value">{data.arrivals.length}</span>
        </article>
        <article className="admin-card">
          <span className="label">滞在中</span>
          <span className="value">{data.staying.length}</span>
        </article>
        <article className="admin-card">
          <span className="label">未対応の問い合わせ</span>
          <span className="value">{data.newInquiries}</span>
        </article>
        <article className="admin-card">
          <span className="label">今月の稼働</span>
          <span className="value">{data.occupancy}%</span>
        </article>
      </div>
      <div className="admin-cards">
        <article className="admin-card">
          <span className="label">今月の予約件数</span>
          <span className="value">{data.monthBookings}</span>
        </article>
        <article className="admin-card">
          <span className="label">今月の売上（確定＋滞在済）</span>
          <span className="value">{formatYen(data.monthRevenue)}</span>
        </article>
        <article className="admin-card">
          <span className="label">本日出発</span>
          <span className="value">{data.departures.length}</span>
        </article>
        <article className="admin-card">
          <span className="label">対応中の問い合わせ</span>
          <span className="value">{data.openInquiries}</span>
        </article>
      </div>
      <StayList title="本日到着" items={data.arrivals} />
      <StayList title="滞在中" items={data.staying} />
      <StayList title="本日出発" items={data.departures} />
      <section className="admin-panel">
        <h2>今後7日の到着</h2>
        {data.upcoming.length === 0 ? <p className="admin-empty">直近の到着はありません。</p> : null}
        {data.upcoming.length ? (
          <table className="admin-table">
            <thead>
              <tr>
                <th>到着</th>
                <th>客室</th>
                <th>お客様</th>
                <th>状態</th>
                <th>合計</th>
              </tr>
            </thead>
            <tbody>
              {data.upcoming.map((item) => (
                <tr key={item.id}>
                  <td>{formatFullDate(item.checkIn)}</td>
                  <td>{item.villaName}</td>
                  <td>
                    <Link to={`/admin/bookings/${item.id}`}>{item.guestName}</Link>
                  </td>
                  <td>
                    <span className={`admin-badge ${item.status}`}>{BOOKING_STATUS[item.status] ?? item.status}</span>
                  </td>
                  <td>{formatYen(item.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : null}
      </section>
    </>
  )
}
