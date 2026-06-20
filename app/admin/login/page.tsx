'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signIn } from '@/lib/auth'
import { SITE_NAME } from '@/lib/site'
import type { Metadata } from 'next'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await signIn(email, password)
      router.replace('/admin')
    } catch {
      setError('Email hoặc mật khẩu không đúng.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <h1 className="font-serif text-3xl text-primary mb-1">{SITE_NAME}</h1>
          <p className="font-sans text-sm text-on-surface-variant">Đăng nhập quản trị</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-surface-container-low rounded-lg px-8 py-8 flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="font-sans text-xs font-bold tracking-[0.08em] uppercase text-on-surface-variant">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="font-sans text-sm bg-surface-container-lowest border border-outline-variant/60 rounded px-3 py-2.5 text-on-surface placeholder:text-outline focus:outline-none focus:border-primary transition-colors"
              placeholder="you@example.com"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="password" className="font-sans text-xs font-bold tracking-[0.08em] uppercase text-on-surface-variant">
              Mật khẩu
            </label>
            <input
              id="password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="font-sans text-sm bg-surface-container-lowest border border-outline-variant/60 rounded px-3 py-2.5 text-on-surface placeholder:text-outline focus:outline-none focus:border-primary transition-colors"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="font-sans text-sm text-error">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-1 bg-primary text-on-primary font-sans text-sm font-medium py-2.5 rounded hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Đang đăng nhập…' : 'Đăng nhập'}
          </button>
        </form>
      </div>
    </div>
  )
}
