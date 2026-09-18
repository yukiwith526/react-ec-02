import { Link } from 'react-router-dom'

export function NotFound() {
  return (
    <section className="section narrow not-found">
      <p className="kicker">404</p>
      <h1>ページが見つかりません</h1>
      <p>アドレスをご確認のうえ、トップまたは予約ページへお戻りください。</p>
      <Link to="/" className="btn btn-dark">
        トップへ
      </Link>
    </section>
  )
}
