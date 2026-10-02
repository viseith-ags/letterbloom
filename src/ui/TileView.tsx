import type { DragEvent } from 'react'
import { JOKER_BY_ID } from '../data/jokers'
import { letterValue } from '../data/letterValues'
import type { Tile } from '../game/types'

type Props = {
  tile: Tile
  selected?: boolean
  order?: number
  drawn?: boolean
  drawIndex?: number
  celebrating?: boolean
  celebrateIndex?: number
  scoring?: boolean
  locked?: boolean
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
  drawn,
  drawIndex = 0,
  celebrating,
  celebrateIndex = 0,
  scoring,
  locked,
  onClick,
  draggable,
  onDragStart,
  onDragOver,
  onDrop,
}: Props) {
  const face = tile.letter === '*' ? (tile.assigned ?? '*') : tile.letter
  const value = tile.letter === '*' ? 0 : letterValue(tile.letter)
  const classes = [
    'tile',
    selected ? 'selected' : '',
    tile.letter === '*' ? 'wild' : '',
    drawn ? 'tile-draw' : '',
    celebrating ? 'tile-celebrate' : '',
    scoring ? 'tile-scoring' : '',
  ]
    .filter(Boolean)
    .join(' ')
  const inner = (
    <>
      {order ? <span className="tile-order">{order}</span> : null}
      <span className="tile-letter">{face}</span>
      <span className="tile-value">{value}</span>
    </>
  )
  const delays: string[] = []
  if (drawn) delays.push(`${drawIndex * 110}ms`)
  if (celebrating) delays.push(`${celebrateIndex * 90}ms`)
  const style = delays.length ? { animationDelay: delays[0] } : undefined
  if (locked || !onClick) {
    return (
      <div className={classes} style={style}>
        {inner}
      </div>
    )
  }
  return (
    <button
      type="button"
      className={classes}
      style={style}
      onClick={onClick}
      draggable={Boolean(draggable)}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      {inner}
    </button>
  )
}

export function JokerCard({
  id,
  active,
  sellFor,
  onSell,
}: {
  id: string
  active?: boolean
  sellFor?: number
  onSell?: () => void
}) {
  const def = JOKER_BY_ID[id]
  if (!def) return null
  return (
    <article className={`joker-card rarity-${def.rarity} ${active ? 'joker-active' : ''}`}>
      <h3>{def.name}</h3>
      <p>{def.description}</p>
      {onSell && sellFor != null ? (
        <button type="button" className="sell" onClick={onSell}>
          Sell ✦{sellFor}
        </button>
      ) : null}
    </article>
  )
}
