// Estadísticas de uso de championsbattledata.com (fuente secundaria: ver sources.json →
// "championsbattledata-api"). CORS abierto y sin clave. Se cachea en memoria y en
// sessionStorage para no repetir peticiones al navegar entre vistas.
const BASE_URL = 'https://championsbattledata.com'
const SESSION_PREFIX = 'cbd:'
const memory = new Map()

function readSession(key) {
  try {
    const raw = sessionStorage.getItem(SESSION_PREFIX + key)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function writeSession(key, value) {
  try {
    sessionStorage.setItem(SESSION_PREFIX + key, JSON.stringify(value))
  } catch {
    // almacenamiento lleno o bloqueado: la caché en memoria basta
  }
}

function pick(rows, category) {
  return rows
    .filter((r) => r.category === category)
    .sort((a, b) => a.rank - b.rank)
    .map((r) => ({ name: r.name, pct: r.percentage_value }))
}

function parse(json) {
  const rows = json.rows || []
  return {
    pokemon: json.pokemon,
    format: json.format,
    season: json.season,
    moves: pick(rows, 'move'),
    items: pick(rows, 'held_item'),
    abilities: pick(rows, 'ability'),
    teammates: pick(rows, 'teammate'),
    natures: rows
      .filter((r) => r.category === 'stat_alignment')
      .sort((a, b) => a.rank - b.rank)
      .map((r) => ({ name: r.name, pct: r.percentage_value, up: r.stat_up, down: r.stat_down })),
    spreads: rows
      .filter((r) => r.category === 'stat_points')
      .sort((a, b) => a.rank - b.rank)
      .map((r) => ({
        pct: r.percentage_value,
        points: {
          hp: r.hp_points || 0,
          atk: r.attack_points || 0,
          def: r.defense_points || 0,
          spa: r.sp_atk_points || 0,
          spd: r.sp_def_points || 0,
          spe: r.speed_points || 0,
        },
      })),
  }
}

// format: 'Doubles' | 'Singles'; showdownId: la clave de species.json ("garchomp")
export async function fetchUsage(showdownId, format = 'Doubles') {
  const key = `${format}/${showdownId}`
  if (memory.has(key)) return memory.get(key)

  const cached = readSession(key)
  if (cached) {
    const p = Promise.resolve(cached)
    memory.set(key, p)
    return p
  }

  const request = fetch(`${BASE_URL}/api/battle/${format}/${encodeURIComponent(showdownId)}`)
    .then((res) => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      return res.json()
    })
    .then((json) => {
      const parsed = parse(json)
      writeSession(key, parsed)
      return parsed
    })
    .catch((err) => {
      memory.delete(key) // permitir reintentar
      throw err
    })

  memory.set(key, request)
  return request
}

// Umbral a partir del cual un movimiento se marca como "meta" en el arsenal
export const META_THRESHOLD = 15
