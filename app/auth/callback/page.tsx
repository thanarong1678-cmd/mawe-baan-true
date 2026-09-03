'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function AuthCallbackPage() {
  const searchParams = useSearchParams()
  const [message, setMessage] = useState('กำลังตรวจสอบการเข้าสู่ระบบ...')

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get('code')
      const error = searchParams.get('error')
      const errorDescription = searchParams.get('error_description')

      console.log('OAuth code:', code)
      console.log('OAuth error:', error)
      console.log('OAuth error description:', errorDescription)

      if (error) {
        setMessage(`LINE Login Error: ${errorDescription || error}`)
        return
      }

      if (!code) {
        setMessage('ไม่พบ OAuth code')
        return
      }

      const { data, error: exchangeError } =
        await supabase.auth.exchangeCodeForSession(code)

      console.log('Exchange result:', data)
      console.log('Exchange error:', exchangeError)

      if (exchangeError) {
        setMessage(`แลก Session ไม่สำเร็จ: ${exchangeError.message}`)
        return
      }

      setMessage('เข้าสู่ระบบสำเร็จ กำลังไปหน้าแรก...')

      setTimeout(() => {
        window.location.href = '/'
      }, 1000)
    }

    handleCallback()
  }, [searchParams])

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