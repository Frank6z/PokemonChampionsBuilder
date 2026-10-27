// moves.json + learnsets.json pesan ~1.3 MB: se cargan bajo demanda en su propio chunk
// la primera vez que una vista necesita movimientos, y se reutilizan después.
let loading = null

export function loadMoveData() {
  if (!loading) {
    loading = Promise.all([import('@/data/moves.json'), import('@/data/learnsets.json')]).then(
      ([moves, learnsets]) => ({
        movesByName: new Map(moves.default.map((m) => [m.name, m])),
        learnsets: learnsets.default,
      }),
    )
  }
  return loading
}

// Learnset de una forma; las Megas sin entrada propia usan el de su forma base.
export function learnsetFor(data, species, form) {
  const entry = data.learnsets[form.learnsetName] || data.learnsets[species.name]
  if (!entry) return null
  return {
    usedName: data.learnsets[form.learnsetName] ? form.learnsetName : species.name,
    moves: entry.moves.map((m) => data.movesByName.get(m.name)).filter(Boolean),
  }
}

const SPREAD_TARGETS = new Set(['allAdjacentFoes', 'allAdjacent'])

export function isSpread(move) {
  return SPREAD_TARGETS.has(move.target)
}

export function isDamaging(move) {
  return move.category !== 'Status'
}

export const CATEGORY_META = {
  Physical: { es: 'Físico', icon: 'mdi-sword', color: '#ff7a45' },
  Special: { es: 'Especial', icon: 'mdi-creation', color: '#5c9dff' },
  Status: { es: 'Estado', icon: 'mdi-shield-half-full', color: '#b0b8c8' },
}
