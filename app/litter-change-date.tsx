'use client'

import { useEffect, useRef, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function LitterChangeDate() {
  const [date, setDate] = useState('')
  const [userId, setUserId] = useState<string | null>(null)
  const currentRef = useRef('')

  useEffect(() => {
    let stopped = false
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user || stopped) return
      setUserId(user.id)
      const { data } = await supabase.from('cat_litter').select('last_changed').order('updated_at', { ascending: false }).limit(1).maybeSingle()
      const saved = data?.last_changed || ''
      if (!stopped) {
        currentRef.current = saved
        setDate(saved)
      }
    }
    void load()
    return () => { stopped = true }
  }, [])

  useEffect(() => {
    if (!userId) return

    const addCard = () => {
      const stock = document.querySelector('.mawe-header-stock') as HTMLElement | null
      if (!stock) return
      if (stock.querySelector('.mawe-litter-date-card')) return

      const card = document.createElement('div')
      card.className = 'mawe-stock-card mawe-litter-date-card'
      card.innerHTML = `
        <div class="mawe-stock-icon">📅</div>
        <div class="mawe-litter-date-content">
          <div class="mawe-stock-label">เปลี่ยนทราย</div>
          <div class="mawe-litter-date-sub">วันที่เปลี่ยนล่าสุด</div>
          <input class="mawe-litter-date-input" type="date" aria-label="วันที่เปลี่ยนทรายแมวล่าสุด" value="${currentRef.current}" />
        </div>
      `

      const input = card.querySelector('input') as HTMLInputElement | null
      input?.addEventListener('change', async () => {
        const value = input.value
        currentRef.current = value
        setDate(value)
        if (!userId) return
        const { data: row } = await supabase.from('cat_litter').select('id').order('updated_at', { ascending: false }).limit(1).maybeSingle()
        if (row?.id) {
          await supabase.from('cat_litter').update({ last_changed: value || null }).eq('id', row.id)
        } else {
          await supabase.from('cat_litter').insert({ user_id: userId, bags_left: 0, box_count: 0, last_changed: value || null })
        }
      })

      stock.appendChild(card)
    }

    const timer = window.setInterval(addCard, 250)
    addCard()
    return () => window.clearInterval(timer)
  }, [userId])

  useEffect(() => {
    const id = 'mawe-litter-date-styles'
    if (document.getElementById(id)) return
    const style = document.createElement('style')
    style.id = id
    style.textContent = `
      .mawe-litter-date-card{width:175px;min-height:112px!important}
      .mawe-litter-date-content{min-width:0;display:flex;flex-direction:column;justify-content:center;gap:4px}
      .mawe-litter-date-sub{font-size:9px;font-weight:800;color:#b87843}
      .mawe-litter-date-input{width:100%;height:29px;border:1px solid #f0c98d;border-radius:9px;background:#fffaf0;color:#8a531f;font-size:11px;font-weight:800;padding:3px 5px;outline:none}
      .mawe-litter-date-input:focus{border-color:#f59e0b;box-shadow:0 0 0 2px #f59e0b22}
      @media(min-width:1101px) and (max-width:1450px){.mawe-litter-date-card{width:150px!important}}
      @media(max-width:1100px){.mawe-litter-date-card{width:auto!important}}
      @media(max-width:767px){.mawe-litter-date-card{grid-column:1 / -1!important;min-height:72px!important}.mawe-litter-date-content{display:grid;grid-template-columns:1fr auto;align-items:center;gap:2px 7px}.mawe-litter-date-sub{grid-column:1}.mawe-litter-date-input{grid-column:2;grid-row:1 / span 2;width:125px}}
    `
    document.head.appendChild(style)
    return () => style.remove()
  }, [])

  return null
}
