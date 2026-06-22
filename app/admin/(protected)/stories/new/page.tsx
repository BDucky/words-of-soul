import type { Metadata } from 'next'
import StoryForm from '@/components/editor/StoryForm'
import AdminPageShell from '@/components/admin/AdminPageShell'

export const metadata: Metadata = { title: 'Viết bài mới' }

export default function NewStoryPage() {
  return (
    <AdminPageShell>
      <h1 className="font-serif text-3xl text-primary mb-10">Viết bài mới</h1>
      <StoryForm />
    </AdminPageShell>
  )
}
