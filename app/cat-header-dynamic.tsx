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
  if (c.includes('ดำ') || c.includes('black')) return 'grayscale(1) brightness(.38)'
  if (c.includes('ขาว') || c.includes('white')) return 'grayscale(1) brightness(1.55)'
  if (c.includes('เทา') || c.includes('gray') || c.includes('grey')) return 'grayscale(1) brightness(.82)'
  if (c.includes('ส้ม') || c.includes('orange')) return 'sepia(.35) saturate(2) hue-rotate(-8deg)'
  if (c.includes('แดง') || c.includes('red')) return 'sepia(.3) saturate(2.3) hue-rotate(-25deg)'
  if (c.includes('น้ำตาล') || c.includes('brown')) return 'sepia(.75) saturate(1.8) hue-rotate(-8deg) brightness(.8)'
  if (c.includes('ครีม') || c.includes('cream')) return 'sepia(.35) saturate(1.2) brightness(1.12)'
  if (c.includes('สลิด') || c.includes('tabby')) return 'sepia(.45) saturate(1.25) hue-rotate(355deg) brightness(.95)'
  return 'none'
}

function ensureStockStyles() {
  if (document.getElementById('mawe-header-stock-styles')) return
  const style = document.createElement('style')
  style.id = 'mawe-header-stock-styles'
  style.textContent = `
    .mawe-header-stock{position:absolute;right:235px;top:50%;transform:translateY(-50%);display:flex;gap:12px;align-items:center;z-index:6}
    .mawe-stock-card{width:175px;min-height:112px;padding:12px 13px;border-radius:22px;background:rgba(255,250,242,.97);border:1px solid rgba(255,255,255,.92);box-shadow:0 8px 24px rgba(124,45,18,.13);color:#7c461f;display:grid;grid-template-columns:48px 1fr;grid-template-rows:1fr auto;gap:3px 8px}
    .mawe-stock-icon{grid-row:1/span 2;width:48px;height:48px;border-radius:50%;display:grid;place-items:center;background:#fff0dc;font-size:29px;line-height:1}
    .mawe-stock-label{font-size:14px;font-weight:900;line-height:1.1}.mawe-stock-value{font-size:13px;line-height:1.1}.mawe-stock-value strong{font-size:28px;color:#8a531f}
    .mawe-stock-owner{font-size:9px;font-weight:800;color:#b87843;white-space:nowrap}.mawe-stock-controls{grid-column:2;display:flex;justify-content:flex-end;gap:5px}.mawe-stock-controls button{width:27px;height:24px;border:0;border-radius:9px;background:#ffe0aa;color:#8a4b20;font-weight:900;cursor:pointer}.mawe-stock-controls button:last-child{background:#ffbd63;color:#fff}
    .mawe-header-note{position:absolute;right:18px;top:7px;width:135px;padding:12px 10px 15px;background:#fff7e8;color:#8a5428;border:2px solid #f3c77e;border-radius:10px 10px 22px 22px;box-shadow:0 6px 12px rgba(124,45,18,.1);font-size:11px;font-weight:900;text-align:center;transform:rotate(3deg);z-index:7}.mawe-header-note:before{content:'•';position:absolute;left:50%;top:-21px;font-size:34px;color:#8a461d}
    .mawe-header-sleepy{position:absolute;right:95px;bottom:-18px;font-size:92px;filter:drop-shadow(0 7px 4px rgba(124,45,18,.16));z-index:5;line-height:1}.mawe-header-paws{position:absolute;right:315px;top:15px;font-size:28px;opacity:.35;transform:rotate(-10deg);z-index:1}.mawe-header-paws:after{content:'🐾  🐾';display:block;transform:translate(28px,35px) rotate(12deg)}
    .mawe-header-quote{display:flex!important;align-items:center;justify-content:space-between!important;gap:8px;width:min(390px,100%)!important;max-width:390px!important;padding:11px 17px!important;border-radius:999px!important;background:rgba(255,239,211,.38)!important;border:2px solid rgba(255,255,255,.74)!important;color:#7b451d!important;font-size:14px!important;font-weight:800!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.55),0 4px 12px rgba(124,45,18,.06)!important;overflow:hidden!important}
    .mawe-header-quote .mawe-arrow{font-size:29px;color:#fff;text-shadow:0 2px 3px rgba(124,45,18,.12);line-height:1;flex:0 0 auto}.mawe-header-quote-text{flex:1;min-width:0;text-align:center;white-space:nowrap;overflow-x:auto;overflow-y:hidden;text-overflow:clip;scrollbar-width:none;touch-action:pan-x}.mawe-header-quote-text::-webkit-scrollbar{display:none}
    header>div:first-child>div:first-child{width:112px!important;height:112px!important;min-width:112px!important;min-height:112px!important;flex:0 0 112px!important;font-size:54px!important;border-width:5px!important;display:flex!important;align-items:center!important;justify-content:center!important;overflow:hidden!important;aspect-ratio:1/1!important}
    header>div:first-child>div:first-child > svg,header>div:first-child>div:first-child > img{width:46px!important;height:46px!important;max-width:46px!important;max-height:46px!important;flex:none!important;aspect-ratio:1/1!important;object-fit:contain!important;transform:none!important}
    header>div:first-child>div:nth-child(2){flex:1 1 auto!important;min-width:0!important;max-width:calc(100% - 124px)!important}
    header h1{font-size:43px!important;line-height:1!important;color:#fff!important;text-shadow:0 3px 8px rgba(124,45,18,.2)}
    header h1+button{font-size:16px!important;padding:9px 18px!important;border-radius:999px!important;background:rgba(126,78,22,.68)!important}
    @media(max-width:767px){
      header{display:flex!important;flex-direction:column!important;gap:10px!important;padding:14px!important}
      header>div:first-child{width:100%!important;display:flex!important;align-items:center!important;gap:10px!important}
      header>div:first-child>div:first-child{width:68px!important;height:68px!important;min-width:68px!important;min-height:68px!important;flex:0 0 68px!important;font-size:34px!important;border-width:4px!important;aspect-ratio:1/1!important}
      header>div:first-child>div:first-child > svg,header>div:first-child>div:first-child > img{width:46px!important;height:46px!important;max-width:46px!important;max-height:46px!important}
      header>div:first-child>div:nth-child(2){max-width:calc(100% - 78px)!important}
      header h1{font-size:26px!important}
      header h1+button{font-size:11px!important;padding:6px 10px!important}
      .mawe-header-quote{width:100%!important;max-width:none!important;font-size:11px!important;padding:9px 11px!important}
      .mawe-header-quote .mawe-arrow{font-size:23px}
      .mawe-header-stock{position:static!important;transform:none!important;width:100%!important;display:grid!important;grid-template-columns:1fr 1fr!important;gap:8px!important;order:2!important}
      .mawe-stock-card{width:auto!important;min-height:82px!important;padding:9px!important;border-radius:16px!important;grid-template-columns:36px 1fr!important;gap:3px 6px!important}
      .mawe-stock-icon{width:36px;height:36px;font-size:22px}
      .mawe-stock-label{font-size:11px}.mawe-stock-value{font-size:10px}.mawe-stock-value strong{font-size:21px}.mawe-stock-owner{font-size:8px}.mawe-stock-controls button{width:25px;height:22px}
      .mawe-header-sleepy,.mawe-header-note,.mawe-header-paws{display:none!important}
    }
    @media(min-width:768px) and (max-width:1100px){
      header{display:flex!important;flex-direction:column!important;gap:12px!important}
      header>div:first-child{width:100%!important}
      header>div:first-child>div:first-child{width:92px!important;height:92px!important;min-width:92px!important;min-height:92px!important;flex:0 0 92px!important;font-size:46px!important;aspect-ratio:1/1!important}
      header>div:first-child>div:first-child > svg,header>div:first-child>div:first-child > img{width:46px!important;height:46px!important;max-width:46px!important;max-height:46px!important}
      header>div:first-child>div:nth-child(2){max-width:calc(100% - 104px)!important}
      header h1{font-size:34px!important}
      header h1+button{font-size:13px!important;padding:7px 13px!important}
      .mawe-header-quote{width:100%!important;max-width:none!important;font-size:13px!important}
      .mawe-header-stock{position:static!important;transform:none!important;width:100%!important;display:grid!important;grid-template-columns:1fr 1fr!important;gap:10px!important;order:2!important}
      .mawe-stock-card{width:auto!important;min-height:96px!important}
      .mawe-header-sleepy,.mawe-header-note,.mawe-header-paws{display:none!important}
    }
    @media(min-width:1101px) and (max-width:1450px){.mawe-header-stock{right:220px}.mawe-stock-card{width:150px}.mawe-header-quote{width:min(370px,100%)!important;max-width:370px!important}.mawe-header-sleepy{right:55px}.mawe-header-note{display:none}}
    @media(min-width:1451px){.mawe-header-stock{right:235px}.mawe-stock-card{width:175px}}
  `
  document.head.appendChild(style)
}

export default function CatHeaderDynamic() {
  const pathname = usePathname()
  const updateHeader = useCallback(async () => {
    if (pathname !== '/') return
    const header = document.querySelector('header') as HTMLElement | null
    if (!header) return
    ensureStockStyles()
    const [{ data: cat }, { data: userResult }] = await Promise.all([
      supabase.from('cats').select('name,color,created_at').order('created_at',{ascending:false}).limit(1).maybeSingle(),
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
    const catGraphic = iconBox?.querySelector('svg, img') as HTMLElement | null
    if (catGraphic) catGraphic.style.filter = catColorFilter(catColor)
    const oldBubble = header.querySelector('[class*="bg-white/20"]') as HTMLElement | null
    if (oldBubble) {
      oldBubble.classList.add('mawe-header-quote')
      oldBubble.innerHTML = '<span class="mawe-arrow">‹</span><span class="mawe-header-quote-text"></span><span class="mawe-arrow">›</span>'
      const q = oldBubble.querySelector('.mawe-header-quote-text') as HTMLElement | null
      if (q) {
        q.textContent = HEADER_QUOTES[Math.floor(Math.random()*HEADER_QUOTES.length)]
        q.scrollLeft = 0
      }
    }
    let stockWrap = header.querySelector('.mawe-header-stock') as HTMLElement | null
    if (!stockWrap) { stockWrap=document.createElement('div'); stockWrap.className='mawe-header-stock'; header.appendChild(stockWrap) }
    let bags=0, boxes=0, litterId=''
    if (user) {
      const { data:litter } = await supabase.from('cat_litter').select('id,bags_left,box_count').order('updated_at',{ascending:false}).limit(1).maybeSingle()
      if (litter) { litterId=litter.id; bags=Number(litter.bags_left)||0; boxes=Number(litter.box_count)||0 }
    }
    const saveStock = async (nextBags:number,nextBoxes:number) => {
      if (!user) return
      const payload={bags_left:Math.max(0,nextBags),box_count:Math.max(0,nextBoxes),last_changed:new Date().toISOString().slice(0,10),user_id:user.id}
      if (litterId) await supabase.from('cat_litter').update(payload).eq('id',litterId)
      else { const {data}=await supabase.from('cat_litter').insert(payload).select('id').maybeSingle(); if(data) litterId=data.id }
    }
    stockWrap.innerHTML=`<div class="mawe-stock-card"><div class="mawe-stock-icon">🛍️</div><div><div class="mawe-stock-label">ทรายแมว</div><div class="mawe-stock-value"><strong>${bags}</strong> ถุง</div><div class="mawe-stock-owner">🐱 ของ${catName}</div></div><div class="mawe-stock-controls"><button data-stock="bm">−</button><button data-stock="bp">+</button></div></div><div class="mawe-stock-card"><div class="mawe-stock-icon">🧺</div><div><div class="mawe-stock-label">กระบะทราย</div><div class="mawe-stock-value"><strong>${boxes}</strong>/3</div><div class="mawe-stock-owner">🐱 ของ${catName}</div></div><div class="mawe-stock-controls"><button data-stock="xm">−</button><button data-stock="xp">+</button></div></div>`
    const bind=(sel:string,fn:()=>Promise<void>)=>stockWrap!.querySelector(sel)?.addEventListener('click',()=>{void fn()})
    bind('[data-stock="bm"]',async()=>{bags=Math.max(0,bags-1);await saveStock(bags,boxes);await updateHeader()})
    bind('[data-stock="bp"]',async()=>{bags++;await saveStock(bags,boxes);await updateHeader()})
    bind('[data-stock="xm"]',async()=>{boxes=Math.max(0,boxes-1);await saveStock(bags,boxes);await updateHeader()})
    bind('[data-stock="xp"]',async()=>{boxes++;await saveStock(bags,boxes);await updateHeader()})
    let sleepy=header.querySelector('.mawe-header-sleepy') as HTMLElement|null
    if(!sleepy){sleepy=document.createElement('div');sleepy.className='mawe-header-sleepy';header.appendChild(sleepy)} sleepy.textContent='😺💤'
    let note=header.querySelector('.mawe-header-note') as HTMLElement|null
    if(!note){note=document.createElement('div');note.className='mawe-header-note';header.appendChild(note)} note.innerHTML='แมวของเราคือ<br>ความสุขเล็กๆ<br>ในทุกวัน<br><span style="font-size:17px">♥</span>'
    let paws=header.querySelector('.mawe-header-paws') as HTMLElement|null
    if(!paws){paws=document.createElement('div');paws.className='mawe-header-paws';header.appendChild(paws)}
    const oldStock=Array.from(document.querySelectorAll('section')).find(s=>(s.textContent||'').includes('สต็อกทรายแมว')&&(s.textContent||'').includes('กระบะทราย')) as HTMLElement|undefined
    if(oldStock) oldStock.style.display='none'
  },[pathname])
  useEffect(()=>{
    if(pathname!=='/') return
    let active=true
    const run=async()=>{if(active) await updateHeader()}
    void run()
    const timer=window.setInterval(()=>{void run()},3000)
    return()=>{active=false;window.clearInterval(timer)}
  },[pathname,updateHeader])
  return null
}