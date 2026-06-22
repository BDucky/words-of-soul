'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { SITE_NAME } from '@/lib/site'
import { signOut } from '@/lib/auth'
import {
  DashboardIcon,
  StoriesIcon,
  AnalyticsIcon,
  SettingsIcon,
  PlusIcon,
  HelpIcon,
  LogoutIcon,
} from '@/components/icons'

const NAV_ITEMS = [
  { label: 'Dashboard', href: '/admin',           activeOn: '/admin',           icon: DashboardIcon },
  { label: 'Stories',   href: '/admin',           activeOn: '/admin/stories',   icon: StoriesIcon },
  // { label: 'Analytics', href: '/admin/analytics', activeOn: '/admin/analytics', icon: AnalyticsIcon },
  // { label: 'Settings',  href: '/admin/settings',  activeOn: '/admin/settings',  icon: SettingsIcon },
]

export default function AdminSidebar() {
  const pathname = usePathname()
  const router   = useRouter()

  async function handleLogout() {
    await signOut()
    router.replace('/admin/login')
  }

  return (
    <aside className="w-64 min-h-screen bg-surface-container-low flex flex-col shrink-0 sticky top-0 self-start h-screen overflow-y-auto">

      {/* Branding */}
      <div className="px-4 pt-16 pb-2">
        <div className="px-4">
          <h1 className="font-serif text-2xl text-primary leading-tight">{SITE_NAME}</h1>
          <p className="font-sans text-sm text-on-surface-variant mt-0.5">Creative Workspace</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 pt-4">
        <ul className="flex flex-col gap-2">
          {NAV_ITEMS.map(({ label, href, activeOn, icon: Icon }) => {
            const active = activeOn === '/admin'
              ? pathname === '/admin'
              : pathname.startsWith(activeOn)
            return (
              <li key={label}>
                <Link
                  href={href}
                  className={[
                    'flex items-center gap-3 px-4 py-2 rounded-xl font-sans text-base transition-colors',
                    active
                      ? 'bg-tertiary-fixed text-on-tertiary-fixed'
                      : 'text-on-surface-variant hover:bg-surface-container',
                  ].join(' ')}
                >
                  <span className="shrink-0">
                    <Icon size={18} />
                  </span>
                  {label}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Bottom section */}
      <div className="px-4 pb-4 flex flex-col gap-4">
        <div className="h-px bg-outline-variant/30" />

        {/* New Story CTA */}
        <Link
          href="/admin/stories/new"
          className="flex items-center justify-center gap-2 bg-primary text-on-primary font-sans text-base px-6 py-3 rounded-xl hover:bg-primary/90 transition-opacity"
        >
          <PlusIcon size={14} />
          New Story
        </Link>

        {/* Help + Logout */}
        <ul className="flex flex-col gap-1">
          <li>
            <Link
              href="/admin/help"
              className="flex items-center gap-3 px-4 py-2 rounded-xl font-sans text-sm text-on-surface-variant hover:bg-surface-container transition-colors"
            >
              <HelpIcon size={14} />
              Help
            </Link>
          </li>
          <li>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-2 rounded-xl font-sans text-sm text-on-surface-variant hover:bg-surface-container transition-colors"
            >
              <LogoutIcon size={14} />
              Logout
            </button>
          </li>
        </ul>
      </div>
    </aside>
  )
}
