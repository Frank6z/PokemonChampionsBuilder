// Roles rápidos inferidos (heurística propia, no dato oficial): stats base + habilidad + movimientos elegidos.
const WEATHER_ABILITIES = new Set([
  'Drought',
  'Drizzle',
  'Sand Stream',
  'Snow Warning',
  'Orichalcum Pulse',
  'Electric Surge',
  'Psychic Surge',
  'Grassy Surge',
  'Misty Surge',
  'Hadron Engine',
  'Sand Spit',
])
const WEATHER_MOVES = new Set([
  'Sunny Day',
  'Rain Dance',
  'Sandstorm',
  'Snowscape',
  'Hail',
  'Electric Terrain',
  'Psychic Terrain',
  'Grassy Terrain',
  'Misty Terrain',
])
const HAZARD_MOVES = new Set(['Stealth Rock', 'Spikes', 'Toxic Spikes', 'Sticky Web'])
const SPEED_CONTROL = new Set([
  'Tailwind',
  'Trick Room',
  'Icy Wind',
  'Electroweb',
  'Thunder Wave',
  'Scary Face',
  'Bulldoze',
])
const SUPPORT_MOVES = new Set([
  'Fake Out',
  'Follow Me',
  'Rage Powder',
  'Helping Hand',
  'Wide Guard',
  'Quick Guard',
  'Parting Shot',
  'Will-O-Wisp',
  'Spore',
  'Encore',
  'Taunt',
  'Light Screen',
  'Reflect',
  'Snarl',
  'Yawn',
  'Haze',
  'Pollen Puff',
  'Life Dew',
  'Coaching',
  'Feint',
  'Ally Switch',
  'Heal Pulse',
])
const SUPPORT_ABILITIES = new Set(['Prankster', 'Intimidate', 'Friend Guard'])

export const ROLE_META = {
  physical: { label: 'Atacante físico', icon: 'mdi-sword', color: '#ff7a45' },
  special: { label: 'Atacante especial', icon: 'mdi-creation', color: '#5c9dff' },
  tank: { label: 'Tanque', icon: 'mdi-shield', color: '#43d39e' },
  fast: { label: 'Rápido', icon: 'mdi-lightning-bolt', color: '#f7d02c' },
  support: { label: 'Support', icon: 'mdi-hand-heart', color: '#d685ad' },
  speed: { label: 'Control de velocidad', icon: 'mdi-wind-turbine', color: '#96d9d6' },
  weather: { label: 'Clima / campo', icon: 'mdi-weather-partly-cloudy', color: '#e2bf65' },
  hazard: { label: 'Hazards', icon: 'mdi-spike', color: '#b6a136' },
}

// moves: objetos de moves.json ya resueltos (pueden faltar)
export function inferRoles(form, ability, moves = []) {
  const s = form.stats
  const roles = new Set()
  const names = new Set(moves.map((m) => m.name))
  const phys = moves.filter((m) => m.category === 'Physical').length
  const spec = moves.filter((m) => m.category === 'Special').length

  if (moves.length) {
    if (phys > spec && s.atk >= 80) roles.add('physical')
    if (spec > phys && s.spa >= 80) roles.add('special')
    if (phys === spec && phys > 0) roles.add(s.atk >= s.spa ? 'physical' : 'special')
  } else {
    if (s.atk >= 100 && s.atk >= s.spa + 10) roles.add('physical')
    if (s.spa >= 100 && s.spa >= s.atk + 10) roles.add('special')
  }
  if (s.hp + s.def + s.spd >= 300) roles.add('tank')
  if (s.spe >= 100) roles.add('fast')
  if (SUPPORT_ABILITIES.has(ability) || [...names].some((n) => SUPPORT_MOVES.has(n)))
    roles.add('support')
  if ([...names].some((n) => SPEED_CONTROL.has(n))) roles.add('speed')
  if (WEATHER_ABILITIES.has(ability) || [...names].some((n) => WEATHER_MOVES.has(n)))
    roles.add('weather')
  if ([...names].some((n) => HAZARD_MOVES.has(n))) roles.add('hazard')
  return [...roles]
}
