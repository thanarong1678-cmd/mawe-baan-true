'use client'

import { useEffect } from 'react'

export default function DesktopHeaderFix() {
  useEffect(() => {
    const style = document.createElement('style')
    style.id = 'mawe-desktop-header-fix'
    style.textContent = `
      @media (min-width: 1101px) {
        .mawe-header-quote {
          width: 390px !important;
          max-width: 390px !important;
          min-width: 390px !important;
          min-height: 48px !important;
          padding: 10px 15px !important;
          font-size: 14px !important;
        }
        .mawe-header-quote-text {
          min-width: 0 !important;
          max-width: 310px !important;
          overflow: hidden !important;
          white-space: nowrap !important;
          text-overflow: ellipsis !important;
        }
      }
    `
    document.head.appendChild(style)
    return () => style.remove()
  }, [])

  return null
}
