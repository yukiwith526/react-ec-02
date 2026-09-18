import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { adminLogin, getAdminMe } from '../lib/adminApi'
import { INN } from '../data/inn'

export function AdminLogin() {
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const [sending, setSending] = useState(false)

  useEffect(() => {
    document.title = `管理ログイン｜${INN.name}`
    document.body.classList.add('is-admin')
    getAdminMe()
      .then(() => navigate('/admin', { replace: true }))
      .catch(() => undefined)
    return () => document.body.classList.remove('is-admin')
  }, [navigate])

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    setSending(true)
    setError('')
    try {
      await adminLogin(String(form.get('username') ?? ''), String(form.get('password') ?? ''))
      navigate('/admin', { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'ログインに失敗しました。')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="admin-login">
      <div className="admin-login-card">
        <small className="kicker">STAFF ONLY</small>
        <h1>{INN.fullName}</h1>
        <p>予約・空室・お問い合わせを管理します。関係者以外は利用できません。</p>
        <form onSubmit={onSubmit}>
          <label>
            ユーザー名
            <input name="username" autoComplete="username" required defaultValue="admin" />
          </label>
          <label>
            パスワード
            <input name="password" type="password" autoComplete="current-password" required />
          </label>
          {error ? <p className="admin-error">{error}</p> : null}
          <button className="admin-btn gold" type="submit" disabled={sending}>
            {sending ? '確認中…' : 'ログイン'}
          </button>
        </form>
      </div>
    </div>
  )
}
