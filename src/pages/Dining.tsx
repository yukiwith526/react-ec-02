import { Link } from 'react-router-dom'
import { Hero } from '../components/Hero'
import { PageIntro } from '../components/PageIntro'
import { Reveal } from '../components/Reveal'
import { RevealImage } from '../components/RevealImage'
import { IMAGES, MEAL_PLANS } from '../data/inn'
import { formatYen } from '../lib/booking'

export function Dining() {
  return (
    <>
      <Hero image={IMAGES.teaRoom} kicker="DINING" title="お食事・お飲み物" lead="旬を、客室でいただく。" compact />
      <section className="section narrow">
        <Reveal>
          <PageIntro en="KAISEKI" title="会席と朝餉。土地の味を、部屋で。">
            杣音の夕食は、旬を小さく盛る会席をお部屋へ運びます。朝食は一汁三菜。素泊まりで安曇野の店を巡る滞在もできます。
          </PageIntro>
        </Reveal>
        <Reveal className="prose" delay={100}>
          <p>
            夕食は、岩魚、山菜、安曇野のわさび、信州蕎麦、りんごまで、その日の旬を一卓にまとめます。朝食は、湧水で炊いた米と焼き魚、汁物を中心に、静かな朝に合う味付けです。
          </p>
          <p>
            飲み物は、安曇野のワイナリーと日本酒、山のハーブティーをご用意。お子さま向けの献立にも対応します。
          </p>
        </Reveal>
      </section>
      <section className="section plans">
        <Reveal>
          <h2>お食事プラン</h2>
        </Reveal>
        <div className="plan-grid">
          {MEAL_PLANS.map((plan, index) => (
            <Reveal key={plan.id} delay={index * 80}>
              <article className="plan-card">
                <h3>{plan.name}</h3>
                <p className="villa-rate">
                  {plan.pricePerPerson === 0 ? '追加料金なし' : `${formatYen(plan.pricePerPerson)} / 名 / 泊`}
                </p>
                <p>{plan.note}</p>
              </article>
            </Reveal>
          ))}
        </div>
        <RevealImage src={IMAGES.sashimi} alt="旬の盛りつけ" className="wide-photo" />
        <Reveal>
          <Link to="/reserve" className="btn btn-dark">
            プランを選んで予約する
          </Link>
        </Reveal>
      </section>
    </>
  )
}
