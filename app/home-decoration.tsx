'use client'

import { createPortal } from 'react-dom'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import './home-decoration.css'

type Decoration = { id: string; item_type: string; x: number; y: number; rotation: number; color: string }

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

const FIXED_POSITIONS: Record<string, { x:number; y:number; rotation:number }> = {
  catbed: { x:18, y:70, rotation:0 },
  scratch: { x:38, y:64, rotation:-3 },
  feather: { x:55, y:72, rotation:8 },
  ball: { x:69, y:73, rotation:0 },
  bowl: { x:82, y:68, rotation:-4 },
  catbox: { x:30, y:34, rotation:0 },
}

const COLORS = [
  ['default','สีเดิม','none'],
  ['red','แดง','sepia(.25) saturate(3) hue-rotate(-25deg)'],
  ['orange','ส้ม','sepia(.35) saturate(2.5) hue-rotate(-5deg)'],
  ['yellow','เหลือง','sepia(.45) saturate(2.8) hue-rotate(5deg) brightness(1.08)'],
  ['green','เขียว','sepia(.45) saturate(3) hue-rotate(65deg)'],
  ['blue','ฟ้า','sepia(.3) saturate(3) hue-rotate(155deg)'],
  ['purple','ม่วง','sepia(.45) saturate(3) hue-rotate(245deg)'],
  ['pink','ชมพู','sepia(.35) saturate(3) hue-rotate(300deg)'],
  ['brown','น้ำตาล','sepia(.8) saturate(1.8) brightness(.8)'],
  ['black','ดำ','grayscale(1) brightness(.45)'],
  ['white','ขาว','grayscale(1) brightness(1.55)'],
]
const colorFilter = (color:string) => COLORS.find(c => c[0]===color)?.[2] || 'none'
const fixedPosition = (type:string) => FIXED_POSITIONS[type] || { x:50, y:58, rotation:0 }

export default function HomeDecoration() {
  const [open, setOpen] = useState(false)
  const [items, setItems] = useState<Decoration[]>([])
  const [userId, setUserId] = useState<string | null>(null)
  const [room, setRoom] = useState<HTMLElement | null>(null)
  const [mounted, setMounted] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)

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
        .select('id,item_type,x,y,rotation,color')
        .eq('user_id', user.id)
        .order('created_at')
      if (data) {
        setItems(data.filter(d => ITEM_TYPES.has(d.item_type)).map(d => ({
          ...d,
          ...fixedPosition(d.item_type),
          color: d.color || 'default',
          x:Number(fixedPosition(d.item_type).x),
          y:Number(fixedPosition(d.item_type).y),
          rotation:Number(fixedPosition(d.item_type).rotation),
        })))
      }
    }
    void load()

    const style = document.createElement('style')
    style.id = 'mawe-stock-spacing-fix'
    style.textContent = `
      @media(min-width:768px){
        header{padding-bottom:88px!important;min-height:0!important;}
        header>div:first-child>div:first-child{width:84px!important;height:84px!important;min-width:84px!important;min-height:84px!important;flex-basis:84px!important;font-size:42px!important;}
        .mawe-cat-face{width:44px!important;height:44px!important;font-size:44px!important;flex-basis:44px!important;}
        header h1{font-size:34px!important;}
        header h1+button{font-size:13px!important;padding:7px 13px!important;}
        .mawe-header-quote{width:290px!important;max-width:290px!important;padding:8px 12px!important;margin-bottom:8px!important;font-size:12px!important;}
        .mawe-header-quote .mawe-arrow{font-size:24px!important;}
        .mawe-header-stock{right:150px!important;left:auto!important;transform:none!important;width:450px!important;bottom:8px!important;gap:8px!important;grid-template-columns:repeat(3,minmax(0,1fr))!important;}
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
        .mawe-header-stock{right:12px!important;width:min(450px,calc(100% - 28px))!important;}
        .mawe-header-quote{width:min(290px,calc(100% - 350px))!important;max-width:none!important;}
      }
      @media(max-width:767px){
        .mawe-header-stock{right:10px!important;left:10px!important;width:calc(100% - 20px)!important;grid-template-columns:repeat(3,minmax(0,1fr))!important;}
        .mawe-header-quote{width:100%!important;max-width:none!important}
      }
    `
    document.head.appendChild(style)
    return () => document.getElementById('mawe-stock-spacing-fix')?.remove()
  }, [])

  const addItem = async (type: string) => {
    let uid = userId
    if (!uid) {
      const { data: { user } } = await supabase.auth.getUser()
      uid = user?.id || null
      if (uid) setUserId(uid)
    }
    if (!uid) { alert('กรุณาเข้าสู่ระบบก่อนเพิ่มของตกแต่งแมว'); return }
    const pos = fixedPosition(type)
    const { data, error } = await supabase
      .from('home_decorations')
      .insert({ user_id:uid, item_type:type, x:pos.x, y:pos.y, rotation:pos.rotation, color:'default' })
      .select('id,item_type,x,y,rotation,color')
      .single()
    if (error) { console.error('Add decoration error:', error); alert('เพิ่มของตกแต่งไม่สำเร็จ: ' + error.message); return }
    if (data) {
      setItems(v => [...v, { ...data, x:pos.x, y:pos.y, rotation:pos.rotation, color:data.color || 'default' }])
      setSelectedId(data.id)
    }
  }

  const changeColor = async (id:string, color:string) => {
    if (!userId) return
    const { error } = await supabase.from('home_decorations').update({ color }).eq('id',id).eq('user_id',userId)
    if (error) { console.error('Change decoration color error:', error); return }
    setItems(v => v.map(i => i.id===id ? { ...i, color } : i))
  }

  const layer = mounted && room ? createPortal(
    <div className="home-decoration-layer">
      {items.map(item => {
        const pos = fixedPosition(item.item_type)
        return (
          <div key={item.id} className="home-decoration-object-wrap" style={{left:`${pos.x}%`,top:`${pos.y}%`}}>
            <button
              type="button"
              className={`home-decoration-object ${selectedId===item.id ? 'is-selected' : ''}`}
              style={{transform:`translate(-50%,-50%) rotate(${pos.rotation}deg)`,filter:colorFilter(item.color)}}
              onClick={(e) => { e.stopPropagation(); setSelectedId(selectedId===item.id ? null : item.id) }}
              aria-label={`${ITEMS.find(i=>i[0]===item.item_type)?.[2] || 'ของตกแต่ง'} เลือกสี`}
            >
              {icon(item.item_type)}
            </button>
            {selectedId===item.id && (
              <div className="home-decoration-color-picker" onClick={e => e.stopPropagation()}>
                <div className="home-decoration-color-title">เลือกสี</div>
                <div className="home-decoration-colors">
                  {COLORS.map(([value,label]) => (
                    <button
                      key={value}
                      type="button"
                      className={`home-decoration-color-dot color-${value} ${item.color===value ? 'active' : ''}`}
                      title={label}
                      aria-label={label}
                      onClick={() => void changeColor(item.id,value)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>, room
  ) : null

  return <>
    <button className="home-decorate-toggle" type="button" onClick={() => setOpen(v=>!v)}>🐱 {open ? 'ปิดของตกแต่งแมว' : 'ของตกแต่งแมว'}</button>
    {open && (
      <div className="home-decoration-panel">
        <strong>🐱 ของตกแต่งน้องแมว</strong>
        <div className="home-decoration-items">
          {ITEMS.map(([type, emoji, label]) => <button key={type} type="button" onClick={() => void addItem(type)}>{emoji}<span>{label}</span></button>)}
        </div>
        <small>แตะของตกแต่งในบ้านเพื่อเลือกสี • ของตกแต่งจะอยู่ตำแหน่งประจำและไม่สามารถลากย้ายได้</small>
      </div>
    )}
    {layer}
  </>
}
