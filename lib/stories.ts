import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
} from 'firebase/firestore'
import { db } from './firebase'
import type { Story, StoryInput } from '@/types/story'
import slugify from 'slugify'

const COLLECTION = 'stories'

function toStory(id: string, data: Record<string, unknown>): Story {
  return {
    id,
    title:           data.title as string,
    slug:            data.slug as string,
    excerpt:         data.excerpt as string,
    content:         data.content as string,
    coverImage:      data.coverImage as string,
    category:        data.category as string,
    readTimeMinutes: data.readTimeMinutes as number,
    publishedAt:     (data.publishedAt as Timestamp).toDate().toISOString(),
    updatedAt:       (data.updatedAt as Timestamp).toDate().toISOString(),
    published:       data.published as boolean,
    authorId:        (data.authorId as string) ?? '',
  }
}

export function generateSlug(title: string): string {
  return slugify(title, { lower: true, strict: true, locale: 'vi' })
}

export function calculateReadTime(html: string): number {
  const text = html.replace(/<[^>]+>/g, '')
  const words = text.trim().split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.ceil(words / 200))
}

export async function getPublishedStories(count = 6): Promise<Story[]> {
  const q = query(
    collection(db, COLLECTION),
    where('published', '==', true),
    orderBy('publishedAt', 'desc'),
    limit(count),
  )
  const snap = await getDocs(q)
  return snap.docs.map(d => toStory(d.id, d.data()))
}

export async function getAllStories(): Promise<Story[]> {
  const q = query(collection(db, COLLECTION), orderBy('updatedAt', 'desc'))
  const snap = await getDocs(q)
  return snap.docs.map(d => toStory(d.id, d.data()))
}

export async function getStoryBySlug(slug: string): Promise<Story | null> {
  const q = query(collection(db, COLLECTION), where('slug', '==', slug), limit(1))
  const snap = await getDocs(q)
  if (snap.empty) return null
  const d = snap.docs[0]
  return toStory(d.id, d.data())
}

export async function getStoryById(id: string): Promise<Story | null> {
  const snap = await getDoc(doc(db, COLLECTION, id))
  if (!snap.exists()) return null
  return toStory(snap.id, snap.data())
}

export async function createStory(input: StoryInput): Promise<string> {
  const now = Timestamp.now()
  const ref = await addDoc(collection(db, COLLECTION), {
    ...input,
    publishedAt: now,
    updatedAt:   now,
  })
  return ref.id
}

export async function updateStory(id: string, input: Partial<StoryInput>): Promise<void> {
  await updateDoc(doc(db, COLLECTION, id), {
    ...input,
    updatedAt: Timestamp.now(),
  })
}

export async function deleteStory(id: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTION, id))
}
