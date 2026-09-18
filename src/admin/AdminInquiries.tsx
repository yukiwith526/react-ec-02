import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { listInquiries, type AdminInquiry } from '../lib/adminApi'
import { INQUIRY_STATUS, formatDateTime } from './labels'

export function AdminInquiries() {
  const [params, setParams] = useSearchParams()
  const [rows, setRows] = useState<AdminInquiry[]>([])
  const [error, setError] = useState('')
  const status = params.get('status') ?? ''
  const q = params.get('q') ?? ''

  useEffect(() => {
    listInquiries({ status, q })
      .then((data) => setRows(data.inquiries))
      .catch((err: Error) => setError(err.message))
  }, [status, q])

  return (
    <>
      <div className="admin-head">
        <div>
          <h1>お問い合わせ</h1>
          <p>公式サイトのフォームから届いた内容です。対応状況を更新してください。</p>
        </div>
      </div>
      <div className="admin-filters">
        <input
          value={q}
          placeholder="氏名 / メール / 本文"
          onChange={(event) => {
            const next = new URLSearchParams(params)
            if (event.target.value) next.set('q', event.target.value)
            else next.delete('q')
            setParams(next)
          }}
        />
        <select
          value={status}
          onChange={(event) => {
            const next = new URLSearchParams(params)
            if (event.target.value) next.set('status', event.target.value)
            else next.delete('status')
            setParams(next)
          }}
        >
          <option value="">すべての状態</option>
          {Object.entries(INQUIRY_STATUS).map(([id, label]) => (
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
              <th>受付</th>
              <th>お名前</th>
              <th>内容</th>
              <th>状態</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <td>{formatDateTime(row.createdAt)}</td>
                <td>
                  <Link to={`/admin/inquiries/${row.id}`}>{row.name}</Link>
                  <div className="admin-note">{row.email}</div>
                </td>
                <td>{row.message.slice(0, 80)}{row.message.length > 80 ? '…' : ''}</td>
                <td>
                  <span className={`admin-badge ${row.status}`}>{INQUIRY_STATUS[row.status] ?? row.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 ? <p className="admin-empty">お問い合わせはありません。</p> : null}
      </section>
    </>
  )
}
