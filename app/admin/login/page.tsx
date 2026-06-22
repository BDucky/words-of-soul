'use client'

import Image from 'next/image'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signIn } from '@/lib/auth'
import { SITE_NAME } from '@/lib/site'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)

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
    <div className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden">

      {/* Background — unoptimized preserves original PNG quality, no WebP conversion */}
      <Image
        src="/images/admin-login-bg.png"
        alt=""
        fill
        unoptimized
        className="object-cover object-center"
        priority
        sizes="100vw"
      />
      {/* Veil — darkens image enough for the card to feel grounded */}
      <div className="absolute inset-0 bg-black/25" />

      {/* Card */}
      <div className="relative z-10 w-full max-w-sm">
        <div className="bg-surface rounded-2xl overflow-hidden shadow-[0_32px_80px_rgba(0,0,0,0.4)] border border-white/10">

          {/* Card header — branding integrated */}
          <div className="px-10 pt-10 pb-7">
            <p className="font-sans text-[10px] font-bold tracking-[0.2em] uppercase text-on-surface-variant/60 mb-2">
              Quản trị
            </p>
            <h1 className="font-serif text-[1.85rem] font-medium text-primary leading-snug">
              {SITE_NAME}
            </h1>
          </div>

          <div className="h-px bg-outline-variant/40 mx-10" />

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-10 py-8 flex flex-col gap-6">

            <div className="flex flex-col gap-2">
              <label
                htmlFor="email"
                className="font-sans text-[10px] font-bold tracking-[0.12em] uppercase text-on-surface-variant"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="font-sans text-sm bg-transparent border-b border-outline-variant/60 py-2.5 text-on-surface placeholder:text-outline/50 focus:outline-none focus:border-primary transition-colors"
                placeholder="you@example.com"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label
                htmlFor="password"
                className="font-sans text-[10px] font-bold tracking-[0.12em] uppercase text-on-surface-variant"
              >
                Mật khẩu
              </label>
              <input
                id="password"
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="font-sans text-sm bg-transparent border-b border-outline-variant/60 py-2.5 text-on-surface placeholder:text-outline/50 focus:outline-none focus:border-primary transition-colors"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <p className="font-sans text-xs text-error -mt-2">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-2 bg-primary text-on-primary font-sans text-[13px] font-medium tracking-[0.06em] py-3.5 rounded-lg hover:bg-primary/90 active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Đang đăng nhập…' : 'Đăng nhập'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
