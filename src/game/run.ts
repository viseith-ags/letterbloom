import { BOSSES } from '../data/bosses'
import { JOKER_BY_ID } from '../data/jokers'
import { drawToHandSize, makeStartingBag, spendTiles } from './bag'
import { loadRecords, saveRecords } from './records'
import { jokerSellValue, scoreWord, validatePlay } from './scoring'
import { addPurchasedLetter, generateShopOffers } from './shop'
import type { ActiveBoss, BossId, Payout, RunState, Tile } from './types'

export function isBossRound(round: number): boolean {
  return round > 0 && round % 3 === 0
}

export function isShopRound(round: number): boolean {
  return round > 0 && round % 2 === 0
}

export function targetForRound(round: number, boss: boolean): number {
  const linear = 22 + 10 * (round - 1)
  const curve = Math.round(((round - 1) * (round - 1) * 1.6) / 2)
  return linear + curve + (boss ? 14 + round * 3 : 0)
}

export function baseHandSize(jokers: string[]): number {
  return 6 + jokers.filter((id) => id === 'wideRack').length
}

export function playsThisRound(jokers: string[], boss: ActiveBoss | null): number {
  const extra = jokers.filter((id) => id === 'encore').length
  const base = boss?.id === 'twoPlays' ? 2 : 3
  return base + extra
}

function roundHandSize(jokers: string[], boss: ActiveBoss | null): number {
  const size = baseHandSize(jokers)
  return boss?.id === 'tightGrip' ? Math.max(1, size - 1) : size
}

function shuffleBosses(): BossId[] {
  const ids = BOSSES.map((b) => b.id)
  for (let i = ids.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[ids[i], ids[j]] = [ids[j]!, ids[i]!]
  }
  return ids
}

function pickRequiredLetter(hand: Tile[]): string {
  const letters = hand
    .map((t) => (t.letter === '*' ? 'E' : t.letter))
    .filter(Boolean)
  if (letters.length === 0) return 'S'
  return letters[Math.floor(Math.random() * letters.length)]!
}

function drawBoss(queue: BossId[]): { bossId: BossId; queue: BossId[] } {
  const nextQueue = queue.length ? [...queue] : shuffleBosses()
  const bossId = nextQueue.shift()!
  if (nextQueue.length === 0) {
    return { bossId, queue: shuffleBosses().filter((id) => id !== bossId) }
  }
  return { bossId, queue: nextQueue }
}

function emptyVisuals() {
  return {
    lastScore: null as RunState['lastScore'],
    spotlightTiles: [] as Tile[],
    lastDrawnIds: [] as string[],
    lastDiscarded: [] as Tile[],
    lastPayout: null as Payout | null,
    pendingFill: null as RunState['pendingFill'],
    pendingOutcome: null as RunState['pendingOutcome'],
  }
}

export function titleState(): RunState {
  const records = loadRecords()
  return {
    phase: 'title',
    round: 0,
    streak: 0,
    runScore: 0,
    coins: 0,
    target: 0,
    roundScore: 0,
    playsLeft: 0,
    discardsLeft: 0,
    bag: [],
    discardPile: [],
    hand: [],
    selectedIds: [],
    jokers: [],
    handSize: 6,
    boss: null,
    bossQueue: shuffleBosses(),
    shopOffers: [],
    rerollCost: 2,
    nextTileId: 1,
    toast: null,
    records,
    ...emptyVisuals(),
  }
}

function beginRound(state: RunState, round: number): RunState {
  const bossRound = isBossRound(round)
  let boss: ActiveBoss | null = null
  let bossQueue = state.bossQueue
  if (bossRound) {
    const drawn = drawBoss(bossQueue)
    boss = { id: drawn.bossId }
    bossQueue = drawn.queue
  }

  const handSize = roundHandSize(state.jokers, boss)
  const overflow =
    state.hand.length > handSize
      ? {
          hand: state.hand.slice(0, handSize),
          discardPile: [...state.discardPile, ...state.hand.slice(handSize)],
        }
      : { hand: state.hand, discardPile: state.discardPile }
  const filled = drawToHandSize(overflow.hand, state.bag, overflow.discardPile, handSize)
  if (boss?.id === 'mustInclude') {
    boss = { ...boss, requiredLetter: pickRequiredLetter(filled.hand) }
  }

  return {
    ...state,
    phase: boss ? 'bossIntro' : 'playing',
    round,
    target: targetForRound(round, bossRound),
    roundScore: 0,
    playsLeft: playsThisRound(state.jokers, boss),
    discardsLeft: 3,
    bag: filled.bag,
    discardPile: filled.discardPile,
    hand: filled.hand,
    selectedIds: [],
    handSize,
    boss,
    bossQueue,
    lastScore: null,
    spotlightTiles: [],
    lastDrawnIds: filled.drawn.map((t) => t.id),
    lastDiscarded: [],
    lastPayout: null,
    pendingFill: null,
    pendingOutcome: null,
    toast: boss ? null : `Round ${round} — hit ${targetForRound(round, bossRound)} points`,
  }
}

export function startRun(): RunState {
  const made = makeStartingBag(1)
  const base = titleState()
  return beginRound(
    {
      ...base,
      coins: 0,
      runScore: 0,
      streak: 0,
      jokers: [],
      bag: made.bag,
      discardPile: [],
      hand: [],
      nextTileId: made.nextId,
    },
    1,
  )
}

export function dismissBossIntro(state: RunState): RunState {
  if (state.phase !== 'bossIntro') return state
  return { ...state, phase: 'playing', toast: `Round ${state.round} — ${state.target} points to beat` }
}

export function selectedTiles(state: RunState): Tile[] {
  const byId = new Map(state.hand.map((t) => [t.id, t]))
  return state.selectedIds.map((id) => byId.get(id)).filter((t): t is Tile => Boolean(t))
}

export function toggleSelect(state: RunState, tileId: string): RunState {
  if (state.phase !== 'playing') return state
  if (!state.hand.some((t) => t.id === tileId)) return state
  const exists = state.selectedIds.includes(tileId)
  return {
    ...state,
    selectedIds: exists
      ? state.selectedIds.filter((id) => id !== tileId)
      : [...state.selectedIds, tileId],
    toast: null,
  }
}

export function clearSelection(state: RunState): RunState {
  if (state.phase !== 'playing') return state
  return { ...state, selectedIds: [] }
}

export function assignWild(state: RunState, tileId: string, letter: string): RunState {
  return {
    ...state,
    hand: state.hand.map((t) =>
      t.id === tileId && t.letter === '*' ? { ...t, assigned: letter.toUpperCase() } : t,
    ),
  }
}

export function moveSelected(state: RunState, from: number, to: number): RunState {
  const ids = [...state.selectedIds]
  const [item] = ids.splice(from, 1)
  if (!item) return state
  ids.splice(to, 0, item)
  return { ...state, selectedIds: ids }
}

function piggyInterest(coins: number, jokers: string[]): number {
  const banks = jokers.filter((id) => id === 'piggyBank').length
  if (!banks) return 0
  return banks * Math.floor(coins / 5)
}

function computePayout(state: RunState, playsLeftAfter: number): Payout {
  const base = 4 + Math.floor(state.round / 2)
  const unusedPlays = playsLeftAfter
  const bossBonus = state.boss ? 3 : 0
  const beforeInterest = state.coins + base + unusedPlays + bossBonus
  const interest = piggyInterest(beforeInterest, state.jokers)
  return {
    base,
    unusedPlays,
    bossBonus,
    interest,
    total: base + unusedPlays + bossBonus + interest,
  }
}

function endRun(state: RunState, toast: string): RunState {
  const records = saveRecords({
    bestStreak: state.streak,
    bestScore: state.runScore,
  })
  return {
    ...state,
    phase: 'gameOver',
    records,
    toast,
    selectedIds: [],
    spotlightTiles: [],
    pendingFill: null,
    pendingOutcome: null,
  }
}

export function playWord(state: RunState): RunState {
  if (state.phase !== 'playing') return state
  if (state.playsLeft <= 0) return { ...state, toast: 'No plays left.' }
  const tiles = selectedTiles(state)
  const check = validatePlay(tiles, state.boss)
  if (!check.ok) return { ...state, toast: check.reason }

  const breakdown = scoreWord(tiles, state.jokers, state.boss, state.hand.length)
  const spent = spendTiles(state.hand, state.selectedIds, state.discardPile)
  const playsLeft = state.playsLeft - 1
  const roundScore = state.roundScore + breakdown.total
  const won = roundScore >= state.target
  const lost = !won && playsLeft <= 0
  const filled = lost || won ? null : drawToHandSize(spent.hand, state.bag, spent.discardPile, state.handSize)

  return {
    ...state,
    phase: 'scoring',
    bag: state.bag,
    discardPile: spent.discardPile,
    hand: spent.hand,
    selectedIds: [],
    playsLeft,
    roundScore,
    lastScore: breakdown,
    spotlightTiles: tiles,
    lastDrawnIds: [],
    lastDiscarded: [],
    lastPayout: won ? computePayout({ ...state, playsLeft }, playsLeft) : null,
    pendingFill: filled
      ? {
          hand: filled.hand,
          bag: filled.bag,
          discardPile: filled.discardPile,
          drawnIds: filled.drawn.map((t) => t.id),
        }
      : null,
    pendingOutcome: won ? 'won' : lost ? 'lost' : 'continue',
    toast: null,
  }
}

export function resolveScoring(state: RunState): RunState {
  if (state.phase !== 'scoring') return state
  if (state.pendingOutcome === 'lost') {
    return endRun(state, `Missed ${state.target} points. Streak ${state.streak}.`)
  }
  if (state.pendingOutcome === 'won') {
    const payout = state.lastPayout ?? computePayout(state, state.playsLeft)
    const coins = state.coins + payout.total
    const streak = state.round
    const runScore = state.runScore + state.roundScore
    const records = saveRecords({ bestStreak: streak, bestScore: runScore })
    return {
      ...state,
      phase: 'reward',
      coins,
      streak,
      runScore,
      records,
      lastPayout: payout,
      spotlightTiles: [],
      pendingFill: null,
      pendingOutcome: null,
      toast: null,
    }
  }

  const fill = state.pendingFill
  if (!fill) {
    return { ...state, phase: 'playing', spotlightTiles: [], lastScore: null }
  }
  return {
    ...state,
    phase: 'playing',
    bag: fill.bag,
    discardPile: fill.discardPile,
    hand: fill.hand,
    lastDrawnIds: fill.drawnIds,
    spotlightTiles: [],
    pendingFill: null,
    pendingOutcome: null,
    lastScore: null,
  }
}

export function collectReward(state: RunState): RunState {
  if (state.phase !== 'reward') return state
  const after = {
    ...state,
    lastPayout: null,
    lastScore: null,
    spotlightTiles: [],
    boss: null as ActiveBoss | null,
  }
  if (isShopRound(state.round)) {
    const shop = generateShopOffers(after.jokers, after.nextTileId)
    return {
      ...after,
      phase: 'shop',
      shopOffers: shop.offers,
      rerollCost: 2,
      nextTileId: shop.nextId,
    }
  }
  return beginRound(after, state.round + 1)
}

export function discardSelected(state: RunState): RunState {
  if (state.phase !== 'playing') return state
  if (state.discardsLeft <= 0) return { ...state, toast: 'No discards left.' }
  if (state.selectedIds.length === 0) return { ...state, toast: 'Select tiles to discard.' }

  const spent = spendTiles(state.hand, state.selectedIds, state.discardPile)
  const filled = drawToHandSize(spent.hand, state.bag, spent.discardPile, state.handSize)
  return {
    ...state,
    bag: state.bag,
    discardPile: spent.discardPile,
    hand: spent.hand,
    selectedIds: [],
    discardsLeft: state.discardsLeft - 1,
    lastDiscarded: spent.spent,
    lastDrawnIds: [],
    lastScore: null,
    toast: null,
    pendingFill: {
      hand: filled.hand,
      bag: filled.bag,
      discardPile: filled.discardPile,
      drawnIds: filled.drawn.map((t) => t.id),
    },
  }
}

export function clearDiscardFx(state: RunState): RunState {
  if (state.lastDiscarded.length === 0 && !state.pendingFill) return state
  const fill = state.pendingFill
  if (fill) {
    return {
      ...state,
      bag: fill.bag,
      discardPile: fill.discardPile,
      hand: fill.hand,
      lastDrawnIds: fill.drawnIds,
      lastDiscarded: [],
      pendingFill: null,
    }
  }
  return { ...state, lastDiscarded: [] }
}

export function clearDrawFx(state: RunState): RunState {
  if (state.lastDrawnIds.length === 0) return state
  return { ...state, lastDrawnIds: [] }
}

export function buyOffer(state: RunState, offerId: string): RunState {
  if (state.phase !== 'shop') return state
  const offer = state.shopOffers.find((o) => o.id === offerId)
  if (!offer) return state
  if (state.coins < offer.cost) return { ...state, toast: 'Not enough coins.' }

  if (offer.kind === 'joker') {
    if (state.jokers.length >= 5) return { ...state, toast: 'All 5 joker slots are full.' }
    if (state.jokers.includes(offer.jokerId)) return { ...state, toast: 'You already have that joker.' }
    return {
      ...state,
      coins: state.coins - offer.cost,
      jokers: [...state.jokers, offer.jokerId],
      shopOffers: state.shopOffers.filter((o) => o.id !== offerId),
      toast: `Took ${JOKER_BY_ID[offer.jokerId]?.name ?? 'a joker'}.`,
    }
  }

  const made = addPurchasedLetter(offer.letter, state.nextTileId)
  return {
    ...state,
    coins: state.coins - offer.cost,
    bag: [...state.bag, made.tile],
    nextTileId: made.nextId,
    shopOffers: state.shopOffers.filter((o) => o.id !== offerId),
    toast: `Added ${offer.letter === '*' ? 'blank' : offer.letter} to the bag.`,
  }
}

export function sellJoker(state: RunState, index: number): RunState {
  if (state.phase !== 'shop') return state
  const id = state.jokers[index]
  if (!id) return state
  const value = jokerSellValue(id)
  const jokers = state.jokers.filter((_, i) => i !== index)
  return {
    ...state,
    jokers,
    coins: state.coins + value,
    toast: `Sold ${JOKER_BY_ID[id]?.name ?? 'a joker'} for ${value}✦.`,
  }
}

export function rerollShop(state: RunState): RunState {
  if (state.phase !== 'shop') return state
  if (state.coins < state.rerollCost) return { ...state, toast: 'Cannot afford a reroll.' }
  const shop = generateShopOffers(state.jokers, state.nextTileId)
  return {
    ...state,
    coins: state.coins - state.rerollCost,
    rerollCost: state.rerollCost + 1,
    shopOffers: shop.offers,
    nextTileId: shop.nextId,
    toast: 'Fresh stock.',
  }
}

export function leaveShop(state: RunState): RunState {
  if (state.phase !== 'shop') return state
  return beginRound({ ...state, shopOffers: [], toast: null }, state.round + 1)
}

export function backToTitle(): RunState {
  return titleState()
}
