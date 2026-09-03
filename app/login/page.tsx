'use client'

import { useEffect, useState } from 'react'
import liff from '@line/liff'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
const router = useRouter()
const [loading, setLoading] = useState(true)
const [error, setError] = useState('')

useEffect(() => {
    const initLIFF = async () => {
    try {
        const liffId = process.env.NEXT_PUBLIC_LIFF_ID

        if (!liffId) {
        throw new Error('ไม่พบ LIFF ID ใน .env.local')
        }

        await liff.init({
        liffId,
        })

        if (!liff.isLoggedIn()) {
        liff.login()
        return
        }

        const profile = await liff.getProfile()

        localStorage.setItem(
        'line_user',
        JSON.stringify({
            userId: profile.userId,
            displayName: profile.displayName,
            pictureUrl: profile.pictureUrl,
        })
        )

        router.push('/')
    } catch (err) {
        console.error(err)
        setError('ไม่สามารถเข้าสู่ระบบด้วย LINE ได้')
        setLoading(false)
    }
    }

    initLIFF()
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
        <h1 style={{ marginBottom: '10px' }}>
        🐱 Mawe Baan
        </h1>

        <p style={{ marginBottom: '25px' }}>
        เข้าสู่ระบบด้วย LINE
        </p>

        {loading && !error && (
        <p>กำลังเชื่อมต่อกับ LINE...</p>
        )}

        {error && (
        <p style={{ color: 'red' }}>
            {error}
        </p>
        )}
    </div>
    </main>
)
}