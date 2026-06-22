import { redirect } from 'next/navigation'

export default function OldNewStoryPage() {
  redirect('/dashboard/stories/new')
}
