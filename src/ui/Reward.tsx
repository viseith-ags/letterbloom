import type { Payout } from '../game/types'

type Props = {
  payout: Payout
  round: number
  roundScore: number
  target: number
  onContinue: () => void
}

export function Reward({ payout, round, roundScore, target, onContinue }: Props) {
  return (
    <div className="overlay">
    <section className="panel reward overlay-card">
      <p className="eyebrow">Round {round} cleared</p>
      <h2>You bloomed it</h2>
      <p>
        {roundScore} points (needed {target})
      </p>
      <ul className="payout-list">
        <li>
          <span>Round payout</span>
          <strong>✦ {payout.base}</strong>
        </li>
        <li>
          <span>Unused plays</span>
          <strong>✦ {payout.unusedPlays}</strong>
        </li>
        {payout.bossBonus ? (
          <li>
            <span>Boss bonus</span>
            <strong>✦ {payout.bossBonus}</strong>
          </li>
        ) : null}
        {payout.interest ? (
          <li>
            <span>Piggy Bank</span>
            <strong>✦ {payout.interest}</strong>
          </li>
        ) : null}
      </ul>
      <p className="coins reward-total">+ ✦ {payout.total}</p>
      <button className="primary big" onClick={onContinue}>
        Continue
      </button>
    </section>
    </div>
  )
}
