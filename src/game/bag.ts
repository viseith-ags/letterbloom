import { STARTING_BAG } from '../data/letterValues'
import type { Tile } from './types'

export function shuffle<T>(items: T[]): T[] {
  const next = [...items]
  for (let i = next.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[next[i], next[j]] = [next[j]!, next[i]!]
  }
  return next
}

export function makeTile(letter: string, nextId: number): { tile: Tile; nextId: number } {
  return {
    tile: { id: `t${nextId}`, letter, ...(letter === '*' ? { assigned: undefined } : {}) },
    nextId: nextId + 1,
  }
}

export function makeStartingBag(startId = 1): { bag: Tile[]; nextId: number } {
  let nextId = startId
  const bag: Tile[] = []
  for (const letter of shuffle(STARTING_BAG)) {
    const made = makeTile(letter, nextId)
    bag.push(made.tile)
    nextId = made.nextId
  }
  return { bag: shuffle(bag), nextId }
}

export function reshuffleIfNeeded(bag: Tile[], discardPile: Tile[]): {
  bag: Tile[]
  discardPile: Tile[]
} {
  if (bag.length > 0) return { bag, discardPile }
  if (discardPile.length === 0) return { bag, discardPile }
  return { bag: shuffle(discardPile), discardPile: [] }
}

export function drawTiles(
  bag: Tile[],
  discardPile: Tile[],
  count: number,
): { drawn: Tile[]; bag: Tile[]; discardPile: Tile[] } {
  let nextBag = [...bag]
  let nextDiscard = [...discardPile]
  const drawn: Tile[] = []
  for (let i = 0; i < count; i++) {
    const reshuffled = reshuffleIfNeeded(nextBag, nextDiscard)
    nextBag = reshuffled.bag
    nextDiscard = reshuffled.discardPile
    const tile = nextBag.shift()
    if (!tile) break
    drawn.push(tile)
  }
  return { drawn, bag: nextBag, discardPile: nextDiscard }
}

export function drawToHandSize(
  hand: Tile[],
  bag: Tile[],
  discardPile: Tile[],
  handSize: number,
): { hand: Tile[]; bag: Tile[]; discardPile: Tile[]; drawn: Tile[] } {
  const need = Math.max(0, handSize - hand.length)
  const result = drawTiles(bag, discardPile, need)
  return {
    hand: [...hand, ...result.drawn],
    bag: result.bag,
    discardPile: result.discardPile,
    drawn: result.drawn,
  }
}

export function spendTiles(
  hand: Tile[],
  ids: string[],
  discardPile: Tile[],
): { hand: Tile[]; discardPile: Tile[]; spent: Tile[] } {
  const idSet = new Set(ids)
  const spent = hand.filter((t) => idSet.has(t.id))
  const kept = hand.filter((t) => !idSet.has(t.id))
  return { hand: kept, discardPile: [...discardPile, ...spent], spent }
}
