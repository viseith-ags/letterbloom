export type Tile = {
  id: string
  letter: string
  assigned?: string
}

export type ScoreBreakdown = {
  word: string
  chips: number
  mult: number
  total: number
  notes: string[]
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

export type RunPhase = 'title' | 'bossIntro' | 'playing' | 'shop' | 'gameOver'

export type Records = {
  bestStreak: number
  bestScore: number
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
  toast: string | null
  records: Records
}
