import Link from 'next/link'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import HeroSection from '@/components/stories/HeroSection'
import FeaturedStoryCard from '@/components/stories/FeaturedStoryCard'
import SecondaryStoryCard from '@/components/stories/SecondaryStoryCard'
import GridStoryCard from '@/components/stories/GridStoryCard'
import { getPublishedStories } from '@/lib/stories'

export const revalidate = 60

const PLACEHOLDER_HERO = 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=1600&q=80'

export default async function DashboardPage() {
  let stories: Awaited<ReturnType<typeof getPublishedStories>> = []

  try {
    stories = await getPublishedStories(6)
  } catch {
    // Firebase not yet configured — render empty state
  }

  const [featured, second, third, ...grid] = stories
  const heroImage = featured?.coverImage ?? PLACEHOLDER_HERO

  return (
    <>
      <Header />

      <main className="flex-1">
        {/* Hero */}
        <HeroSection imageUrl={heroImage} alt={featured?.title ?? 'Words of Soul'} />

        {/* Featured + Secondary */}
        {stories.length > 0 && (
          <section className="max-w-280 mx-auto px-6 mt-20">
            <div className="grid grid-cols-1 md:grid-cols-[3fr_2fr] gap-10">
              {featured && <FeaturedStoryCard story={featured} />}

              {(second || third) && (
                <div className="flex flex-col gap-8 justify-center">
                  {second && <SecondaryStoryCard story={second} />}
                  {second && third && <hr className="border-outline-variant/40" />}
                  {third  && <SecondaryStoryCard story={third} />}
                </div>
              )}
            </div>
          </section>
        )}

        {/* 3-col grid */}
        {grid.length > 0 && (
          <section className="max-w-280 mx-auto px-6 mt-32">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
              {grid.map(story => (
                <GridStoryCard key={story.id} story={story} />
              ))}
            </div>
          </section>
        )}

        {/* Empty state */}
        {stories.length === 0 && (
          <section className="max-w-280 mx-auto px-6 mt-20 text-center py-24">
            <p className="font-serif text-3xl text-primary mb-4">Chưa có câu chuyện nào.</p>
            <p className="font-sans text-on-surface-variant">
              Hãy bắt đầu bằng cách{' '}
              <Link href="/admin/stories/new" className="underline underline-offset-2 hover:text-primary transition-colors">
                viết câu chuyện đầu tiên
              </Link>
              .
            </p>
          </section>
        )}

        <div className="h-[8rem]" />
      </main>

      <Footer />
    </>
  )
}
