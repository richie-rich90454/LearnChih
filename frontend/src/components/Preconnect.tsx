import { Helmet } from 'react-helmet-async'
import { env } from '@/env'

/**
 * Injects resource hints for the API origin configured via VITE_API_BASE_URL.
 * Falls back to the common local dev backend origin when the variable is not
 * set so local builds still benefit from preconnection.
 */
export default function Preconnect() {
  const raw = env.VITE_API_BASE_URL?.trim()
  const apiOrigin = raw ? raw.replace(/\/$/, '') : 'http://localhost:8080'

  return (
    <Helmet>
      <link rel="preconnect" href={apiOrigin} />
      <link rel="dns-prefetch" href={apiOrigin} />
    </Helmet>
  )
}
