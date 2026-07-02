import { useEffect, useRef, type ReactNode } from 'react'
import gsap from 'gsap'
import { useReducedMotion } from '../hooks/useReducedMotion'

interface AnimatedCounterProps {
  value: number
  duration?: number
  className?: string
  prefix?: ReactNode
  suffix?: ReactNode
  formatter?: (value: number) => string
}

/**
 * Animates numeric value changes with a smooth count-up / count-down tween.
 * Respects prefers-reduced-motion by jumping directly to the new value.
 */
export function AnimatedCounter({
  value,
  duration = 0.6,
  className,
  prefix,
  suffix,
  formatter = (v) => Math.round(v).toLocaleString(),
}: AnimatedCounterProps) {
  const reduced = useReducedMotion()
  const displayRef = useRef<HTMLSpanElement>(null)
  const valueRef = useRef(value)

  useEffect(() => {
    if (!displayRef.current) return

    const from = valueRef.current
    const to = value
    valueRef.current = to

    if (reduced) {
      displayRef.current.textContent = formatter(to)
      return
    }

    const obj = { value: from }
    const tween = gsap.to(obj, {
      value: to,
      duration,
      ease: 'power2.out',
      onUpdate: () => {
        if (displayRef.current) {
          displayRef.current.textContent = formatter(obj.value)
        }
      },
    })

    return () => {
      tween.kill()
    }
  }, [value, duration, reduced, formatter])

  return (
    <span className={className}>
      {prefix}
      <span ref={displayRef}>{formatter(value)}</span>
      {suffix}
    </span>
  )
}
