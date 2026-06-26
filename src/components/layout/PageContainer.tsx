import { Outlet, useLocation } from 'react-router-dom'
import { BottomNav } from './BottomNav'

const NO_NAV_ROUTES = ['/watch/', '/party/', '/community/chat/']

export function PageContainer() {
  const location = useLocation()
  const hideNav = NO_NAV_ROUTES.some((r) => location.pathname.startsWith(r))

  return (
    <div className="min-h-screen flex flex-col bg-bg-primary">
      <main
        className="flex-1 overflow-y-auto"
        style={{
          paddingBottom: hideNav ? 0 : 'calc(3.5rem + env(safe-area-inset-bottom, 0px))',
        }}
      >
        <Outlet />
      </main>
      {!hideNav && <BottomNav />}
    </div>
  )
}

export default PageContainer
