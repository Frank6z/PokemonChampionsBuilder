import effectivenessData from '@/data/effectiveness.json'

// Los 18 tipos jugables. Stellar existe en effectiveness.json pero no es un tipo defensivo.
// `asset` / `icon` son los nombres de archivo de src/assets/TYPES y src/assets/Icon_Types.
export const TYPES = {
  Normal: { es: 'Normal', color: '#A8A77A', asset: 'NORMAL_.png', icon: 'Normal type.ico' },
  Fire: { es: 'Fuego', color: '#EE8130', asset: 'FUEGO.png', icon: 'Fire type.ico' },
  Water: { es: 'Agua', color: '#6390F0', asset: 'AGUA.png', icon: 'Water type.ico' },
  Electric: {
    es: 'Eléctrico',
    color: '#F7D02C',
    asset: 'ELECTRICO.png',
    icon: 'Electric type.ico',
  },
  Grass: { es: 'Planta', color: '#7AC74C', asset: 'PLANTA.png', icon: 'Grass type.ico' },
  Ice: { es: 'Hielo', color: '#96D9D6', asset: 'HIELO.png', icon: 'Ice type.ico' },
  Fighting: { es: 'Lucha', color: '#C22E28', asset: 'LUCHA.png', icon: 'Fighting type.ico' },
  Poison: { es: 'Veneno', color: '#A33EA1', asset: 'VENENO.png', icon: 'Poison type.ico' },
  Ground: { es: 'Tierra', color: '#E2BF65', asset: 'TIERRA.png', icon: 'Ground type.ico' },
  Flying: { es: 'Volador', color: '#A98FF3', asset: 'VOLADOR.png', icon: 'Flying type.ico' },
  Psychic: { es: 'Psíquico', color: '#F95587', asset: 'PSIQUICO.png', icon: 'Psychic type.ico' },
  Bug: { es: 'Bicho', color: '#A6B91A', asset: 'BICHO.png', icon: 'Bug type.ico' },
  Rock: { es: 'Roca', color: '#B6A136', asset: 'ROCA.png', icon: 'Rock type.ico' },
  Ghost: { es: 'Fantasma', color: '#735797', asset: 'FANTASMA.png', icon: 'Ghost type.ico' },
  Dragon: { es: 'Dragón', color: '#6F35FC', asset: 'DRAGON_.png', icon: 'Dragon type.ico' },
  Dark: { es: 'Siniestro', color: '#705746', asset: 'SINIESTRO.png', icon: 'Dark type.ico' },
  Steel: { es: 'Acero', color: '#B7B7CE', asset: 'ACERO.png', icon: 'Steel type.ico' },
  Fairy: { es: 'Hada', color: '#D685AD', asset: 'HADA.png', icon: 'Fairy type.ico' },
}

export const TYPE_IDS = Object.keys(TYPES)

const typeByAsset = Object.fromEntries(TYPE_IDS.map((id) => [TYPES[id].asset, id]))

// species.json guarda los tipos como nombre de archivo ("DRAGON_.png") → id en inglés ("Dragon")
export function typeFromAsset(asset) {
  return asset ? typeByAsset[asset] || null : null
}

const iconUrls = import.meta.glob('../assets/Icon_Types/*.ico', { eager: true, import: 'default' })

export function typeIconUrl(type) {
  const meta = TYPES[type]
  return meta ? iconUrls[`../assets/Icon_Types/${meta.icon}`] || '' : ''
}

export function typeColor(type) {
  return TYPES[type]?.color || '#888'
}

const chart = effectivenessData.chart

// Multiplicador de un ataque de tipo `attackType` contra un Pokémon de tipos `defTypes`
export function attackMultiplier(attackType, defTypes) {
  const row = chart[attackType]
  if (!row) return 1
  return defTypes.reduce((acc, t) => acc * (row[t] ?? 1), 1)
}

// Habilidades que alteran la tabla de tipos al defender. Solo las de efecto directo y conocido.
const ABILITY_DEFENSE = {
  Levitate: { Ground: 0 },
  'Earth Eater': { Ground: 0 },
  'Flash Fire': { Fire: 0 },
  'Well-Baked Body': { Fire: 0 },
  'Water Absorb': { Water: 0 },
  'Storm Drain': { Water: 0 },
  'Dry Skin': { Water: 0, Fire: 1.25 },
  'Volt Absorb': { Electric: 0 },
  'Lightning Rod': { Electric: 0 },
  'Motor Drive': { Electric: 0 },
  'Sap Sipper': { Grass: 0 },
  'Thick Fat': { Fire: 0.5, Ice: 0.5 },
  Heatproof: { Fire: 0.5 },
  'Water Bubble': { Fire: 0.5 },
  'Purifying Salt': { Ghost: 0.5 },
  Fluffy: { Fire: 2 },
}
const FILTER_ABILITIES = new Set(['Filter', 'Solid Rock', 'Prism Armor'])

export function defensiveMultiplier(attackType, defTypes, ability) {
  let mult = attackMultiplier(attackType, defTypes)
  const mod = ability && ABILITY_DEFENSE[ability]?.[attackType]
  if (mod !== undefined && mod !== null) mult = mod === 0 ? 0 : mult * mod
  if (ability && FILTER_ABILITIES.has(ability) && mult > 1) mult *= 0.75
  return mult
}

export function abilityAffectsTyping(ability) {
  return !!ability && (ability in ABILITY_DEFENSE || FILTER_ABILITIES.has(ability))
}

// Debilidades / resistencias / inmunidades de una combinación de tipos
export function matchupsFor(defTypes, ability) {
  const out = { weak: [], resist: [], immune: [] }
  for (const atk of TYPE_IDS) {
    const m = defensiveMultiplier(atk, defTypes, ability)
    if (m === 0) out.immune.push({ type: atk, mult: m })
    else if (m > 1) out.weak.push({ type: atk, mult: m })
    else if (m < 1) out.resist.push({ type: atk, mult: m })
  }
  out.weak.sort((a, b) => b.mult - a.mult)
  out.resist.sort((a, b) => a.mult - b.mult)
  return out
}

export function formatMult(m) {
  if (m === 0) return '0×'
  if (m === 0.25) return '¼×'
  if (m === 0.5) return '½×'
  return `${Number.isInteger(m) ? m : m.toFixed(2).replace(/0$/, '')}×`
}
