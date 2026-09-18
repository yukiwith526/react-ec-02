import { useInView } from '../lib/motion'

type RevealImageProps = {
  src: string
  alt: string
  className?: string
  eager?: boolean
  emphasis?: boolean
}

export function RevealImage({ src, alt, className = '', eager = false, emphasis = false }: RevealImageProps) {
  const { ref, inView } = useInView<HTMLDivElement>(0.2)

  return (
    <div
      ref={ref}
      className={`media-frame${emphasis ? ' is-emphasis' : ''}${inView ? ' is-in' : ''} ${className}`.trim()}
    >
      <img src={src} alt={alt} loading={eager ? 'eager' : 'lazy'} decoding="async" />
    </div>
  )
}
