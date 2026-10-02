import { JOKERS } from '../data/jokers'
import { letterCost } from '../data/letterValues'
import { makeTile, shuffle } from './bag'
import type { ShopOffer } from './types'

const SHOP_LETTERS = 'EARIOTNSLUDCPMHGYBFWKVJXQZ*'.split('')

export function generateShopOffers(
  ownedJokers: string[],
  nextId: number,
): { offers: ShopOffer[]; nextId: number } {
  let id = nextId
  const unusedJokers = shuffle(JOKERS.filter((j) => !ownedJokers.includes(j.id)))
  const letters = shuffle([...SHOP_LETTERS])
  const offers: ShopOffer[] = []
  let letterIndex = 0
  let jokerIndex = 0

  const jokerSlots = unusedJokers.length === 0 ? 0 : Math.random() < 0.35 ? 2 : 1
  for (let i = 0; i < jokerSlots && jokerIndex < unusedJokers.length && offers.length < 3; i++) {
    const j = unusedJokers[jokerIndex++]!
    offers.push({ kind: 'joker', jokerId: j.id, cost: j.cost, id: `s${id++}` })
  }

  while (offers.length < 3) {
    const letter = letters[letterIndex % letters.length]!
    letterIndex += 1
    offers.push({ kind: 'letter', letter, cost: letterCost(letter), id: `s${id++}` })
  }

  return { offers: shuffle(offers), nextId: id }
}

export function addPurchasedLetter(letter: string, nextTileId: number) {
  return makeTile(letter, nextTileId)
}
