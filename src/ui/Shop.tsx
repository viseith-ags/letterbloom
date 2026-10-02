import { JOKER_BY_ID } from '../data/jokers'
import { letterCost } from '../data/letterValues'
import type { ShopOffer } from '../game/types'
import { JokerRow } from './Table'
import { TileView } from './TileView'

type Props = {
  offers: ShopOffer[]
  coins: number
  rerollCost: number
  jokers: string[]
  onBuy: (id: string) => void
  onSell: (index: number) => void
  onReroll: () => void
  onLeave: () => void
}

export function Shop({
  offers,
  coins,
  rerollCost,
  jokers,
  onBuy,
  onSell,
  onReroll,
  onLeave,
}: Props) {
  return (
    <div className="overlay">
    <section className="panel shop overlay-card">
      <header className="panel-head">
        <div>
          <p className="eyebrow">Between rounds</p>
          <h2>Flower shop</h2>
        </div>
        <p className="coins">✦ {coins}</p>
      </header>

      <div className="owned-jokers">
        <p className="eyebrow">Your jokers</p>
        <JokerRow jokers={jokers} onSell={onSell} />
        <p className="fine">Sell a joker for half of what you paid.</p>
      </div>

      <div className="shop-grid">
        {offers.map((offer) => {
          if (offer.kind === 'letter') {
            const tile = { id: offer.id, letter: offer.letter }
            const tooPoor = coins < offer.cost
            return (
              <button
                key={offer.id}
                className="shop-card"
                disabled={tooPoor}
                onClick={() => onBuy(offer.id)}
              >
                <TileView tile={tile} locked />
                <strong>{offer.letter === '*' ? 'Blank petal' : `Letter ${offer.letter}`}</strong>
                <span>Add to bag · {letterCost(offer.letter)}✦</span>
              </button>
            )
          }
          const def = JOKER_BY_ID[offer.jokerId]
          const full = jokers.length >= 5
          const tooPoor = coins < offer.cost
          return (
            <button
              key={offer.id}
              className={`shop-card rarity-${def?.rarity ?? 'common'}`}
              disabled={tooPoor || full}
              onClick={() => onBuy(offer.id)}
            >
              <h3>{def?.name}</h3>
              <p>{def?.description}</p>
              <em>{def?.flavor}</em>
              <span>
                {offer.cost}✦{full ? ' · slots full' : ''}
              </span>
            </button>
          )
        })}
      </div>
      <div className="shop-actions">
        <button className="ghost" onClick={onReroll} disabled={coins < rerollCost}>
          Reroll {rerollCost}✦
        </button>
        <button className="primary" onClick={onLeave}>
          Next round
        </button>
      </div>
    </section>
    </div>
  )
}
