import Link from 'next/link'
import { getAllStories } from '@/lib/stories'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Danh sách bài viết' }
export const revalidate = 0

export default async function AdminStoriesPage() {
  let stories: Awaited<ReturnType<typeof getAllStories>> = []

  try {
    stories = await getAllStories()
  } catch {
    // Firebase not configured
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-serif text-3xl text-primary">Bài viết</h1>
        <Link
          href="/admin/stories/new"
          className="bg-primary text-on-primary font-sans text-sm px-5 py-2.5 rounded hover:opacity-90 transition-opacity"
        >
          + Viết mới
        </Link>
      </div>

      {stories.length === 0 ? (
        <p className="font-sans text-on-surface-variant text-center py-20">
          Chưa có bài viết nào. Hãy bắt đầu!
        </p>
      ) : (
        <div className="bg-surface-container-lowest rounded-lg overflow-hidden border border-outline-variant/40">
          {stories.map((story, i) => (
            <div
              key={story.id}
              className={[
                'flex items-center justify-between gap-4 px-5 py-4',
                i !== 0 && 'border-t border-outline-variant/30',
              ].join(' ')}
            >
              <div className="min-w-0">
                <div className="flex items-center gap-3 mb-0.5">
                  <span className={[
                    'font-sans text-[10px] font-bold tracking-[0.1em] uppercase px-2 py-0.5 rounded-full',
                    story.published
                      ? 'bg-primary-fixed text-on-primary-fixed'
                      : 'bg-secondary-container text-on-secondary-container',
                  ].join(' ')}>
                    {story.published ? 'Đã xuất bản' : 'Bản nháp'}
                  </span>
                  <span className="font-sans text-xs text-outline">
                    {new Date(story.updatedAt).toLocaleDateString('vi-VN')}
                  </span>
                </div>
                <p className="font-serif text-lg text-primary truncate">{story.title}</p>
              </div>
              <Link
                href={`/admin/stories/${story.id}/edit`}
                className="shrink-0 font-sans text-sm text-on-surface-variant border border-outline-variant/60 px-3 py-1.5 rounded hover:border-primary hover:text-primary transition-colors"
              >
                Chỉnh sửa
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
