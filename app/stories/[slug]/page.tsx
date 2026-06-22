import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import type { Metadata } from 'next'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import BackToTopButton from '@/components/stories/BackToTopButton'
import GridStoryCard from '@/components/stories/GridStoryCard'
import { getStoryBySlug, getPublishedStories } from '@/lib/stories'
import { SITE_NAME, SITE_TAGLINE } from '@/lib/site'

export const revalidate = 60

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  try {
    const stories = await getPublishedStories(100)
    return stories.map(s => ({ slug: s.slug }))
  } catch {
    return []
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  try {
    const story = await getStoryBySlug(slug)
    if (!story) return {}
    return {
      title: story.title,
      description: story.excerpt,
      openGraph: {
        title: story.title,
        description: story.excerpt,
        images: story.coverImage ? [story.coverImage] : [],
      },
    }
  } catch {
    return {}
  }
}

export default async function StoryDetailPage({ params }: Props) {
  const { slug } = await params
  let story = null

  try {
    story = await getStoryBySlug(slug)
  } catch {
    notFound()
  }

  if (!story) notFound()

  let related: Awaited<ReturnType<typeof getPublishedStories>> = []
  try {
    const all = await getPublishedStories(10)
    related = all.filter(s => s.slug !== slug).slice(0, 3)
  } catch {
    // Firestore not reachable at build time
  }

  const publishedDate = new Date(story.publishedAt).toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <>
      <Header />

      <main className="flex flex-col gap-16 pb-32">

        {/* ── Hero ── */}
        <section className="max-w-280 mx-auto w-full px-6 pt-4 flex flex-col gap-4">

          {/* Back link row */}
          <div className="flex items-center">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 font-sans text-base text-secondary uppercase tracking-[0.08em] hover:text-primary transition-colors"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                <path d="M10 6H2M5 3 2 6l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Back to stories
            </Link>
          </div>

          {/* Cover image with overlay */}
          {story.coverImage && (
            <div className="relative h-[459px] rounded-lg overflow-hidden">
              <Image
                src={story.coverImage}
                alt={story.title}
                fill
                className="object-cover"
                priority
                sizes="1072px"
              />
              <div className="absolute inset-0 bg-primary/25" />
            </div>
          )}

          {/* Category + title + meta — 720px centered */}
          <div className="max-w-180 mx-auto w-full pt-4 flex flex-col gap-4">
            <div className="flex justify-center">
              <span className="bg-tertiary-fixed text-on-tertiary-fixed font-sans text-xs uppercase tracking-widest px-4 py-1 rounded-xl">
                {story.category}
              </span>
            </div>

            <h1 className="font-serif text-[2.25rem] sm:text-[3rem] lg:text-[4rem] font-medium text-primary text-center leading-[1.1] tracking-[-0.01em]">
              {story.title}
            </h1>

            <div className="flex items-center justify-center gap-4 font-sans text-sm text-secondary pt-2">
              <span>{SITE_NAME}</span>
              <span className="w-1 h-1 rounded-full bg-outline-variant flex-shrink-0" />
              <span>{publishedDate}</span>
              <span className="w-1 h-1 rounded-full bg-outline-variant flex-shrink-0" />
              <span>{story.readTimeMinutes} phút đọc</span>
            </div>
          </div>
        </section>

        {/* ── Article body ── */}
        <section className="max-w-180 mx-auto w-full px-6 flex flex-col gap-16">

          <div
            className="prose-story"
            dangerouslySetInnerHTML={{ __html: story.content }}
          />

          {/* Tags + engagement */}
          <div className="flex flex-col gap-8 pt-8 border-t border-outline-variant/40">
            <div className="flex flex-wrap items-center gap-2">
              <span className="bg-surface-container-low font-sans text-xs text-secondary px-4 py-1 rounded-xl">
                {story.category}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <button className="flex items-center gap-2 font-sans text-sm text-secondary hover:text-primary transition-colors">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
                Thích
              </button>
              <button className="flex items-center gap-2 font-sans text-sm text-secondary hover:text-primary transition-colors">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8M16 6l-4-4-4 4M12 2v13" />
                </svg>
                Chia sẻ
              </button>
            </div>
          </div>

          {/* Author card */}
          <div className="bg-surface-container-low rounded-lg p-8 flex items-start gap-6">
            <div className="w-20 h-20 rounded-xl bg-surface-container flex-shrink-0" aria-hidden="true" />
            <div className="flex flex-col gap-1.5 pt-1">
              <h4 className="font-serif text-xl text-primary leading-snug">{SITE_NAME}</h4>
              <p className="font-sans text-sm text-secondary leading-relaxed">{SITE_TAGLINE}</p>
              <Link
                href="/"
                className="font-sans text-xs font-bold text-primary uppercase tracking-widest mt-2 hover:opacity-70 transition-opacity"
              >
                Xem thêm →
              </Link>
            </div>
          </div>
        </section>

        {/* ── Related stories ── */}
        {related.length > 0 && (
          <section className="w-full bg-surface-container-lowest px-4 pt-16 pb-16 sm:px-8 sm:pt-32 lg:px-20 lg:pt-48 lg:pb-32">
            <div className="max-w-280 mx-auto px-2 sm:px-6 flex flex-col gap-8 lg:gap-16">
              <div className="flex items-end justify-between">
                <div className="flex flex-col gap-1.5">
                  <p className="font-sans text-xs text-secondary uppercase tracking-widest">
                    Đề xuất cho bạn
                  </p>
                  <h2 className="font-serif text-[2rem] font-medium text-primary leading-tight">
                    Có thể bạn thích
                  </h2>
                </div>
                <Link
                  href="/"
                  className="font-sans text-sm text-secondary hover:text-primary transition-colors"
                >
                  Xem tất cả →
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                {related.map(s => (
                  <GridStoryCard key={s.id} story={s} />
                ))}
              </div>
            </div>
          </section>
        )}

      </main>

      <Footer />
      <BackToTopButton />
    </>
  )
}
