import Image from 'next/image'
import Link from 'next/link'
import type { Story } from '@/types/story'
import CategoryBadge from './CategoryBadge'

export default function FeaturedStoryCard({ story }: { story: Story }) {
  return (
    <Link href={`/stories/${story.slug}`} className="group block">
      {/* Cover image */}
      <div className="relative w-full aspect-[4/3] rounded-lg overflow-hidden mb-5">
        <Image
          src={story.coverImage}
          alt={story.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
          sizes="(max-width: 768px) 100vw, 60vw"
          priority
        />
      </div>

      {/* Meta */}
      <CategoryBadge category={story.category} className="mb-3" />

      <h2 className="font-serif text-3xl font-medium text-primary leading-[1.25] mb-3 group-hover:opacity-80 transition-opacity">
        {story.title}
      </h2>

      <p className="font-sans text-base text-on-surface-variant leading-relaxed mb-4 line-clamp-3">
        {story.excerpt}
      </p>

      <p className="font-sans text-[11px] font-bold tracking-[0.1em] uppercase text-outline">
        Thời gian đọc: {story.readTimeMinutes} phút
      </p>
    </Link>
  )
}
