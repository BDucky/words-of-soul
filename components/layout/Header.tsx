'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { SITE_NAME } from '@/lib/site'

const NAV_LINKS = [
  { href: '/',         label: 'Câu chuyện' },
  { href: '/about',    label: 'Giới thiệu' },
]

export default function Header() {
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-50 bg-surface/95 backdrop-blur-sm border-b border-outline-variant/40">
      <div className="max-w-[70rem] mx-auto px-6 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link
          href="/"
          className="font-serif text-xl font-medium text-primary tracking-tight hover:opacity-80 transition-opacity"
        >
          {SITE_NAME}
        </Link>

        {/* Nav */}
        <nav className="hidden sm:flex items-center gap-8">
          {NAV_LINKS.map(({ href, label }) => {
            const active = pathname === href
            return (
              <Link
                key={href}
                href={href}
                className={[
                  'font-sans text-sm text-primary transition-all',
                  'border-b pb-0.5',
                  active
                    ? 'border-primary font-medium'
                    : 'border-transparent hover:border-primary/50',
                ].join(' ')}
              >
                {label}
              </Link>
            )
          })}
        </nav>

        {/* Hamburger (mobile) */}
        <button
          className="sm:hidden text-primary p-1"
          aria-label="Menu"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </button>
      </div>
    </header>
  )
}
