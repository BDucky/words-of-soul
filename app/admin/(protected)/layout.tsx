import type { Metadata } from 'next'
import { SITE_NAME } from '@/lib/site'
import AdminAuthGuard from '@/components/layout/AdminAuthGuard'
import AdminSidebar from '@/components/layout/AdminSidebar'

export const metadata: Metadata = {
  title: { default: 'Admin', template: `%s — Admin · ${SITE_NAME}` },
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminAuthGuard>
      <div className="flex min-h-screen bg-white">
        <AdminSidebar />
        <main className="flex-1 min-w-0 bg-white">
          {children}
        </main>
      </div>
    </AdminAuthGuard>
  )
}
