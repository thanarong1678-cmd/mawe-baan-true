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
        header { position: relative !important; }
        .mawe-header-stock {
          z-index: 50 !important;
          pointer-events: auto !important;
        }
        .mawe-stock-card,
        .mawe-stock-controls {
          pointer-events: auto !important;
        }
        .mawe-stock-controls button {
          position: relative !important;
          z-index: 100 !important;
          pointer-events: auto !important;
          touch-action: manipulation !important;
          user-select: none !important;
          -webkit-user-select: none !important;
        }
      }
    `
    document.head.appendChild(style)
    return () => style.remove()
  }, [])

  return null
}
