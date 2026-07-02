import { lazy, Suspense, useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import {
  Spinner,
  Toaster,
  makeStyles,
} from '@fluentui/react-components'
import RequireAuth from './components/RequireAuth'
import AppLayout from './components/AppLayout'
import CookieConsent from './components/CookieConsent'
import { UpdatePrompt } from './components/UpdatePrompt'
import { prefetchRoute } from './hooks/useRoutePrefetch'
import { useRouteAnnouncer } from './hooks/useRouteAnnouncer'

const LoginPage = lazy(() => import('./pages/LoginPage'))
const RegisterPage = lazy(() => import('./pages/RegisterPage'))
const VerifyEmailPage = lazy(() => import('./pages/VerifyEmailPage'))
const DashboardPage = lazy(() => import('./pages/DashboardPage'))
const ResourcesPage = lazy(() => import('./pages/ResourcesPage'))
const ResourceDetailPage = lazy(() => import('./pages/ResourceDetailPage'))
const ChannelsPage = lazy(() => import('./pages/ChannelsPage'))
const ChannelThreadPage = lazy(() => import('./pages/ChannelThreadPage'))
const ProfilePage = lazy(() => import('./pages/ProfilePage'))
const LeaderboardPage = lazy(() => import('./pages/LeaderboardPage'))
const AdminPage = lazy(() => import('./pages/AdminPage'))
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'))

const useStyles = makeStyles({
  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
  },
})

function LoadingFallback() {
  const styles = useStyles()
  return (
    <div className={styles.loadingContainer}>
      <Spinner size="large" label="Loading..." />
    </div>
  )
}

function RouteAnnouncer() {
  const announcement = useRouteAnnouncer()
  return (
    <div aria-live="polite" aria-atomic="true" style={{ position: 'absolute', left: '-9999px' }}>
      {announcement}
    </div>
  )
}

export default function App() {
  // Warm primary nav route chunks on idle; hover/focus prefetch lives in AppLayout.
  useEffect(() => {
    const run = () => {
      prefetchRoute('dashboard', () => import('./pages/DashboardPage'))
      prefetchRoute('resources', () => import('./pages/ResourcesPage'))
      prefetchRoute('channels', () => import('./pages/ChannelsPage'))
      prefetchRoute('leaderboard', () => import('./pages/LeaderboardPage'))
    }
    if (typeof window.requestIdleCallback === 'function') {
      window.requestIdleCallback(run)
    } else {
      window.setTimeout(run, 1500)
    }
  }, [])

  return (
    <BrowserRouter>
      <RouteAnnouncer />
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/verify" element={<VerifyEmailPage />} />

          {/* Protected routes */}
          <Route
            element={
              <RequireAuth>
                <AppLayout />
              </RequireAuth>
            }
          >
            <Route path="/" element={<DashboardPage />} />
            <Route path="/resources" element={<ResourcesPage />} />
            <Route path="/resources/:id" element={<ResourceDetailPage />} />
            <Route path="/channels" element={<ChannelsPage />} />
            <Route path="/channels/:channelId/threads/:threadId" element={<ChannelThreadPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/profile/:id" element={<ProfilePage />} />
            <Route path="/leaderboard" element={<LeaderboardPage />} />
            <Route path="/admin" element={<AdminPage />} />
          </Route>

          {/* Public catch-all 404 (must be last) */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
      <Toaster position="top" />
      <CookieConsent />
      <UpdatePrompt />
    </BrowserRouter>
  )
}
