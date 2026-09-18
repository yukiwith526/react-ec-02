import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { INN } from '../data/inn'

const LINKS = [
  { to: '/story', label: '宿の物語' },
  { to: '/rooms', label: '客室' },
  { to: '/dining', label: 'お食事' },
  { to: '/about', label: 'ご案内' },
  { to: '/access', label: '交通アクセス' },
  { to: '/faq', label: 'よくあるご質問' },
]

export function Header() {
  const location = useLocation()
  const [open, setOpen] = useState(false)
  const [menuPath, setMenuPath] = useState(location.pathname)
  const [scrolled, setScrolled] = useState(false)
  const home = location.pathname === '/'

  if (menuPath !== location.pathname) {
    setMenuPath(location.pathname)
    setOpen(false)
  }

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header className={`site-header${scrolled || !home || open ? ' is-solid' : ''}`}>
      <Link to="/" className="brand">
        <span className="brand-en">{INN.nameEn}</span>
        <span className="brand-ja">{INN.name}</span>
      </Link>
      <nav className="nav-desktop" aria-label="主要ナビゲーション">
        {LINKS.map((link) => (
          <NavLink key={link.to} to={link.to}>
            {link.label}
          </NavLink>
        ))}
      </nav>
      <Link to="/reserve" className="header-reserve">
        ご予約
      </Link>
      <button
        type="button"
        className={`menu-toggle${open ? ' is-open' : ''}`}
        aria-label={open ? 'メニューを閉じる' : 'メニューを開く'}
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        <span />
        <span />
      </button>
      {open ? (
        <div className="nav-drawer">
          <p className="drawer-kicker">{INN.fullName}</p>
          {LINKS.map((link) => (
            <NavLink key={link.to} to={link.to}>
              {link.label}
            </NavLink>
          ))}
          <NavLink to="/contact">お問い合わせ</NavLink>
          <Link to="/reserve" className="btn btn-gold">
            ご予約・空室検索
          </Link>
        </div>
      ) : null}
    </header>
  )
}
