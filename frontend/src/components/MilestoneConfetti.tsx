import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { useReducedMotion } from '../hooks/useReducedMotion'

interface MilestoneConfettiProps {
  active?: boolean
  particleCount?: number
  colors?: string[]
  onComplete?: () => void
}

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  color: string
  rotation: number
  rotationSpeed: number
}

/**
 * Renders a one-shot confetti burst on a fixed canvas overlay when `active`
 * becomes true. GSAP tweens particle physics; disabled for reduced motion.
 */
export function MilestoneConfetti({
  active = false,
  particleCount = 40,
  colors = ['#0F6CBD', '#5C2E91', '#107C10', '#D83B01', '#FFB900', '#00B7C3'],
  onComplete,
}: MilestoneConfettiProps) {
  const reduced = useReducedMotion()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const firedRef = useRef(false)

  useEffect(() => {
    if (!active) {
      firedRef.current = false
      return
    }
    if (reduced || !canvasRef.current || firedRef.current) return
    firedRef.current = true

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const width = window.innerWidth
    const height = window.innerHeight
    canvas.width = width * dpr
    canvas.height = height * dpr
    canvas.style.width = `${width}px`
    canvas.style.height = `${height}px`
    ctx.scale(dpr, dpr)

    const originX = width / 2
    const originY = height / 2

    const particles: Particle[] = Array.from({ length: particleCount }, () => {
      const angle = Math.random() * Math.PI * 2
      const velocity = 4 + Math.random() * 10
      return {
        x: originX,
        y: originY,
        vx: Math.cos(angle) * velocity,
        vy: Math.sin(angle) * velocity - 4,
        size: 6 + Math.random() * 8,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 20,
      }
    })

    let completed = 0

    const draw = () => {
      ctx.clearRect(0, 0, width, height)
      particles.forEach((p) => {
        ctx.save()
        ctx.translate(p.x, p.y)
        ctx.rotate((p.rotation * Math.PI) / 180)
        ctx.fillStyle = p.color
        ctx.fillRect(-p.size / 2, -p.size / 3, p.size, p.size / 1.5)
        ctx.restore()
      })
    }

    const ctxGsap = gsap.context(() => {
      particles.forEach((p, i) => {
        gsap.to(p, {
          x: p.x + p.vx * (18 + Math.random() * 20),
          y: p.y + p.vy * (14 + Math.random() * 16) + 180,
          rotation: p.rotation + p.rotationSpeed * 24,
          opacity: 0,
          duration: 0.9,
          ease: 'power1.out',
          delay: i * 0.005,
          onUpdate: draw,
          onComplete: () => {
            completed += 1
            if (completed === particles.length) {
              ctx.clearRect(0, 0, width, height)
              onComplete?.()
            }
          },
        })
      })
    })

    draw()

    return () => {
      ctxGsap.revert()
    }
  }, [active, reduced, particleCount, colors, onComplete])

  if (reduced) return null

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 9999,
      }}
    />
  )
}
