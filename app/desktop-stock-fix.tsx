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
      header { overflow: visible !important; }
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
        gap: 12px !important;
        width: max-content !important;
      }
      .mawe-stock-card {
        width: 175px !important;
        min-height: 100px !important;
        box-sizing: border-box !important;
        pointer-events: auto !important;
        box-shadow: 0 7px 22px rgba(124,45,18,.12) !important;
      }
      .mawe-stock-card:nth-child(2) { position: relative !important; overflow: visible !important; }
      .mawe-stock-card:nth-child(2) .mawe-stock-date {
        position: absolute !important;
        left: calc(100% + 12px) !important;
        top: 0 !important;
        width: 175px !important;
        min-height: 100px !important;
        box-sizing: border-box !important;
        margin: 0 !important;
        padding: 12px 13px !important;
        border-radius: 22px !important;
        background: rgba(255,250,242,.97) !important;
        border: 1px solid rgba(255,255,255,.92) !important;
        box-shadow: 0 7px 22px rgba(124,45,18,.12) !important;
        display: flex !important;
        flex-direction: column !important;
        align-items: flex-start !important;
        justify-content: center !important;
        gap: 8px !important;
        font-size: 12px !important;
        color: #8a5428 !important;
        z-index: 60 !important;
      }
      .mawe-stock-card:nth-child(2) .mawe-stock-date input {
        width: 125px !important;
        height: 30px !important;
        font-size: 11px !important;
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
      .mawe-stock-date input { cursor: pointer !important; }

      @media (max-width: 767px) {
        header { margin-bottom: 104px !important; }
        .mawe-header-stock {
          top: calc(100% + 10px) !important;
          width: calc(100vw - 28px) !important;
          gap: 6px !important;
        }
        .mawe-stock-card,
        .mawe-stock-card:nth-child(2) .mawe-stock-date {
          width: calc((100vw - 40px) / 3) !important;
          min-height: 88px !important;
          padding: 8px !important;
          border-radius: 15px !important;
        }
        .mawe-stock-card:nth-child(2) .mawe-stock-date {
          left: calc(100% + 6px) !important;
          top: 0 !important;
        }
        .mawe-stock-card:nth-child(2) .mawe-stock-date input {
          width: 100% !important;
          height: 25px !important;
          font-size: 8px !important;
        }
        .mawe-stock-icon { width: 32px !important; height: 32px !important; font-size: 20px !important; }
        .mawe-stock-label { font-size: 10px !important; }
        .mawe-stock-value { font-size: 9px !important; }
        .mawe-stock-value strong { font-size: 20px !important; }
        .mawe-stock-owner { font-size: 7px !important; }
        .mawe-stock-controls button { width: 23px !important; height: 20px !important; }
      }

      @media (min-width: 768px) and (max-width: 1100px) {
        header { margin-bottom: 118px !important; }
        .mawe-header-stock { top: calc(100% + 12px) !important; gap: 8px !important; }
        .mawe-stock-card,
        .mawe-stock-card:nth-child(2) .mawe-stock-date {
          width: 150px !important;
          min-height: 94px !important;
        }
        .mawe-stock-card:nth-child(2) .mawe-stock-date { left: calc(100% + 8px) !important; }
      }

      @media (min-width: 1101px) {
        header { margin-bottom: 122px !important; }
      }
    `
    document.head.appendChild(style)
    return () => style.remove()
  }, [])

  return null
}
