import { useLayoutEffect, useRef } from 'react'
import { TileView } from './TileView'
import type { Tile } from '../game/types'

type Props = {
  hand: Tile[]
  selectedIds: string[]
  drawnIds: string[]
  locked?: boolean
  onToggle: (id: string) => void
}

export function Rack({ hand, selectedIds, drawnIds, locked, onToggle }: Props) {
  const rackRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    if (drawnIds.length === 0) return
    const well = document.querySelector('.draw-well')
    const rack = rackRef.current
    if (!well || !rack) return
    const wr = well.getBoundingClientRect()
    rack.querySelectorAll('.tile-draw').forEach((node) => {
      const el = node as HTMLElement
      const r = el.getBoundingClientRect()
      el.style.setProperty('--draw-dx', `${wr.left - r.left}px`)
      el.style.setProperty('--draw-dy', `${wr.top - r.top}px`)
    })
  }, [drawnIds, hand])

  return (
    <div className="rack" aria-label="Letter rack" ref={rackRef}>
      {Array.from({ length: 6 }, (_, i) => {
        const tile = hand[i]
        if (!tile) return <div key={`empty-${i}`} className="rack-slot" />
        const idx = selectedIds.indexOf(tile.id)
        return (
          <TileView
            key={tile.id}
            tile={tile}
            selected={idx >= 0}
            order={idx >= 0 ? idx + 1 : undefined}
            drawn={drawnIds.includes(tile.id)}
            drawIndex={Math.max(0, drawnIds.indexOf(tile.id))}
            locked={locked}
            onClick={() => onToggle(tile.id)}
            draggable={!locked}
            onDragStart={(e) => {
              e.dataTransfer.setData('text/tile-id', tile.id)
              e.dataTransfer.effectAllowed = 'move'
            }}
          />
        )
      })}
    </div>
  )
}
