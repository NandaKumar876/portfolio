'use client'

import { useEffect, useRef } from 'react'

interface Blob {
  cx: number; cy: number
  rx: number; ry: number
  ax: number; ay: number
  opacity: number
}

const BLOBS: Blob[] = [
  { cx:.14, cy:.18, rx:.40, ry:.30, ax:.000014, ay:.000010, opacity:.038 },
  { cx:.82, cy:.72, rx:.32, ry:.26, ax:-.000012, ay:.000014, opacity:.024 },
  { cx:.50, cy:.44, rx:.22, ry:.20, ax:.000016, ay:-.000017, opacity:.018 },
  { cx:.80, cy:.14, rx:.24, ry:.20, ax:-.000018, ay:.000009, opacity:.015 },
]

export function AmbientCanvas() {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const cv  = ref.current!
    const ctx = cv.getContext('2d')!
    let   raf = 0

    function resize() {
      cv.width  = window.innerWidth
      cv.height = window.innerHeight
    }

    function frame(t: number) {
      ctx.clearRect(0, 0, cv.width, cv.height)
      ctx.fillStyle = '#08080b'
      ctx.fillRect(0, 0, cv.width, cv.height)

      const m = Math.min(cv.width, cv.height)
      BLOBS.forEach(b => {
        const ox = Math.sin(t * b.ax * 12000) * 0.06
        const oy = Math.cos(t * b.ay * 12000) * 0.06
        const x  = (b.cx + ox) * cv.width
        const y  = (b.cy + oy) * cv.height
        const rx = b.rx * m
        const ry = b.ry * m

        ctx.save()
        ctx.translate(x, y)
        ctx.scale(1, ry / rx)
        const g = ctx.createRadialGradient(0, 0, 0, 0, 0, rx)
        g.addColorStop(0,   `rgba(255,255,255,${b.opacity})`)
        g.addColorStop(0.5, `rgba(255,255,255,${b.opacity * 0.08})`)
        g.addColorStop(1,   'transparent')
        ctx.fillStyle = g
        ctx.beginPath()
        ctx.arc(0, 0, rx, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()
      })
      raf = requestAnimationFrame(frame)
    }

    resize()
    window.addEventListener('resize', resize)
    raf = requestAnimationFrame(frame)
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize) }
  }, [])

  return (
    <canvas
      ref={ref}
      style={{ position:'fixed', inset:0, width:'100%', height:'100%', zIndex:0, pointerEvents:'none' }}
    />
  )
}
