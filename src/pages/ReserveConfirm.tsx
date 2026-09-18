import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Hero } from '../components/Hero'
import { IMAGES, INN } from '../data/inn'
import { getBooking, type Booking } from '../lib/api'
import { formatFullDate, formatYen } from '../lib/booking'

export function ReserveConfirm() {
  const { id } = useParams()
  const [booking, setBooking] = useState<Booking | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!id) return
    getBooking(id)
      .then((data) => setBooking(data.booking))
      .catch((err: Error) => setError(err.message))
  }, [id])

  return (
    <>
      <Hero image={IMAGES.tatamiGarden} kicker="CONFIRMATION" title="ご予約確定" compact />
      <section className="section narrow confirm">
        {error ? <p className="form-error">{error}</p> : null}
        {!booking && !error ? <p>予約内容を読み込んでいます…</p> : null}
        {booking ? (
          <>
            <p className="confirm-code">予約番号 {booking.confirmationCode}</p>
            <h2>{booking.guestName} 様</h2>
            <p>
              {INN.fullName} {booking.villaName} を、下記の内容で承りました。到着当日は15時以降にフロント小屋へお越しください。
            </p>
            <dl className="info-list">
              <div>
                <dt>客室</dt>
                <dd>{booking.villaName}</dd>
              </div>
              <div>
                <dt>到着</dt>
                <dd>{formatFullDate(booking.checkIn)}</dd>
              </div>
              <div>
                <dt>出発</dt>
                <dd>{formatFullDate(booking.checkOut)}</dd>
              </div>
              <div>
                <dt>人数</dt>
                <dd>{booking.guests}名 / {booking.nights}泊</dd>
              </div>
              <div>
                <dt>お食事</dt>
                <dd>{booking.mealPlanName}</dd>
              </div>
              <div>
                <dt>合計</dt>
                <dd>{formatYen(booking.total)}（現地精算）</dd>
              </div>
            </dl>
            <p className="footer-note">
              確認の控えとして、この画面を保存してください。変更は {INN.phone} までご連絡ください。
            </p>
            <Link to="/" className="btn btn-dark">
              トップへ戻る
            </Link>
          </>
        ) : null}
      </section>
    </>
  )
}
