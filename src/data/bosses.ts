import type { BossId } from '../game/types'

export type BossDef = {
  id: BossId
  name: string
  description: string
}

export const BOSSES: BossDef[] = [
  {
    id: 'minLength4',
    name: 'Tall Stems',
    description: 'Words must be at least 4 letters.',
  },
  {
    id: 'noE',
    name: 'No E, Darling',
    description: 'You cannot play a word that contains E.',
  },
  {
    id: 'muteVowels',
    name: 'Quiet Vowels',
    description: 'Vowels score 0 chips this round.',
  },
  {
    id: 'mustInclude',
    name: 'House Letter',
    description: 'Every word must include a shown letter.',
  },
  {
    id: 'evenLength',
    name: 'Even Keel',
    description: 'Only even-length words score.',
  },
  {
    id: 'twoPlays',
    name: 'Short Set',
    description: 'Only 2 plays this round.',
  },
  {
    id: 'tightGrip',
    name: 'Tight Grip',
    description: 'Hand size is reduced by 1 this round.',
  },
  {
    id: 'ghostFirst',
    name: 'Ghost First',
    description: 'The first letter of each word scores 0.',
  },
]

export const BOSS_BY_ID: Record<BossId, BossDef> = Object.fromEntries(
  BOSSES.map((b) => [b.id, b]),
) as Record<BossId, BossDef>
