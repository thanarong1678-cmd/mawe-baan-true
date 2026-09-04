'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function AuthCallbackPage() {
  const [message, setMessage] = useState('กำลังเข้าสู่ระบบ...')

  useEffect(() => {
    const handleCallback = async () => {
      const params = new URLSearchParams(window.location.search)

      const code = params.get('code')
      const error = params.get('error')
      const errorDescription = params.get('error_description')

      if (error) {
        setMessage(
          `เข้าสู่ระบบไม่สำเร็จ: ${errorDescription || error}`
        )
        return
      }

      if (!code) {
        setMessage('ไม่พบรหัสเข้าสู่ระบบ')
        return
      }

      const { error: exchangeError } =
        await supabase.auth.exchangeCodeForSession(code)

      if (exchangeError) {
        console.error(exchangeError)
        setMessage(
          `เข้าสู่ระบบไม่สำเร็จ: ${exchangeError.message}`
        )
        return
      }

      setMessage('เข้าสู่ระบบสำเร็จ กำลังเข้าสู่หน้าหลัก...')

      window.location.href = '/'
    }

    handleCallback()
  }, [])

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