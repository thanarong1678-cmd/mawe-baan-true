'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import './cat-litter-user.css'

type LitterRow = {
  id: string
  bags_left: number
  box_count: number
  last_changed: string
}

export default function CatLitterUser() {
  const pathname = usePathname()
  const [mount, setMount] = useState<HTMLElement | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [row, setRow] = useState<LitterRow | null>(null)
  const [bags, setBags] = useState(0)
  const [boxes, setBoxes] = useState(0)
  const [saving, setSaving] = useState(false)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (pathname !== '/') return

    let active = true
    const findHeader = () => {
      const header = document.querySelector('header') as HTMLElement | null
      if (active && header) setMount(header)
      return Boolean(header)
    }

    if (findHeader()) return
    const timer = window.setInterval(() => {
      if (findHeader()) window.clearInterval(timer)
    }, 100)

    return () => {
      active = false
      window.clearInterval(timer)
    }
  }, [pathname])

  useEffect(() => {
    if (pathname !== '/' || !mount) return

    let active = true
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!active || !user) return
      setUserId(user.id)

      const { data, error } = await supabase
        .from('cat_litter')
        .select('id,bags_left,box_count,last_changed')
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (error) {
        console.error('โหลดสต็อกทรายแมวไม่สำเร็จ:', error)
        setReady(true)
        return
      }

      if (data) {
        const next = {
          id: data.id,
          bags_left: Number(data.bags_left) || 0,
          box_count: Number(data.box_count) || 0,
          last_changed: data.last_changed || '',
        }
        setRow(next)
        setBags(next.bags_left)
        setBoxes(next.box_count)
      }
      setReady(true)
    }

    load()
    return () => { active = false }
  }, [pathname, mount])

  useEffect(() => {
    if (pathname !== '/') return

    const sections = Array.from(document.querySelectorAll('section'))
    const oldStock = sections.find((section) => {
      const text = section.textContent || ''
      return text.includes('ทรายแมว') && text.includes('กระบะทราย')
    }) as HTMLElement | undefined

    if (oldStock) {
      oldStock.dataset.maweLegacyLitter = 'true'
    }
  }, [pathname, ready])

  const save = async () => {
    if (!userId || saving) return
    setSaving(true)

    const payload = {
      bags_left: Math.max(0, bags),
      box_count: Math.max(0, boxes),
      last_changed: new Date().toISOString().slice(0, 10),
      user_id: userId,
    }

    let error = null
    let savedId = row?.id

    if (row?.id) {
      const result = await supabase
        .from('cat_litter')
        .update(payload)
        .eq('id', row.id)
      error = result.error
    } else {
      const result = await supabase
        .from('cat_litter')
        .insert(payload)
        .select('id,bags_left,box_count,last_changed')
        .single()
      error = result.error
      if (result.data) savedId = result.data.id
    }

    if (error) {
      console.error('บันทึกสต็อกทรายแมวไม่สำเร็จ:', error)
      alert('บันทึกสต็อกไม่สำเร็จ กรุณาลองใหม่อีกครั้ง')
    } else {
      setRow({ id: savedId || '', ...payload })
    }
    setSaving(false)
  }

  if (pathname !== '/' || !mount || !ready) return null

  return createPortal(
    <div className="mawe-litter-stock" aria-label="สต็อกทรายแมวและกระบะทราย">
      <div className="mawe-litter-card">
        <div className="mawe-litter-icon">🛍️</div>
        <div className="mawe-litter-content">
          <div className="mawe-litter-title">ทรายแมว</div>
          <div className="mawe-litter-value"><strong>{bags}</strong> ถุง</div>
          <div className="mawe-litter-owner">🐱 ของบัญชีนี้</div>
        </div>
        <div className="mawe-litter-controls">
          <button type="button" onClick={() => setBags(v => Math.max(0, v - 1))}>−</button>
          <button type="button" onClick={() => setBags(v => v + 1)}>+</button>
        </div>
      </div>

      <div className="mawe-litter-card">
        <div className="mawe-litter-icon">🧺</div>
        <div className="mawe-litter-content">
          <div className="mawe-litter-title">กระบะทราย</div>
          <div className="mawe-litter-value"><strong>{boxes}</strong> ใบ</div>
          <div className="mawe-litter-owner">🐱 ของบัญชีนี้</div>
        </div>
        <div className="mawe-litter-controls">
          <button type="button" onClick={() => setBoxes(v => Math.max(0, v - 1))}>−</button>
          <button type="button" onClick={() => setBoxes(v => v + 1)}>+</button>
        </div>
      </div>

      <button type="button" className="mawe-litter-save" onClick={save} disabled={saving}>
        {saving ? 'กำลังบันทึก...' : 'บันทึกสต็อก'}
      </button>
    </div>,
    mount,
  )
}
