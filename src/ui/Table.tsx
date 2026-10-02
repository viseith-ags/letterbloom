import { JokerCard, TileView } from './TileView'
import { faceLetter } from '../game/scoring'
import type { Tile } from '../game/types'

type Props = {
  tiles: Tile[]
  onRemove: (id: string) => void
  onAssignWild: (id: string, letter: string) => void
  onReorder: (from: number, to: number) => void
  onDropTile: (id: string) => void
}

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')

export function PlayRow({ tiles, onRemove, onAssignWild, onReorder, onDropTile }: Props) {
  return (
    <div
      className="play-row"
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
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
            onClick={() => onRemove(tile.id)}
            draggable
            onDragStart={(e) => {
              e.dataTransfer.setData('text/play-index', String(index))
              e.dataTransfer.setData('text/tile-id', tile.id)
            }}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.stopPropagation()
              const fromRaw = e.dataTransfer.getData('text/play-index')
              if (fromRaw !== '') {
                onReorder(Number(fromRaw), index)
                return
              }
              const id = e.dataTransfer.getData('text/tile-id')
              if (id) onDropTile(id)
            }}
          />
          {tile.letter === '*' ? (
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

export function JokerRow({ jokers }: { jokers: string[] }) {
  return (
    <div className="joker-row" aria-label="Jokers">
      {Array.from({ length: 5 }, (_, i) => {
        const id = jokers[i]
        return (
          <div key={id ?? `empty-${i}`} className="joker-slot">
            {id ? <JokerCard id={id} /> : <span>empty</span>}
          </div>
        )
      })}
    </div>
  )
}
