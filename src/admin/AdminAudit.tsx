import { useEffect, useState } from 'react'
import { listAudit, type AuditEvent } from '../lib/adminApi'
import { AUDIT_ACTION, formatDateTime } from './labels'

export function AdminAudit() {
  const [rows, setRows] = useState<AuditEvent[]>([])
  const [action, setAction] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    listAudit(action)
      .then((data) => setRows(data.events))
      .catch((err: Error) => setError(err.message))
  }, [action])

  return (
    <>
      <div className="admin-head">
        <div>
          <h1>操作履歴</h1>
          <p>ログイン、予約の登録・変更、休業設定の記録です。直近200件まで表示します。</p>
        </div>
      </div>
      <div className="admin-filters">
        <select value={action} onChange={(event) => setAction(event.target.value)}>
          <option value="">すべての操作</option>
          {Object.entries(AUDIT_ACTION).map(([id, label]) => (
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
              <th>日時</th>
              <th>担当</th>
              <th>操作</th>
              <th>対象</th>
              <th>詳細</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <td>{formatDateTime(row.created_at)}</td>
                <td>{row.username ?? '—'}</td>
                <td>{AUDIT_ACTION[row.action] ?? row.action}</td>
                <td>
                  {row.entity ?? '—'}
                  {row.entity_id ? ` / ${row.entity_id.slice(0, 8)}` : ''}
                </td>
                <td>{row.detail ?? ''}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 ? <p className="admin-empty">履歴はまだありません。</p> : null}
      </section>
    </>
  )
}
