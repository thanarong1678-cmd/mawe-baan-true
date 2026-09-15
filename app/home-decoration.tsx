'use client'

import { createPortal } from 'react-dom'
import { useEffect, useRef, useState } from 'react'
import { supabase } from '@/lib/supabase'
import './home-decoration.css'

type Decoration = { id: string; item_type: string; x: number; y: number; rotation: number }
type PointEvent = React.PointerEvent<HTMLDivElement>

const ITEMS = [
  ['catbed','🛏️','ที่นอนแมว'],
  ['scratch','🪵','เสาลับเล็บ'],
  ['feather','🪶','ไม้ตกแมว'],
  ['ball','⚽','ลูกบอล'],
  ['bowl','🥣','ชามอาหาร'],
  ['catbox','🏠','บ้านน้องแมว'],
]

const icon = (type: string) => ITEMS.find(i => i[0] === type)?.[1] || '🐾'

export default function HomeDecoration() {
  const [open, setOpen] = useState(false)
  const [items, setItems] = useState<Decoration[]>([])
  const [userId, setUserId] = useState<string | null>(null)
  const [drag, setDrag] = useState<string | null>(null)
  const [trashHover, setTrashHover] = useState(false)
  const [room, setRoom] = useState<HTMLElement | null>(null)
  const [mounted, setMounted] = useState(false)
  const pressTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const longPressed = useRef(false)
  const trashRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMounted(true)
    const findRoom = () => {
      const el = document.querySelector('.wallpaper-day, .wallpaper-night') as HTMLElement | null
      if (el) setRoom(el)
    }
    findRoom()

    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setUserId(user.id)
      const { data } = await supabase.from('home_decorations').select('id,item_type,x,y,rotation').order('created_at')
      if (data) setItems(data.map(d => ({ ...d, x:Number(d.x), y:Number(d.y), rotation:Number(d.rotation) })))
    }
    load()

    const style = document.createElement('style')
    style.id = 'mawe-stock-spacing-fix'
    style.textContent = `
      .mawe-header-stock{right:190px!important;left:auto!important;transform:none!important;width:330px!important;bottom:12px!important;}
      .mawe-header-quote{width:min(360px,calc(100% - 390px))!important;max-width:360px!important;margin-right:auto!important;}
      @media(max-width:1100px){.mawe-header-stock{right:12px!important;width:min(330px,calc(100% - 28px))!important}.mawe-header-quote{width:min(360px,calc(100% - 28px))!important;max-width:none!important}}
      @media(max-width:767px){.mawe-header-stock{right:10px!important;left:10px!important;width:calc(100% - 20px)!important}.mawe-header-quote{width:100%!important}}
    `
    document.head.appendChild(style)
    return () => {
      if (pressTimer.current) clearTimeout(pressTimer.current)
      document.getElementById('mawe-stock-spacing-fix')?.remove()
    }
  }, [])

  const addItem = async (type: string) => {
    if (!userId) return
    const { data, error } = await supabase.from('home_decorations').insert({ user_id:userId, item_type:type, x:50, y:58, rotation:0 }).select('id,item_type,x,y,rotation').single()
    if (!error && data) setItems(v => [...v, { ...data, x:Number(data.x), y:Number(data.y), rotation:Number(data.rotation) }])
  }

  const moveItem = (id: string, e: PointEvent) => {
    if (!room) return
    const r = room.getBoundingClientRect()
    const x = Math.max(5, Math.min(95, ((e.clientX-r.left)/r.width)*100))
    const y = Math.max(8, Math.min(92, ((e.clientY-r.top)/r.height)*100))
    setItems(v => v.map(i => i.id===id ? { ...i, x, y } : i))
    const trash = trashRef.current?.getBoundingClientRect()
    setTrashHover(!!trash && e.clientX>=trash.left && e.clientX<=trash.right && e.clientY>=trash.top && e.clientY<=trash.bottom)
  }

  const finishMove = async (id: string, e: PointEvent) => {
    const trash = trashRef.current?.getBoundingClientRect()
    const overTrash = !!trash && e.clientX>=trash.left && e.clientX<=trash.right && e.clientY>=trash.top && e.clientY<=trash.bottom
    if (overTrash) {
      const { error } = await supabase.from('home_decorations').delete().eq('id',id)
      if (!error) setItems(v => v.filter(i => i.id!==id))
    } else {
      const item = items.find(i => i.id===id)
      if (item) await supabase.from('home_decorations').update({x:item.x,y:item.y}).eq('id',id)
    }
    setDrag(null); setTrashHover(false)
  }

  const startPress = (id:string, e:PointEvent) => {
    e.preventDefault()
    longPressed.current = false
    const target = e.currentTarget as HTMLElement
    target.setPointerCapture(e.pointerId)
    pressTimer.current = setTimeout(() => {
      longPressed.current = true
      setDrag(id)
    }, 500)
  }

  const cancelPress = () => {
    if (pressTimer.current) clearTimeout(pressTimer.current)
    pressTimer.current = null
  }

  const handleMove = (id:string, e:PointEvent) => {
    if (!longPressed.current || drag!==id) return
    moveItem(id,e)
  }

  const handleUp = (id:string, e:PointEvent) => {
    cancelPress()
    if (longPressed.current && drag===id) finishMove(id,e)
    else setDrag(null)
    longPressed.current = false
  }

  const panel = open ? (
    <div className="home-decoration-panel">
      <strong>🐱 ของตกแต่งน้องแมว</strong>
      <div className="home-decoration-items">
        {ITEMS.map(([type, emoji, label]) => <button key={type} onClick={() => addItem(type)}>{emoji}<span>{label}</span></button>)}
      </div>
      <small>แตะเพื่อเพิ่มของตกแต่ง • กดค้าง 0.5 วินาทีที่ของตกแต่งเพื่อย้าย</small>
    </div>
  ) : null

  const layer = mounted && room ? createPortal(
    <div className="home-decoration-layer">
      {items.map(item => (
        <div key={item.id} className="home-decoration-object-wrap" style={{left:`${item.x}%`,top:`${item.y}%`}}>
          <div className={`home-decoration-object ${drag===item.id ? 'is-dragging' : ''}`} style={{transform:`translate(-50%,-50%) rotate(${item.rotation}deg)`}} onPointerDown={e => startPress(item.id,e)} onPointerMove={e => handleMove(item.id,e)} onPointerUp={e => handleUp(item.id,e)} onPointerCancel={cancelPress}>{icon(item.item_type)}</div>
        </div>
      ))}
      {drag && <div ref={trashRef} className={`home-decoration-trash ${trashHover ? 'is-over' : ''}`} aria-label="ถังขยะลบของตกแต่ง">🗑️<span>{trashHover ? 'ปล่อยเพื่อลบ' : 'ลากมาทิ้งที่นี่'}</span></div>}
    </div>, room
  ) : null

  return <>
    <button className="home-decorate-toggle" onClick={() => setOpen(v=>!v)}>🐱 {open ? 'ปิดของตกแต่งแมว' : 'ของตกแต่งแมว'}</button>
    {panel}
    {layer}
  </>
}
