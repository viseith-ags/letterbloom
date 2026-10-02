import { bossBannerText } from '../game/scoring'
import type { ActiveBoss } from '../game/types'

export function BossBanner({ boss, onContinue }: { boss: ActiveBoss; onContinue: () => void }) {
  return (
    <div className="overlay">
      <section className="panel overlay-card">
        <p className="eyebrow">Boss round</p>
        <h2>Something in the greenhouse shifted</h2>
        <p className="boss-rule">{bossBannerText(boss)}</p>
        <button className="primary" onClick={onContinue}>
          I can work with this
        </button>
      </section>
    </div>
  )
}
