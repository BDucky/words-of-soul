import type { Metadata } from 'next'
import { SITE_NAME } from '@/lib/site'
import AdminAuthGuard from '@/components/layout/AdminAuthGuard'
import AdminSidebar from '@/components/layout/AdminSidebar'
import AdminTopBar from '@/components/layout/AdminTopBar'
import AdminMobileNav from '@/components/layout/AdminMobileNav'

export const metadata: Metadata = {
  title: { default: 'Admin', template: `%s — Admin · ${SITE_NAME}` },
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminAuthGuard>
      <div className="flex min-h-screen bg-white">
        <AdminTopBar />
        <AdminSidebar />
        <main className="flex-1 min-w-0 bg-white pt-14 pb-16 lg:pt-0 lg:pb-0">
          {children}
        </main>
        <AdminMobileNav />
      </div>
    </AdminAuthGuard>
  )
}
