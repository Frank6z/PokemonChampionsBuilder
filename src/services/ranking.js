// Ranking de uso por formato (top 50), generado por scripts/sync-battle-data.mjs (~17 KB, carga inmediata).
import rankingData from '@/data/champions/generated/ranking.json'
import { getSpecies, formIndexForItem } from '@/services/pokedex.js'

export const rankingMeta = rankingData.meta

const byFormat = Object.fromEntries(
  Object.entries(rankingData.ranking).map(([format, rows]) => [
    format,
    {
      rows: rows.filter((r) => r.id && getSpecies(r.id)),
      rankById: new Map(rows.map((r) => [r.id, r])),
    },
  ]),
)

export function rankOf(key, format) {
  return byFormat[format]?.rankById.get(key) || null
}

// Las N amenazas más usadas, con la forma que indica su objeto más común (Mega Piedra)
export function topThreats(format, n = 12) {
  return (byFormat[format]?.rows || []).slice(0, n).map((r) => {
    const species = getSpecies(r.id)
    const formIndex = formIndexForItem(species, r.topItem)
    return { ...r, species, formIndex, form: species.forms[formIndex] }
  })
}
