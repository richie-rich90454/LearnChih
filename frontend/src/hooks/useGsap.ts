import { useRef, type DependencyList } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { useReducedMotion } from './useReducedMotion'

interface GsapSetupContext {
  gsap: typeof gsap
  tl: gsap.core.Timeline
}

/**
 * Scoped GSAP hook that automatically:
 *  - creates a timeline
 *  - scopes animations to the returned ref
 *  - reverts the context on unmount
 *  - disables animation when the user prefers reduced motion
 *
 * @param animation callback receiving gsap and a timeline. Run animations here.
 * @param deps dependencies that should re-run the animation (defaults to []).\
 *   `reduced` is always included.
 * @returns ref to attach to a container element, plus the reduced-motion flag.
 */
export function useGsap<T extends HTMLElement = HTMLDivElement>(
  animation?: (ctx: GsapSetupContext) => void,
  deps: DependencyList = []
) {
  const reduced = useReducedMotion()
  const containerRef = useRef<T>(null)

  useGSAP(
    () => {
      if (reduced) return
      const tl = gsap.timeline()
      animation?.({ gsap, tl })
    },
    {
      scope: containerRef,
      dependencies: [reduced, ...deps],
    }
  )

  return { ref: containerRef, reduced }
}
