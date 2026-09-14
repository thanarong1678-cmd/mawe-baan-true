'use client'

import { useEffect } from 'react'

export default function StockLayoutFix() {
  useEffect(() => {
    const styleId = 'mawe-stock-layout-fix-v4'
    document.getElementById(styleId)?.remove()

    const style = document.createElement('style')
    style.id = styleId
    style.textContent = `
      /* กลับแบบเดิม: สต็อก 2 ช่องอยู่ภายในแถบหัวสีส้ม */
      header {
        position: relative !important;
        overflow: visible !important;
      }

      /* เอาช่องวันที่เปลี่ยนทรายออกจากหน้าจอ */
      .mawe-stock-date-card {
        display: none !important;
      }

      .mawe-header-stock {
        position: absolute !important;
        top: 50% !important;
        right: 235px !important;
        left: auto !important;
        transform: translateY(-50%) !important;
        width: auto !important;
        margin: 0 !important;
        display: flex !important;
        grid-template-columns: none !important;
        gap: 12px !important;
        align-items: center !important;
        z-index: 20 !important;
        box-sizing: border-box !important;
      }

      .mawe-stock-card {
        width: 175px !important;
        min-width: 0 !important;
        min-height: 112px !important;
        margin: 0 !important;
        box-sizing: border-box !important;
      }

      .mawe-stock-controls,
      .mawe-stock-controls button {
        pointer-events: auto !important;
      }

      @media (min-width: 1101px) and (max-width: 1450px) {
        .mawe-header-stock {
          right: 220px !important;
          gap: 10px !important;
        }
        .mawe-stock-card {
          width: 150px !important;
        }
      }

      @media (max-width: 1100px) {
        .mawe-header-stock {
          position: static !important;
          top: auto !important;
          right: auto !important;
          left: auto !important;
          transform: none !important;
          width: 100% !important;
          margin: 10px 0 0 !important;
          display: grid !important;
          grid-template-columns: 1fr 1fr !important;
          gap: 10px !important;
          align-items: stretch !important;
        }

        .mawe-stock-card {
          width: auto !important;
          min-height: 96px !important;
        }
      }

      @media (max-width: 767px) {
        .mawe-header-stock {
          width: 100% !important;
          margin-top: 8px !important;
          gap: 8px !important;
        }
        .mawe-stock-card {
          min-height: 82px !important;
          padding: 9px !important;
        }
      }
    `
    document.head.appendChild(style)

    const moveStockIntoHeader = () => {
      const header = document.querySelector('header') as HTMLElement | null
      const stock = document.querySelector('.mawe-header-stock') as HTMLElement | null
      if (!header || !stock) return

      /* CatHeaderDynamic เดิมย้ายสต็อกออกจาก header ทุกครั้งที่รีเฟรชข้อมูล
         จึงบังคับให้กลับเข้า header เพื่อให้เหมือนแบบเดิม */
      if (stock.parentElement !== header) {
        header.appendChild(stock)
      }
    }

    moveStockIntoHeader()

    const observer = new MutationObserver(() => {
      moveStockIntoHeader()
    })
    observer.observe(document.body, { childList: true, subtree: true })

    const timer = window.setInterval(moveStockIntoHeader, 250)

    return () => {
      observer.disconnect()
      window.clearInterval(timer)
      style.remove()
    }
  }, [])

  return null
}
