'use client'

import { createPortal } from 'react-dom'
import { useEffect, useRef, useState } from 'react'
import { supabase } from '@/lib/supabase'
import './home-decoration.css'

type Decoration = { id: string; item_type: string; x: number; y: number; rotation: number; color: string; scale: number }
type DragState = { id: string; originalX: number; originalY: number; currentX: number; currentY: number; moved: boolean }
type PendingDrag = { id: string; x: number; y: number; originalX: number; originalY: number }

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
const label = (type: string) => ITEMS.find(i => i[0] === type)?.[2] || 'ของตกแต่ง'

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

function findVisibleRoom() {
  const candidates = Array.from(document.querySelectorAll('.wallpaper-day, .wallpaper-night')) as HTMLElement[]
  const visible = candidates.filter(el => {
    const style = window.getComputedStyle(el)
    const rect = el.getBoundingClientRect()
    return style.display !== 'none' && style.visibility !== 'hidden' && rect.width > 20 && rect.height > 20
  })
  return visible[0] || candidates.find(el => el.offsetWidth > 20 && el.offsetHeight > 20) || null
}

export default function HomeDecoration() {
  const [open, setOpen] = useState(false)
  const [items, setItems] = useState<Decoration[]>([])
  const [userId, setUserId] = useState<string | null>(null)
  const [room, setRoom] = useState<HTMLElement | null>(null)
  const [mounted, setMounted] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [pendingDrag, setPendingDrag] = useState<PendingDrag | null>(null)
  const dragRef = useRef<DragState | null>(null)

  useEffect(() => {
    setMounted(true)
    const updateRoom = () => { const el = findVisibleRoom(); if (el) setRoom(el) }
    updateRoom()
    const retryTimers = [100, 300, 700, 1200].map(ms => window.setTimeout(updateRoom, ms))
    const observer = new MutationObserver(updateRoom)
    observer.observe(document.body, { childList:true, subtree:true, attributes:true, attributeFilter:['class','style'] })
    window.addEventListener('resize', updateRoom)

    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setUserId(user.id)
      const { data } = await supabase.from('home_decorations').select('id,item_type,x,y,rotation,color,scale').eq('user_id', user.id).order('created_at')
      if (data) {
        const seen = new Set<string>()
        const uniqueItems = data.filter(d => {
          if (!ITEM_TYPES.has(d.item_type) || seen.has(d.item_type)) return false
          seen.add(d.item_type); return true
        })
        setItems(uniqueItems.map(d => {
          const fallback = fixedPosition(d.item_type)
          const scale = Number(d.scale)
          return { ...d, color:d.color || 'default', x:Number.isFinite(Number(d.x)) ? Number(d.x) : fallback.x, y:Number.isFinite(Number(d.y)) ? Number(d.y) : fallback.y, rotation:Number.isFinite(Number(d.rotation)) ? Number(d.rotation) : fallback.rotation, scale:Number.isFinite(scale) ? Math.max(.6, Math.min(1.8, scale)) : 1 }
        }))
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
        header h1{font-size:34px!important;} header h1+button{font-size:13px!important;padding:7px 13px!important;}
        .mawe-header-quote{width:290px!important;max-width:290px!important;padding:8px 12px!important;margin-bottom:8px!important;font-size:12px!important;}
        .mawe-header-quote .mawe-arrow{font-size:24px!important;}
        .mawe-header-stock{right:150px!important;left:auto!important;transform:none!important;width:450px!important;bottom:8px!important;gap:8px!important;grid-template-columns:repeat(3,minmax(0,1fr))!important;}
        .mawe-stock-card{min-height:66px!important;padding:7px 9px!important;border-radius:14px!important;grid-template-columns:31px minmax(0,1fr)!important;gap:2px 6px!important;}
        .mawe-stock-icon{width:31px!important;height:31px!important;font-size:20px!important;} .mawe-stock-label{font-size:11px!important;} .mawe-stock-value{font-size:10px!important;} .mawe-stock-value strong{font-size:20px!important;}
        .mawe-stock-controls button{width:24px!important;height:21px!important;} .mawe-header-sleepy{right:10px!important;bottom:8px!important;font-size:40px!important;}
      }
      @media(max-width:1100px) and (min-width:768px){header{padding-bottom:84px!important;}.mawe-header-stock{right:12px!important;width:min(450px,calc(100% - 28px))!important;}.mawe-header-quote{width:min(290px,calc(100% - 350px))!important;max-width:none!important;}}
      @media(max-width:767px){.mawe-header-stock{right:10px!important;left:10px!important;width:calc(100% - 20px)!important;grid-template-columns:repeat(3,minmax(0,1fr))!important;}.mawe-header-quote{width:100%!important;max-width:none!important}}
    `
    document.head.appendChild(style)
    return () => { retryTimers.forEach(window.clearTimeout); observer.disconnect(); window.removeEventListener('resize', updateRoom); document.getElementById('mawe-stock-spacing-fix')?.remove() }
  }, [])

  const addItem = async (type: string) => {
    let uid = userId
    if (!uid) { const { data:{user} } = await supabase.auth.getUser(); uid=user?.id || null; if (uid) setUserId(uid) }
    if (!uid) { alert('กรุณาเข้าสู่ระบบก่อนเพิ่มของตกแต่งแมว'); return }
    const existing = items.find(i => i.item_type === type)
    if (existing) { setSelectedId(existing.id); alert('ของตกแต่งชิ้นนี้มีอยู่แล้ว สามารถกดที่ชิ้นนั้นเพื่อเปลี่ยนสี ขนาด หรือลบได้'); return }
    const pos = fixedPosition(type)
    const { data, error } = await supabase.from('home_decorations').insert({ user_id:uid, item_type:type, x:pos.x, y:pos.y, rotation:pos.rotation, color:'default', scale:1 }).select('id,item_type,x,y,rotation,color,scale').single()
    if (error) { console.error('Add decoration error:', error); if (error.code === '23505') alert('ของตกแต่งชิ้นนี้มีอยู่แล้ว'); else alert('เพิ่มของตกแต่งไม่สำเร็จ: ' + error.message); return }
    if (data) { setItems(v => [...v, { ...data, x:pos.x, y:pos.y, rotation:pos.rotation, color:data.color || 'default', scale:Number(data.scale) || 1 }]); setSelectedId(data.id); setOpen(false) }
  }

  const changeColor = async (id:string, color:string) => {
    if (!userId) return
    const { error } = await supabase.from('home_decorations').update({ color }).eq('id',id).eq('user_id',userId)
    if (error) { console.error('Change decoration color error:', error); return }
    setItems(v => v.map(i => i.id===id ? { ...i, color } : i))
  }

  const changeScale = async (id:string, scale:number) => {
    if (!userId) return
    const safeScale = Math.max(.6, Math.min(1.8, scale))
    setItems(v => v.map(i => i.id===id ? { ...i, scale:safeScale } : i))
    const { error } = await supabase.from('home_decorations').update({ scale:safeScale }).eq('id',id).eq('user_id',userId)
    if (error) {
      console.error('Change decoration scale error:', error)
      alert('บันทึกขนาดไม่สำเร็จ กรุณาลองใหม่')
    }
  }

  const deleteItem = async (id:string) => {
    if (!userId) return
    const { error } = await supabase.from('home_decorations').delete().eq('id',id).eq('user_id',userId)
    if (error) { console.error('Delete decoration error:', error); alert('ลบของตกแต่งไม่สำเร็จ: ' + error.message); return }
    setItems(v => v.filter(i => i.id !== id)); setSelectedId(null); setPendingDrag(null)
  }

  const savePosition = async (id:string, x:number, y:number) => {
    if (!userId) return false
    const { error } = await supabase.from('home_decorations').update({ x, y }).eq('id',id).eq('user_id',userId)
    if (error) { console.error('Save decoration position error:', error); alert('บันทึกตำแหน่งไม่สำเร็จ กรุณาลองใหม่'); return false }
    return true
  }

  const cancelDrag = () => {
    if (!pendingDrag) return
    setItems(v => v.map(i => i.id===pendingDrag.id ? { ...i, x:pendingDrag.originalX, y:pendingDrag.originalY } : i))
    setPendingDrag(null)
  }

  const confirmDrag = async () => {
    if (!pendingDrag) return
    const current = pendingDrag
    if (await savePosition(current.id, current.x, current.y)) setPendingDrag(null)
  }

  const startDrag = (e: React.PointerEvent<HTMLButtonElement>, item: Decoration) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return
    e.preventDefault(); e.stopPropagation()
    dragRef.current = { id:item.id, originalX:item.x, originalY:item.y, currentX:item.x, currentY:item.y, moved:false }
    e.currentTarget.setPointerCapture?.(e.pointerId)
  }

  const moveDrag = (e: React.PointerEvent<HTMLButtonElement>) => {
    const drag = dragRef.current
    if (!drag || !room) return
    const rect = room.getBoundingClientRect()
    if (rect.width <= 0 || rect.height <= 0) return
    const x = Math.max(5, Math.min(95, ((e.clientX - rect.left) / rect.width) * 100))
    const y = Math.max(5, Math.min(95, ((e.clientY - rect.top) / rect.height) * 100))
    if (Math.abs(x-drag.originalX)>1 || Math.abs(y-drag.originalY)>1) drag.moved=true
    if (drag.moved) { drag.currentX=x; drag.currentY=y; setItems(v => v.map(i => i.id===drag.id ? { ...i, x, y } : i)) }
  }

  const endDrag = (e: React.PointerEvent<HTMLButtonElement>, item: Decoration) => {
    const drag = dragRef.current
    if (!drag || drag.id !== item.id) return
    dragRef.current=null
    try { e.currentTarget.releasePointerCapture?.(e.pointerId) } catch {}
    if (!drag.moved) { setSelectedId(selectedId===item.id ? null : item.id); return }
    setSelectedId(item.id)
    setPendingDrag({ id:item.id, x:drag.currentX, y:drag.currentY, originalX:drag.originalX, originalY:drag.originalY })
  }

  const layer = mounted && room ? createPortal(
    <div className="home-decoration-layer">
      {items.map(item => (
        <div key={item.id} className="home-decoration-object-wrap" style={{left:`${item.x}%`,top:`${item.y}%`}}>
          <button type="button" className={`home-decoration-object ${selectedId===item.id ? 'is-selected' : ''}`} style={{transform:`translate(-50%,-50%) rotate(${item.rotation}deg) scale(${item.scale})`,filter:colorFilter(item.color)}} onPointerDown={(e)=>startDrag(e,item)} onPointerMove={moveDrag} onPointerUp={(e)=>endDrag(e,item)} onPointerCancel={(e)=>endDrag(e,item)} onClick={(e)=>e.stopPropagation()} aria-label={`${label(item.item_type)} ลากเพื่อย้ายตำแหน่ง`}>
            {icon(item.item_type)}
          </button>
          {selectedId===item.id && (
            <div className="home-decoration-color-picker" onPointerDown={e=>e.stopPropagation()} onClick={e=>e.stopPropagation()}>
              <div className="home-decoration-color-title">ลากเพื่อย้ายตำแหน่ง</div>
              {pendingDrag?.id===item.id && <div className="home-decoration-confirm-row"><button type="button" className="home-decoration-confirm" onClick={()=>void confirmDrag()}>✓ ยืนยันตำแหน่งนี้</button><button type="button" className="home-decoration-cancel" onClick={cancelDrag}>ยกเลิก</button></div>}
              <div className="home-decoration-color-title">ขนาด {Math.round(item.scale*100)}%</div>
              <input className="home-decoration-scale-slider" type="range" min="0.6" max="1.8" step="0.1" value={item.scale} onChange={e=>void changeScale(item.id,Number(e.target.value))} aria-label="ปรับขนาดของตกแต่ง" />
              <div className="home-decoration-scale-labels"><span>เล็ก</span><span>ใหญ่</span></div>
              <div className="home-decoration-color-title">เลือกสี</div>
              <div className="home-decoration-colors">
                {COLORS.map(([value,labelText])=><button key={value} type="button" className={`home-decoration-color-dot color-${value} ${item.color===value?'active':''}`} title={labelText} aria-label={labelText} onClick={()=>void changeColor(item.id,value)}/>) }
              </div>
              <button type="button" className="home-decoration-delete" onClick={()=>void deleteItem(item.id)}>🗑️ ลบของตกแต่งชิ้นนี้</button>
            </div>
          )}
        </div>
      ))}
    </div>, room
  ) : null

  return <>
    <button className="home-decorate-toggle" type="button" onClick={()=>setOpen(v=>!v)}>🐱 {open ? 'ปิดของตกแต่งแมว' : 'ของตกแต่งแมว'}</button>
    {open && <div className="home-decoration-panel"><strong>🐱 ของตกแต่งน้องแมว</strong><div className="home-decoration-items">{ITEMS.map(([type,emoji,itemLabel])=><button key={type} type="button" onClick={()=>void addItem(type)}>{emoji}<span>{itemLabel}</span></button>)}</div><small>ลากของตกแต่งได้ทั้งคอมและโทรศัพท์ • ปล่อยแล้วกดยืนยันตำแหน่ง • แตะเพื่อเปลี่ยนสี ปรับขนาด หรือลบ</small></div>}
    {layer}
  </>
}
