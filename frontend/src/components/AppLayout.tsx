import { useState } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import {
  makeStyles,
  tokens,
  Avatar,
  Button,
  Drawer,
  DrawerHeader,
  DrawerBody,
  InlineDrawer,
  Menu,
  MenuTrigger,
  MenuPopover,
  MenuList,
  MenuItem,
  Text,
  Title3,
} from '@fluentui/react-components'
import {
  Navigation24Regular,
  Home24Regular,
  Document24Regular,
  Chat24Regular,
  Trophy24Regular,
  Person24Regular,
  Shield24Regular,
  SignOut24Regular,
} from '@fluentui/react-icons'
import useAuthStore from '../store/authStore'

interface NavItem {
  path: string
  label: string
  icon: React.ReactNode
}

const useStyles = makeStyles({
  root: {
    display: 'flex',
    height: '100vh',
    overflow: 'hidden',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: `${tokens.spacingVerticalS} ${tokens.spacingHorizontalL}`,
    borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
    backgroundColor: tokens.colorNeutralBackground1,
    minHeight: '56px',
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalM,
  },
  mainArea: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    overflow: 'hidden',
  },
  content: {
    flex: 1,
    overflow: 'auto',
    padding: tokens.spacingHorizontalXL,
    backgroundColor: tokens.colorNeutralBackground2,
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalM,
    width: '100%',
    textAlign: 'left',
  },
  navItemActive: {
    backgroundColor: tokens.colorNeutralBackground1Selected,
  },
  mobileMenuButton: {
    display: 'none',
    '@media (max-width: 768px)': {
      display: 'inline-flex',
    },
  },
  desktopDrawer: {
    '@media (max-width: 768px)': {
      display: 'none',
    },
  },
})

const navItems: NavItem[] = [
  { path: '/', label: 'Dashboard', icon: <Home24Regular /> },
  { path: '/resources', label: 'Resources', icon: <Document24Regular /> },
  { path: '/channels', label: 'Channels', icon: <Chat24Regular /> },
  { path: '/leaderboard', label: 'Leaderboard', icon: <Trophy24Regular /> },
  { path: '/profile', label: 'Profile', icon: <Person24Regular /> },
]

export default function AppLayout() {
  const styles = useStyles()
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuthStore()
  const [mobileOpen, setMobileOpen] = useState(false)

  const isAdmin = user?.role === 'ADMIN' || user?.role === 'MODERATOR'

  const handleNav = (path: string) => {
    navigate(path)
    setMobileOpen(false)
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const isActive = (path: string): boolean => {
    if (path === '/') return location.pathname === '/'
    return location.pathname.startsWith(path)
  }

  const NavLinks = () => (
    <>
      {navItems.map((item) => (
        <Button
          key={item.path}
          appearance="subtle"
          className={`${styles.navItem} ${isActive(item.path) ? styles.navItemActive : ''}`}
          onClick={() => handleNav(item.path)}
          style={{ justifyContent: 'flex-start', padding: '10px 16px' }}
        >
          {item.icon}
          <Text>{item.label}</Text>
        </Button>
      ))}
      {isAdmin && (
        <Button
          appearance="subtle"
          className={`${styles.navItem} ${isActive('/admin') ? styles.navItemActive : ''}`}
          onClick={() => handleNav('/admin')}
          style={{ justifyContent: 'flex-start', padding: '10px 16px' }}
        >
          <Shield24Regular />
          <Text>Admin</Text>
        </Button>
      )}
    </>
  )

  return (
    <div className={styles.root}>
      {/* Desktop sidebar */}
      <div className={styles.desktopDrawer}>
        <InlineDrawer open position="start" size="small">
          <DrawerHeader>
            <Title3>OpenSolutions</Title3>
          </DrawerHeader>
          <DrawerBody>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <NavLinks />
            </div>
          </DrawerBody>
        </InlineDrawer>
      </div>

      {/* Mobile drawer */}
      <Drawer
        open={mobileOpen}
        position="start"
        size="small"
        onOpenChange={(_: unknown, data: { open: boolean }) => setMobileOpen(data.open)}
      >
        <DrawerHeader>
          <Title3>OpenSolutions</Title3>
        </DrawerHeader>
        <DrawerBody>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <NavLinks />
          </div>
        </DrawerBody>
      </Drawer>

      {/* Main area */}
      <div className={styles.mainArea}>
        <header className={styles.header}>
          <div className={styles.headerLeft}>
            <Button
              appearance="subtle"
              icon={<Navigation24Regular />}
              className={styles.mobileMenuButton}
              onClick={() => setMobileOpen(true)}
            />
            <Title3 className={styles.desktopDrawer} style={{ display: 'none' }}>OpenSolutions</Title3>
          </div>

          <Menu>
            <MenuTrigger disableButtonEnhancement>
              <Button appearance="subtle" style={{ gap: '8px' }}>
                <Avatar name={user?.name || 'User'} size={28} />
                <Text>{user?.name || 'User'}</Text>
              </Button>
            </MenuTrigger>
            <MenuPopover>
              <MenuList>
                <MenuItem icon={<Person24Regular />} onClick={() => navigate('/profile')}>
                  Profile
                </MenuItem>
                <MenuItem icon={<SignOut24Regular />} onClick={handleLogout}>
                  Sign Out
                </MenuItem>
              </MenuList>
            </MenuPopover>
          </Menu>
        </header>

        <main className={styles.content}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}
