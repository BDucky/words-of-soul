import Image from 'next/image'
import Link from 'next/link'
import type { Story } from '@/types/story'
import CategoryBadge from './CategoryBadge'

export default function SecondaryStoryCard({ story }: { story: Story }) {
  return (
    <Link href={`/stories/${story.slug}`} className="group flex gap-4">
      {/* Thumbnail */}
      <div className="relative w-28 h-20 shrink-0 rounded-lg overflow-hidden">
        <Image
          src={story.coverImage}
          alt={story.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          sizes="112px"
        />
      </div>

      {/* Content */}
      <div className="flex flex-col justify-center min-w-0">
        <CategoryBadge category={story.category} className="mb-1.5 self-start" />
        <h3 className="font-serif text-lg font-medium text-primary leading-snug line-clamp-2 group-hover:opacity-80 transition-opacity">
          {story.title}
        </h3>
        <p className="mt-1 font-sans text-sm text-on-surface-variant line-clamp-2">
          {story.excerpt}
        </p>
      </div>
    </Link>
  )
}
