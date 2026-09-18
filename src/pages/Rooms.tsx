import { Hero } from '../components/Hero'
import { PageIntro } from '../components/PageIntro'
import { Reveal } from '../components/Reveal'
import { VillaCard } from '../components/VillaCard'
import { IMAGES, VILLAS } from '../data/inn'

export function Rooms() {
  return (
    <>
      <Hero image={IMAGES.bedroom} kicker="ROOMS" title="客室" lead="一棟一組。畳の間と、湯。" compact />
      <section className="section">
        <Reveal>
          <PageIntro en="PRIVATE VILLAS" title="季節を告げる、二つの貸し切り宿">
            春風に乗って芽吹きが届き、秋には鹿の声が谷をわたる安曇野。時間の流れがゆるやかな一棟貸しで、自然がもたらす空気を独占してください。
          </PageIntro>
        </Reveal>
        <div className="villa-list">
          {VILLAS.map((villa) => (
            <VillaCard key={villa.id} villa={villa} featured />
          ))}
        </div>
      </section>
    </>
  )
}
