import Link from 'next/link'
import { SITE_NAME, SITE_TAGLINE } from '@/lib/site'

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-outline-variant/40 bg-surface">
      <div className="max-w-[70rem] mx-auto px-6 py-12 flex flex-col sm:flex-row justify-between gap-8">
        {/* Left */}
        <div>
          <p className="font-serif text-lg text-primary font-medium">{SITE_NAME}</p>
          <p className="mt-1 text-xs text-on-surface-variant">
            © {new Date().getFullYear()} {SITE_NAME}. {SITE_TAGLINE}.
          </p>
        </div>

        {/* Right */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <nav className="flex gap-6">
            <Link href="/about"   className="text-xs text-on-surface-variant hover:text-primary transition-colors">Giới thiệu</Link>
            <Link href="/contact" className="text-xs text-on-surface-variant hover:text-primary transition-colors">Liên hệ</Link>
            <Link href="/feed.xml" className="text-xs text-on-surface-variant hover:text-primary transition-colors">Nguồn cấp RSS</Link>
          </nav>

          {/* Social icons */}
          <div className="flex gap-3">
            <a href="#" aria-label="Email" className="text-on-surface-variant hover:text-primary transition-colors">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="2" y="4" width="20" height="16" rx="2"/>
                <path d="m2 7 10 7 10-7"/>
              </svg>
            </a>
            <a href="#" aria-label="RSS" className="text-on-surface-variant hover:text-primary transition-colors">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M4 11a9 9 0 0 1 9 9M4 4a16 16 0 0 1 16 16"/>
                <circle cx="5" cy="19" r="1" fill="currentColor"/>
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
