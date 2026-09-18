import { Link } from 'react-router-dom'
import { Hero } from '../components/Hero'
import { DeerMotif, FireflyMotif } from '../components/Motifs'
import { Reveal } from '../components/Reveal'
import { RevealImage } from '../components/RevealImage'
import { VillaCard } from '../components/VillaCard'
import { CULTURE, IMAGES, INN, STORY_BEATS, VILLAS } from '../data/inn'

export function Home() {
  return (
    <>
      <Hero
        image={IMAGES.hero}
        kicker={INN.fullName}
        title={INN.name}
        lead="一日一組。畳の間から、山と水を望む離れ。"
        vertical={INN.tagline}
      />

      <section className="section story-teaser">
        <Reveal className="story-copy">
          <p className="kicker">STORY</p>
          <h2>
            杣人の小屋から
            <br />
            「杣音」へ
          </h2>
          <p>
            山の仕事を支えた古い小屋を、いまは静かな滞在のために開いています。梁に残る斧の跡も、庭をわたる風も、ここが長く人を迎えてきた場所であることを伝えています。
          </p>
          <p>
            古材を残し、信州の木を足し、障子と畳、露天の湯を整えました。一日一組だけが、森の時間を独占できます。
          </p>
          <Link to="/story" className="text-link">
            宿の物語について
          </Link>
        </Reveal>
        <div className="story-visual">
          <RevealImage src={IMAGES.house} alt="夕暮れの離れ" />
          <RevealImage src={IMAGES.tatamiGarden} alt="畳の客室" emphasis />
        </div>
      </section>

      <section className="timeline-wrap">
        <Reveal className="section-head">
          <p className="kicker">HISTORY</p>
          <h2>歴史を繋ぐ物語</h2>
        </Reveal>
        <div className="timeline">
          {STORY_BEATS.map((beat, index) => (
            <Reveal key={beat.year} delay={index * 90}>
              <article className="timeline-card">
                <p className="year">{beat.year}</p>
                <h3>{beat.title}</h3>
                <p>{beat.body}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="section rooms-home">
        <Reveal className="section-head">
          <p className="kicker">ROOMS</p>
          <h2>一棟一組。畳の上で、山を聴く。</h2>
          <p>障子を開き、湯に浸かり、庭の灯籠を眺める。春は芽吹き、秋は鹿の声。それぞれの季節が、客室の名を更新します。</p>
        </Reveal>
        <div className="motif-row">
          <DeerMotif />
          <FireflyMotif />
        </div>
        <div className="villa-list">
          {VILLAS.map((villa) => (
            <VillaCard key={villa.id} villa={villa} featured />
          ))}
        </div>
      </section>

      <section className="culture">
        <Reveal className="section-head light">
          <p className="kicker">TRADITION & LAND</p>
          <h2>木、石、水、旬。旅の景色</h2>
        </Reveal>
        <div className="culture-grid">
          {CULTURE.map((item) => (
            <figure key={item.title}>
              <RevealImage src={item.image} alt={item.title} />
              <figcaption>
                <strong>{item.title}</strong>
                <span>{item.caption}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section className="split">
        <RevealImage src={IMAGES.dining} alt="会席料理" className="split-media" />
        <Reveal className="split-copy">
          <p className="kicker">DINING</p>
          <h2>旬の会席を、客室で。</h2>
          <p>
            夕食は旬を小さく盛る会席を、客室へ。朝食は一汁三菜。素泊まりで、土地の店を歩く滞在もできます。
          </p>
          <Link to="/dining" className="text-link">
            お食事・お飲み物について
          </Link>
        </Reveal>
      </section>

      <section className="cta-band">
        <Reveal>
          <p className="kicker">RESERVATION</p>
          <h2>ご予約はこちら</h2>
          <p>
            {INN.fullName}のご予約は、公式サイトまたはお電話で承ります。
            <br />
            空室はリアルタイムでご確認いただけます。
          </p>
          <a href={`tel:${INN.phone.replace(/-/g, '')}`} className="tel">
            TEL {INN.phone}
          </a>
          <p className="footer-note">{INN.hours}</p>
          <Link to="/reserve" className="btn btn-gold">
            ご予約・空室検索
          </Link>
        </Reveal>
      </section>
    </>
  )
}
