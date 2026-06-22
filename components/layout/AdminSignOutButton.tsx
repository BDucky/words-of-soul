'use client'

import { useRouter } from 'next/navigation'
import { signOut } from '@/lib/auth'

export default function AdminSignOutButton() {
  const router = useRouter()

  async function handleSignOut() {
    await signOut()
    router.replace('/login')
  }

  return (
    <button
      onClick={handleSignOut}
      className="font-sans text-xs text-on-primary/70 hover:text-on-primary transition-colors"
    >
      Đăng xuất
    </button>
  )
}
