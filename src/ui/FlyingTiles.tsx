import { faceLetter } from '../game/scoring'
import type { Tile } from '../game/types'

export type FlyOrigin = { left: number; top: number }

export function FlyingTiles({
  tiles,
  origins,
}: {
  tiles: Tile[]
  origins?: FlyOrigin[]
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
            }}
          >
            {faceLetter(tile) || tile.letter}
          </span>
        )
      })}
    </div>
  )
}

export function CornerWells() {
  return (
    <>
      <div className="well discard-well" aria-hidden>
        <span>Discard</span>
      </div>
      <div className="well draw-well" aria-hidden>
        <span>Draw</span>
      </div>
    </>
  )
}
