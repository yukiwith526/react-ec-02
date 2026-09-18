import { useEffect, useState, type FormEvent } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getInquiry, patchInquiry, type AdminInquiry } from '../lib/adminApi'
import { INQUIRY_STATUS, formatDateTime } from './labels'

export function AdminInquiryDetail() {
  const { id = '' } = useParams()
  const [item, setItem] = useState<AdminInquiry | null>(null)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    getInquiry(id)
      .then((data) => setItem(data.inquiry))
      .catch((err: Error) => setError(err.message))
  }, [id])

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!item) return
    const form = new FormData(event.currentTarget)
    setSaving(true)
    setError('')
    try {
      const result = await patchInquiry(item.id, {
        status: String(form.get('status')),
        staffNotes: String(form.get('staffNotes')),
      })
      setItem(result.inquiry)
      setMessage('保存しました。')
    } catch (err) {
      setError(err instanceof Error ? err.message : '保存に失敗しました。')
    } finally {
      setSaving(false)
    }
  }

  if (error && !item) return <p className="admin-error">{error}</p>
  if (!item) return <p className="admin-loading">読み込み中…</p>

  return (
    <>
      <div className="admin-head">
        <div>
          <h1>{item.name} 様</h1>
          <p>
            {formatDateTime(item.createdAt)} ／ {item.email}
            {item.phone ? ` ／ ${item.phone}` : ''}
          </p>
        </div>
        <Link className="admin-btn ghost" to="/admin/inquiries">
          一覧へ
        </Link>
      </div>
      {error ? <p className="admin-error">{error}</p> : null}
      {message ? <p className="admin-ok">{message}</p> : null}
      <section className="admin-panel">
        <h2>本文</h2>
        <p style={{ whiteSpace: 'pre-wrap' }}>{item.message}</p>
        <form className="admin-form" onSubmit={onSubmit}>
          <label>
            対応状況
            <select name="status" defaultValue={item.status} key={item.status}>
              {Object.entries(INQUIRY_STATUS).map(([id, label]) => (
                <option key={id} value={id}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <label className="wide">
            対応メモ
            <textarea name="staffNotes" defaultValue={item.staffNotes} />
          </label>
          <div className="wide">
            <button className="admin-btn gold" type="submit" disabled={saving}>
              {saving ? '保存中…' : '保存する'}
            </button>
          </div>
        </form>
      </section>
    </>
  )
}
