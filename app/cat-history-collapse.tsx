'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

export default function CatHistoryCollapse() {
  const pathname = usePathname()

  useEffect(() => {
    if (pathname !== '/') return

    let observer: MutationObserver | null = null

    const enhanceHistorySection = () => {
      const sections = Array.from(document.querySelectorAll('section'))

      const historySection = sections.find((section) => {
        const heading = section.querySelector('h2')
        return heading?.textContent?.includes('เพิ่มประวัติน้องแมว')
      })

      if (!historySection || historySection.dataset.historyCollapsible === 'true') {
        return Boolean(historySection)
      }

      const heading = historySection.querySelector('h2')
      if (!heading) return false

      historySection.dataset.historyCollapsible = 'true'
      historySection.dataset.historyCollapsed = 'true'

      const toggle = document.createElement('button')
      toggle.type = 'button'
      toggle.className = 'mawe-history-toggle'
      toggle.setAttribute('aria-expanded', 'false')
      toggle.innerHTML = '<span class="mawe-history-toggle-icon">⌄</span><span>เปิดประวัติน้องแมว</span>'

      toggle.addEventListener('click', () => {
        const collapsed = historySection.dataset.historyCollapsed === 'true'
        const nextCollapsed = !collapsed

        historySection.dataset.historyCollapsed = String(nextCollapsed)
        toggle.setAttribute('aria-expanded', String(!nextCollapsed))
        toggle.innerHTML = nextCollapsed
          ? '<span class="mawe-history-toggle-icon">⌄</span><span>เปิดประวัติน้องแมว</span>'
          : '<span class="mawe-history-toggle-icon">⌃</span><span>ซ่อนประวัติน้องแมว</span>'
      })

      heading.appendChild(toggle)
      return true
    }

    if (!enhanceHistorySection()) {
      observer = new MutationObserver(() => {
        if (enhanceHistorySection()) {
          observer?.disconnect()
          observer = null
        }
      })

      observer.observe(document.body, { childList: true, subtree: true })
    }

    return () => {
      observer?.disconnect()
    }
  }, [pathname])

  return null
}
