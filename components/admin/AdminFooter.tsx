import Link from 'next/link'
import { SITE_NAME } from '@/lib/site'

export default function AdminFooter() {
  return (
    <footer className="border-t border-outline-variant/20 pt-16 pb-4">
      <div className="flex items-center justify-between">
        <p className="font-sans text-xs font-bold text-secondary">
          © 2024 {SITE_NAME}. Rooted in creativity.
        </p>
        <nav className="flex items-center gap-6">
          <Link
            href="/privacy"
            className="font-sans text-xs font-bold text-secondary hover:text-primary transition-colors"
          >
            Privacy Policy
          </Link>
          <Link
            href="/terms"
            className="font-sans text-xs font-bold text-secondary hover:text-primary transition-colors"
          >
            Terms of Service
          </Link>
          <Link
            href="/contact"
            className="font-sans text-xs font-bold text-secondary hover:text-primary transition-colors"
          >
            Contact Us
          </Link>
        </nav>
      </div>
    </footer>
  )
}
