import { Link, useParams } from 'react-router-dom'
import { Hero } from '../components/Hero'
import { Reveal } from '../components/Reveal'
import { RevealImage } from '../components/RevealImage'
import { getVilla } from '../data/inn'
import { formatYen } from '../lib/booking'
import { NotFound } from './NotFound'

export function RoomDetail() {
  const { slug } = useParams()
  const villa = getVilla(slug ?? '')
  if (!villa) return <NotFound />

  return (
    <>
      <Hero image={villa.images[0]} kicker={villa.nameEn} title={villa.name} lead={villa.kicker} compact />
      <section className="section room-detail">
        <Reveal className="prose">
          <p>{villa.description}</p>
        </Reveal>
        <Reveal delay={80}>
          <dl className="villa-meta large">
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
            <div>
              <dt>料金</dt>
              <dd>{formatYen(villa.weekdayRate)}〜 / 泊</dd>
            </div>
          </dl>
        </Reveal>
        <div className="room-gallery">
          {villa.images.map((image, index) => (
            <RevealImage key={image} src={image} alt={`${villa.name}の様子`} emphasis={index === 0} />
          ))}
        </div>
        <Reveal className="two-col">
          <div>
            <h3>空間の特徴</h3>
            <ul className="plain-list">
              {villa.highlights.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <div>
            <h3>備えつけ</h3>
            <ul className="plain-list">
              {villa.amenities.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </Reveal>
        <Reveal className="room-cta">
          <Link to={`/reserve?villa=${villa.slug}`} className="btn btn-gold">
            {villa.name}を予約する
          </Link>
          <Link to="/rooms" className="text-link">
            客室一覧へ
          </Link>
        </Reveal>
      </section>
    </>
  )
}
