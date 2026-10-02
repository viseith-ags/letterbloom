import { faceLetter } from '../game/scoring'
import type { Tile } from '../game/types'

export type FlyOrigin = { left: number; top: number }

export function FlyingTiles({
  tiles,
  origins,
  dest,
}: {
  tiles: Tile[]
  origins?: FlyOrigin[]
  dest?: FlyOrigin
}) {
  if (tiles.length === 0) return null
  return (
    <div className="flying-layer" aria-hidden>
      {tiles.map((tile, i) => {
        const origin = origins?.[i]
        return (
          <span
            key={`${tile.id}-${i}`}
            className="flying-tile discard-fly"
            style={{
              animationDelay: `${i * 110}ms`,
              ['--fly-start' as string]: origin ? `${origin.left}px` : `${46 + i * 4}%`,
              ['--fly-top' as string]: origin ? `${origin.top}px` : '52%',
              ['--fly-end-left' as string]: dest ? `${dest.left}px` : '24px',
              ['--fly-end-top' as string]: dest ? `${dest.top}px` : 'calc(100% - 72px)',
            }}
          >
            {faceLetter(tile) || tile.letter}
          </span>
        )
      })}
    </div>
  )
}

export function DiscardWell() {
  return (
    <div className="well discard-well" aria-hidden>
      <span>Discard</span>
    </div>
  )
}

export function DrawWell() {
  return (
    <div className="well draw-well" aria-hidden>
      <span>Draw</span>
    </div>
  )
}
