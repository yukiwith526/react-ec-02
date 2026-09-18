import { Link } from 'react-router-dom'
import { Hero } from '../components/Hero'
import { IMAGES, INN } from '../data/inn'

const LINKS = [
  { to: '/', label: 'トップ' },
  { to: '/story', label: '宿の物語' },
  { to: '/rooms', label: '客室' },
  { to: '/dining', label: 'お食事・お飲み物' },
  { to: '/about', label: 'ご案内' },
  { to: '/access', label: '交通アクセス' },
  { to: '/faq', label: 'よくあるご質問' },
  { to: '/contact', label: 'お問い合わせ' },
  { to: '/reserve', label: 'ご予約・空室検索' },
]

export function Sitemap() {
  return (
    <>
      <Hero image={IMAGES.house} kicker="SITEMAP" title="サイトマップ" compact />
      <section className="section narrow">
        <ul className="sitemap">
          {LINKS.map((link) => (
            <li key={link.to}>
              <Link to={link.to}>{link.label}</Link>
            </li>
          ))}
        </ul>
        <p className="footer-note">{INN.fullName}</p>
      </section>
    </>
  )
}
