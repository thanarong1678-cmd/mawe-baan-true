'use client'

import { useEffect, useState, type ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function AuthGuard({ children }: { children: ReactNode }) {
  const pathname = usePathname()
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
        window.location.replace('/login')
        return
      }

      setChecking(false)
    }

    checkAuth()

    return () => {
      active = false
    }
  }, [pathname])

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
