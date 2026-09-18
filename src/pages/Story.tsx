import { Link } from 'react-router-dom'
import { Hero } from '../components/Hero'
import { PageIntro } from '../components/PageIntro'
import { Reveal } from '../components/Reveal'
import { RevealImage } from '../components/RevealImage'
import { IMAGES, STORY_BEATS } from '../data/inn'

export function Story() {
  return (
    <>
      <Hero image={IMAGES.house} kicker="STORY" title="宿の物語" lead="止まった針が、いま動き出す。" compact />
      <section className="section narrow">
        <Reveal>
          <PageIntro en="FROM THE FOREST" title="由緒ある山の小屋を、後世へ。">
            かつて杣人が往来した峠の手前で、旅人と仕事人が同じ囲炉裏を囲みました。その記憶を消さず、いまの暮らしの静けさに翻訳したのが杣音です。
          </PageIntro>
        </Reveal>
        <Reveal className="prose" delay={120}>
          <p>
            「山を守りながら、人を泊める場所として残してほしい」——最後の当主が託した言葉を起点に、古材の軸組を調べ、石垣を積み直し、信州唐松と姫子松を足しました。派手な新築ではなく、時間の層が見える建築を選んでいます。
          </p>
          <p>
            障子を開ければ、鳥の声と水路の音が先に届きます。畳に座り、庭石を眺め、湯に浸かる。暮らすように滞在し、翌朝には山の気配で目が覚める。そんな一日一組の時間を用意しました。
          </p>
        </Reveal>
      </section>
      <section className="timeline-wrap">
        <div className="timeline is-wrap">
          {STORY_BEATS.map((beat, index) => (
            <Reveal key={beat.year} delay={index * 80}>
              <article className="timeline-card">
                <p className="year">{beat.year}</p>
                <h3>{beat.title}</h3>
                <p>{beat.body}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </section>
      <section className="split reverse">
        <RevealImage src={IMAGES.architecture} alt="障子と畳の間" className="split-media" />
        <Reveal className="split-copy">
          <p className="kicker">ARCHITECTURE</p>
          <h2>残すものと、足すもの。</h2>
          <p>
            火打梁、手斧の跡、庭石、障子。価値ある造作は残し、断熱と水回りは現代の基準へ。サステナブルであることは、山の仕事を継ぐことでもあります。
          </p>
          <Link to="/rooms" className="text-link">
            客室を見る
          </Link>
        </Reveal>
      </section>
    </>
  )
}
