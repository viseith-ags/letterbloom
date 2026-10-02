import { useEffect, useRef, useState } from 'react'
import type { ScoreBreakdown, ScoreStep } from '../game/types'

type Preview = {
  ok: boolean
  reason: string | null
  breakdown: ScoreBreakdown | null
} | null

type Props = {
  scoring: ScoreBreakdown | null
  preview: Preview
  toast: string | null
  onStep: (step: ScoreStep | null, letterIndex: number) => void
  onComplete: () => void
}

export function ScoreBanner({ scoring, preview, toast, onStep, onComplete }: Props) {
  const [index, setIndex] = useState(0)
  const onStepRef = useRef(onStep)
  const onCompleteRef = useRef(onComplete)
  onStepRef.current = onStep
  onCompleteRef.current = onComplete

  useEffect(() => {
    setIndex(0)
  }, [scoring])

  useEffect(() => {
    if (!scoring) return
    if (index >= scoring.steps.length) {
      const pause = window.setTimeout(() => onCompleteRef.current(), 750)
      return () => window.clearTimeout(pause)
    }
    const current = scoring.steps[index]!
    const letterIndex =
      current.kind === 'letter'
        ? scoring.steps.slice(0, index + 1).filter((s) => s.kind === 'letter').length - 1
        : -1
    onStepRef.current(current, letterIndex)
    const wait = current.kind === 'letter' ? 240 : current.kind === 'joker' ? 520 : 900
    const timer = window.setTimeout(() => setIndex((n) => n + 1), wait)
    return () => window.clearTimeout(timer)
  }, [index, scoring])

  const step = scoring ? scoring.steps[Math.min(index, scoring.steps.length - 1)] : null
  const live = preview?.breakdown
  const points = step?.points ?? live?.points ?? 0
  const mult = step?.mult ?? live?.mult ?? 0
  const total = step?.kind === 'total' ? step.total : (live?.total ?? points * mult)

  let eyebrow = 'Word score'
  let detail = 'Click tiles to spell a word.'
  let tone = 'idle'

  if (scoring && step) {
    eyebrow = `Scoring ${scoring.word}`
    tone = 'scoring'
    detail =
      step.kind === 'letter'
        ? `${step.letter} adds ${step.add} point${step.add === 1 ? '' : 's'}`
        : step.kind === 'joker'
          ? `${step.name} — ${step.detail}`
          : `${step.points} × ${step.mult} = ${step.total} points`
  } else if (live) {
    eyebrow = preview?.ok ? live.word : 'Building a word'
    tone = preview?.ok ? 'ready' : 'idle'
    detail = preview?.ok
      ? `${live.word} would score ${live.points} × ${live.mult} = ${live.total} points`
      : (preview?.reason ?? 'Keep spelling.')
  } else if (toast) {
    detail = toast
  }

  return (
    <div className={`score-banner ${tone}`}>
      <p className="eyebrow">{eyebrow}</p>
      <div className="tally-row">
        <div>
          <span className="tally-label">Points</span>
          <strong>{points}</strong>
        </div>
        <span className="tally-times">×</span>
        <div>
          <span className="tally-label">Mult</span>
          <strong>{mult}</strong>
        </div>
        <span className="tally-times">=</span>
        <div className="tally-total">
          <span className="tally-label">Total</span>
          <strong>{total}</strong>
        </div>
      </div>
      <p className="tally-detail">{detail}</p>
    </div>
  )
}
