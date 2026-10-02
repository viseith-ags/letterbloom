import { TileView } from './TileView'
import type { Tile } from '../game/types'

type Props = {
  hand: Tile[]
  selectedIds: string[]
  onToggle: (id: string) => void
}

export function Rack({ hand, selectedIds, onToggle }: Props) {
  return (
    <div className="rack" aria-label="Letter rack">
      {hand.map((tile) => {
        const idx = selectedIds.indexOf(tile.id)
        return (
          <TileView
            key={tile.id}
            tile={tile}
            selected={idx >= 0}
            order={idx >= 0 ? idx + 1 : undefined}
            onClick={() => onToggle(tile.id)}
            draggable
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
