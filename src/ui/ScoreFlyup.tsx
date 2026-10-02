import type { ScoreBreakdown } from '../game/types'

export function ScoreFlyup({ score }: { score: ScoreBreakdown | null }) {
  if (!score) return null
  return (
    <div className="score-flyup" key={`${score.word}-${score.total}`}>
      <strong>{score.word}</strong>
      <span>
        {score.chips} × {score.mult} = {score.total}
      </span>
      <small>{score.notes.join(' · ')}</small>
    </div>
  )
}
