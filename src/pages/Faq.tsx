import { Hero } from '../components/Hero'
import { PageIntro } from '../components/PageIntro'
import { Reveal } from '../components/Reveal'
import { FAQS, IMAGES } from '../data/inn'

export function Faq() {
  return (
    <>
      <Hero image={IMAGES.entrance} kicker="FAQ" title="よくあるご質問" compact />
      <section className="section narrow">
        <Reveal>
          <PageIntro en="QUESTIONS" title="滞在の前に、どうぞ。">
            予約と滞在に関するご質問をまとめました。ここにない内容はお問い合わせからご連絡ください。
          </PageIntro>
        </Reveal>
        <div className="faq-list">
          {FAQS.map((item, index) => (
            <Reveal key={item.q} delay={index * 50}>
              <details>
                <summary>{item.q}</summary>
                <p>{item.a}</p>
              </details>
            </Reveal>
          ))}
        </div>
      </section>
    </>
  )
}
