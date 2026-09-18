import { useState, type FormEvent } from 'react'
import { Hero } from '../components/Hero'
import { PageIntro } from '../components/PageIntro'
import { Reveal } from '../components/Reveal'
import { IMAGES, INN } from '../data/inn'
import { sendInquiry } from '../lib/api'

export function Contact() {
  const [status, setStatus] = useState<'idle' | 'sending' | 'ok' | 'error'>('idle')
  const [message, setMessage] = useState('')

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    setStatus('sending')
    setMessage('')
    try {
      await sendInquiry({
        name: String(form.get('name') ?? ''),
        email: String(form.get('email') ?? ''),
        phone: String(form.get('phone') ?? ''),
        message: String(form.get('message') ?? ''),
      })
      setStatus('ok')
      event.currentTarget.reset()
    } catch (error) {
      setStatus('error')
      setMessage(error instanceof Error ? error.message : '送信に失敗しました。')
    }
  }

  return (
    <>
      <Hero image={IMAGES.house} kicker="CONTACT" title="お問い合わせ" compact />
      <section className="section narrow">
        <Reveal>
          <PageIntro en="WRITE TO US" title="ご質問・ご相談">
            予約内容の変更、送迎、記念日のお手配などは、お電話またはフォームからどうぞ。
          </PageIntro>
        </Reveal>
        <Reveal delay={80}>
          <p className="contact-phone">
            TEL <a href={`tel:${INN.phone.replace(/-/g, '')}`}>{INN.phone}</a>
            <span>{INN.hours}</span>
          </p>
        </Reveal>
        <Reveal delay={140}>
          <form className="form" onSubmit={onSubmit}>
          <label>
            お名前
            <input name="name" required autoComplete="name" />
          </label>
          <label>
            メールアドレス
            <input name="email" type="email" required autoComplete="email" />
          </label>
          <label>
            電話番号
            <input name="phone" type="tel" autoComplete="tel" />
          </label>
          <label>
            お問い合わせ内容
            <textarea name="message" rows={6} required minLength={10} />
          </label>
          <button className="btn btn-dark" type="submit" disabled={status === 'sending'}>
            {status === 'sending' ? '送信中…' : '送信する'}
          </button>
          {status === 'ok' ? <p className="form-ok">承りました。二営業日以内にご連絡します。</p> : null}
          {status === 'error' ? <p className="form-error">{message}</p> : null}
        </form>
        </Reveal>
      </section>
    </>
  )
}
