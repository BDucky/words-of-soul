'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { DashboardIcon, StoriesIcon, PlusIcon } from '@/components/icons'

export default function AdminMobileNav() {
  const pathname = usePathname()

  const dashActive    = pathname === '/dashboard'
  const storiesActive = pathname.startsWith('/dashboard/stories')

  return (
    <nav
      aria-label="Mobile navigation"
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 h-16 bg-surface-container-low border-t border-outline-variant/20 flex items-center"
    >
      {/* Dashboard */}
      <Link
        href="/dashboard"
        className={[
          'flex-1 flex flex-col items-center justify-center gap-1 h-full transition-colors',
          dashActive ? 'text-primary' : 'text-on-surface-variant',
        ].join(' ')}
      >
        <DashboardIcon size={20} />
        <span className="font-sans text-[10px] tracking-wide">Dashboard</span>
      </Link>

      {/* Centre FAB */}
      <div className="flex-shrink-0 px-6">
        <Link
          href="/dashboard/stories/new"
          aria-label="Write new story"
          className="w-12 h-12 bg-primary text-on-primary rounded-xl flex items-center justify-center hover:bg-primary/90 transition-colors shadow-md"
        >
          <PlusIcon size={18} />
        </Link>
      </div>

      {/* Stories */}
      <Link
        href="/dashboard"
        className={[
          'flex-1 flex flex-col items-center justify-center gap-1 h-full transition-colors',
          storiesActive ? 'text-primary' : 'text-on-surface-variant',
        ].join(' ')}
      >
        <StoriesIcon size={20} />
        <span className="font-sans text-[10px] tracking-wide">Stories</span>
      </Link>
    </nav>
  )
}
