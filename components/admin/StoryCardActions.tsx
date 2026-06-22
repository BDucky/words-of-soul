'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { deleteStory } from '@/lib/stories'
import { getFirebaseAuth } from '@/lib/auth'
import { EyeIcon, PencilIcon, TrashIcon } from '@/components/icons'

interface Props {
  storyId:   string
  storySlug: string
  authorId:  string
}

export default function StoryCardActions({ storyId, storySlug, authorId }: Props) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  const [isOwner, setIsOwner] = useState(false)

  useEffect(() => {
    const uid = getFirebaseAuth().currentUser?.uid ?? ''
    // Stories without authorId (created before this feature) are editable by anyone
    setIsOwner(!authorId || authorId === uid)
  }, [authorId])

  async function handleDelete() {
    if (!confirm('Xoá bài viết này?')) return
    setBusy(true)
    try {
      await deleteStory(storyId)
      router.refresh()
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex items-center justify-between pt-4 border-t border-outline-variant/20">
      <div className="flex items-center gap-3">
        <Link
          href={`/stories/${storySlug}`}
          target="_blank"
          className="text-on-surface-variant hover:text-primary transition-colors"
          title="Xem bài viết"
        >
          <EyeIcon size={16} />
        </Link>

        {isOwner && (
          <Link
            href={`/admin/stories/${storyId}/edit`}
            className="text-on-surface-variant hover:text-primary transition-colors"
            title="Chỉnh sửa"
          >
            <PencilIcon size={16} />
          </Link>
        )}
      </div>

      {isOwner && (
        <button
          onClick={handleDelete}
          disabled={busy}
          className="text-on-surface-variant hover:text-error transition-colors disabled:opacity-40"
          title="Xoá bài viết"
        >
          <TrashIcon size={16} />
        </button>
      )}
    </div>
  )
}
