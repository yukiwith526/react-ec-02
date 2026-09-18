import { Link, Outlet, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { Header } from './Header'
import { Footer } from './Footer'
import { INN } from '../data/inn'

export function Layout() {
  const location = useLocation()
  const hideFab = location.pathname.startsWith('/reserve')

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' })
  }, [location.pathname])

  return (
    <div className="app-shell">
      <Header />
      <main>
        <Outlet />
      </main>
      <Footer />
      {hideFab ? null : (
        <Link to="/reserve" className="reserve-fab">
          ご予約・空室検索
          <span>{INN.name}</span>
        </Link>
      )}
    </div>
  )
}
