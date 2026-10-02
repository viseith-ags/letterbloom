export const RECORDS_KEY = 'letterbloom-records'

export type StoredRecords = {
  bestStreak: number
  bestScore: number
}

export function loadRecords(): StoredRecords {
  try {
    const raw = localStorage.getItem(RECORDS_KEY)
    if (!raw) return { bestStreak: 0, bestScore: 0 }
    const parsed = JSON.parse(raw) as StoredRecords
    return {
      bestStreak: Number(parsed.bestStreak) || 0,
      bestScore: Number(parsed.bestScore) || 0,
    }
  } catch {
    return { bestStreak: 0, bestScore: 0 }
  }
}

export function saveRecords(records: StoredRecords): StoredRecords {
  const prev = loadRecords()
  const next = {
    bestStreak: Math.max(prev.bestStreak, records.bestStreak),
    bestScore: Math.max(prev.bestScore, records.bestScore),
  }
  localStorage.setItem(RECORDS_KEY, JSON.stringify(next))
  return next
}
