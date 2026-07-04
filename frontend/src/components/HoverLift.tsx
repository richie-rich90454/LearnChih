import { useRef, type ReactNode, useEffect } from 'react'
import gsap from 'gsap'
import { useReducedMotion } from '../hooks/useReducedMotion'

interface HoverLiftProps {
  children: ReactNode
  className?: string
  scale?: number
  y?: number
  shadow?: string
}

/**
 * Adds a subtle lift + scale micro-interaction on hover/focus.
 * Safe to wrap any interactive element (cards, buttons, list rows).
 */
export function HoverLift({
  children,
  className,
  scale = 1.02,
  y = -2,
  shadow: _shadow,
}: HoverLiftProps) {
  const reduced = useReducedMotion()
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (reduced || !ref.current) return

    const el = ref.current

    const ctx = gsap.context(() => {
      const enter = () => {
        gsap.to(el, { scale, y, duration: 0.25, ease: 'power2.out' })
      }
      const leave = () => {
        gsap.to(el, { scale: 1, y: 0, duration: 0.25, ease: 'power2.out' })
      }

      el.addEventListener('mouseenter', enter)
      el.addEventListener('mouseleave', leave)
      el.addEventListener('focusin', enter)
      el.addEventListener('focusout', leave)

      return () => {
        el.removeEventListener('mouseenter', enter)
        el.removeEventListener('mouseleave', leave)
        el.removeEventListener('focusin', enter)
        el.removeEventListener('focusout', leave)
      }
    }, ref)

    return () => {
      ctx.revert()
    }
  }, [reduced, scale, y])

  return (
    <div ref={ref} className={className} style={{ willChange: reduced ? undefined : 'transform' }}>
      {children}
    </div>
  )
}
