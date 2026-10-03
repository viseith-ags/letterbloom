import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { bossBannerText, scoreWord, validatePlay } from './game/scoring'
import {
  assignWild,
  backToTitle,
  buyOffer,
  clearDiscardFx,
  clearDrawFx,
  clearSelection,
  collectReward,
  discardSelected,
  dismissBossIntro,
  leaveShop,
  playWord,
  rerollShop,
  resolveScoring,
  selectedTiles,
  sellJoker,
  startRun,
  titleState,
  toggleSelect,
  moveSelected,
} from './game/run'
import type { RunState, ScoreStep } from './game/types'
import { BossBanner } from './ui/BossBanner'
import { DiscardWell, DrawWell, FlyingTiles, type FlyOrigin } from './ui/FlyingTiles'
import { GameOver } from './ui/GameOver'
import { Rack } from './ui/Rack'
import { Reward } from './ui/Reward'
import { ScoreBanner } from './ui/ScoreBanner'
import { Shop } from './ui/Shop'
import { JokerRow, PlayRow } from './ui/Table'
import { PLAY_DESIGN_WIDTH, PLAY_FRAME } from './ui/playFrame'

export default function App() {
  const [state, setState] = useState<RunState>(() => titleState())
  const [activeJoker, setActiveJoker] = useState<string | null>(null)
  const [scoringLetter, setScoringLetter] = useState(-1)
  const [discardOrigins, setDiscardOrigins] = useState<FlyOrigin[]>([])
  const [discardDest, setDiscardDest] = useState<FlyOrigin | undefined>(undefined)
  const played = useMemo(() => {
    if (state.phase === 'scoring') return state.spotlightTiles
    return selectedTiles(state)
  }, [state])
  const overlayOpen =
    state.phase === 'bossIntro' || state.phase === 'reward' || state.phase === 'shop'
  const locked = state.phase === 'scoring' || overlayOpen
  const drawnKey = state.lastDrawnIds.join(',')
  const discardedKey = state.lastDiscarded.map((t) => t.id).join(',')

  const preview = useMemo(() => {
    if (state.phase !== 'playing' || played.length === 0) return null
    const needsBlank = played.some((t) => t.letter === '*' && !t.assigned)
    const breakdown = needsBlank
      ? null
      : scoreWord(played, state.jokers, state.boss, state.hand.length)
    if (needsBlank) {
      return { ok: false, reason: 'Choose a letter for each blank.', breakdown: null }
    }
    const check = validatePlay(played, state.boss)
    return {
      ok: check.ok,
      reason: check.ok ? null : check.reason,
      breakdown,
    }
  }, [played, state.phase, state.jokers, state.boss, state.hand.length])

  const previewJokerIds =
    preview?.breakdown
      ? preview.breakdown.steps.filter((s) => s.kind === 'joker').map((s) => s.jokerId)
      : []

  useEffect(() => {
    if (!drawnKey) return
    const n = drawnKey.split(',').filter(Boolean).length
    const timer = window.setTimeout(() => setState((s) => clearDrawFx(s)), 560 + n * 110)
    return () => window.clearTimeout(timer)
  }, [drawnKey])

  useEffect(() => {
    if (!discardedKey) return
    const n = discardedKey.split(',').filter(Boolean).length
    const timer = window.setTimeout(() => setState((s) => clearDiscardFx(s)), 680 + n * 110)
    return () => window.clearTimeout(timer)
  }, [discardedKey])

  function dropOntoPlay(id: string) {
    setState((s) => {
      if (s.selectedIds.includes(id)) return s
      return toggleSelect(s, id)
    })
  }

  function onScoreStep(step: ScoreStep | null, letterIndex: number) {
    if (!step) {
      setActiveJoker(null)
      setScoringLetter(-1)
      return
    }
    if (step.kind === 'letter') {
      setScoringLetter(letterIndex)
      setActiveJoker(null)
    } else if (step.kind === 'joker') {
      setScoringLetter(-1)
      setActiveJoker(step.jokerId)
    } else {
      setScoringLetter(-1)
      setActiveJoker(null)
    }
  }

  const tableOpen = state.phase !== 'title' && state.phase !== 'gameOver'
  const jokerHighlights =
    state.phase === 'scoring' ? (activeJoker ? [activeJoker] : []) : previewJokerIds
  const stageRef = useRef<HTMLDivElement>(null)
  const columnRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const stage = stageRef.current
    const column = columnRef.current
    const scaler = column?.parentElement
    if (!stage || !column || !scaler) return

    const fit = () => {
      const box = stage.getBoundingClientRect()
      const columnW = Math.min(box.width, box.height * (PLAY_FRAME.width / PLAY_FRAME.height))
      column.style.width = `${PLAY_DESIGN_WIDTH}px`
      column.style.transform = 'none'
      const contentH = Math.max(column.scrollHeight, column.offsetHeight, 1)
      const scale = Math.min(columnW / PLAY_DESIGN_WIDTH, box.height / contentH)
      column.style.transformOrigin = 'top left'
      column.style.transform = `scale(${scale})`
      scaler.style.width = `${PLAY_DESIGN_WIDTH * scale}px`
      scaler.style.height = `${contentH * scale}px`
      stage.style.setProperty('--play-frame-w', String(PLAY_FRAME.width))
      stage.style.setProperty('--play-frame-h', String(PLAY_FRAME.height))
      stage.style.setProperty('--play-column-w', `${columnW}px`)
    }

    fit()
    const ro = new ResizeObserver(fit)
    ro.observe(stage)
    window.addEventListener('resize', fit)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', fit)
    }
  }, [state.phase, overlayOpen])

  return (
    <div className="stage-shell">
      <div className="stage" ref={stageRef}>
        <div className="app">
          <div className="glow" />
          <FlyingTiles tiles={state.lastDiscarded} origins={discardOrigins} dest={discardDest} />
          <div className={`board ${tableOpen ? 'table' : ''}`}>
            <div className="scaler">
              <div className="play-column" ref={columnRef}>

      {state.phase === 'title' ? (
        <section className="panel title-screen">
          <p className="eyebrow">A word run in pastel</p>
          <h1>Letterbloom</h1>
          <p className="lede">
            Spell one word at a time from six tiles. Score is letter points times length, then
            jokers. Miss the target and the streak ends. Coins buy shop upgrades.
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
            <li>3 plays · 3 discards · a full rack after every play</li>
            <li>Shop after even rounds · boss every 3rd round</li>
          </ul>
        </section>
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

      {tableOpen ? (
        <div className={overlayOpen ? 'run-play dimmed' : 'run-play'}>
          <header className="hud">
            <h1>Letterbloom</h1>
            <p className="round-heading">Round {state.round}</p>
            <dl className="hud-stats">
              <div>
                <dt>Streak</dt>
                <dd>{state.streak}</dd>
              </div>
              <div>
                <dt>Round Points</dt>
                <dd>
                  {state.roundScore}
                  <small> / {state.target}</small>
                </dd>
              </div>
              <div>
                <dt>Total Run Points</dt>
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

          <p className={`boss-banner ${state.boss ? '' : 'idle'}`}>
            {state.boss ? bossBannerText(state.boss) : '\u00a0'}
          </p>

          <JokerRow jokers={state.jokers} activeIds={jokerHighlights} />

          <ScoreBanner
            key={state.lastScore ? `${state.lastScore.word}-${state.lastScore.total}` : 'idle'}
            scoring={state.phase === 'scoring' ? state.lastScore : null}
            preview={state.phase === 'playing' ? preview : null}
            toast={state.toast}
            onStep={onScoreStep}
            onComplete={() => {
              setActiveJoker(null)
              setScoringLetter(-1)
              setState((s) => resolveScoring(s))
            }}
          />

          <PlayRow
            tiles={played}
            locked={locked}
            celebrating={state.phase === 'scoring'}
            scoringLetter={scoringLetter}
            onRemove={(id) => setState(toggleSelect(state, id))}
            onAssignWild={(id, letter) => setState(assignWild(state, id, letter))}
            onReorder={(from, to) => setState(moveSelected(state, from, to))}
            onDropTile={dropOntoPlay}
          />

          <Rack
            hand={state.hand}
            selectedIds={state.phase === 'playing' ? state.selectedIds : []}
            drawnIds={state.lastDrawnIds}
            locked={locked}
            onToggle={(id) => setState(toggleSelect(state, id))}
          />

          <div className="actions">
            <button
              className="btn-discard"
              onClick={() => {
                const origins = [...document.querySelectorAll('.play-row .tile')].map((el) => {
                  const r = el.getBoundingClientRect()
                  return { left: r.left, top: r.top }
                })
                const well = document.querySelector('.discard-well')
                const wr = well?.getBoundingClientRect()
                setDiscardOrigins(origins)
                setDiscardDest(wr ? { left: wr.left + 10, top: wr.top + 8 } : undefined)
                setState((s) => discardSelected(s))
              }}
              disabled={locked || state.discardsLeft <= 0}
            >
              Discard
            </button>
            <button className="ghost" onClick={() => setState(clearSelection(state))} disabled={locked}>
              Clear
            </button>
            <button
              className="primary btn-play"
              onClick={() => setState(playWord(state))}
              disabled={locked || state.playsLeft <= 0}
            >
              Play
            </button>
          </div>

          <div className="wells-row">
            <DiscardWell />
            <DrawWell />
          </div>
        </div>
      ) : null}

      {state.phase === 'shop' ? (
        <Shop
          offers={state.shopOffers}
          coins={state.coins}
          rerollCost={state.rerollCost}
          jokers={state.jokers}
          onBuy={(id) => setState(buyOffer(state, id))}
          onSell={(index) => setState(sellJoker(state, index))}
          onReroll={() => setState(rerollShop(state))}
          onLeave={() => setState(leaveShop(state))}
        />
      ) : null}
              </div>
            </div>
          </div>

      {state.phase === 'bossIntro' && state.boss ? (
        <BossBanner boss={state.boss} onContinue={() => setState(dismissBossIntro(state))} />
      ) : null}

      {state.phase === 'reward' && state.lastPayout ? (
        <Reward
          payout={state.lastPayout}
          round={state.round}
          roundScore={state.roundScore}
          target={state.target}
          onContinue={() => setState(collectReward(state))}
        />
      ) : null}
        </div>
      </div>
    </div>
  )
}
