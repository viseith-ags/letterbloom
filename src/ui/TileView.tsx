import type { DragEvent } from 'react'
import { JOKER_BY_ID } from '../data/jokers'
import { letterValue } from '../data/letterValues'
import type { Tile } from '../game/types'

type Props = {
  tile: Tile
  selected?: boolean
  order?: number
  onClick?: () => void
  draggable?: boolean
  onDragStart?: (e: DragEvent) => void
  onDragOver?: (e: DragEvent) => void
  onDrop?: (e: DragEvent) => void
}

export function TileView({
  tile,
  selected,
  order,
  onClick,
  draggable,
  onDragStart,
  onDragOver,
  onDrop,
}: Props) {
  const face = tile.letter === '*' ? (tile.assigned ?? '*') : tile.letter
  const value = tile.letter === '*' ? 0 : letterValue(tile.letter)
  return (
    <button
      type="button"
      className={`tile ${selected ? 'selected' : ''} ${tile.letter === '*' ? 'wild' : ''}`}
      onClick={onClick}
      draggable={draggable}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      {order ? <span className="tile-order">{order}</span> : null}
      <span className="tile-letter">{face}</span>
      <span className="tile-value">{value}</span>
    </button>
  )
}

export function JokerCard({ id }: { id: string }) {
  const def = JOKER_BY_ID[id]
  if (!def) return null
  return (
    <article className={`joker-card rarity-${def.rarity}`}>
      <h3>{def.name}</h3>
      <p>{def.description}</p>
    </article>
  )
}
