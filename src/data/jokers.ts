export type JokerDef = {
  id: string
  name: string
  description: string
  flavor: string
  rarity: 'common' | 'uncommon' | 'rare'
  cost: number
}

export const JOKERS: JokerDef[] = [
  {
    id: 'petalVowels',
    name: 'Petal Vowels',
    description: '+4 points per vowel in the word.',
    flavor: 'Aeiou, but make it floral.',
    rarity: 'common',
    cost: 4,
  },
  {
    id: 'honeycomb',
    name: 'Honeycomb',
    description: '+8 points if the word has a doubled letter.',
    flavor: 'Sticky, sweet, twice as nice.',
    rarity: 'uncommon',
    cost: 6,
  },
  {
    id: 'fullBloom',
    name: 'Full Bloom',
    description: '×2 mult if you use your entire hand.',
    flavor: 'Go on. Use every petal.',
    rarity: 'uncommon',
    cost: 7,
  },
  {
    id: 'eGarden',
    name: 'E-Garden',
    description: '+6 points per E.',
    flavor: 'She has a favorite letter. It is E.',
    rarity: 'common',
    cost: 5,
  },
  {
    id: 'mirrorPond',
    name: 'Mirror Pond',
    description: '+3 mult if the word is a palindrome.',
    flavor: 'Reads the same in the water.',
    rarity: 'uncommon',
    cost: 6,
  },
  {
    id: 'wideRack',
    name: 'Wide Rack',
    description: '+1 hand size.',
    flavor: 'A little extra room on the windowsill.',
    rarity: 'rare',
    cost: 8,
  },
  {
    id: 'piggyBank',
    name: 'Piggy Bank',
    description: 'End of round: +1 coin per 5 coins you hold.',
    flavor: 'Interest, but cute.',
    rarity: 'common',
    cost: 4,
  },
  {
    id: 'rarePetals',
    name: 'Rare Petals',
    description: '+15 points per J, Q, X, or Z.',
    flavor: 'The dramatic ones.',
    rarity: 'uncommon',
    cost: 6,
  },
  {
    id: 'tinyBouquet',
    name: 'Tiny Bouquet',
    description: 'If the word is 3 letters or fewer: +12 points and +1 mult.',
    flavor: 'Small stems still count.',
    rarity: 'common',
    cost: 5,
  },
  {
    id: 'longStem',
    name: 'Long Stem',
    description: '+2 mult if the word is 5+ letters.',
    flavor: 'Reach for the tall vase.',
    rarity: 'uncommon',
    cost: 6,
  },
  {
    id: 'softStart',
    name: 'Soft Start',
    description: 'The first letter scores its points twice.',
    flavor: 'Lead with something tender.',
    rarity: 'common',
    cost: 4,
  },
  {
    id: 'encore',
    name: 'Encore',
    description: '+1 play each round.',
    flavor: 'One more, for the room.',
    rarity: 'rare',
    cost: 9,
  },
]

export const JOKER_BY_ID: Record<string, JokerDef> = Object.fromEntries(
  JOKERS.map((j) => [j.id, j]),
)
