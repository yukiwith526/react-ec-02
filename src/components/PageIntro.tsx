type PageIntroProps = {
  en: string
  title: string
  children: string
}

export function PageIntro({ en, title, children }: PageIntroProps) {
  return (
    <div className="page-intro">
      <p className="kicker">{en}</p>
      <h2>{title}</h2>
      <p>{children}</p>
    </div>
  )
}
