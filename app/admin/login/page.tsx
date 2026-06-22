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
    <div className="relative min-h-screen flex items-center justify-center px-4">

      {/* Background — full quality, no blur */}
      <Image
        src="/images/admin-login-bg.png"
        alt=""
        fill
        className="object-cover object-center"
        quality={100}
        priority
        sizes="100vw"
      />

      {/* Soft dark veil for readability without hiding the photo */}
      <div className="absolute inset-0 bg-black/30" />

      {/* Card */}
      <div className="relative z-10 w-full max-w-[22rem]">

        {/* Site name above card */}
        <div className="text-center mb-8">
          <p className="font-sans text-xs font-bold tracking-[0.15em] uppercase text-white/50 mb-2">
            Quản trị
          </p>
          <h1 className="font-serif text-4xl font-medium text-white leading-tight drop-shadow">
            {SITE_NAME}
          </h1>
        </div>

        {/* Form card */}
        <form
          onSubmit={handleSubmit}
          className="bg-surface rounded-lg px-8 py-8 flex flex-col gap-6 shadow-2xl"
        >
          {/* Email */}
          <div className="flex flex-col gap-2">
            <label
              htmlFor="email"
              className="font-sans text-[11px] font-bold tracking-[0.1em] uppercase text-on-surface-variant"
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
              className="font-sans text-sm bg-transparent border-b border-outline-variant py-2 text-on-surface placeholder:text-outline/60 focus:outline-none focus:border-primary transition-colors"
              placeholder="you@example.com"
            />
          </div>

          {/* Password */}
          <div className="flex flex-col gap-2">
            <label
              htmlFor="password"
              className="font-sans text-[11px] font-bold tracking-[0.1em] uppercase text-on-surface-variant"
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
              className="font-sans text-sm bg-transparent border-b border-outline-variant py-2 text-on-surface placeholder:text-outline/60 focus:outline-none focus:border-primary transition-colors"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="font-sans text-xs text-error -mt-2">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-1 bg-primary text-on-primary font-sans text-sm font-medium py-3 rounded hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Đang đăng nhập…' : 'Đăng nhập'}
          </button>
        </form>
      </div>
    </div>
  )
}
