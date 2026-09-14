'use client'

import { useEffect } from 'react'

export default function StockLayoutFix() {
  useEffect(() => {
    const id = 'mawe-stock-layout-fix-v3'
    document.getElementById(id)?.remove()

    const style = document.createElement('style')
    style.id = id
    style.textContent = `
      header {
        position: relative !important;
        margin-bottom: 0 !important;
        overflow: visible !important;
      }

      /* ซ่อนช่องวันที่เปลี่ยนทราย และกลับไปใช้ 2 ช่องแบบเดิม */
      .mawe-stock-date-card { display: none !important; }

      .mawe-header-stock {
        position: absolute !important;
        top: 50% !important;
        right: 220px !important;
        left: auto !important;
        transform: translateY(-50%) !important;
        width: auto !important;
        margin: 0 !important;
        display: flex !important;
        grid-template-columns: none !important;
        gap: 12px !important;
        align-items: center !important;
        z-index: 50 !important;
        box-sizing: border-box !important;
      }

      .mawe-stock-card {
        position: relative !important;
        width: 175px !important;
        min-width: 0 !important;
        min-height: 112px !important;
        margin: 0 !important;
        box-sizing: border-box !important;
      }

      @media (min-width: 1101px) and (max-width: 1450px) {
        .mawe-header-stock { right: 205px !important; gap: 10px !important; }
        .mawe-stock-card { width: 150px !important; }
      }

      @media (max-width: 1100px) {
        .mawe-header-stock {
          position: static !important;
          transform: none !important;
          width: 100% !important;
          margin: 10px 0 0 !important;
          display: grid !important;
          grid-template-columns: 1fr 1fr !important;
          gap: 8px !important;
        }
        .mawe-stock-card { width: auto !important; min-height: 88px !important; }
      }

      @media (max-width: 767px) {
        .mawe-header-stock { width: 100% !important; margin-top: 8px !important; gap: 8px !important; }
        .mawe-stock-card { min-height: 82px !important; padding: 9px !important; }
      }
    `
    document.head.appendChild(style)
    return () => style.remove()
  }, [])

  return null
}
