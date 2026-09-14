'use client'

import { useEffect } from 'react'

export default function DesktopStockFix() {
  useEffect(() => {
    const id = 'mawe-desktop-stock-fix'
    const old = document.getElementById(id)
    if (old) old.remove()

    const style = document.createElement('style')
    style.id = id
    style.textContent = `
      @media (min-width: 1101px) {
        header { position: relative !important; margin-bottom: 148px !important; }
        .mawe-header-stock {
          position: absolute !important;
          left: 50% !important;
          right: auto !important;
          top: calc(100% + 14px) !important;
          transform: translateX(-50%) !important;
          z-index: 50 !important;
          pointer-events: auto !important;
          display: flex !important;
          align-items: stretch !important;
          justify-content: center !important;
          gap: 14px !important;
          width: max-content !important;
        }
        .mawe-stock-card {
          width: 175px !important;
          min-height: 108px !important;
          box-sizing: border-box !important;
          pointer-events: auto !important;
          box-shadow: 0 7px 22px rgba(124,45,18,.12) !important;
        }
        .mawe-stock-card:nth-child(2) .mawe-stock-date {
          display: none !important;
        }
        .mawe-stock-controls,
        .mawe-stock-controls button {
          position: relative !important;
          z-index: 100 !important;
          pointer-events: auto !important;
          touch-action: manipulation !important;
          user-select: none !important;
          -webkit-user-select: none !important;
        }
        .mawe-stock-date input {
          cursor: pointer !important;
        }
      }
    `
    document.head.appendChild(style)
    return () => style.remove()
  }, [])

  return null
}
