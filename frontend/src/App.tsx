import { lazy, Suspense, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { BrowserRouter, Routes, Route, useLocation, useOutlet } from 'react-router-dom'
import {
  Spinner,
  Toaster,
  makeStyles,
} from '@fluentui/react-components'
import RequireAuth from './components/RequireAuth'
import AppLayout from './components/AppLayout'
import CookieConsent from './components/CookieConsent'
import Preconnect from './components/Preconnect'
import { UpdatePrompt } from './components/UpdatePrompt'
import { ErrorBoundary } from './components/ErrorBoundary'
import { CommandPalette, useCommandPaletteShortcut } from './components/CommandPalette'
import { PageTransition } from './components/PageTransition'
import { prefetchRoute } from './hooks/useRoutePrefetch'
import { useRouteAnnouncer } from './hooks/useRouteAnnouncer'

const LoginPage = lazy(() => import('./pages/LoginPage'))
const RegisterPage = lazy(() => import('./pages/RegisterPage'))
const VerifyEmailPage = lazy(() => import('./pages/VerifyEmailPage'))
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage'))
const ResetPasswordPage = lazy(() => import('./pages/ResetPasswordPage'))
const DashboardPage = lazy(() => import('./pages/DashboardPage'))
const ResourcesPage = lazy(() => import('./pages/ResourcesPage'))
const ResourceDetailPage = lazy(() => import('./pages/ResourceDetailPage'))
const ChannelsPage = lazy(() => import('./pages/ChannelsPage'))
const ChannelThreadPage = lazy(() => import('./pages/ChannelThreadPage'))
const ProfilePage = lazy(() => import('./pages/ProfilePage'))
const NotificationsPage = lazy(() => import('./pages/NotificationsPage'))
const FlashcardsPage = lazy(() => import('./pages/FlashcardsPage'))
const QuizPage = lazy(() => import('./pages/QuizPage'))
const LeaderboardPage = lazy(() => import('./pages/LeaderboardPage'))
const AdminPage = lazy(() => import('./pages/AdminPage'))
const ModerationPage = lazy(() => import('./pages/ModerationPage'))
const ApiDocsPage = lazy(() => import('./pages/ApiDocsPage'))
const SearchPage = lazy(() => import('./pages/SearchPage'))
const BookmarksPage = lazy(() => import('./pages/BookmarksPage'))
const StudyGroupsPage = lazy(() => import('./pages/StudyGroupsPage'))
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
  const { t } = useTranslation()
  return (
    <div className={styles.loadingContainer}>
      <Spinner size="large" label={t('common.loading')} />
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

function AnimatedOutlet() {
  const location = useLocation()
  const element = useOutlet()
  return (
    <PageTransition key={location.pathname}>
      {element}
    </PageTransition>
  )
}

function AppShell() {
  const { open, setOpen } = useCommandPaletteShortcut()

  return (
    <>
      <CommandPalette open={open} onOpenChange={setOpen} />
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<PageTransition><LoginPage /></PageTransition>} />
        <Route path="/register" element={<PageTransition><RegisterPage /></PageTransition>} />
        <Route path="/verify" element={<PageTransition><VerifyEmailPage /></PageTransition>} />
        <Route path="/forgot-password" element={<PageTransition><ForgotPasswordPage /></PageTransition>} />
        <Route path="/reset-password" element={<PageTransition><ResetPasswordPage /></PageTransition>} />

        {/* Shared layout: public routes + protected branch */}
        <Route element={<AppLayout />}>
          {/* Public routes */}
          <Route path="/resources" element={<PageTransition><ResourcesPage /></PageTransition>} />
          <Route path="/resources/:id" element={<PageTransition><ResourceDetailPage /></PageTransition>} />
          <Route path="/channels" element={<PageTransition><ChannelsPage /></PageTransition>} />
          <Route path="/channels/:channelId/threads/:threadId" element={<PageTransition><ChannelThreadPage /></PageTransition>} />
          <Route path="/search" element={<PageTransition><SearchPage /></PageTransition>} />
          <Route path="/leaderboard" element={<PageTransition><LeaderboardPage /></PageTransition>} />
          <Route path="/api-docs" element={<PageTransition><ApiDocsPage /></PageTransition>} />

          {/* Protected routes */}
          <Route element={<RequireAuth><AnimatedOutlet /></RequireAuth>}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/profile/:id" element={<ProfilePage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/flashcards" element={<FlashcardsPage />} />
            <Route path="/quizzes" element={<QuizPage />} />
            <Route path="/bookmarks" element={<BookmarksPage />} />
            <Route path="/study-groups" element={<StudyGroupsPage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/moderation" element={<ModerationPage />} />
          </Route>
        </Route>

        {/* Public catch-all 404 (must be last) */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </>
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
      prefetchRoute('flashcards', () => import('./pages/FlashcardsPage'))
      prefetchRoute('quizzes', () => import('./pages/QuizPage'))
      prefetchRoute('search', () => import('./pages/SearchPage'))
      prefetchRoute('bookmarks', () => import('./pages/BookmarksPage'))
      prefetchRoute('study-groups', () => import('./pages/StudyGroupsPage'))
    }
    if (typeof window.requestIdleCallback === 'function') {
      window.requestIdleCallback(run)
    } else {
      window.setTimeout(run, 1500)
    }
  }, [])

  // Fluent UI Tabster creates off-screen dummy inputs with aria-hidden="true"
  // and tabindex="0" for focus management. They remain programmatically
  // focusable with tabindex="-1" and no longer violate aria-hidden-focus.
  useEffect(() => {
    const fixTabsterDummies = () => {
      document.querySelectorAll<HTMLElement>('[data-tabster-dummy][tabindex="0"]').forEach((el) => {
        el.setAttribute('tabindex', '-1')
      })
    }
    fixTabsterDummies()
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === 'childList') {
          fixTabsterDummies()
          break
        }
      }
    })
    observer.observe(document.body, { childList: true, subtree: true })
    return () => observer.disconnect()
  }, [])

  return (
    <BrowserRouter>
      <Preconnect />
      <RouteAnnouncer />
      <ErrorBoundary>
        <Suspense fallback={<LoadingFallback />}>
          <AppShell />
        </Suspense>
      </ErrorBoundary>
      <Toaster position="bottom-end" timeout={4000} toasterId="main-toaster" />
      <CookieConsent />
      <UpdatePrompt />
    </BrowserRouter>
  )
}
