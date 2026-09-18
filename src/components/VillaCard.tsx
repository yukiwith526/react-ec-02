import { Link } from 'react-router-dom'
import type { Villa } from '../data/inn'
import { formatYen } from '../lib/booking'
import { Reveal } from './Reveal'
import { RevealImage } from './RevealImage'

export function VillaCard({ villa, featured }: { villa: Villa; featured?: boolean }) {
  return (
    <article className={`villa-card${featured ? ' is-featured' : ''}`}>
      <Link to={`/rooms/${villa.slug}`} className="villa-photo">
        <RevealImage src={villa.images[0]} alt={`${villa.name}の客室`} emphasis />
      </Link>
      <Reveal className="villa-body">
        <p className="kicker">{villa.nameEn}</p>
        <h3>{villa.name}</h3>
        <p className="villa-kicker">{villa.kicker}</p>
        <p>{villa.summary}</p>
        <dl className="villa-meta">
          <div>
            <dt>定員</dt>
            <dd>{villa.capacity}名</dd>
          </div>
          <div>
            <dt>面積</dt>
            <dd>
              {villa.sizeSqm}㎡（{villa.floors}階建）
            </dd>
          </div>
          <div>
            <dt>駐車</dt>
            <dd>{villa.parking}台</dd>
          </div>
        </dl>
        <p className="villa-rate">
          {formatYen(villa.weekdayRate)}〜
          <small> / 1泊（税込・素泊まり）</small>
        </p>
        <div className="villa-actions">
          <Link to={`/rooms/${villa.slug}`} className="text-link">
            お部屋について
          </Link>
          <Link to={`/reserve?villa=${villa.slug}`} className="btn btn-dark">
            この客室を予約
          </Link>
        </div>
      </Reveal>
    </article>
  )
}
