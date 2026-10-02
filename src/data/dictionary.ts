import wordsRaw from './words.txt?raw'

export const DICTIONARY: Set<string> = new Set(
  wordsRaw
    .split(/\s+/)
    .map((w) => w.trim().toUpperCase())
    .filter((w) => w.length >= 2 && w.length <= 10),
)

export function isValidWord(word: string): boolean {
  return DICTIONARY.has(word.toUpperCase())
}
