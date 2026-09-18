import { Link } from 'react-router-dom'
import { INN } from '../data/inn'

const GROUPS = [
  {
    title: 'SITEMAP',
    links: [
      { to: '/story', label: '宿の物語' },
      { to: '/rooms', label: '客室' },
      { to: '/about', label: 'ご案内' },
      { to: '/dining', label: 'お食事・お飲み物' },
      { to: '/access', label: '交通アクセス' },
      { to: '/faq', label: 'よくあるご質問' },
      { to: '/contact', label: 'お問い合わせ' },
      { to: '/sitemap', label: 'サイトマップ' },
    ],
  },
]

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-top">
        <Link to="/" className="footer-brand">
          <span>{INN.nameEn}</span>
          {INN.name}
        </Link>
        <div className="footer-grid">
          {GROUPS.map((group) => (
            <div key={group.title}>
              <p className="footer-heading">{group.title}</p>
              <ul>
                {group.links.map((link) => (
                  <li key={link.to}>
                    <Link to={link.to}>{link.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <div>
            <p className="footer-heading">RESERVATION</p>
            <Link to="/reserve" className="footer-reserve">
              ご予約・空室検索
            </Link>
          </div>
          <div>
            <p className="footer-heading">TEL</p>
            <a href={`tel:${INN.phone.replace(/-/g, '')}`}>{INN.phone}</a>
            <p className="footer-note">{INN.hours}</p>
          </div>
          <div>
            <p className="footer-heading">ADDRESS</p>
            <p>
              {INN.postal}
              <br />
              {INN.address}
            </p>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <p>一日一組限定の山里ヴィラ</p>
        <p>
          © {new Date().getFullYear()} {INN.fullName}
          <span className="photo-credit"> ／ 写真は Unsplash・ぱくたそ より</span>
        </p>
      </div>
    </footer>
  )
}
