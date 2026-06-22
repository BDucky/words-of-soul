'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { SITE_NAME } from '@/lib/site'
import { signOut } from '@/lib/auth'
import { DashboardIcon, StoriesIcon, PlusIcon, HelpIcon, LogoutIcon } from '@/components/icons'

const NAV_ITEMS = [
  { label: 'Dashboard', href: '/dashboard', activeOn: '/dashboard',         icon: DashboardIcon },
  { label: 'Stories',   href: '/dashboard', activeOn: '/dashboard/stories', icon: StoriesIcon },
]

export default function AdminTopBar() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  async function handleLogout() {
    setOpen(false)
    await signOut()
    router.replace('/login')
  }

  return (
    <>
      {/* Fixed top bar — mobile only */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-40 h-14 bg-surface-container-low border-b border-outline-variant/20 flex items-center justify-between px-4">
        <span className="font-serif text-xl text-primary">{SITE_NAME}</span>
        <button
          onClick={() => setOpen(true)}
          className="w-9 h-9 flex items-center justify-center rounded-lg text-on-surface-variant hover:bg-surface-container transition-colors"
          aria-label="Open navigation menu"
        >
          <svg width={20} height={20} viewBox="0 0 20 20" fill="none" aria-hidden>
            <path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
          </svg>
        </button>
      </header>

      {/* Backdrop */}
      <div
        aria-hidden
        className={[
          'lg:hidden fixed inset-0 z-50 bg-black/40 transition-opacity duration-200',
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none',
        ].join(' ')}
        onClick={() => setOpen(false)}
      />

      {/* Slide-in drawer */}
      <div
        className={[
          'lg:hidden fixed top-0 left-0 z-50 h-full w-72 bg-surface-container-low flex flex-col shadow-xl transition-transform duration-200',
          open ? 'translate-x-0' : '-translate-x-full',
        ].join(' ')}
      >
        {/* Drawer header */}
        <div className="flex items-start justify-between px-6 pt-8 pb-4">
          <div>
            <h1 className="font-serif text-2xl text-primary leading-tight">{SITE_NAME}</h1>
            <p className="font-sans text-sm text-on-surface-variant mt-0.5">Creative Workspace</p>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="mt-1 w-8 h-8 flex items-center justify-center rounded-lg text-on-surface-variant hover:bg-surface-container transition-colors"
            aria-label="Close menu"
          >
            <svg width={16} height={16} viewBox="0 0 16 16" fill="none" aria-hidden>
              <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-4 pt-2 overflow-y-auto">
          <ul className="flex flex-col gap-1.5">
            {NAV_ITEMS.map(({ label, href, activeOn, icon: Icon }) => {
              const active = activeOn === '/dashboard'
                ? pathname === '/dashboard'
                : pathname.startsWith(activeOn)
              return (
                <li key={label}>
                  <Link
                    href={href}
                    onClick={() => setOpen(false)}
                    className={[
                      'flex items-center gap-3 px-4 py-2.5 rounded-xl font-sans text-base transition-colors',
                      active
                        ? 'bg-tertiary-fixed text-on-tertiary-fixed'
                        : 'text-on-surface-variant hover:bg-surface-container',
                    ].join(' ')}
                  >
                    <Icon size={18} />
                    {label}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* CTA + footer */}
        <div className="px-4 pb-8 flex flex-col gap-3">
          <div className="h-px bg-outline-variant/30" />
          <Link
            href="/dashboard/stories/new"
            onClick={() => setOpen(false)}
            className="flex items-center justify-center gap-2 bg-primary text-on-primary font-sans text-sm px-6 py-3 rounded-xl hover:bg-primary/90 transition-opacity"
          >
            <PlusIcon size={14} />
            New Story
          </Link>
          <ul className="flex flex-col gap-0.5">
            <li>
              <Link
                href="/help"
                onClick={() => setOpen(false)}
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
      </div>
    </>
  )
}
