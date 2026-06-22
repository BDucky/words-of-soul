'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import CoverImageUpload from './CoverImageUpload'
import { CATEGORIES } from '@/types/story'
import { createStory, updateStory, deleteStory, generateSlug, calculateReadTime } from '@/lib/stories'
import { getFirebaseAuth } from '@/lib/auth'
import type { Story } from '@/types/story'

const RichTextEditor = dynamic(() => import('./RichTextEditor'), {
  ssr: false,
  loading: () => <div className="h-64 bg-surface-container animate-pulse rounded-md" />,
})

interface Props {
  story?: Story
}

export default function StoryForm({ story }: Props) {
  const router = useRouter()
  const isEditing = !!story
  const currentUid = getFirebaseAuth().currentUser?.uid ?? ''
  const isOwner = !isEditing || !story?.authorId || story?.authorId === currentUid

  const [title,      setTitle]      = useState(story?.title ?? '')
  const [slug,       setSlug]       = useState(story?.slug ?? '')
  const [excerpt,    setExcerpt]    = useState(story?.excerpt ?? '')
  const [category,   setCategory]   = useState(story?.category ?? CATEGORIES[0])
  const [coverImage, setCoverImage] = useState(story?.coverImage ?? '')
  const [content,    setContent]    = useState(story?.content ?? '')
  const [published,  setPublished]  = useState(story?.published ?? false)
  const [saving,     setSaving]     = useState(false)
  const [deleting,   setDeleting]   = useState(false)

  function handleTitleChange(value: string) {
    setTitle(value)
    if (!isEditing || slug === generateSlug(story?.title ?? '')) {
      setSlug(generateSlug(value))
    }
  }

  async function handleSave(publish?: boolean) {
    if (!title.trim() || !content.trim()) {
      alert('Tiêu đề và nội dung không được để trống.')
      return
    }
    setSaving(true)
    try {
      const payload = {
        title:           title.trim(),
        slug:            slug.trim() || generateSlug(title),
        excerpt:         excerpt.trim(),
        category,
        coverImage,
        content,
        readTimeMinutes: calculateReadTime(content),
        published:       publish !== undefined ? publish : published,
        authorId:        isEditing ? (story?.authorId ?? currentUid) : currentUid,
      }

      if (isEditing) {
        await updateStory(story.id, payload)
      } else {
        await createStory(payload)
      }
      router.push('/admin')
      router.refresh()
    } catch (err) {
      console.error(err)
      alert('Lưu thất bại. Vui lòng thử lại.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!isEditing) return
    if (!confirm('Bạn chắc chắn muốn xóa bài viết này?')) return
    setDeleting(true)
    try {
      await deleteStory(story.id)
      router.push('/admin')
      router.refresh()
    } catch {
      alert('Xóa thất bại. Vui lòng thử lại.')
    } finally {
      setDeleting(false)
    }
  }

  const inputBase = 'w-full bg-transparent border-0 border-b border-primary/40 focus:border-primary focus:outline-none py-2 font-sans text-on-surface placeholder:text-outline transition-colors'

  if (!isOwner) {
    return (
      <div className="py-12 text-center">
        <p className="font-sans text-sm text-secondary">Bạn chỉ có thể xem bài viết này, không thể chỉnh sửa.</p>
      </div>
    )
  }

  return (
    <form onSubmit={e => { e.preventDefault(); handleSave() }} className="space-y-8">
      {/* Cover image */}
      <CoverImageUpload value={coverImage} onChange={setCoverImage} />

      {/* Title */}
      <div>
        <input
          value={title}
          onChange={e => handleTitleChange(e.target.value)}
          placeholder="Tiêu đề bài viết..."
          className={`${inputBase} font-serif text-3xl`}
          required
        />
      </div>

      {/* Slug */}
      <div>
        <label className="font-sans text-xs text-outline uppercase tracking-[0.1em] block mb-1">Slug</label>
        <input
          value={slug}
          onChange={e => setSlug(e.target.value)}
          placeholder="url-cua-bai-viet"
          className={`${inputBase} text-sm text-on-surface-variant`}
        />
      </div>

      {/* Excerpt */}
      <div>
        <label className="font-sans text-xs text-outline uppercase tracking-[0.1em] block mb-1">Tóm tắt</label>
        <textarea
          value={excerpt}
          onChange={e => setExcerpt(e.target.value)}
          placeholder="1–2 câu giới thiệu ngắn gọn..."
          rows={2}
          className={`${inputBase} resize-none`}
        />
      </div>

      {/* Category */}
      <div>
        <label className="font-sans text-xs text-outline uppercase tracking-[0.1em] block mb-1">Danh mục</label>
        <select
          value={category}
          onChange={e => setCategory(e.target.value)}
          className={`${inputBase} bg-transparent`}
        >
          {CATEGORIES.map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {/* Rich text */}
      <div>
        <label className="font-sans text-xs text-outline uppercase tracking-[0.1em] block mb-3">Nội dung</label>
        <RichTextEditor content={content} onChange={setContent} />
      </div>

      {/* Actions */}
      <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-outline-variant/40">
        {/* Published toggle */}
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <div
            onClick={() => setPublished(p => !p)}
            className={[
              'relative w-10 h-5 rounded-full transition-colors',
              published ? 'bg-primary' : 'bg-surface-container-high',
            ].join(' ')}
          >
            <div className={[
              'absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform',
              published ? 'translate-x-5' : 'translate-x-0',
            ].join(' ')} />
          </div>
          <span className="font-sans text-sm text-on-surface-variant">
            {published ? 'Xuất bản' : 'Bản nháp'}
          </span>
        </label>

        <div className="flex gap-3 ml-auto">
          {isEditing && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="font-sans text-sm text-error border border-error/40 px-4 py-2 rounded hover:bg-error-container transition-colors disabled:opacity-50"
            >
              {deleting ? 'Đang xóa...' : 'Xóa'}
            </button>
          )}
          <button
            type="button"
            onClick={() => handleSave(false)}
            disabled={saving}
            className="font-sans text-sm text-on-surface border border-outline-variant/60 px-4 py-2 rounded hover:border-primary transition-colors disabled:opacity-50"
          >
            Lưu nháp
          </button>
          <button
            type="button"
            onClick={() => handleSave(true)}
            disabled={saving}
            className="font-sans text-sm bg-primary text-on-primary px-5 py-2 rounded hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {saving ? 'Đang lưu...' : 'Xuất bản'}
          </button>
        </div>
      </div>
    </form>
  )
}
