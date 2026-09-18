import { Link } from 'react-router-dom'
import { Hero } from '../components/Hero'
import { PageIntro } from '../components/PageIntro'
import { Reveal } from '../components/Reveal'
import { IMAGES, INN } from '../data/inn'

export function Access() {
  const mapQuery = encodeURIComponent(INN.address)
  return (
    <>
      <Hero image={IMAGES.entrance} kicker="ACCESS" title="交通アクセス" lead="穂高の駅から、森の入口へ。" compact />
      <section className="section narrow">
        <Reveal>
          <PageIntro en="HOW TO REACH" title="山里までの道のり">
            東京から北陸新幹線と特急、あるいは中央自動車道。最後の十五分は、田園から森へ景色が切り替わります。
          </PageIntro>
        </Reveal>
        <div className="access-blocks">
          <Reveal>
            <article>
              <h3>電車で</h3>
              <p>JR大糸線「穂高」駅下車。タクシーまたは宿の送迎で約15分。送迎は15:00までの到着に限り、ご予約時にお申し込みください。</p>
            </article>
          </Reveal>
          <Reveal delay={80}>
            <article>
              <h3>お車で</h3>
              <p>長野自動車道・安曇野ICより約25分。各ヴィラに専用駐車場があります。冬期はスタッドレスタイヤをご用意ください。</p>
            </article>
          </Reveal>
          <Reveal delay={140}>
            <article>
              <h3>住所</h3>
              <p>
                {INN.postal}
                <br />
                {INN.address}
              </p>
              <a className="text-link" href={`https://maps.google.com/?q=${mapQuery}`} target="_blank" rel="noreferrer">
                地図アプリで開く
              </a>
            </article>
          </Reveal>
        </div>
        <Reveal>
          <iframe
            title="杣音の地図"
            className="map"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            src={`https://maps.google.com/maps?q=${mapQuery}&z=12&output=embed`}
          />
        </Reveal>
        <Reveal>
          <Link to="/reserve" className="btn btn-dark">
            到着日を選んで予約する
          </Link>
        </Reveal>
      </section>
    </>
  )
}
