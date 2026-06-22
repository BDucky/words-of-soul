'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { SITE_NAME } from '@/lib/site'

const NAV_LINKS = [
  { href: '/',      label: 'Trang chủ', exact: true },
  { href: '/',      label: 'Truyện',    matchPrefix: '/stories' },
  { href: '/about', label: 'Giới thiệu', exact: true },
]

export default function Header() {
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-50 bg-surface">
      <div className="max-w-280 mx-auto px-6 h-[65px] flex items-center justify-between">
        {/* Logo + nav */}
        <div className="flex items-center gap-8">
          <Link
            href="/"
            className="font-serif text-2xl font-bold text-primary tracking-tight hover:opacity-80 transition-opacity"
          >
            {SITE_NAME}
          </Link>

          <nav className="hidden sm:flex items-center gap-6">
            {NAV_LINKS.map(({ href, label, exact, matchPrefix }) => {
              const active = matchPrefix
                ? pathname.startsWith(matchPrefix)
                : exact
                  ? pathname === href
                  : pathname.startsWith(href)
              return (
                <Link
                  key={label}
                  href={href}
                  className={[
                    'font-sans text-sm text-primary transition-colors border-b pb-1',
                    active
                      ? 'border-primary'
                      : 'border-transparent hover:border-primary/40',
                  ].join(' ')}
                >
                  {label}
                </Link>
              )
            })}
          </nav>
        </div>

        {/* Right: CTA + search + avatar */}
        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="hidden sm:inline-flex items-center bg-primary text-on-primary font-sans text-sm font-medium px-6 py-2 rounded-xl hover:opacity-90 transition-opacity"
          >
            Viết
          </Link>

          <button
            aria-label="Tìm kiếm"
            className="w-8 h-8 flex items-center justify-center text-primary hover:opacity-70 transition-opacity"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
          </button>

          <div className="w-8 h-8 rounded-xl overflow-hidden bg-surface-container" aria-hidden="true" />
        </div>
      </div>
    </header>
  )
}
