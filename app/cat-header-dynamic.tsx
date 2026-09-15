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

function formatLitterDate(value: string | null) {
  if (!value) return 'ยังไม่เปลี่ยน'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return 'ยังไม่เปลี่ยน'
  return d.toLocaleDateString('th-TH', { day:'numeric', month:'short', year:'numeric' })
}

function ensureStyles() {
  if (document.getElementById('mawe-header-stock-styles')) return
  const style = document.createElement('style')
  style.id = 'mawe-header-stock-styles'
  style.textContent = `
    header { position:relative !important; overflow:hidden !important; box-sizing:border-box !important; padding-bottom:122px !important; }
    .mawe-header-stock {
      position:absolute !important;
      left:50% !important;
      bottom:12px !important;
      transform:translateX(-50%) !important;
      width:min(660px, calc(100% - 240px)) !important;
      margin:0 !important;
      display:grid !important;
      grid-template-columns:repeat(3, minmax(0,1fr)) !important;
      gap:10px !important;
      align-items:stretch !important;
      z-index:20 !important;
      box-sizing:border-box !important;
    }
    .mawe-stock-card {
      min-width:0;
      min-height:86px;
      box-sizing:border-box;
      padding:9px 10px;
      border-radius:17px;
      background:rgba(255,250,242,.98);
      border:1px solid rgba(255,255,255,.95);
      box-shadow:0 7px 22px rgba(124,45,18,.12);
      color:#7c461f;
      display:grid;
      grid-template-columns:34px minmax(0,1fr);
      grid-template-rows:1fr auto;
      gap:3px 6px;
    }
    .mawe-stock-date-card { grid-template-columns:32px minmax(0,1fr); }
    .mawe-stock-icon { grid-row:1 / span 2; width:34px; height:34px; border-radius:50%; display:grid; place-items:center; background:#fff0dc; font-size:21px; line-height:1; }
    .mawe-stock-label { font-size:12px; font-weight:900; line-height:1.1; }
    .mawe-stock-value { font-size:10px; line-height:1.1; }
    .mawe-stock-value strong { font-size:22px; color:#8a531f; }
    .mawe-stock-owner { font-size:8px; font-weight:800; color:#b87843; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
    .mawe-stock-controls { grid-column:2; display:flex; justify-content:flex-end; gap:5px; }
    .mawe-stock-controls button { width:27px; height:24px; border:0; border-radius:9px; background:#ffe0aa; color:#8a4b20; font-weight:900; cursor:pointer; touch-action:manipulation; pointer-events:auto; position:relative; z-index:40; }
    .mawe-stock-controls button:last-child { background:#ffbd63; color:#fff; }
    .mawe-litter-date { font-size:10px; font-weight:900; color:#8a531f; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
    .mawe-litter-change-btn { grid-column:2; width:100%; min-height:23px; border:0; border-radius:8px; background:#ffbd63; color:#fff; font-size:9px; font-weight:900; cursor:pointer; touch-action:manipulation; transition:none !important; }
    .mawe-litter-change-btn:active { transform:none !important; opacity:.9; }
    .mawe-litter-change-btn:disabled { opacity:.65; cursor:wait; }

    .mawe-header-sleepy { position:absolute; right:16px; bottom:12px; top:auto; font-size:50px; filter:drop-shadow(0 5px 3px rgba(124,45,18,.16)); z-index:4; line-height:1; }
    .mawe-header-note { position:absolute; right:72px; top:7px; width:100px; padding:8px 7px 9px; background:#fff7e8; color:#8a5428; border:2px solid #f3c77e; border-radius:10px 10px 18px 18px; box-shadow:0 6px 12px rgba(124,45,18,.1); font-size:9px; font-weight:900; text-align:center; transform:rotate(3deg); z-index:3; }
    .mawe-header-note:before { content:'•'; position:absolute; left:50%; top:-20px; font-size:30px; color:#8a461d; }
    .mawe-header-paws { position:absolute; right:270px; top:15px; font-size:23px; opacity:.3; transform:rotate(-10deg); z-index:1; }
    .mawe-header-paws:after { content:'🐾  🐾'; display:block; transform:translate(22px,28px) rotate(12deg); }

    .mawe-header-quote { display:flex!important; align-items:center; justify-content:space-between!important; gap:8px; width:min(390px,100%)!important; max-width:390px!important; padding:11px 17px!important; margin-bottom:16px!important; border-radius:999px!important; background:rgba(255,239,211,.38)!important; border:2px solid rgba(255,255,255,.74)!important; color:#7b451d!important; font-size:14px!important; font-weight:800!important; box-shadow:inset 0 1px 0 rgba(255,255,255,.55),0 4px 12px rgba(124,45,18,.06)!important; overflow:hidden!important; position:relative!important; z-index:10!important; }
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

    @media(max-width:1100px) {
      header { padding-bottom:116px !important; }
      .mawe-header-stock { width:calc(100% - 28px)!important; bottom:9px!important; gap:8px!important; }
      .mawe-stock-card { min-height:82px; }
      .mawe-header-sleepy { right:9px; bottom:9px; font-size:42px; }
      .mawe-header-note { right:58px; top:7px; }
    }
    @media(max-width:767px) {
      header { padding-bottom:104px !important; overflow:hidden !important; }
      .mawe-header-stock { width:calc(100% - 20px)!important; bottom:8px!important; gap:6px!important; }
      .mawe-stock-card { min-height:74px; padding:7px; border-radius:15px; grid-template-columns:27px minmax(0,1fr); gap:3px 4px; }
      .mawe-stock-date-card { grid-template-columns:25px minmax(0,1fr); }
      .mawe-stock-icon { width:27px; height:27px; font-size:17px; }
      .mawe-stock-label { font-size:9px; }
      .mawe-stock-value { font-size:8px; }
      .mawe-stock-value strong { font-size:18px; }
      .mawe-stock-owner { font-size:6px; }
      .mawe-stock-controls button { width:22px; height:20px; }
      .mawe-litter-date { font-size:8px; }
      .mawe-litter-change-btn { min-height:21px; font-size:8px; }
      header>div:first-child>div:first-child { width:68px!important; height:68px!important; min-width:68px!important; min-height:68px!important; flex:0 0 68px!important; font-size:34px!important; border-width:4px!important; }
      .mawe-cat-face { width:36px!important; height:36px!important; font-size:36px!important; flex-basis:36px!important; }
      header>div:first-child>div:nth-child(2) { max-width:calc(100% - 78px)!important; }
      header h1 { font-size:26px!important; }
      header h1+button { font-size:11px!important; padding:6px 10px!important; }
      .mawe-header-quote { width:100%!important; max-width:none!important; font-size:11px!important; padding:9px 11px!important; margin-bottom:10px!important; }
      .mawe-header-quote .mawe-arrow { font-size:23px; }
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
    if (oldBubble && !oldBubble.dataset.maweBound) {
      oldBubble.classList.add('mawe-header-quote')
      oldBubble.innerHTML = '<span class="mawe-arrow" data-dir="prev">‹</span><span class="mawe-header-quote-text"></span><span class="mawe-arrow" data-dir="next">›</span>'
      const q = oldBubble.querySelector('.mawe-header-quote-text') as HTMLElement | null
      const quoteIndex = Math.floor(Math.random() * HEADER_QUOTES.length)
      oldBubble.dataset.quoteIndex = String(quoteIndex)
      if (q) q.textContent = HEADER_QUOTES[quoteIndex]
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
      oldBubble.dataset.maweBound = '1'
    }

    let stockWrap = document.querySelector('.mawe-header-stock') as HTMLElement | null
    if (!stockWrap) {
      stockWrap = document.createElement('div')
      stockWrap.className = 'mawe-header-stock'
      header.appendChild(stockWrap)
    }

    let bags = 0, boxes = 0, litterId = '', lastChanged: string | null = null
    if (user) {
      const { data:litter } = await supabase.from('cat_litter').select('id,bags_left,box_count,last_changed').eq('user_id', user.id).order('updated_at',{ascending:false}).limit(1).maybeSingle()
      if (litter) {
        litterId = litter.id
        bags = Number(litter.bags_left) || 0
        boxes = Number(litter.box_count) || 0
        lastChanged = litter.last_changed || null
      }
    }

    const saveStock = async (nextBags:number, nextBoxes:number) => {
      if (!user) return
      if (litterId) {
        const { error } = await supabase.from('cat_litter').update({ bags_left:Math.max(0,nextBags), box_count:Math.max(0,nextBoxes) }).eq('id',litterId).eq('user_id',user.id)
        if (error) throw error
      } else {
        const today = new Date().toISOString().slice(0,10)
        const { data, error } = await supabase.from('cat_litter').insert({ bags_left:Math.max(0,nextBags), box_count:Math.max(0,nextBoxes), last_changed:today, user_id:user.id }).select('id').maybeSingle()
        if (error) throw error
        if (data) { litterId=data.id; lastChanged=today }
      }
    }

    stockWrap.innerHTML = `
      <div class="mawe-stock-card">
        <div class="mawe-stock-icon">🛍️</div>
        <div><div class="mawe-stock-label">ทรายแมว</div><div class="mawe-stock-value"><strong data-stock-value="bags">${bags}</strong> ถุง</div><div class="mawe-stock-owner">🐱 ของ${catName}</div></div>
        <div class="mawe-stock-controls"><button data-stock="bm">−</button><button data-stock="bp">+</button></div>
      </div>
      <div class="mawe-stock-card">
        <div class="mawe-stock-icon">🧺</div>
        <div><div class="mawe-stock-label">กระบะทราย</div><div class="mawe-stock-value"><strong data-stock-value="boxes">${boxes}</strong>/3</div><div class="mawe-stock-owner">🐱 ของ${catName}</div></div>
        <div class="mawe-stock-controls"><button data-stock="xm">−</button><button data-stock="xp">+</button></div>
      </div>
      <div class="mawe-stock-card mawe-stock-date-card">
        <div class="mawe-stock-icon">📅</div>
        <div><div class="mawe-stock-label">วันเปลี่ยนทราย</div><div class="mawe-litter-date">${formatLitterDate(lastChanged)}</div></div>
        <button class="mawe-litter-change-btn" type="button" data-litter-change>เปลี่ยนวันนี้</button>
      </div>
    `

    const updateStockValue = (key:'bags'|'boxes', value:number) => {
      const el = stockWrap!.querySelector(`[data-stock-value="${key}"]`) as HTMLElement | null
      if (el) el.textContent = String(value)
    }

    const bindStock = (sel:string, fn:()=>Promise<void>) => stockWrap!.querySelector(sel)?.addEventListener('click', (e) => {
      e.preventDefault()
      e.stopPropagation()
      void fn().catch((error) => console.error('Update litter stock error:', error))
    })

    bindStock('[data-stock="bm"]', async()=>{
      const next = Math.max(0,bags-1)
      bags = next
      updateStockValue('bags', bags)
      await saveStock(bags,boxes)
    })
    bindStock('[data-stock="bp"]', async()=>{
      const next = bags + 1
      bags = next
      updateStockValue('bags', bags)
      await saveStock(bags,boxes)
    })
    bindStock('[data-stock="xm"]', async()=>{
      const next = Math.max(0,boxes-1)
      boxes = next
      updateStockValue('boxes', boxes)
      await saveStock(bags,boxes)
    })
    bindStock('[data-stock="xp"]', async()=>{
      const next = boxes + 1
      boxes = next
      updateStockValue('boxes', boxes)
      await saveStock(bags,boxes)
    })

    const changeDateBtn = stockWrap.querySelector('[data-litter-change]') as HTMLButtonElement | null
    const dateEl = stockWrap.querySelector('.mawe-litter-date') as HTMLElement | null
    if (changeDateBtn) {
      changeDateBtn.addEventListener('click', async (e) => {
        e.preventDefault()
        e.stopPropagation()
        if (!user || changeDateBtn.disabled) return
        changeDateBtn.disabled = true
        const today = new Date().toISOString().slice(0,10)
        try {
          if (litterId) {
            const { error } = await supabase.from('cat_litter').update({ last_changed:today }).eq('id',litterId).eq('user_id',user.id)
            if (error) throw error
          } else {
            const { data, error } = await supabase.from('cat_litter').insert({ bags_left:bags, box_count:boxes, last_changed:today, user_id:user.id }).select('id').maybeSingle()
            if (error) throw error
            if (data) litterId=data.id
          }
          lastChanged=today
          if (dateEl) dateEl.textContent=formatLitterDate(today)
        } catch (error) {
          console.error('Update litter date error:', error)
          alert('เปลี่ยนวันไม่สำเร็จ กรุณาลองใหม่')
        } finally {
          changeDateBtn.disabled = false
        }
      })
    }

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
    return()=>{ active=false }
  }, [pathname, updateHeader])
  return null
}
