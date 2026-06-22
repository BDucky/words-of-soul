import type { Metadata } from 'next'
import { getAllStories } from '@/lib/stories'
import { SearchIcon } from '@/components/icons'
import AdminPageShell from '@/components/admin/AdminPageShell'
import StatCard from '@/components/admin/StatCard'
import AdminStoryCard from '@/components/admin/AdminStoryCard'
import AdminAddStoryCard from '@/components/admin/AdminAddStoryCard'
import AdminPagination from '@/components/admin/AdminPagination'
import AdminFooter from '@/components/admin/AdminFooter'

export const metadata: Metadata = { title: 'Dashboard' }
export const revalidate = 0

const PAGE_SIZE = 5

interface Props {
  searchParams: Promise<{ page?: string }>
}

export default async function AdminDashboardPage({ searchParams }: Props) {
  const { page: pageStr } = await searchParams
  const currentPage = Math.max(1, parseInt(pageStr ?? '1', 10))

  let stories: Awaited<ReturnType<typeof getAllStories>> = []
  try {
    stories = await getAllStories()
  } catch {
    // Firebase not configured
  }

  const totalPages  = Math.max(1, Math.ceil(stories.length / PAGE_SIZE))
  const safePage    = Math.min(currentPage, totalPages)
  const start       = (safePage - 1) * PAGE_SIZE
  const pageStories = stories.slice(start, start + PAGE_SIZE)
  const latestStory = stories[0]

  return (
    <AdminPageShell className="flex flex-col gap-16 min-h-screen">

      {/* ── Header ── */}
      <section className="flex items-start justify-between gap-6">
        <div className="flex flex-col gap-2">
          <h2 className="font-serif text-[2rem] leading-tight text-primary">
            Thư viện Sáng tạo
          </h2>
          <p className="font-sans text-lg text-secondary max-w-lg leading-relaxed">
            Chào mừng bạn trở lại với khu vườn của những câu chuyện. Hãy tiếp tục vun
            vén cho những ý tưởng đang nảy mầm.
          </p>
        </div>

        <div className="relative shrink-0">
          <input
            type="search"
            placeholder="Tìm kiếm truyện..."
            className="font-sans text-sm bg-surface-container-low border border-outline-variant/40 rounded-lg pl-4 pr-10 py-2.5 w-60 text-on-surface placeholder:text-outline/50 focus:outline-none focus:border-primary transition-colors"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-outline pointer-events-none">
            <SearchIcon size={16} />
          </span>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="grid grid-cols-3 gap-4">
        <StatCard label="Tổng số truyện"    value={stories.length} />
        <StatCard label="Lượt đọc tháng này" value="—" />
        <StatCard label="Truyện mới nhất"    value={latestStory?.title ?? '—'} variant="accent" />
      </section>

      {/* ── Story Grid ── */}
      <section>
        <div className="grid grid-cols-3 gap-6">
          {pageStories.map((story) => (
            <AdminStoryCard key={story.id} story={story} />
          ))}
          <AdminAddStoryCard />
        </div>
      </section>

      {/* ── Pagination ── */}
      <AdminPagination currentPage={safePage} totalPages={totalPages} baseHref="/admin" />

      {/* ── Footer ── */}
      <AdminFooter />

    </AdminPageShell>
  )
}
