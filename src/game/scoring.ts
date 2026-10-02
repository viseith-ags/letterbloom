import { BOSS_BY_ID } from '../data/bosses'
import { isValidWord } from '../data/dictionary'
import { JOKER_BY_ID } from '../data/jokers'
import { letterValue, RARE_LETTERS, VOWELS } from '../data/letterValues'
import type { ActiveBoss, ScoreBreakdown, ScoreStep, Tile } from './types'

export function faceLetter(tile: Tile): string {
  if (tile.letter === '*') return (tile.assigned ?? '').toUpperCase()
  return tile.letter.toUpperCase()
}

export function wordFromTiles(tiles: Tile[]): string {
  return tiles.map(faceLetter).join('')
}

export function isPalindrome(word: string): boolean {
  if (word.length < 2) return false
  return word === [...word].reverse().join('')
}

export function hasDoubleLetter(word: string): boolean {
  for (let i = 1; i < word.length; i++) {
    if (word[i] === word[i - 1]) return true
  }
  return false
}

export function bossBlocksWord(word: string, boss: ActiveBoss | null): string | null {
  if (!boss) return null
  if (boss.id === 'minLength4' && word.length < 4) {
    return 'Tall Stems wants 4+ letters.'
  }
  if (boss.id === 'noE' && word.includes('E')) {
    return 'No E this round, darling.'
  }
  if (boss.id === 'mustInclude' && boss.requiredLetter && !word.includes(boss.requiredLetter)) {
    return `Must include ${boss.requiredLetter}.`
  }
  if (boss.id === 'evenLength' && word.length % 2 !== 0) {
    return 'Even-length words only.'
  }
  return null
}

export function validatePlay(
  tiles: Tile[],
  boss: ActiveBoss | null,
): { ok: true; word: string } | { ok: false; reason: string } {
  if (tiles.length === 0) return { ok: false, reason: 'Pick some tiles first.' }
  if (tiles.some((t) => t.letter === '*' && !t.assigned)) {
    return { ok: false, reason: 'Choose a letter for each blank tile.' }
  }
  const word = wordFromTiles(tiles)
  if (!isValidWord(word)) return { ok: false, reason: `"${word}" is not in the dictionary.` }
  const blocked = bossBlocksWord(word, boss)
  if (blocked) return { ok: false, reason: blocked }
  return { ok: true, word }
}

function letterPoints(letter: string, index: number, boss: ActiveBoss | null): number {
  let value = letterValue(letter)
  if (boss?.id === 'muteVowels' && VOWELS.has(letter)) value = 0
  if (boss?.id === 'ghostFirst' && index === 0) value = 0
  return value
}

export function scoreWord(
  tiles: Tile[],
  jokers: string[],
  boss: ActiveBoss | null,
  handSizeAtPlay: number,
): ScoreBreakdown {
  const word = wordFromTiles(tiles)
  const steps: ScoreStep[] = []
  let points = 0
  const multStart = word.length
  let mult = multStart

  for (let i = 0; i < word.length; i++) {
    const letter = word[i]!
    const add = letterPoints(letter, i, boss)
    points += add
    steps.push({ kind: 'letter', letter, add, points, mult })
  }

  for (const jokerId of jokers) {
    const def = JOKER_BY_ID[jokerId]
    if (!def) continue
    if (jokerId === 'petalVowels') {
      const n = [...word].filter((c) => VOWELS.has(c)).length
      const add = n * 4
      if (!add) continue
      points += add
      steps.push({
        kind: 'joker',
        jokerId,
        name: def.name,
        detail: `+${add} points from ${n} vowel${n === 1 ? '' : 's'}`,
        points,
        mult,
      })
    } else if (jokerId === 'honeycomb') {
      if (!hasDoubleLetter(word)) continue
      points += 8
      steps.push({
        kind: 'joker',
        jokerId,
        name: def.name,
        detail: '+8 points for a doubled letter',
        points,
        mult,
      })
    } else if (jokerId === 'fullBloom') {
      if (!(tiles.length === handSizeAtPlay && handSizeAtPlay > 0)) continue
      mult *= 2
      steps.push({
        kind: 'joker',
        jokerId,
        name: def.name,
        detail: '×2 mult for using the whole rack',
        points,
        mult,
      })
    } else if (jokerId === 'eGarden') {
      const n = [...word].filter((c) => c === 'E').length
      const add = n * 6
      if (!add) continue
      points += add
      steps.push({
        kind: 'joker',
        jokerId,
        name: def.name,
        detail: `+${add} points from ${n} E${n === 1 ? '' : 's'}`,
        points,
        mult,
      })
    } else if (jokerId === 'mirrorPond') {
      if (!isPalindrome(word)) continue
      mult += 3
      steps.push({
        kind: 'joker',
        jokerId,
        name: def.name,
        detail: '+3 mult for a palindrome',
        points,
        mult,
      })
    } else if (jokerId === 'rarePetals') {
      const n = [...word].filter((c) => RARE_LETTERS.has(c)).length
      const add = n * 15
      if (!add) continue
      points += add
      steps.push({
        kind: 'joker',
        jokerId,
        name: def.name,
        detail: `+${add} points from rare letters`,
        points,
        mult,
      })
    } else if (jokerId === 'tinyBouquet') {
      if (word.length > 3) continue
      points += 12
      mult += 1
      steps.push({
        kind: 'joker',
        jokerId,
        name: def.name,
        detail: '+12 points and +1 mult for a short word',
        points,
        mult,
      })
    } else if (jokerId === 'longStem') {
      if (word.length < 5) continue
      mult += 2
      steps.push({
        kind: 'joker',
        jokerId,
        name: def.name,
        detail: '+2 mult for 5+ letters',
        points,
        mult,
      })
    } else if (jokerId === 'softStart') {
      const extra = letterPoints(word[0] ?? '', 0, boss)
      if (!extra) continue
      points += extra
      steps.push({
        kind: 'joker',
        jokerId,
        name: def.name,
        detail: `+${extra} points, first letter again`,
        points,
        mult,
      })
    }
  }

  const total = points * mult
  steps.push({ kind: 'total', points, mult, total })
  return { word, points, mult, total, steps }
}

export function bossBannerText(boss: ActiveBoss): string {
  const def = BOSS_BY_ID[boss.id]
  if (boss.id === 'mustInclude' && boss.requiredLetter) {
    return `${def.name} — every word must include ${boss.requiredLetter}.`
  }
  return `${def.name} — ${def.description}`
}

export function jokerSellValue(jokerId: string): number {
  const cost = JOKER_BY_ID[jokerId]?.cost ?? 0
  return Math.max(1, Math.floor(cost / 2))
}
