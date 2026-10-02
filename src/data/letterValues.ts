export const LETTER_VALUES: Record<string, number> = {
  A: 1,
  B: 3,
  C: 3,
  D: 2,
  E: 1,
  F: 4,
  G: 2,
  H: 4,
  I: 1,
  J: 8,
  K: 5,
  L: 1,
  M: 3,
  N: 1,
  O: 1,
  P: 3,
  Q: 10,
  R: 1,
  S: 1,
  T: 1,
  U: 1,
  V: 4,
  W: 4,
  X: 8,
  Y: 4,
  Z: 10,
}

export const VOWELS = new Set(['A', 'E', 'I', 'O', 'U'])

export const RARE_LETTERS = new Set(['J', 'Q', 'X', 'Z'])

export const STARTING_BAG: string[] = [
  ...'EEEE'.split(''),
  ...'AAA'.split(''),
  ...'II'.split(''),
  ...'OO'.split(''),
  'U',
  ...'RR'.split(''),
  ...'NN'.split(''),
  ...'TT'.split(''),
  ...'SS'.split(''),
  'L',
  'D',
  'C',
  'H',
  'M',
  'P',
  'Y',
  'G',
]

export function letterCost(letter: string): number {
  if (letter === '*') return 8
  if (RARE_LETTERS.has(letter)) return 7
  if ('EARIOTNS'.includes(letter)) return 3
  if ('LUDCPMHGY'.includes(letter)) return 4
  return 5
}

export function letterValue(letter: string): number {
  if (letter === '*') return 0
  return LETTER_VALUES[letter] ?? 0
}
