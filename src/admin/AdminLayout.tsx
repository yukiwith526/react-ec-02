import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { adminLogout, getAdminMe, type AdminUser } from '../lib/adminApi'
import { INN } from '../data/inn'

const NAV = [
  { to: '/admin', label: '本日の動き', end: true },
  { to: '/admin/bookings', label: '予約台帳' },
  { to: '/admin/bookings/new', label: '予約を登録' },
  { to: '/admin/calendar', label: '空室カレンダー' },
  { to: '/admin/inquiries', label: 'お問い合わせ' },
  { to: '/admin/audit', label: '操作履歴' },
  { to: '/admin/settings', label: '設定' },
]

export function AdminLayout() {
  const navigate = useNavigate()
  const [user, setUser] = useState<AdminUser | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const previous = document.title
    document.title = `管理｜${INN.fullName}`
    document.body.classList.add('is-admin')
    const robots = document.createElement('meta')
    robots.name = 'robots'
    robots.content = 'noindex, nofollow'
    document.head.append(robots)
    return () => {
      document.title = previous
      document.body.classList.remove('is-admin')
      robots.remove()
    }
  }, [])

  useEffect(() => {
    getAdminMe()
      .then((data) => {
        setUser(data.user)
        setReady(true)
      })
      .catch(() => {
        setReady(true)
        setUser(null)
        navigate('/admin/login', { replace: true })
      })
  }, [navigate])

  async function onLogout() {
    try {
      await adminLogout()
    } catch {
      /* still leave */
    }
    navigate('/admin/login', { replace: true })
  }

  if (!ready) return <p className="admin-loading">管理画面を読み込んでいます…</p>
  if (!user) return null

  return (
    <div className="admin-root">
      <aside className="admin-side">
        <div className="admin-brand">
          <small>FRONT DESK</small>
          <strong>{INN.name} 管理</strong>
        </div>
        <nav className="admin-nav" aria-label="管理メニュー">
          {NAV.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end}>
              {item.label}
            </NavLink>
          ))}
          <Link to="/">公開サイト</Link>
          <button type="button" className="admin-nav-btn" onClick={() => void onLogout()}>
            ログアウト
          </button>
        </nav>
        <p className="admin-side-foot">
          {user.displayName}（{user.username}）
        </p>
      </aside>
      <div className="admin-main">
        <Outlet context={{ user }} />
      </div>
    </div>
  )
}
