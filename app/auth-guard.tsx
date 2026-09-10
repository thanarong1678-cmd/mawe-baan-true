'use client'

import { useEffect, useState, type ReactNode } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function AuthGuard({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [checking, setChecking] = useState(pathname === '/')

  useEffect(() => {
    if (pathname !== '/') {
      setChecking(false)
      return
    }

    let active = true

    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser()

      if (!active) return

      if (!user) {
        router.replace('/login')
        return
      }

      setChecking(false)
    }

    checkAuth()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!active) return

      if (event === 'SIGNED_IN' && session) {
        setChecking(false)
        return
      }

      if (event === 'SIGNED_OUT') {
        setChecking(true)
        router.replace('/login')
      }
    })

    return () => {
      active = false
      subscription.unsubscribe()
    }
  }, [pathname, router])

  if (checking) {
    return (
      <main style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: '20px' }}>
        <div>
          <h2>🐱 Mawe Baan</h2>
          <p>กำลังตรวจสอบการเข้าสู่ระบบ...</p>
        </div>
      </main>
    )
  }

  return <>{children}</>
}
