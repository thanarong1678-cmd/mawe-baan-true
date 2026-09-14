'use client'

import { useCallback, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { usePathname } from 'next/navigation'

const HEADER_QUOTES = [
  'วันนี้ก็เป็นอีกวันที่ดีนะเหมียว ❤️',
  'มนุษย์! ข้าวหมดยัง! หิวจนจะกินบ้านแล้วนะ!',
  'ทรายแมวตักหรือยัง! โวยวายนะ!',
  'อย่านั่งเฉยๆ ป้อนขนมเลียด่วนเลย!',
  'อย่าลืมเช็กแมวป่วยและตักกระบะทรายด้วย!',
  'ขอนอนก่อนนะ... ปลุกตอนมีขนมด้วย 😴',
]

function catColorFilter(color: string) {
  const c = color.toLowerCase().trim()
  if (c.includes('ดำ') || c.includes('black')) return 'none'
  if (c.includes('ขาว') || c.includes('white')) return 'grayscale(1) brightness(1.45)'
  if (c.includes('เทา') || c.includes('gray') || c.includes('grey')) return 'grayscale(1) brightness(.78)'
  if (c.includes('ส้ม') || c.includes('orange')) return 'sepia(.25) saturate(2.2) hue-rotate(-8deg)'
  if (c.includes('แดง') || c.includes('red')) return 'sepia(.25) saturate(2.5) hue-rotate(-25deg)'
  if (c.includes('น้ำตาล') || c.includes('brown')) return 'sepia(.7) saturate(1.8) brightness(.82)'
  if (c.includes('ครีม') || c.includes('cream')) return 'sepia(.3) saturate(1.15) brightness(1.12)'
  if (c.includes('สลิด') || c.includes('tabby')) return 'sepia(.45) saturate(1.25) hue-rotate(355deg) brightness(.95)'
  return 'none'
}

function catColorEmoji(color: string) {
  const c = color.toLowerCase().trim()
  if (c.includes('ดำ') || c.includes('black')) return '🐈‍⬛'
  return '🐱'
}

function ensureStyles() {
  if (document.getElementById('mawe-header-stock-styles')) return
  const style = document.createElement('style')
  style.id = 'mawe-header-stock-styles'
  style.textContent = `
    .mawe-header-stock {
      width: min(920px, calc(100% - 28px));
      margin: 12px auto 16px;
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 12px;
      align-items: stretch;
      position: relative;
      z-index: 30;
      box-sizing: border-box;
    }
    .mawe-stock-card {
      min-width: 0;
      min-height: 100px;
      box-sizing: border-box;
      padding: 12px 14px;
      border-radius: 22px;
      background: rgba(255,250,242,.98);
      border: 1px solid rgba(255,255,255,.95);
      box-shadow: 0 7px 22px rgba(124,45,18,.12);
      color: #7c461f;
      display: grid;
      grid-template-columns: 46px minmax(0,1fr);
      grid-template-rows: 1fr auto;
      gap: 3px 8px;
    }
    .mawe-stock-icon { grid-row: 1 / span 2; width:46px; height:46px; border-radius:50%; display:grid; place-items:center; background:#fff0dc; font-size:28px; line-height:1; }
    .mawe-stock-label { font-size:14px; font-weight:900; line-height:1.1; }
    .mawe-stock-value { font-size:13px; line-height:1.1; }
    .mawe-stock-value strong { font-size:28px; color:#8a531f; }
    .mawe-stock-owner { font-size:9px; font-weight:800; color:#b87843; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
    .mawe-stock-controls { grid-column:2; display:flex; justify-content:flex-end; gap:5px; }
    .mawe-stock-controls button { width:28px; height:25px; border:0; border-radius:9px; background:#ffe0aa; color:#8a4b20; font-weight:900; cursor:pointer; touch-action:manipulation; }
    .mawe-stock-controls button:last-child { background:#ffbd63; color:#fff; }
    .mawe-stock-date-card { min-width:0; min-height:100px; box-sizing:border-box; padding:12px 14px; border-radius:22px; background:rgba(255,250,242,.98); border:1px solid rgba(255,255,255,.95); box-shadow:0 7px 22px rgba(124,45,18,.12); color:#7c461f; display:flex; align-items:center; gap:12px; }
    .mawe-stock-date-icon { width:46px; height:46px; flex:0 0 46px; border-radius:50%; display:grid; place-items:center; background:#fff0dc; font-size:27px; }
    .mawe-stock-date-title { font-size:14px; font-weight:900; line-height:1.1; }
    .mawe-stock-date-sub { font-size:9px; font-weight:800; color:#b87843; margin-top:5px; }
    .mawe-stock-date-card input { width:100%; max-width:145px; height:32px; box-sizing:border-box; border:1px solid #f3c77e; border-radius:9px; background:#fff8ed; color:#8a5428; font-size:11px; padding:3px 6px; font-weight:800; cursor:pointer; }
    .mawe-header-note { position:absolute; right:18px; top:7px; width:135px; padding:12px 10px 15px; background:#fff7e8; color:#8a5428; border:2px solid #f3c77e; border-radius:10px 10px 22px 22px; box-shadow:0 6px 12px rgba(124,45,18,.1); font-size:11px; font-weight:900; text-align:center; transform:rotate(3deg); z-index:7; }
    .mawe-header-note:before { content:'•'; position:absolute; left:50%; top:-21px; font-size:34px; color:#8a461d; }
    .mawe-header-sleepy { position:absolute; right:95px; bottom:-18px; font-size:92px; filter:drop-shadow(0 7px 4px rgba(124,45,18,.16)); z-index:5; line-height:1; }
    .mawe-header-paws { position:absolute; right:315px; top:15px; font-size:28px; opacity:.35; transform:rotate(-10deg); z-index:1; }
    .mawe-header-paws:after { content:'🐾  🐾'; display:block; transform:translate(28px,35px) rotate(12deg); }
    .mawe-header-quote { display:flex!important; align-items:center; justify-content:space-between!important; gap:8px; width:min(390px,100%)!important; max-width:390px!important; padding:11px 17px!important; border-radius:999px!important; background:rgba(255,239,211,.38)!important; border:2px solid rgba(255,255,255,.74)!important; color:#7b451d!important; font-size:14px!important; font-weight:800!important; box-shadow:inset 0 1px 0 rgba(255,255,255,.55),0 4px 12px rgba(124,45,18,.06)!important; overflow:hidden!important; }
    .mawe-header-quote .mawe-arrow { font-size:29px; color:#fff; text-shadow:0 2px 3px rgba(124,45,18,.12); line-height:1; flex:0 0 auto; cursor:pointer; user-select:none; }
    .mawe-header-quote .mawe-arrow:hover { transform:scale(1.18); }
    .mawe-header-quote .mawe-arrow:active { transform:scale(.92); }
    .mawe-header-quote-text { flex:1; min-width:0; text-align:center; white-space:nowrap; overflow-x:auto; overflow-y:hidden; text-overflow:clip; scrollbar-width:none; touch-action:pan-x; }
    .mawe-header-quote-text::-webkit-scrollbar { display:none; }
    header>div:first-child>div:first-child { width:112px!important; height:112px!important; min-width:112px!important; min-height:112px!important; flex:0 0 112px!important; font-size:54px!important; border-width:5px!important; display:flex!important; align-items:center!important; justify-content:center!important; overflow:hidden!important; aspect-ratio:1/1!important; }
    .mawe-cat-face { display:block!important; width:54px!important; height:54px!important; line-height:1!important; font-size:54px!important; flex:0 0 54px!important; text-align:center!important; transform:none!important; filter:none; }
    header>div:first-child>div:nth-child(2) { flex:1 1 auto!important; min-width:0!important; max-width:calc(100% - 124px)!important; }
    header h1 { font-size:43px!important; line-height:1!important; color:#fff!important; text-shadow:0 3px 8px rgba(124,45,18,.2); }
    header h1+button { font-size:16px!important; padding:9px 18px!important; border-radius:999px!important; background:rgba(126,78,22,.68)!important; }
    @media(max-width:767px) {
      .mawe-header-stock { width:calc(100% - 28px); grid-template-columns:1fr 1fr; gap:8px; margin:10px auto 14px; }
      .mawe-stock-card { min-height:88px; padding:9px; border-radius:16px; grid-template-columns:34px minmax(0,1fr); gap:3px 6px; }
      .mawe-stock-icon { width:34px; height:34px; font-size:21px; }
      .mawe-stock-label { font-size:11px; }
      .mawe-stock-value { font-size:10px; }
      .mawe-stock-value strong { font-size:21px; }
      .mawe-stock-owner { font-size:7px; }
      .mawe-stock-controls button { width:25px; height:22px; }
      .mawe-stock-date-card { grid-column:1 / -1; min-height:82px; padding:9px 12px; border-radius:16px; gap:9px; }
      .mawe-stock-date-icon { width:34px; height:34px; flex-basis:34px; font-size:20px; }
      .mawe-stock-date-title { font-size:11px; }
      .mawe-stock-date-sub { font-size:8px; margin-top:3px; }
      .mawe-stock-date-card input { max-width:130px; height:27px; font-size:9px; }
    }
    @media(min-width:768px) and (max-width:1100px) {
      .mawe-header-stock { width:calc(100% - 28px); gap:9px; }
      .mawe-stock-card,.mawe-stock-date-card { min-height:94px; }
      .mawe-stock-label { font-size:13px; }
      .mawe-stock-value strong { font-size:25px; }
    }
    @media(max-width:767px) {
      header>div:first-child>div:first-child { width:68px!important; height:68px!important; min-width:68px!important; min-height:68px!important; flex:0 0 68px!important; font-size:34px!important; border-width:4px!important; }
      .mawe-cat-face { width:36px!important; height:36px!important; font-size:36px!important; flex-basis:36px!important; }
      header>div:first-child>div:nth-child(2) { max-width:calc(100% - 78px)!important; }
      header h1 { font-size:26px!important; }
      header h1+button { font-size:11px!important; padding:6px 10px!important; }
      .mawe-header-quote { width:100%!important; max-width:none!important; font-size:11px!important; padding:9px 11px!important; }
      .mawe-header-quote .mawe-arrow { font-size:23px; }
      .mawe-header-sleepy,.mawe-header-note,.mawe-header-paws { display:none!important; }
    }
    @media(min-width:768px) and (max-width:1100px) {
      header>div:first-child>div:first-child { width:92px!important; height:92px!important; min-width:92px!important; min-height:92px!important; flex:0 0 92px!important; font-size:46px!important; }
      .mawe-cat-face { width:46px!important; height:46px!important; font-size:46px!important; flex-basis:46px!important; }
      header>div:first-child>div:nth-child(2) { max-width:calc(100% - 104px)!important; }
      header h1 { font-size:34px!important; }
      header h1+button { font-size:13px!important; padding:7px 13px!important; }
      .mawe-header-quote { width:100%!important; max-width:none!important; font-size:13px!important; }
      .mawe-header-sleepy,.mawe-header-note,.mawe-header-paws { display:none!important; }
    }
  `
  document.head.appendChild(style)
}

export default function CatHeaderDynamic() {
  const pathname = usePathname()

  const updateHeader = useCallback(async () => {
    if (pathname !== '/') return
    const header = document.querySelector('header') as HTMLElement | null
    if (!header) return
    ensureStyles()

    const [{ data: cat }, { data: userResult }] = await Promise.all([
      supabase.from('cats').select('name,color,created_at').order('created_at', { ascending:false }).limit(1).maybeSingle(),
      supabase.auth.getUser(),
    ])
    const user = userResult?.user
    const catName = cat?.name?.trim() || 'พี่ส้ม'
    const catColor = cat?.color?.trim() || 'ส้ม'

    const title = header.querySelector('h1') as HTMLElement | null
    if (title) title.textContent = `${catName} 🐾`
    const toggle = title?.parentElement?.querySelector('button') as HTMLButtonElement | null
    if (toggle) toggle.innerHTML = '<span style="color:#b7f34a">●</span> กำลังใช้งาน'

    const iconBox = header.querySelector(':scope > div:first-child > div:first-child') as HTMLElement | null
    if (iconBox) {
      iconBox.innerHTML = ''
      const catFace = document.createElement('span')
      catFace.className = 'mawe-cat-face'
      catFace.textContent = catColorEmoji(catColor)
      catFace.style.filter = catColorFilter(catColor)
      iconBox.appendChild(catFace)
    }

    const oldBubble = header.querySelector('[class*="bg-white/20"]') as HTMLElement | null
    if (oldBubble) {
      oldBubble.classList.add('mawe-header-quote')
      oldBubble.innerHTML = '<span class="mawe-arrow" data-dir="prev">‹</span><span class="mawe-header-quote-text"></span><span class="mawe-arrow" data-dir="next">›</span>'
      const q = oldBubble.querySelector('.mawe-header-quote-text') as HTMLElement | null
      const quoteIndex = Math.floor(Math.random() * HEADER_QUOTES.length)
      oldBubble.dataset.quoteIndex = String(quoteIndex)
      if (q) { q.textContent = HEADER_QUOTES[quoteIndex]; q.scrollLeft = 0 }
      oldBubble.querySelector('[data-dir="prev"]')?.addEventListener('click', (e) => {
        e.stopPropagation()
        const current = Number(oldBubble!.dataset.quoteIndex || 0)
        const next = (current - 1 + HEADER_QUOTES.length) % HEADER_QUOTES.length
        oldBubble!.dataset.quoteIndex = String(next)
        if (q) q.textContent = HEADER_QUOTES[next]
      })
      oldBubble.querySelector('[data-dir="next"]')?.addEventListener('click', (e) => {
        e.stopPropagation()
        const current = Number(oldBubble!.dataset.quoteIndex || 0)
        const next = (current + 1) % HEADER_QUOTES.length
        oldBubble!.dataset.quoteIndex = String(next)
        if (q) q.textContent = HEADER_QUOTES[next]
      })
    }

    let stockWrap = document.querySelector('.mawe-header-stock') as HTMLElement | null
    if (!stockWrap) {
      stockWrap = document.createElement('div')
      stockWrap.className = 'mawe-header-stock'
    }
    // สำคัญ: ให้สต็อกเป็นพี่น้องกับ header ไม่ใช่อยู่ข้างใน header เพื่อไม่ให้ซ้อนกัน
    if (stockWrap.parentElement !== header.parentElement || stockWrap.previousElementSibling !== header) {
      header.after(stockWrap)
    }

    let bags = 0, boxes = 0, litterId = '', changedDate = ''
    if (user) {
      const { data:litter } = await supabase.from('cat_litter').select('id,bags_left,box_count,last_changed_date,last_changed').order('updated_at',{ascending:false}).limit(1).maybeSingle()
      if (litter) {
        litterId = litter.id
        bags = Number(litter.bags_left) || 0
        boxes = Number(litter.box_count) || 0
        changedDate = litter.last_changed_date || litter.last_changed || ''
      }
    }

    const saveStock = async (nextBags:number, nextBoxes:number) => {
      if (!user) return
      if (litterId) {
        await supabase.from('cat_litter').update({ bags_left:Math.max(0,nextBags), box_count:Math.max(0,nextBoxes) }).eq('id',litterId)
      } else {
        const today = new Date().toISOString().slice(0,10)
        const { data } = await supabase.from('cat_litter').insert({ bags_left:Math.max(0,nextBags), box_count:Math.max(0,nextBoxes), last_changed:today, last_changed_date:today, user_id:user.id }).select('id').maybeSingle()
        if (data) { litterId=data.id; changedDate=today }
      }
    }

    const saveChangedDate = async (value:string) => {
      if (!user || !value) return
      changedDate=value
      if (litterId) {
        await supabase.from('cat_litter').update({ last_changed_date:value, last_changed:value }).eq('id',litterId)
      } else {
        const { data } = await supabase.from('cat_litter').insert({ bags_left:bags, box_count:boxes, last_changed:value, last_changed_date:value, user_id:user.id }).select('id').maybeSingle()
        if (data) litterId=data.id
      }
    }

    stockWrap.innerHTML = `
      <div class="mawe-stock-card">
        <div class="mawe-stock-icon">🛍️</div>
        <div><div class="mawe-stock-label">ทรายแมว</div><div class="mawe-stock-value"><strong>${bags}</strong> ถุง</div><div class="mawe-stock-owner">🐱 ของ${catName}</div></div>
        <div class="mawe-stock-controls"><button data-stock="bm">−</button><button data-stock="bp">+</button></div>
      </div>
      <div class="mawe-stock-card">
        <div class="mawe-stock-icon">🧺</div>
        <div><div class="mawe-stock-label">กระบะทราย</div><div class="mawe-stock-value"><strong>${boxes}</strong>/3</div><div class="mawe-stock-owner">🐱 ของ${catName}</div></div>
        <div class="mawe-stock-controls"><button data-stock="xm">−</button><button data-stock="xp">+</button></div>
      </div>
      <div class="mawe-stock-date-card">
        <div class="mawe-stock-date-icon">📅</div>
        <div style="min-width:0;flex:1"><div class="mawe-stock-date-title">เปลี่ยนทราย</div><div class="mawe-stock-date-sub">วันที่เปลี่ยนล่าสุด</div></div>
        <input type="date" value="${changedDate}" aria-label="วันที่เปลี่ยนทรายล่าสุด" />
      </div>
    `

    const bind = (sel:string, fn:()=>Promise<void>) => stockWrap!.querySelector(sel)?.addEventListener('click', () => { void fn() })
    bind('[data-stock="bm"]', async()=>{ bags=Math.max(0,bags-1); await saveStock(bags,boxes); await updateHeader() })
    bind('[data-stock="bp"]', async()=>{ bags++; await saveStock(bags,boxes); await updateHeader() })
    bind('[data-stock="xm"]', async()=>{ boxes=Math.max(0,boxes-1); await saveStock(bags,boxes); await updateHeader() })
    bind('[data-stock="xp"]', async()=>{ boxes++; await saveStock(bags,boxes); await updateHeader() })
    stockWrap.querySelector('input[type="date"]')?.addEventListener('change', (e) => { void saveChangedDate((e.target as HTMLInputElement).value) })

    let sleepy=header.querySelector('.mawe-header-sleepy') as HTMLElement|null
    if(!sleepy){sleepy=document.createElement('div');sleepy.className='mawe-header-sleepy';header.appendChild(sleepy)}
    sleepy.textContent='😺💤'
    let note=header.querySelector('.mawe-header-note') as HTMLElement|null
    if(!note){note=document.createElement('div');note.className='mawe-header-note';header.appendChild(note)}
    note.innerHTML='แมวของเราคือ<br>ความสุขเล็กๆ<br>ในทุกวัน<br><span style="font-size:17px">♥</span>'
    let paws=header.querySelector('.mawe-header-paws') as HTMLElement|null
    if(!paws){paws=document.createElement('div');paws.className='mawe-header-paws';header.appendChild(paws)}

    const oldStock=Array.from(document.querySelectorAll('section')).find(s => (s.textContent||'').includes('สต็อกทรายแมว') && (s.textContent||'').includes('กระบะทราย')) as HTMLElement|undefined
    if(oldStock) oldStock.style.display='none'
  }, [pathname])

  useEffect(() => {
    if(pathname!=='/') return
    let active=true
    const run=async()=>{ if(active) await updateHeader() }
    void run()
    const timer=window.setInterval(()=>{ void run() }, 3000)
    return()=>{ active=false; window.clearInterval(timer) }
  }, [pathname, updateHeader])

  return null
}
