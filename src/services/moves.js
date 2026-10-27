// Movimientos y learnsets (~380 KB) se cargan bajo demanda en su propio chunk la primera vez
// que una vista los necesita, y se reutilizan después. Generados por scripts/sync-battle-data.mjs.
let loading = null

export function loadMoveData() {
  if (!loading) {
    loading = Promise.all([
      import('@/data/champions/generated/moves.json'),
      import('@/data/champions/generated/learnsets.json'),
    ]).then(([moves, learnsets]) => ({
      movesByName: new Map(moves.default.moves.map((m) => [m.name, m])),
      learnsets: learnsets.default.learnsets,
    }))
  }
  return loading
}

// Learnset de una entrada (las Megas comparten el de su especie)
export function learnsetFor(data, species) {
  const names = data.learnsets[species.key]
  if (!names) return null
  return names.map((n) => data.movesByName.get(n)).filter(Boolean)
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
