'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import './home-decoration.css'

type Decoration = { id: string; item_type: string; x: number; y: number; rotation: number }

const ITEMS = [
  ['bed','🛏️','ที่นอน'], ['toy','🧶','ของเล่น'], ['bowl','🥣','ชามอาหาร'], ['plant','🌿','ต้นไม้'], ['ball','⚽','ลูกบอล'], ['house','🏠','บ้านเล็ก'],
]

export default function HomeDecoration() {
  const [open, setOpen] = useState(false)
  const [items, setItems] = useState<Decoration[]>([])
  const [userId, setUserId] = useState<string | null>(null)
  const [drag, setDrag] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setUserId(user.id)
      const { data } = await supabase.from('home_decorations').select('id,item_type,x,y,rotation').order('created_at')
      if (data) setItems(data.map(d => ({...d, x:Number(d.x), y:Number(d.y), rotation:Number(d.rotation)})))
    }
    load()
  }, [])

  const addItem = async (type: string) => {
    if (!userId) return
    const { data, error } = await supabase.from('home_decorations').insert({ user_id: userId, item_type: type, x: 50, y: 55, rotation: 0 }).select('id,item_type,x,y,rotation').single()
    if (!error && data) setItems(v => [...v, {...data, x:Number(data.x), y:Number(data.y), rotation:Number(data.rotation)}])
  }

  const deleteItem = async (id: string) => {
    const { error } = await supabase.from('home_decorations').delete().eq('id', id)
    if (!error) setItems(v => v.filter(i => i.id !== id))
  }

  const moveItem = async (id: string, e: React.PointerEvent) => {
    const target = e.currentTarget.parentElement?.parentElement
    if (!target) return
    const r = target.getBoundingClientRect()
    const x = Math.max(5, Math.min(95, ((e.clientX - r.left) / r.width) * 100))
    const y = Math.max(10, Math.min(90, ((e.clientY - r.top) / r.height) * 100))
    setItems(v => v.map(i => i.id === id ? {...i, x, y} : i))
  }

  const finishMove = async (id: string) => {
    const item = items.find(i => i.id === id)
    if (item) await supabase.from('home_decorations').update({ x: item.x, y: item.y }).eq('id', id)
    setDrag(null)
  }

  const icon = (type: string) => ITEMS.find(i => i[0] === type)?.[1] || '🐾'

  return <>
    <button className="home-decorate-toggle" onClick={() => setOpen(v => !v)}>🎨 {open ? 'ปิดตกแต่งบ้าน' : 'ตกแต่งบ้าน'}</button>
    {open && <div className="home-decoration-panel">
      <strong>🏠 ตกแต่งบ้านแมว</strong>
      <div className="home-decoration-items">{ITEMS.map(([type, emoji, label]) => <button key={type} onClick={() => addItem(type)}>{emoji}<span>{label}</span></button>)}</div>
      <small>แตะของตกแต่งเพื่อเพิ่ม แล้วลากไปวางในบ้านได้ · กด ✕ เพื่อลบ</small>
    </div>}
    <div className="home-decoration-layer">{items.map(item => <div key={item.id} className="home-decoration-object-wrap" style={{left:`${item.x}%`,top:`${item.y}%`}}>
      <div className="home-decoration-object" style={{transform:`translate(-50%,-50%) rotate(${item.rotation}deg)`}} onPointerDown={e => { setDrag(item.id); (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId) }} onPointerMove={e => { if (drag === item.id) moveItem(item.id,e) }} onPointerUp={() => finishMove(item.id)}>{icon(item.item_type)}</div>
      <button className="home-decoration-delete" aria-label="ลบของตกแต่ง" onPointerDown={e => e.stopPropagation()} onClick={() => deleteItem(item.id)}>✕</button>
    </div>)}</div>
  </>
}
