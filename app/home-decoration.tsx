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
const ITEM_TYPES = new Set(ITEMS.map(i => i[0]))
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
      const { data } = await supabase
        .from('home_decorations')
        .select('id,item_type,x,y,rotation')
        .eq('user_id', user.id)
        .order('created_at')
      if (data) setItems(data.filter(d => ITEM_TYPES.has(d.item_type)).map(d => ({ ...d, x:Number(d.x), y:Number(d.y), rotation:Number(d.rotation) })))
    }
    load()

    const style = document.createElement('style')
    style.id = 'mawe-stock-spacing-fix'
    style.textContent = `
      /* Desktop: ลดความสูงของแถบสีส้ม และกันพื้นที่สต็อกไม่ให้ทับข้อความ */
      @media(min-width:768px){
        header{padding-bottom:88px!important;min-height:0!important;}
        header>div:first-child>div:first-child{width:84px!important;height:84px!important;min-width:84px!important;min-height:84px!important;flex-basis:84px!important;font-size:42px!important;}
        .mawe-cat-face{width:44px!important;height:44px!important;font-size:44px!important;flex-basis:44px!important;}
        header h1{font-size:34px!important;}
        header h1+button{font-size:13px!important;padding:7px 13px!important;}
        .mawe-header-quote{width:290px!important;max-width:290px!important;padding:8px 12px!important;margin-bottom:8px!important;font-size:12px!important;}
        .mawe-header-quote .mawe-arrow{font-size:24px!important;}
        .mawe-header-stock{right:150px!important;left:auto!important;transform:none!important;width:300px!important;bottom:8px!important;gap:8px!important;}
        .mawe-stock-card{min-height:66px!important;padding:7px 9px!important;border-radius:14px!important;grid-template-columns:31px minmax(0,1fr)!important;gap:2px 6px!important;}
        .mawe-stock-icon{width:31px!important;height:31px!important;font-size:20px!important;}
        .mawe-stock-label{font-size:11px!important;}
        .mawe-stock-value{font-size:10px!important;}
        .mawe-stock-value strong{font-size:20px!important;}
        .mawe-stock-controls button{width:24px!important;height:21px!important;}
        .mawe-header-sleepy{right:10px!important;bottom:8px!important;font-size:40px!important;}
      }
      @media(max-width:1100px) and (min-width:768px){
        header{padding-bottom:84px!important;}
        .mawe-header-stock{right:12px!important;width:min(300px,calc(100% - 28px))!important;}
        .mawe-header-quote{width:min(290px,calc(100% - 350px))!important;max-width:none!important;}
      }
      @media(max-width:767px){
        .mawe-header-stock{right:10px!important;left:10px!important;width:calc(100% - 20px)!important}
        .mawe-header-quote{width:100%!important;max-width:none!important}
      }
    `
    document.head.appendChild(style)
    return () => {
      if (pressTimer.current) clearTimeout(pressTimer.current)
      document.getElementById('mawe-stock-spacing-fix')?.remove()
    }
  }, [])

  const addItem = async (type: string) => {
    let uid = userId
    if (!uid) {
      const { data: { user } } = await supabase.auth.getUser()
      uid = user?.id || null
      if (uid) setUserId(uid)
    }
    if (!uid) {
      alert('กรุณาเข้าสู่ระบบก่อนเพิ่มของตกแต่งแมว')
      return
    }

    const { data, error } = await supabase
      .from('home_decorations')
      .insert({ user_id:uid, item_type:type, x:50, y:58, rotation:0 })
      .select('id,item_type,x,y,rotation')
      .single()

    if (error) {
      console.error('Add decoration error:', error)
      alert('เพิ่มของตกแต่งไม่สำเร็จ: ' + error.message)
      return
    }

    if (data) setItems(v => [...v, { ...data, x:Number(data.x), y:Number(data.y), rotation:Number(data.rotation) }])
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
      const { error } = await supabase.from('home_decorations').delete().eq('id',id).eq('user_id', userId)
      if (!error) setItems(v => v.filter(i => i.id!==id))
    } else {
      const item = items.find(i => i.id===id)
      if (item) await supabase.from('home_decorations').update({x:item.x,y:item.y}).eq('id',id).eq('user_id', userId)
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
        {ITEMS.map(([type, emoji, label]) => <button key={type} type="button" onClick={() => addItem(type)}>{emoji}<span>{label}</span></button>)}
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
    <button className="home-decorate-toggle" type="button" onClick={() => setOpen(v=>!v)}>🐱 {open ? 'ปิดของตกแต่งแมว' : 'ของตกแต่งแมว'}</button>
    {panel}
    {layer}
  </>
}
