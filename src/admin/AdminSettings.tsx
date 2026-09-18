import { useState, type FormEvent } from 'react'
import { useNavigate, useOutletContext } from 'react-router-dom'
import { changeAdminPassword, type AdminUser } from '../lib/adminApi'

export function AdminSettings() {
  const { user } = useOutletContext<{ user: AdminUser }>()
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const next = String(form.get('newPassword') ?? '')
    const confirm = String(form.get('confirmPassword') ?? '')
    if (next !== confirm) {
      setError('確認用パスワードが一致しません。')
      return
    }
    setSaving(true)
    setError('')
    try {
      await changeAdminPassword(String(form.get('currentPassword') ?? ''), next)
      navigate('/admin/login', { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : '変更に失敗しました。')
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <div className="admin-head">
        <div>
          <h1>設定</h1>
          <p>ログイン中のアカウント：{user.displayName}（{user.username}）</p>
        </div>
      </div>
      <section className="admin-panel">
        <h2>パスワード変更</h2>
        <p className="admin-note">変更後は再ログインが必要です。10文字以上を設定してください。</p>
        {error ? <p className="admin-error">{error}</p> : null}
        <form className="admin-form" onSubmit={onSubmit}>
          <label className="wide">
            現在のパスワード
            <input name="currentPassword" type="password" autoComplete="current-password" required />
          </label>
          <label>
            新しいパスワード
            <input name="newPassword" type="password" autoComplete="new-password" minLength={10} required />
          </label>
          <label>
            新しいパスワード（確認）
            <input name="confirmPassword" type="password" autoComplete="new-password" minLength={10} required />
          </label>
          <div className="wide">
            <button className="admin-btn gold" type="submit" disabled={saving}>
              {saving ? '変更中…' : 'パスワードを変更する'}
            </button>
          </div>
        </form>
      </section>
    </>
  )
}
