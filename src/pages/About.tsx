import { Hero } from '../components/Hero'
import { PageIntro } from '../components/PageIntro'
import { Reveal } from '../components/Reveal'
import { GUIDES, IMAGES, INN } from '../data/inn'

export function About() {
  return (
    <>
      <Hero image={IMAGES.shoji} kicker="ABOUT" title="ご案内" lead="畳の間と、湯の手引き。" compact />
      <section className="section narrow">
        <Reveal>
          <PageIntro en="STAY GUIDE" title="一棟一組、プライベートな時間でお出迎え">
            到着からお見送りまで、スタッフは最小限の接点で動きます。必要なときだけ現れる距離感を大切にしています。
          </PageIntro>
        </Reveal>
        <div className="guide-grid">
          {GUIDES.map((guide, index) => (
            <Reveal key={guide.title} delay={index * 70}>
              <article>
                <h3>{guide.title}</h3>
                <p>{guide.body}</p>
              </article>
            </Reveal>
          ))}
        </div>
        <Reveal delay={120}>
          <dl className="info-list">
            <div>
              <dt>チェックイン</dt>
              <dd>{INN.checkIn}</dd>
            </div>
            <div>
              <dt>チェックアウト</dt>
              <dd>{INN.checkOut}</dd>
            </div>
            <div>
              <dt>電話</dt>
              <dd>{INN.phone}</dd>
            </div>
            <div>
              <dt>所在地</dt>
              <dd>
                {INN.postal} {INN.address}
              </dd>
            </div>
          </dl>
        </Reveal>
      </section>
    </>
  )
}
