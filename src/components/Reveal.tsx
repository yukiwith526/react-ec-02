import type { CSSProperties, ReactNode } from 'react'
import { useInView } from '../lib/motion'

type RevealProps = {
  children: ReactNode
  className?: string
  delay?: number
}

export function Reveal({ children, className = '', delay = 0 }: RevealProps) {
  const { ref, inView } = useInView<HTMLDivElement>()
  const style = delay ? ({ transitionDelay: `${delay}ms` } satisfies CSSProperties) : undefined

  return (
    <div ref={ref} className={`reveal${inView ? ' is-in' : ''} ${className}`.trim()} style={style}>
      {children}
    </div>
  )
}
