'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function AuthCallbackPage() {
  const router = useRouter()
  const [message, setMessage] = useState('กำลังเข้าสู่ระบบ...')

  useEffect(() => {
    let active = true

    const handleCallback = async () => {
      const params = new URLSearchParams(window.location.search)
      const code = params.get('code')
      const error = params.get('error')
      const errorDescription = params.get('error_description')

      if (error) {
        if (active) {
          setMessage(`เข้าสู่ระบบไม่สำเร็จ: ${errorDescription || error}`)
        }
        return
      }

      if (!code) {
        // In case the browser has already restored the session, continue directly.
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          router.replace('/')
          return
        }

        if (active) setMessage('ไม่พบรหัสเข้าสู่ระบบ')
        return
      }

      const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

      if (exchangeError) {
        console.error(exchangeError)
        if (active) {
          setMessage(`เข้าสู่ระบบไม่สำเร็จ: ${exchangeError.message}`)
        }
        return
      }

      if (!active) return

      setMessage('เข้าสู่ระบบสำเร็จ กำลังเข้าสู่หน้าหลัก...')

      // เปลี่ยนหน้าแบบ client-side ทันที ไม่ต้องปิด/เปิดเว็บใหม่
      router.replace('/')
    }

    handleCallback()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session && active) {
        router.replace('/')
      }
    })

    return () => {
      active = false
      subscription.unsubscribe()
    }
  }, [router])

  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        padding: '20px',
      }}
    >
      <div>
        <h2>🐱 Mawe Baan</h2>
        <p>{message}</p>
      </div>
    </main>
  )
}
