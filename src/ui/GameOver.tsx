import type { Records } from '../game/types'

type Props = {
  streak: number
  runScore: number
  target: number
  records: Records
  toast: string | null
  onAgain: () => void
  onTitle: () => void
}

export function GameOver({ streak, runScore, target, records, toast, onAgain, onTitle }: Props) {
  return (
    <section className="panel game-over">
      <p className="eyebrow">Run over</p>
      <h2>The bouquet wilted</h2>
      <p>{toast ?? `Missed ${target}.`}</p>
      <dl className="stats">
        <div>
          <dt>Streak</dt>
          <dd>{streak}</dd>
        </div>
        <div>
          <dt>Run score</dt>
          <dd>{runScore}</dd>
        </div>
        <div>
          <dt>Best streak</dt>
          <dd>{records.bestStreak}</dd>
        </div>
        <div>
          <dt>Best score</dt>
          <dd>{records.bestScore}</dd>
        </div>
      </dl>
      <div className="shop-actions">
        <button className="primary" onClick={onAgain}>
          New run
        </button>
        <button className="ghost" onClick={onTitle}>
          Title
        </button>
      </div>
    </section>
  )
}
