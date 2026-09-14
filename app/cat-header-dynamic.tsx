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

function ensureStockStyles() {
  if (document.getElementById('mawe-header-stock-styles')) return
  const style = document.createElement('style')
  style.id = 'mawe-header-stock-styles'
  style.textContent = `
    .mawe-header-stock{display:flex;gap:12px;align-items:center;margin-left:auto}
    .mawe-stock-card{width:175px;min-height:112px;padding:12px 13px;border-radius:22px;background:rgba(255,250,242,.96);border:1px solid rgba(255,255,255,.9);box-shadow:0 8px 24px rgba(124,45,18,.13);color:#7c461f;display:grid;grid-template-columns:48px 1fr;grid-template-rows:1fr auto;gap:3px 8px}
    .mawe-stock-icon{grid-row:1/span 2;width:48px;height:48px;border-radius:50%;display:grid;place-items:center;background:#fff0dc;font-size:29px}
    .mawe-stock-label{font-size:14px;font-weight:900;line-height:1.1}
    .mawe-stock-value{font-size:13px;line-height:1.1}.mawe-stock-value strong{font-size:28px;color:#8a531f}
    .mawe-stock-owner{font-size:9px;font-weight:800;color:#b87843;white-space:nowrap}
    .mawe-stock-controls{grid-column:2;display:flex;justify-content:flex-end;gap:5px}
    .mawe-stock-controls button{width:27px;height:24px;border:0;border-radius:9px;background:#ffe0aa;color:#8a4b20;font-weight:900;cursor:pointer}
    .mawe-stock-controls button:last-child{background:#ffbd63;color:#fff}
    .mawe-header-note{position:absolute;right:18px;top:7px;width:135px;padding:12px 10px 15px;background:#fff7e8;color:#8a5428;border:2px solid #f3c77e;border-radius:10px 10px 22px 22px;box-shadow:0 6px 12px rgba(124,45,18,.1);font-size:11px;font-weight:900;text-align:center;transform:rotate(3deg);z-index:4}
    .mawe-header-note:before{content:'•';position:absolute;left:50%;top:-21px;font-size:34px;color:#8a461d}
    .mawe-header-sleepy{position:absolute;right:100px;bottom:-17px;font-size:86px;filter:drop-shadow(0 7px 4px rgba(124,45,18,.16));z-index:3;line-height:1}
    .mawe-header-paws{position:absolute;right:285px;top:15px;font-size:28px;opacity:.35;transform:rotate(-10deg);z-index:1}
    .mawe-header-paws:after{content:'🐾  🐾';display:block;transform:translate(28px,35px) rotate(12deg)}
    .mawe-header-quote{display:flex!important;align-items:center;justify-content:space-between!important;gap:8px;width:min(610px,100%)!important;max-width:none!important;padding:10px 16px!important;border-radius:999px!important;background:rgba(255,239,211,.35)!important;border:2px solid rgba(255,255,255,.72)!important;color:#7b451d!important;font-size:14px!important;font-weight:800!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.55),0 4px 12px rgba(124,45,18,.06)!important}
    .mawe-header-quote .mawe-arrow{font-size:26px;color:#fff;text-shadow:0 2px 3px rgba(124,45,18,.12);line-height:1}
    .mawe-header-quote-text{flex:1;text-align:center;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    @media(max-width:1250px){.mawe-header-stock{gap:7px}.mawe-stock-card{width:145px}.mawe-header-sleepy{right:20px}.mawe-header-note{display:none}.mawe-header-paws{display:none}}
    @media(max-width:900px){.mawe-header-stock{display:none}.mawe-header-sleepy{right:8px;font-size:58px}.mawe-header-quote{width:100%!important}.mawe-header-note{display:none}}
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
      supabase.from('cats').select('name,created_at').order('created_at', { ascending: false }).limit(1).maybeSingle(),
      supabase.auth.getUser(),
    ])
    const user = userResult?.user
    const catName = cat?.name?.trim() || 'พี่ส้ม'

    const title = header.querySelector('h1') as HTMLElement | null
    if (title) {
      title.textContent = `${catName} 🐾`
      title.dataset.maweCatHeaderTitle = 'true'
    }

    const toggle = title?.parentElement?.querySelector('button') as HTMLButtonElement | null
    if (toggle) toggle.innerHTML = '<span style="color:#b7f34a">●</span> กำลังใช้งาน'

    const oldBubble = header.querySelector('.bg-white\\/20') as HTMLElement | null
    if (oldBubble) {
      oldBubble.classList.add('mawe-header-quote')
      oldBubble.innerHTML = '<span class="mawe-arrow">‹</span><span class="mawe-header-quote-text"></span><span class="mawe-arrow">›</span>'
      const quoteText = oldBubble.querySelector('.mawe-header-quote-text')
      if (quoteText) quoteText.textContent = `🐟  ${HEADER_QUOTES[Math.floor(Math.random() * HEADER_QUOTES.length)]}`
    }

    let stockWrap = header.querySelector('.mawe-header-stock') as HTMLElement | null
    if (!stockWrap) {
      stockWrap = document.createElement('div')
      stockWrap.className = 'mawe-header-stock'
      header.appendChild(stockWrap)
    }

    let bags = 0
    let boxes = 0
    let litterId = ''
    if (user) {
      const { data: litter } = await supabase.from('cat_litter').select('id,bags_left,box_count').order('updated_at',{ascending:false}).limit(1).maybeSingle()
      if (litter) {
        litterId = litter.id
        bags = Number(litter.bags_left) || 0
        boxes = Number(litter.box_count) || 0
      }
    }

    const saveStock = async (nextBags: number, nextBoxes: number) => {
      if (!user) return
      const payload = { bags_left: Math.max(0,nextBags), box_count: Math.max(0,nextBoxes), last_changed: new Date().toISOString().slice(0,10), user_id:user.id }
      if (litterId) {
        await supabase.from('cat_litter').update(payload).eq('id',litterId)
      } else {
        const { data } = await supabase.from('cat_litter').insert(payload).select('id').maybeSingle()
        if (data) litterId = data.id
      }
    }

    stockWrap.innerHTML = `
      <div class="mawe-stock-card">
        <div class="mawe-stock-icon">🛍️</div>
        <div><div class="mawe-stock-label">ทรายแมว</div><div class="mawe-stock-value"><strong>${bags}</strong> ถุง</div><div class="mawe-stock-owner">🐱 ของ${catName}</div></div>
        <div class="mawe-stock-controls"><button data-stock="bags-minus">⌄</button><button data-stock="bags-plus">⌃</button></div>
      </div>
      <div class="mawe-stock-card">
        <div class="mawe-stock-icon">🧺</div>
        <div><div class="mawe-stock-label">กระบะทราย</div><div class="mawe-stock-value"><strong>${boxes}</strong>/3</div><div class="mawe-stock-owner">🐱 ของ${catName}</div></div>
        <div class="mawe-stock-controls"><button data-stock="boxes-minus">⌄</button><button data-stock="boxes-plus">⌃</button></div>
      </div>
    `

    stockWrap.querySelector('[data-stock="bags-minus"]')?.addEventListener('click', async () => { bags=Math.max(0,bags-1); await saveStock(bags,boxes); updateHeader() })
    stockWrap.querySelector('[data-stock="bags-plus"]')?.addEventListener('click', async () => { bags++; await saveStock(bags,boxes); updateHeader() })
    stockWrap.querySelector('[data-stock="boxes-minus"]')?.addEventListener('click', async () => { boxes=Math.max(0,boxes-1); await saveStock(bags,boxes); updateHeader() })
    stockWrap.querySelector('[data-stock="boxes-plus"]')?.addEventListener('click', async () => { boxes++; await saveStock(bags,boxes); updateHeader() })

    let sleepy = header.querySelector('.mawe-header-sleepy') as HTMLElement | null
    if (!sleepy) { sleepy=document.createElement('div'); sleepy.className='mawe-header-sleepy'; header.appendChild(sleepy) }
    sleepy.textContent='😺💤'

    let note = header.querySelector('.mawe-header-note') as HTMLElement | null
    if (!note) { note=document.createElement('div'); note.className='mawe-header-note'; header.appendChild(note) }
    note.innerHTML='แมวของเราคือ<br>ความสุขเล็กๆ<br>ในทุกวัน<br><span style="font-size:17px">♥</span>'

    let paws = header.querySelector('.mawe-header-paws') as HTMLElement | null
    if (!paws) { paws=document.createElement('div'); paws.className='mawe-header-paws'; header.appendChild(paws) }

    const legacySections = Array.from(document.querySelectorAll('section'))
    const oldStock = legacySections.find(s => (s.textContent||'').includes('สต็อกทรายแมว') && (s.textContent||'').includes('กระบะทราย')) as HTMLElement | undefined
    if (oldStock) oldStock.style.display='none'
  }, [pathname])

  useEffect(() => {
    if (pathname !== '/') return
    let active = true
    const run = async () => { if (active) await updateHeader() }
    run()
    const timer = window.setInterval(run, 3000)
    return () => { active=false; window.clearInterval(timer) }
  }, [pathname, updateHeader])

  return null
}
