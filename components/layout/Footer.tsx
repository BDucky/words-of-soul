import Link from 'next/link'
import { SITE_NAME } from '@/lib/site'

export default function Footer() {
  return (
    <footer className="bg-surface">
      <div className="max-w-280 mx-auto px-6 py-12 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between sm:py-16">
        <Link
          href="/"
          className="font-serif text-2xl font-bold text-primary tracking-tight hover:opacity-80 transition-opacity"
        >
          {SITE_NAME}
        </Link>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-8">
          <nav className="flex items-center gap-6 sm:gap-6">
            <Link href="/about"   className="font-sans text-xs text-secondary hover:text-primary transition-colors">Giới thiệu</Link>
            <Link href="/privacy" className="font-sans text-xs text-secondary hover:text-primary transition-colors">Chính sách</Link>
            <Link href="/contact" className="font-sans text-xs text-secondary hover:text-primary transition-colors">Liên hệ</Link>
          </nav>

          <p className="font-sans text-xs font-bold text-secondary">
            © {new Date().getFullYear()} {SITE_NAME}. Những trang viết từ tâm hồn.
          </p>
        </div>
      </div>
    </footer>
  )
}
