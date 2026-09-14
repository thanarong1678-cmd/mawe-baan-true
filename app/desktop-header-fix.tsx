'use client'

import { useEffect } from 'react'

export default function DesktopHeaderFix() {
  useEffect(() => {
    const id = 'mawe-desktop-header-fix'
    const old = document.getElementById(id)
    if (old) old.remove()

    const style = document.createElement('style')
    style.id = id
    style.textContent = `
      @media (min-width: 1101px) {
        .mawe-header-quote {
          width: 320px !important;
          max-width: 320px !important;
          min-width: 0 !important;
          flex: 0 1 320px !important;
          min-height: 48px !important;
          padding: 10px 15px !important;
          font-size: 14px !important;
          overflow: hidden !important;
        }
        .mawe-header-quote-text {
          min-width: 0 !important;
          max-width: 245px !important;
          flex: 1 1 auto !important;
          overflow-x: auto !important;
          overflow-y: hidden !important;
          white-space: nowrap !important;
          text-overflow: clip !important;
          scrollbar-width: none !important;
          touch-action: pan-x !important;
          cursor: grab;
        }
        .mawe-header-quote-text::-webkit-scrollbar { display: none !important; }
      }
    `
    document.head.appendChild(style)
    return () => style.remove()
  }, [])

  return null
}
