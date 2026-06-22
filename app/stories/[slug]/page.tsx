import { notFound } from 'next/navigation'
import Image from 'next/image'
import type { Metadata } from 'next'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import CategoryBadge from '@/components/stories/CategoryBadge'
import { getStoryBySlug, getPublishedStories } from '@/lib/stories'

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

  const publishedDate = new Date(story.publishedAt).toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <>
      <Header />

      <main className="flex-1">
        {/* Article header */}
        <div className="max-w-280 mx-auto px-6 pt-16 pb-10 text-center">
          <CategoryBadge category={story.category} className="mb-6" />
          <h1 className="font-serif text-5xl md:text-6xl font-medium text-primary leading-[1.1] tracking-[-0.02em] mb-6 max-w-3xl mx-auto">
            {story.title}
          </h1>
          <p className="font-sans text-sm text-outline uppercase tracking-[0.1em]">
            {publishedDate} · Thời gian đọc: {story.readTimeMinutes} phút
          </p>
        </div>

        {/* Cover image — full bleed */}
        {story.coverImage && (
          <div className="relative w-full h-[60vh] min-h-[360px] overflow-hidden">
            <Image
              src={story.coverImage}
              alt={story.title}
              fill
              className="object-cover"
              priority
              sizes="100vw"
            />
          </div>
        )}

        {/* Article body — 720px reading column */}
        <article className="max-w-180 mx-auto px-6 py-16">
          <div
            className="prose-story"
            dangerouslySetInnerHTML={{ __html: story.content }}
          />
        </article>

        {/* Bottom spacer */}
        <div className="h-[8rem]" />
      </main>

      <Footer />
    </>
  )
}
