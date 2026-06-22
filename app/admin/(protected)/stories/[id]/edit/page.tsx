import { redirect } from 'next/navigation'

interface Props {
  params: Promise<{ id: string }>
}

export default async function OldEditStoryPage({ params }: Props) {
  const { id } = await params
  redirect(`/dashboard/stories/${id}/edit`)
}
