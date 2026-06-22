import type { Metadata } from 'next'
import Link from 'next/link'
import { SITE_NAME } from '@/lib/site'
import AdminAuthGuard from '@/components/layout/AdminAuthGuard'
import AdminSignOutButton from '@/components/layout/AdminSignOutButton'

export const metadata: Metadata = {
  title: { default: 'Admin', template: `%s — Admin · ${SITE_NAME}` },
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminAuthGuard>
      <div className="min-h-screen bg-surface-container-low">
        <div className="bg-primary text-on-primary px-6 py-3 flex items-center justify-between">
          <span className="font-serif text-base font-medium">{SITE_NAME} · Admin</span>
          <div className="flex items-center gap-4">
            <Link href="/" className="font-sans text-xs text-on-primary/70 hover:text-on-primary transition-colors">
              ← Về trang chính
            </Link>
            <span className="text-on-primary/30">|</span>
            <AdminSignOutButton />
          </div>
        </div>

        <div className="max-w-280 mx-auto px-6 py-10">
          {children}
        </div>
      </div>
    </AdminAuthGuard>
  )
}
