import { useRef, type ReactNode, type CSSProperties } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { useReducedMotion } from '../hooks/useReducedMotion'

interface StaggerRevealProps {
  children: ReactNode
  className?: string
  style?: CSSProperties
  staggerSeconds?: number
  childSelector?: string
}

/**
 * Reveals child elements with a staggered fade-up animation when the
 * component mounts. Defaults to animating direct children.
 */
export function StaggerReveal({
  children,
  className,
  style,
  staggerSeconds = 0.05,
  childSelector = '> *',
}: StaggerRevealProps) {
  const reduced = useReducedMotion()
  const containerRef = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      if (reduced) return
      const targets = containerRef.current?.querySelectorAll(childSelector)
      if (!targets || targets.length === 0) return
      gsap.fromTo(
        targets,
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.4,
          stagger: staggerSeconds,
          ease: 'power2.out',
        }
      )
    },
    { scope: containerRef, dependencies: [reduced, staggerSeconds, childSelector] }
  )

  return (
    <div ref={containerRef} className={className} style={style}>
      {children}
    </div>
  )
}
