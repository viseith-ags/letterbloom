export type Tile = {
  id: string
  letter: string
  assigned?: string
}

export type ScoreStep =
  | { kind: 'letter'; letter: string; add: number; points: number; mult: number }
  | { kind: 'joker'; jokerId: string; name: string; detail: string; points: number; mult: number }
  | { kind: 'total'; points: number; mult: number; total: number }

export type ScoreBreakdown = {
  word: string
  points: number
  mult: number
  total: number
  steps: ScoreStep[]
}

export type ShopOffer =
  | { kind: 'letter'; letter: string; cost: number; id: string }
  | { kind: 'joker'; jokerId: string; cost: number; id: string }

export type BossId =
  | 'minLength4'
  | 'noE'
  | 'muteVowels'
  | 'mustInclude'
  | 'evenLength'
  | 'twoPlays'
  | 'tightGrip'
  | 'ghostFirst'

export type ActiveBoss = {
  id: BossId
  requiredLetter?: string
}

export type RunPhase =
  | 'title'
  | 'bossIntro'
  | 'playing'
  | 'scoring'
  | 'reward'
  | 'shop'
  | 'gameOver'

export type Records = {
  bestStreak: number
  bestScore: number
}

export type Payout = {
  base: number
  unusedPlays: number
  bossBonus: number
  interest: number
  total: number
}

export type PendingFill = {
  hand: Tile[]
  bag: Tile[]
  discardPile: Tile[]
  drawnIds: string[]
}

export type RunState = {
  phase: RunPhase
  round: number
  streak: number
  runScore: number
  coins: number
  target: number
  roundScore: number
  playsLeft: number
  discardsLeft: number
  bag: Tile[]
  discardPile: Tile[]
  hand: Tile[]
  selectedIds: string[]
  jokers: string[]
  handSize: number
  boss: ActiveBoss | null
  bossQueue: BossId[]
  shopOffers: ShopOffer[]
  rerollCost: number
  nextTileId: number
  lastScore: ScoreBreakdown | null
  spotlightTiles: Tile[]
  lastDrawnIds: string[]
  lastDiscarded: Tile[]
  lastPayout: Payout | null
  pendingFill: PendingFill | null
  pendingOutcome: 'continue' | 'won' | 'lost' | null
  toast: string | null
  records: Records
}
