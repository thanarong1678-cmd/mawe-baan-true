'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function AuthCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const code = searchParams.get('code')

    if (!code) {
      router.replace('/login?error=callback')
      return
    }

    const handleCallback = async () => {
      const { error } = await supabase.auth.exchangeCodeForSession(code)

      if (error) {
        console.error(error)
        router.replace('/login?error=callback')
        return
      }

      router.replace('/')
    }

    handleCallback()
  }, [router, searchParams])

  return (
    <main style={{ padding: 40, textAlign: 'center' }}>
      <h2>กำลังเข้าสู่ระบบ...</h2>
      <p>กรุณารอสักครู่</p>
    </main>
  )
}