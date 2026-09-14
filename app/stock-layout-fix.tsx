'use client'

import { useEffect } from 'react'

export default function StockLayoutFix() {
  useEffect(() => {
    const id = 'mawe-stock-layout-fix-v2'
    document.getElementById(id)?.remove()

    const style = document.createElement('style')
    style.id = id
    style.textContent = `
      /* Stock cards live visually below the header, never on top of it. */
      header {
        position: relative !important;
        margin-bottom: 128px !important;
        overflow: visible !important;
      }

      .mawe-header-stock {
        position: absolute !important;
        top: calc(100% + 12px) !important;
        left: 50% !important;
        right: auto !important;
        transform: translateX(-50%) !important;
        width: min(920px, calc(100vw - 28px)) !important;
        margin: 0 !important;
        display: grid !important;
        grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
        gap: 12px !important;
        z-index: 40 !important;
        box-sizing: border-box !important;
      }

      .mawe-stock-card,
      .mawe-stock-date-card {
        position: relative !important;
        left: auto !important;
        top: auto !important;
        transform: none !important;
        width: auto !important;
        min-width: 0 !important;
        margin: 0 !important;
        box-sizing: border-box !important;
      }

      /* Date is a normal third card, not attached to the litter-box card. */
      .mawe-stock-date-card {
        grid-column: auto !important;
        grid-row: auto !important;
      }

      @media (max-width: 767px) {
        header { margin-bottom: 190px !important; }
        .mawe-header-stock {
          top: calc(100% + 10px) !important;
          width: calc(100vw - 28px) !important;
          grid-template-columns: 1fr 1fr !important;
          gap: 8px !important;
        }
        .mawe-stock-date-card {
          grid-column: 1 / -1 !important;
        }
      }

      @media (min-width: 768px) and (max-width: 1100px) {
        header { margin-bottom: 125px !important; }
        .mawe-header-stock {
          width: calc(100vw - 40px) !important;
          max-width: 920px !important;
          gap: 9px !important;
        }
      }
    `
    document.head.appendChild(style)
    return () => style.remove()
  }, [])

  return null
}
