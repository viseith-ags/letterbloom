import { useMemo, useState } from 'react'
import { bossBannerText } from './game/scoring'
import {
  assignWild,
  backToTitle,
  buyOffer,
  clearSelection,
  discardSelected,
  dismissBossIntro,
  leaveShop,
  playWord,
  rerollShop,
  selectedTiles,
  startRun,
  titleState,
  toggleSelect,
  moveSelected,
} from './game/run'
import type { RunState } from './game/types'
import { BossBanner } from './ui/BossBanner'
import { GameOver } from './ui/GameOver'
import { Rack } from './ui/Rack'
import { ScoreFlyup } from './ui/ScoreFlyup'
import { Shop } from './ui/Shop'
import { JokerRow, PlayRow } from './ui/Table'

export default function App() {
  const [state, setState] = useState<RunState>(() => titleState())
  const played = useMemo(() => selectedTiles(state), [state])

  function dropOntoPlay(id: string) {
    setState((s) => {
      if (s.selectedIds.includes(id)) return s
      return toggleSelect(s, id)
    })
  }

  return (
    <div className="app">
      <div className="glow" />
      {state.phase === 'title' ? (
        <section className="panel title-screen">
          <p className="eyebrow">A word run in pastel</p>
          <h1>Letterbloom</h1>
          <p className="lede">
            Spell one word at a time from six tiles. Score is Scrabble chips times length, then
            jokers. Miss the target and the streak ends.
          </p>
          <dl className="stats compact">
            <div>
              <dt>Best streak</dt>
              <dd>{state.records.bestStreak}</dd>
            </div>
            <div>
              <dt>Best score</dt>
              <dd>{state.records.bestScore}</dd>
            </div>
          </dl>
          <button className="primary big" onClick={() => setState(startRun())}>
            Start a run
          </button>
          <ul className="how">
            <li>3 plays · 3 discards · plays do not refill</li>
            <li>Shop after even rounds · boss every 3rd round</li>
          </ul>
        </section>
      ) : null}

      {state.phase === 'bossIntro' && state.boss ? (
        <BossBanner boss={state.boss} onContinue={() => setState(dismissBossIntro(state))} />
      ) : null}

      {state.phase === 'shop' ? (
        <Shop
          offers={state.shopOffers}
          coins={state.coins}
          rerollCost={state.rerollCost}
          jokerCount={state.jokers.length}
          onBuy={(id) => setState(buyOffer(state, id))}
          onReroll={() => setState(rerollShop(state))}
          onLeave={() => setState(leaveShop(state))}
        />
      ) : null}

      {state.phase === 'gameOver' ? (
        <GameOver
          streak={state.streak}
          runScore={state.runScore}
          target={state.target}
          records={state.records}
          toast={state.toast}
          onAgain={() => setState(startRun())}
          onTitle={() => setState(backToTitle())}
        />
      ) : null}

      {state.phase === 'playing' ? (
        <section className="table">
          <header className="hud">
            <div>
              <p className="eyebrow">Letterbloom</p>
              <h1>Round {state.round}</h1>
            </div>
            <dl className="hud-stats">
              <div>
                <dt>Streak</dt>
                <dd>{state.streak}</dd>
              </div>
              <div>
                <dt>Score</dt>
                <dd>
                  {state.roundScore}
                  <small> / {state.target}</small>
                </dd>
              </div>
              <div>
                <dt>Run</dt>
                <dd>{state.runScore}</dd>
              </div>
              <div>
                <dt>Coins</dt>
                <dd>✦ {state.coins}</dd>
              </div>
              <div>
                <dt>Plays</dt>
                <dd>{state.playsLeft}</dd>
              </div>
              <div>
                <dt>Discards</dt>
                <dd>{state.discardsLeft}</dd>
              </div>
            </dl>
          </header>

          {state.boss ? <p className="boss-chip">{bossBannerText(state.boss)}</p> : null}

          <JokerRow jokers={state.jokers} />
          <ScoreFlyup score={state.lastScore} />
          {state.toast ? <p className="toast">{state.toast}</p> : null}

          <PlayRow
            tiles={played}
            onRemove={(id) => setState(toggleSelect(state, id))}
            onAssignWild={(id, letter) => setState(assignWild(state, id, letter))}
            onReorder={(from, to) => setState(moveSelected(state, from, to))}
            onDropTile={dropOntoPlay}
          />

          <Rack
            hand={state.hand}
            selectedIds={state.selectedIds}
            onToggle={(id) => setState(toggleSelect(state, id))}
          />

          <div className="actions">
            <button className="ghost" onClick={() => setState(clearSelection(state))}>
              Clear
            </button>
            <button
              className="ghost"
              onClick={() => setState(discardSelected(state))}
              disabled={state.discardsLeft <= 0}
            >
              Discard
            </button>
            <button
              className="primary"
              onClick={() => setState(playWord(state))}
              disabled={state.playsLeft <= 0}
            >
              Play word
            </button>
          </div>
          <p className="fine">Unused tiles stay. Discards refill to {state.handSize}. Plays do not.</p>
        </section>
      ) : null}
    </div>
  )
}
