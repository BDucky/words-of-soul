'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { onAuthStateChanged } from 'firebase/auth'
import { getFirebaseAuth } from '@/lib/auth'

export default function AdminAuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const auth = getFirebaseAuth()
    const unsub = onAuthStateChanged(auth, user => {
      if (!user && pathname !== '/admin/login') {
        router.replace('/admin/login')
      } else {
        setReady(true)
      }
    })
    return unsub
  }, [pathname, router])

  if (!ready) return null

  return <>{children}</>
}
