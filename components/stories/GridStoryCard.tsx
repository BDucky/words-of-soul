import Image from 'next/image'
import Link from 'next/link'
import type { Story } from '@/types/story'
import CategoryBadge from './CategoryBadge'

export default function GridStoryCard({ story }: { story: Story }) {
  return (
    <Link href={`/stories/${story.slug}`} className="group block">
      {/* Cover */}
      <div className="relative w-full aspect-[3/2] rounded-lg overflow-hidden mb-4">
        <Image
          src={story.coverImage}
          alt={story.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          sizes="(max-width: 768px) 100vw, 33vw"
        />
      </div>

      <CategoryBadge category={story.category} className="mb-2" />

      <h3 className="font-serif text-xl font-medium text-primary leading-snug mb-2 group-hover:opacity-80 transition-opacity line-clamp-2">
        {story.title}
      </h3>

      <p className="font-sans text-sm text-on-surface-variant leading-relaxed line-clamp-3">
        {story.excerpt}
      </p>
    </Link>
  )
}
