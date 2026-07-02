interface OptimizedImageProps {
  src: string
  alt: string
  width: number
  height: number
  srcSet?: string
  sizes?: string
  /** Mark as the LCP image to load eagerly with high fetch priority. */
  priority?: boolean
  className?: string
}

/**
 * Wrapper around <img> with sensible performance defaults:
 * - lazy loading + async decoding for off-screen images
 * - explicit width/height to prevent layout shift (CLS)
 * - srcSet/sizes for responsive image delivery
 * - priority flag promotes the LCP image (eager + fetchPriority="high")
 *
 * Spec refs: C31, C35, C42–C44, C33.
 */
export function OptimizedImage({
  src,
  alt,
  width,
  height,
  srcSet,
  sizes,
  priority,
  className,
}: OptimizedImageProps) {
  return (
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
      fetchPriority={priority ? 'high' : 'auto'}
      srcSet={srcSet}
      sizes={sizes}
      className={className}
    />
  )
}

export default OptimizedImage
