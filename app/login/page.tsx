'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function LoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async () => {
    setLoading(true)
    setError('')

    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'custom:line-oauth',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) {
        throw error
      }

      if (data.url) {
        window.location.assign(data.url)
      }
    } catch (err) {
      console.error(err)
      setError('ไม่สามารถเข้าสู่ระบบด้วย LINE ได้')
      setLoading(false)
    }
  }

  useEffect(() => {
    let active = true

    const checkSession = async () => {
      const { data: { user } } = await supabase.auth.getUser()

      if (active && user) {
        router.replace('/')
      }
    }

    checkSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (active && (event === 'SIGNED_IN' || session)) {
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
        background: '#f5f5f5',
        padding: '20px',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '400px',
          background: 'white',
          padding: '30px',
          borderRadius: '16px',
          textAlign: 'center',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        }}
      >
        <h1>🐱 Mawe Baan</h1>

        <p>
          {loading
            ? 'กำลังเชื่อมต่อกับ LINE...'
            : 'เข้าสู่ระบบเพื่อใช้งาน Mawe Baan'}
        </p>

        {!loading && (
          <button
            onClick={handleLogin}
            style={{
              width: '100%',
              padding: '14px',
              marginTop: '20px',
              border: 'none',
              borderRadius: '10px',
              background: '#06C755',
              color: 'white',
              fontSize: '16px',
              cursor: 'pointer',
            }}
          >
            เข้าสู่ระบบด้วย LINE
          </button>
        )}

        {error && (
          <p style={{ color: 'red', marginTop: '15px' }}>
            {error}
          </p>
        )}
      </div>
    </main>
  )
}
