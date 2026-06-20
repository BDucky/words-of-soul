import type { Metadata } from 'next'
import { SITE_NAME } from '@/lib/site'

export const metadata: Metadata = {
  title: { default: 'Admin', template: `%s — Admin · ${SITE_NAME}` },
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-surface-container-low">
      {/* Admin top bar */}
      <div className="bg-primary text-on-primary px-6 py-3 flex items-center justify-between">
        <span className="font-serif text-base font-medium">{SITE_NAME} · Admin</span>
        <a href="/" className="font-sans text-xs text-on-primary/70 hover:text-on-primary transition-colors">
          ← Về trang chính
        </a>
      </div>

      <div className="max-w-[70rem] mx-auto px-6 py-10">
        {children}
      </div>
    </div>
  )
}
