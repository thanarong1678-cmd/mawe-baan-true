'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
const router = useRouter()
const [loading, setLoading] = useState(true)
const [error, setError] = useState('')

useEffect(() => {
    const login = async () => {
    try {
        const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'custom:line',
        options: {
            redirectTo: `${window.location.origin}/login`,
        },
        })

        if (error) {
        throw error
        }

        if (data.url) {
        window.location.href = data.url
        }
    } catch (err) {
        console.error(err)
        setError('ไม่สามารถเข้าสู่ระบบด้วย LINE ได้')
        setLoading(false)
    }
    }

    login()
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
        {error || 'กำลังเชื่อมต่อกับ LINE...'}
        </p>
    </div>
    </main>
)
}