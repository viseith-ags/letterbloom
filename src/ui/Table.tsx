import { JokerCard, TileView } from './TileView'
import { faceLetter, jokerSellValue } from '../game/scoring'
import type { Tile } from '../game/types'

type Props = {
  tiles: Tile[]
  locked?: boolean
  celebrating?: boolean
  scoringLetter?: number
  onRemove: (id: string) => void
  onAssignWild: (id: string, letter: string) => void
  onReorder: (from: number, to: number) => void
  onDropTile: (id: string) => void
}

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')

export function PlayRow({
  tiles,
  locked,
  celebrating,
  scoringLetter,
  onRemove,
  onAssignWild,
  onReorder,
  onDropTile,
}: Props) {
  return (
    <div
      className={`play-row ${celebrating ? 'celebrating' : ''}`}
      onDragOver={(e) => {
        if (!locked) e.preventDefault()
      }}
      onDrop={(e) => {
        if (locked) return
        const id = e.dataTransfer.getData('text/tile-id')
        if (id) onDropTile(id)
      }}
    >
      {tiles.length === 0 ? <p className="hint">Click tiles in order, or drag them here.</p> : null}
      {tiles.map((tile, index) => (
        <div key={tile.id} className="play-slot">
          <TileView
            tile={tile}
            selected
            order={index + 1}
            celebrating={celebrating}
            celebrateIndex={index}
            scoring={scoringLetter === index}
            locked={locked}
            onClick={() => onRemove(tile.id)}
            draggable={!locked}
            onDragStart={(e) => {
              e.dataTransfer.setData('text/play-index', String(index))
              e.dataTransfer.setData('text/tile-id', tile.id)
            }}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.stopPropagation()
              if (locked) return
              const fromRaw = e.dataTransfer.getData('text/play-index')
              if (fromRaw !== '') {
                onReorder(Number(fromRaw), index)
                return
              }
              const id = e.dataTransfer.getData('text/tile-id')
              if (id) onDropTile(id)
            }}
          />
          {tile.letter === '*' && !locked ? (
            <label className="wild-pick">
              <span>Blank</span>
              <select
                value={faceLetter(tile) || ''}
                onChange={(e) => onAssignWild(tile.id, e.target.value)}
              >
                <option value="">?</option>
                {LETTERS.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
            </label>
          ) : null}
        </div>
      ))}
    </div>
  )
}

export function JokerRow({
  jokers,
  activeIds,
  onSell,
}: {
  jokers: string[]
  activeIds?: string[]
  onSell?: (index: number) => void
}) {
  const active = new Set(activeIds ?? [])
  const slots = Array.from({ length: 5 }, (_, i) => {
    const id = jokers[i]
    return (
      <div key={id ?? `empty-${i}`} className="joker-slot">
        {id ? (
          <JokerCard
            id={id}
            active={active.has(id)}
            sellFor={onSell ? jokerSellValue(id) : undefined}
            onSell={onSell ? () => onSell(i) : undefined}
          />
        ) : (
          <span>empty</span>
        )}
      </div>
    )
  })
  return (
    <div className="joker-board" aria-label="Jokers">
      <div className="joker-row">{slots.slice(0, 3)}</div>
      <div className="joker-row">{slots.slice(3)}</div>
    </div>
  )
}
