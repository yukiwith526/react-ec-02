import { Link } from 'react-router-dom'
import { INN } from '../data/inn'

type HeroProps = {
  image: string
  kicker?: string
  title: string
  lead?: string
  compact?: boolean
  vertical?: string
}

export function Hero({ image, kicker, title, lead, compact, vertical }: HeroProps) {
  return (
    <section className={`hero${compact ? ' is-compact' : ''}`}>
      <div className="hero-media">
        <img src={image} alt="" className={`hero-image${compact ? '' : ' is-resolve'}`} />
      </div>
      <div className="hero-veil" />
      <div className="hero-copy">
        {kicker ? <p className="hero-kicker">{kicker}</p> : null}
        <h1>{title}</h1>
        {lead ? <p className="hero-lead">{lead}</p> : null}
        {!compact ? (
          <Link to="/reserve" className="btn btn-ghost">
            ご予約・空室検索
          </Link>
        ) : null}
      </div>
      {vertical ? <p className="hero-vertical">{vertical}</p> : null}
      {!compact ? (
        <div className="hero-scroll">
          <span>SCROLL</span>
          <i />
        </div>
      ) : null}
      <p className="hero-mark">{INN.nameEn}</p>
    </section>
  )
}
