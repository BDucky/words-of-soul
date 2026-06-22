export interface Story {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string       // TipTap HTML
  coverImage: string    // Storage URL
  category: string
  readTimeMinutes: number
  publishedAt: string   // ISO string
  updatedAt: string
  published: boolean
  authorId: string    // Firebase Auth UID of the creator
}

export type StoryInput = Omit<Story, 'id' | 'publishedAt' | 'updatedAt'>

export const CATEGORIES = [
  'Tiểu luận',
  'Thủ công',
  'Du lịch',
  'Quan sát',
  'Lối sống',
  'Thiên nhiên',
  'Cảm nhận',
] as const

export type Category = (typeof CATEGORIES)[number]
