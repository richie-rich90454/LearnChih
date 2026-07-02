import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { useReducedMotion } from '../hooks/useReducedMotion'

interface ThemeTransitionProps {
  mode: 'light' | 'dark'
  originX?: number
  originY?: number
}

/**
 * Renders a circular clip-path reveal when the theme changes.
 * The circle expands from the click/toggle origin to fill the viewport,
 * then is removed. Disabled under reduced motion.
 */
export function ThemeTransition({ mode, originX, originY }: ThemeTransitionProps) {
  const reduced = useReducedMotion()
  const ref = useRef<HTMLDivElement>(null)
  const [key, setKey] = useState(0)
  const prevModeRef = useRef(mode)

  useEffect(() => {
    if (prevModeRef.current === mode) return
    prevModeRef.current = mode
    setKey((k) => k + 1)
  }, [mode])

  useEffect(() => {
    if (reduced || !ref.current) return

    const el = ref.current
    const rect = el.getBoundingClientRect()
    const cx = originX ?? rect.width / 2
    const cy = originY ?? rect.height / 2
    const maxRadius = Math.max(
      Math.hypot(cx, cy),
      Math.hypot(rect.width - cx, cy),
      Math.hypot(cx, rect.height - cy),
      Math.hypot(rect.width - cx, rect.height - cy)
    )

    el.style.clipPath = `circle(0px at ${cx}px ${cy}px)`

    const tween = gsap.to(el, {
      clipPath: `circle(${maxRadius * 1.2}px at ${cx}px ${cy}px)`,
      duration: 0.55,
      ease: 'power2.inOut',
      onComplete: () => {
        gsap.set(el, { clipPath: 'none' })
      },
    })

    return () => {
      tween.kill()
    }
  }, [key, reduced, originX, originY])

  if (reduced) return null

  return (
    <div
      key={key}
      ref={ref}
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9998,
        pointerEvents: 'none',
        backgroundColor: mode === 'dark' ? '#0a0a0a' : '#ffffff',
      }}
    />
  )
}
