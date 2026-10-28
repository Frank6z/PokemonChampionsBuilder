// Pokédex de la app = roster generado (scripts/sync-battle-data.mjs, 263 entradas)
// + capa curada de species.json (sprites locales, textos en español, procedencia).
import generated from '@/data/champions/generated/pokedex.json'
import speciesData from '@/data/champions/species.json'

// Un único glob a nivel de módulo para los sprites locales
const spriteUrls = import.meta.glob('../assets/*.png', { eager: true, import: 'default' })

export function spriteUrl(fileName) {
  return fileName ? spriteUrls[`../assets/${fileName}`] || '' : ''
}

// Repositorio de sprites de PokéAPI (GitHub). El sync guarda solo el id de cada forma.
const SPRITES_BASE =
  'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other'
const artworkUrl = (id) => (id ? `${SPRITES_BASE}/official-artwork/${id}.png` : '')
// GIF animado estilo Showdown; null cuando la forma no lo tiene (Megas nuevas de Champions)
const animatedUrl = (id) => `${SPRITES_BASE}/showdown/${id}.gif`

export const STAT_KEYS = ['hp', 'atk', 'def', 'spa', 'spd', 'spe']

export const STAT_LABELS = {
  hp: 'PS',
  atk: 'Ataque',
  def: 'Defensa',
  spa: 'At. Esp.',
  spd: 'Def. Esp.',
  spe: 'Velocidad',
}

// Nombre corto de pestaña: "Base", "Mega", "Mega Z", "Alolan", "Wash"…
function formLabel(kind, index) {
  return index === 0 && !kind.startsWith('Mega') ? 'Base' : kind
}

function buildSpecies(key, remote) {
  const curated = speciesData.species[key]
  const forms = remote.forms.map((f, i) => {
    // en species.json la primera forma se llama "Base" y las demás como el form_kind de CBD
    const local = curated?.forms.find((lf) => (lf.name === 'Base' ? i === 0 : lf.name === f.kind))
    return {
      name: formLabel(f.kind, i),
      fullName: f.name,
      isMega: f.kind.startsWith('Mega'),
      sprite: (local && spriteUrl(local.img)) || artworkUrl(f.art),
      animated: f.anim ? animatedUrl(f.art) : null,
      types: f.types,
      abilities: f.abilities.map((a) => ({ name: a.name, hidden: !!a.hidden })),
      stats: f.stats,
      bst: STAT_KEYS.reduce((acc, k) => acc + f.stats[k], 0),
      status: local?.status || 'unknown',
      notes: local?.notes || null,
    }
  })
  return {
    key,
    name: curated?.name || remote.name,
    dexNumber: remote.dex ?? curated?.dexNumber ?? null,
    category: curated?.category || null,
    pokedexEntry: curated?.pokedexEntry || null,
    curated: !!curated,
    forms,
  }
}

export const speciesList = Object.entries(generated.species).map(([key, s]) => buildSpecies(key, s))

export const speciesByKey = Object.fromEntries(speciesList.map((s) => [s.key, s]))

export const dataMeta = generated.meta

export function getSpecies(key) {
  return speciesByKey[key] || null
}

export function getForm(key, formIndex = 0) {
  const s = speciesByKey[key]
  return s ? s.forms[formIndex] || s.forms[0] : null
}

// Índice de forma que corresponde a una Mega Piedra ("Charizardite Y" → "Mega Y")
export function formIndexForItem(species, item) {
  const m = item && /ite(?: ([XYZ]))?$/.exec(item)
  if (!m || !species.forms.some((f) => f.isMega)) return 0
  const target = m[1] ? `Mega ${m[1]}` : 'Mega'
  const i = species.forms.findIndex((f) => f.name === target)
  return i === -1 ? 0 : i
}
