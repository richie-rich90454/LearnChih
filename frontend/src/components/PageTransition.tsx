import { useRef, type ReactNode } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { useReducedMotion } from '../hooks/useReducedMotion'

interface PageTransitionProps {
  children: ReactNode
  className?: string
}

/**
 * Wraps routed page content with a subtle fade/slide enter animation.
 * Exit animation is intentionally omitted to keep React Router navigation
 * snappy; the enter animation provides the motion "sugar" without blocking
 * the UI.
 */
export function PageTransition({ children, className }: PageTransitionProps) {
  const reduced = useReducedMotion()
  const containerRef = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      if (reduced) return
      gsap.fromTo(
        containerRef.current,
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out' }
      )
    },
    { scope: containerRef, dependencies: [reduced] }
  )

  return (
    <div ref={containerRef} className={className}>
      {children}
    </div>
  )
}
