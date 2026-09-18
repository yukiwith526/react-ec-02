import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { MEAL_PLANS, VILLAS } from '../data/inn'
import { getAdminBooking, patchAdminBooking, type AdminBooking } from '../lib/adminApi'
import { formatFullDate, formatYen } from '../lib/booking'
import { BOOKING_SOURCE, BOOKING_STATUS, formatDateTime } from './labels'

export function AdminBookingDetail() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const [booking, setBooking] = useState<AdminBooking | null>(null)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    getAdminBooking(id)
      .then((data) => setBooking(data.booking))
      .catch((err: Error) => setError(err.message))
  }, [id])

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!booking) return
    const form = new FormData(event.currentTarget)
    setSaving(true)
    setError('')
    setMessage('')
    try {
      const result = await patchAdminBooking(booking.id, {
        villaId: String(form.get('villaId')),
        checkIn: String(form.get('checkIn')),
        checkOut: String(form.get('checkOut')),
        guests: Number(form.get('guests')),
        mealPlan: String(form.get('mealPlan')),
        guestName: String(form.get('guestName')),
        guestKana: String(form.get('guestKana')),
        email: String(form.get('email')),
        phone: String(form.get('phone')),
        notes: String(form.get('notes')),
        staffNotes: String(form.get('staffNotes')),
        source: String(form.get('source')),
        status: String(form.get('status')),
      })
      setBooking(result.booking)
      setMessage('保存しました。料金は日程・人数・食事の変更に合わせて再計算しています。')
    } catch (err) {
      setError(err instanceof Error ? err.message : '保存に失敗しました。')
    } finally {
      setSaving(false)
    }
  }

  async function setStatus(status: string) {
    if (!booking) return
    setSaving(true)
    setError('')
    try {
      const result = await patchAdminBooking(booking.id, { status })
      setBooking(result.booking)
      setMessage(`${BOOKING_STATUS[status] ?? status}に更新しました。`)
    } catch (err) {
      setError(err instanceof Error ? err.message : '更新に失敗しました。')
    } finally {
      setSaving(false)
    }
  }

  if (error && !booking) return <p className="admin-error">{error}</p>
  if (!booking) return <p className="admin-loading">予約を読み込んでいます…</p>

  return (
    <>
      <div className="admin-head">
        <div>
          <h1>{booking.guestName} 様</h1>
          <p>
            予約番号 {booking.confirmationCode} ／ {formatFullDate(booking.checkIn)} 到着
          </p>
        </div>
        <div className="admin-actions">
          <button className="admin-btn ghost" type="button" onClick={() => navigate(-1)}>
            戻る
          </button>
          {booking.status === 'confirmed' ? (
            <>
              <button className="admin-btn" type="button" disabled={saving} onClick={() => void setStatus('completed')}>
                滞在済にする
              </button>
              <button className="admin-btn danger" type="button" disabled={saving} onClick={() => void setStatus('cancelled')}>
                キャンセル
              </button>
            </>
          ) : null}
        </div>
      </div>
      {error ? <p className="admin-error">{error}</p> : null}
      {message ? <p className="admin-ok">{message}</p> : null}
      <section className="admin-panel">
        <p>
          <span className={`admin-badge ${booking.status}`}>{BOOKING_STATUS[booking.status] ?? booking.status}</span>
          {'  '}
          {formatYen(booking.total)}（宿泊 {formatYen(booking.lodging)} / 食事 {formatYen(booking.meals)} / 税{' '}
          {formatYen(booking.tax)}）
        </p>
        <form className="admin-form" onSubmit={onSubmit}>
          <label>
            客室
            <select name="villaId" defaultValue={booking.villaId}>
              {VILLAS.map((villa) => (
                <option key={villa.id} value={villa.id}>
                  {villa.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            状態
            <select name="status" defaultValue={booking.status} key={booking.status}>
              {Object.entries(BOOKING_STATUS).map(([id, label]) => (
                <option key={id} value={id}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <label>
            到着
            <input name="checkIn" type="date" defaultValue={booking.checkIn} required />
          </label>
          <label>
            出発
            <input name="checkOut" type="date" defaultValue={booking.checkOut} required />
          </label>
          <label>
            人数
            <input name="guests" type="number" min={1} defaultValue={booking.guests} required />
          </label>
          <label>
            食事
            <select name="mealPlan" defaultValue={booking.mealPlan}>
              {MEAL_PLANS.map((plan) => (
                <option key={plan.id} value={plan.id}>
                  {plan.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            氏名
            <input name="guestName" defaultValue={booking.guestName} required />
          </label>
          <label>
            ふりがな
            <input name="guestKana" defaultValue={booking.guestKana} />
          </label>
          <label>
            メール
            <input name="email" type="email" defaultValue={booking.email} required />
          </label>
          <label>
            電話
            <input name="phone" defaultValue={booking.phone} required />
          </label>
          <label>
            予約経路
            <select name="source" defaultValue={booking.source}>
              {Object.entries(BOOKING_SOURCE).map(([id, label]) => (
                <option key={id} value={id}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <label>
            登録日時
            <input value={formatDateTime(booking.createdAt ?? '')} readOnly />
          </label>
          <label className="wide">
            お客様からのご要望
            <textarea name="notes" defaultValue={booking.notes} />
          </label>
          <label className="wide">
            社内メモ（お客様には表示されません）
            <textarea name="staffNotes" defaultValue={booking.staffNotes} />
          </label>
          <div className="wide">
            <button className="admin-btn gold" type="submit" disabled={saving}>
              {saving ? '保存中…' : '内容を保存する'}
            </button>
          </div>
        </form>
      </section>
      <p className="admin-note">
        <Link to="/admin/bookings">台帳へ戻る</Link>
      </p>
    </>
  )
}
