import speciesData from '@/data/champions/species.json'
import { typeFromAsset } from '@/utils/types.js'

// Un único glob a nivel de módulo: antes cada página lo repetía dentro de cada llamada.
const spriteUrls = import.meta.glob('../assets/*.png', { eager: true, import: 'default' })

export function spriteUrl(fileName) {
  return fileName ? spriteUrls[`../assets/${fileName}`] || '' : ''
}

const STAT_KEYS = ['hp', 'atk', 'def', 'spa', 'spd', 'spe']

function normalizeForm(form, species) {
  const types = [typeFromAsset(form.type1), typeFromAsset(form.type2)].filter(Boolean)
  const abilities = Object.entries(form.abilities || {})
    .filter(([, name]) => name)
    .map(([slot, name]) => ({ slot, name, hidden: slot === 'H' }))
  const bst = STAT_KEYS.reduce((acc, k) => acc + (form.stats?.[k] || 0), 0)
  // Nombre usado en learnsets.json: "Garchomp", "Mega Garchomp", "Mega Charizard X"
  const learnsetName =
    form.name === 'Base' ? species.name : `${form.name.replace(/^Mega/, 'Mega ' + species.name)}`
  return {
    name: form.name,
    isMega: form.name.startsWith('Mega'),
    sprite: spriteUrl(form.img),
    types,
    abilities,
    stats: form.stats,
    bst,
    learnsetName,
    status: form.status,
    sources: form.sources,
    notes: form.notes,
  }
}

export const speciesList = Object.entries(speciesData.species).map(([key, s]) => ({
  key,
  name: s.name,
  dexNumber: s.dexNumber,
  category: s.category,
  pokedexEntry: s.pokedexEntry,
  forms: s.forms.map((f) => normalizeForm(f, s)),
}))

export const speciesByKey = Object.fromEntries(speciesList.map((s) => [s.key, s]))

export function getSpecies(key) {
  return speciesByKey[key] || null
}

export function getForm(key, formIndex = 0) {
  const s = speciesByKey[key]
  return s ? s.forms[formIndex] || s.forms[0] : null
}

export { STAT_KEYS }

export const STAT_LABELS = {
  hp: 'PS',
  atk: 'Ataque',
  def: 'Defensa',
  spa: 'At. Esp.',
  spd: 'Def. Esp.',
  spe: 'Velocidad',
}
