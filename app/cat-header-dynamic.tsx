'use client'

import { useCallback, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabase'

const HEADER_QUOTES = [
  'มนุษย์! ข้าวหมดยัง! หิวจนจะกินบ้านแล้วนะ!',
  'ทรายแมวตักหรือยัง! โวยวายนะ!',
  'อย่านั่งเฉยๆ ป้อนขนมเลียด่วนเลย!',
  'อย่าลืมเช็กแมวป่วยและตักกระบะทรายด้วย!',
  'วันนี้ก็เป็นอีกวันที่ดีนะเหมียว 💕',
  'ขอนอนก่อนนะ... ปลุกตอนมีขนมด้วย 😴',
  'มนุษย์เก่งมาก วันนี้ดูแลเราแล้วหรือยัง 🐾',
]

export default function CatHeaderDynamic() {
  const pathname = usePathname()

  const updateHeader = useCallback(async () => {
    if (pathname !== '/') return

    const header = document.querySelector('header')
    if (!header) return

    const { data } = await supabase
      .from('cats')
      .select('name, created_at')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    const catName = data?.name?.trim() || 'พี่ส้ม'
    const quote = HEADER_QUOTES[Math.floor(Math.random() * HEADER_QUOTES.length)]

    const nameElement = Array.from(header.querySelectorAll('b')).find((element) => {
      return element.dataset.maweCatName === 'true' || element.textContent?.includes('พี่ส้ม')
    })

    if (!nameElement) return

    nameElement.dataset.maweCatName = 'true'
    nameElement.textContent = `${catName}:`

    const bubble = nameElement.parentElement
    if (!bubble) return

    const textNodes = Array.from(bubble.childNodes).filter(
      (node): node is Text => node.nodeType === Node.TEXT_NODE,
    )

    const quoteNode = textNodes.find((node) => {
      return nameElement.compareDocumentPosition(node) & Node.DOCUMENT_POSITION_FOLLOWING
    })

    if (quoteNode) {
      quoteNode.textContent = ` "${quote}"`
    } else {
      bubble.appendChild(document.createTextNode(` "${quote}"`))
    }
  }, [pathname])

  useEffect(() => {
    if (pathname !== '/') return

    let active = true
    let timer: ReturnType<typeof setInterval> | null = null

    const tick = async () => {
      if (!active) return
      await updateHeader()
    }

    const start = () => {
      tick()
      timer = setInterval(tick, 3000)
    }

    const observer = new MutationObserver(() => {
      if (!document.querySelector('header b')) return
      if (timer === null) start()
      else tick()
    })

    observer.observe(document.body, { childList: true, subtree: true })

    start()

    return () => {
      active = false
      observer.disconnect()
      if (timer) clearInterval(timer)
    }
  }, [pathname, updateHeader])

  return null
}
