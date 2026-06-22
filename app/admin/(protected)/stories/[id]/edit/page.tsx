import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import StoryForm from '@/components/editor/StoryForm'
import { getStoryById } from '@/lib/stories'

interface Props {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  try {
    const story = await getStoryById(id)
    return { title: `Chỉnh sửa: ${story?.title ?? ''}` }
  } catch {
    return {}
  }
}

export const revalidate = 0

export default async function EditStoryPage({ params }: Props) {
  const { id } = await params
  let story = null

  try {
    story = await getStoryById(id)
  } catch {
    notFound()
  }

  if (!story) notFound()

  return (
    <div>
      <h1 className="font-serif text-3xl text-primary mb-10">Chỉnh sửa bài viết</h1>
      <StoryForm story={story} />
    </div>
  )
}
