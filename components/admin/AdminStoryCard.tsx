import Image from 'next/image'
import Link from 'next/link'
import type { Story } from '@/types/story'
import StoryCardActions from './StoryCardActions'

interface Props {
  story: Story
}

export default function AdminStoryCard({ story }: Props) {
  return (
    <article className="bg-white rounded-lg overflow-hidden border border-outline-variant/20 flex flex-col">
      {/* Cover image — links to story */}
      <Link href={`/stories/${story.slug}`} className="relative block h-44 bg-surface-container shrink-0 group">
        {story.coverImage ? (
          <Image
            src={story.coverImage}
            alt={story.title}
            fill
            className="object-cover group-hover:scale-[1.02] transition-transform duration-300"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="absolute inset-0 bg-surface-container-high" />
        )}
        <span className="absolute bottom-3 left-3 font-sans text-[10px] font-bold tracking-[0.1em] uppercase bg-tertiary-fixed text-on-tertiary-fixed-variant px-3 py-1 rounded-xl">
          {story.category}
        </span>
      </Link>

      {/* Content */}
      <div className="flex flex-col gap-2 px-4 py-4 flex-1">
        <p className="font-sans text-[10px] font-bold tracking-[0.08em] uppercase text-secondary">
          Biên soạn: {new Date(story.updatedAt).toLocaleDateString('vi-VN')}
        </p>
        <Link href={`/stories/${story.slug}`} className="group">
          <h3 className="font-serif text-lg leading-snug text-primary line-clamp-2 group-hover:opacity-70 transition-opacity">
            {story.title}
          </h3>
        </Link>
        <p className="font-sans text-sm text-on-surface-variant leading-relaxed line-clamp-3 flex-1">
          {story.excerpt}
        </p>
        <StoryCardActions storyId={story.id} storySlug={story.slug} authorId={story.authorId} />
      </div>
    </article>
  )
}
