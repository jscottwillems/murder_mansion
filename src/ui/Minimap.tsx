import { useEffect, useRef } from 'react'
import type { Snapshot } from '@/game/types'
import { ROOMS } from '@/game/data'

export function Minimap({ snap }: { snap: Snapshot }) {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const W = canvas.width
    const cell = W / 3
    ctx.clearRect(0, 0, W, W)
    ctx.font = '8px Georgia'
    for (const r of ROOMS) {
      const x = r.col * cell
      const y = r.row * cell
      const isPlayer = snap.minimap.playerRoom === r.id
      const hasBody = snap.minimap.bodyRooms.includes(r.id)
      ctx.fillStyle = isPlayer ? 'rgba(201,162,39,0.28)' : 'rgba(30,28,40,0.85)'
      ctx.fillRect(x + 1.5, y + 1.5, cell - 3, cell - 3)
      ctx.strokeStyle = isPlayer ? '#c9a227' : 'rgba(160,150,130,0.35)'
      ctx.lineWidth = isPlayer ? 1.4 : 0.8
      ctx.strokeRect(x + 1.5, y + 1.5, cell - 3, cell - 3)
      ctx.fillStyle = isPlayer ? '#e8d8a0' : 'rgba(200,190,170,0.55)'
      ctx.textAlign = 'center'
      ctx.fillText(r.name.split(' ')[0], x + cell / 2, y + cell / 2 + 2)
      if (hasBody) {
        ctx.fillStyle = '#c83a2a'
        ctx.beginPath()
        ctx.arc(x + cell - 7, y + 7, 3, 0, Math.PI * 2)
        ctx.fill()
      }
    }
    // player marker
    const pr = ROOMS.find(r => r.id === snap.minimap.playerRoom)
    if (pr) {
      ctx.fillStyle = '#e8d8a0'
      ctx.beginPath()
      ctx.arc(pr.col * cell + 8, pr.row * cell + 8, 2.6, 0, Math.PI * 2)
      ctx.fill()
    }
    // visible guests
    for (const g of snap.minimap.visibleGuestRooms) {
      const gr = ROOMS.find(r => r.id === g.room)
      if (!gr) continue
      ctx.fillStyle = g.color
      ctx.beginPath()
      ctx.arc(gr.col * cell + 12 + Math.random() * 0, gr.row * cell + 12, 2.2, 0, Math.PI * 2)
      ctx.fill()
    }
  }, [snap])

  return (
    <canvas
      ref={ref}
      width={300}
      height={300}
      className="aspect-square w-full rounded border border-[#3a352a] bg-black/70 shadow-lg"
    />
  )
}
