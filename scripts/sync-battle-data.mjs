// Genera los JSON modulares de la app a partir de Pokemon Champions Battle Data (CBD) + PokéAPI.
// Escribe en src/data/champions/generated/ y deja un informe de auditoría en reports/.
// Uso: node scripts/sync-battle-data.mjs [--refresh]   (--refresh ignora las cachés)
//
// Fuentes (ver src/data/champions/sources.json):
//   - championsbattledata-api: roster, formas, tipos, habilidades, stats a nivel 50, learnsets y rankings de uso.
//     Licencia: uso personal/educativo/análisis competitivo, citando y enlazando https://championsbattledata.com/.
//     No concede derechos sobre imágenes → los sprites NO se toman de CBD.
//   - pokeapi (complementaria): nº de Pokédex, habilidad oculta y URL del artwork oficial.

import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const DATA = join(ROOT, 'src', 'data')
const OUT = join(DATA, 'champions', 'generated')
const REPORTS = join(ROOT, 'reports')
const CBD_CACHE = join(REPORTS, '.cache', 'cbd')
const POKEAPI_CACHE = join(REPORTS, '.cache', 'pokeapi')
const CBD = 'https://championsbattledata.com'
const POKEAPI = 'https://pokeapi.co/api/v2'
const REFRESH = process.argv.includes('--refresh')
const today = new Date().toISOString().slice(0, 10)

const readJson = async (file) => JSON.parse(await readFile(file, 'utf8'))

const slug = (name) =>
  name
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/['’.:]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

async function cached(dir, key, url, parse = (r) => r.json()) {
  const file = join(dir, key.replace(/[^a-z0-9-]+/gi, '_') + (parse === text ? '.html' : '.json'))
  if (!REFRESH && existsSync(file)) {
    const raw = await readFile(file, 'utf8')
    return parse === text ? raw : JSON.parse(raw)
  }
  const res = await fetch(url, { headers: { 'User-Agent': 'PokeChampBuilder sync script' } })
  if (res.status === 404) return null
  if (!res.ok) throw new Error(`${url}: HTTP ${res.status}`)
  const body = await parse(res)
  await writeFile(file, parse === text ? body : JSON.stringify(body))
  return body
}
const text = (r) => r.text()
const pokeapi = (path) => cached(POKEAPI_CACHE, path, `${POKEAPI}/${path}`)

async function pool(items, size, fn) {
  const out = new Array(items.length)
  let next = 0
  const worker = async () => {
    while (next < items.length) {
      const i = next++
      out[i] = await fn(items[i], i)
    }
  }
  await Promise.all(Array.from({ length: size }, worker))
  return out
}

// CBD da stats a nivel 50 con 31 IV, 0 puntos y naturaleza neutra:
// PS = base + 75, resto = base + 20 (exacto para bases enteras)
function toBaseStats(f) {
  return {
    hp: f.hp - 75,
    atk: f.attack - 20,
    def: f.defense - 20,
    spa: f.sp_attack - 20,
    spd: f.sp_defense - 20,
    spe: f.speed - 20,
  }
}

// Formas de combate que pertenecen a la misma entrada aunque no sean la principal
const IN_BATTLE_KINDS = /^(Blade Forme|Rainy Form|Snowy Form|Sunny Form)$/

// Tokens de PokéAPI que identifican una forma a partir del form_kind de CBD
const KIND_TOKENS = {
  alolan: 'alola',
  galarian: 'galar',
  hisuian: 'hisui',
  paldean: 'paldea',
  female: 'female',
  male: 'male',
  jumbo: 'super',
  large: 'large',
  small: 'small',
  midnight: 'midnight',
  dusk: 'dusk',
  blade: 'blade',
  shield: 'shield',
  rainy: 'rainy',
  snowy: 'snowy',
  sunny: 'sunny',
}

function kindTokens(kind) {
  if (!kind || kind === 'Base') return []
  return kind
    .toLowerCase()
    .split(/\s+/)
    .map((w) => KIND_TOKENS[w] || w)
    .filter((w) => !['form', 'forme', 'variety', 'breed'].includes(w))
}

// Elige la variedad de PokéAPI de una forma de CBD
function pickVariety(form, species, pokemonByName) {
  const defaultName = species.varieties.find((v) => v.is_default).pokemon.name
  const tokens = kindTokens(form.form_kind)
  if (!tokens.length) return defaultName
  let best = null
  let bestScore = 0
  for (const v of species.varieties) {
    const parts = v.pokemon.name.split('-')
    let score = tokens.filter((t) => parts.includes(t)).length
    // "Mega" a secas no debe casar con "-mega-x"
    if (tokens.length === 1 && tokens[0] === 'mega' && /-mega-[xyz]$/.test(v.pokemon.name))
      score -= 0.5
    const p = pokemonByName[v.pokemon.name]
    if (p && p.types.map((t) => t.type.name).join('/') === form.types.map(slug).join('/'))
      score += 0.25
    if (score > bestScore) {
      best = v.pokemon.name
      bestScore = score
    }
  }
  return bestScore >= 1 ? best : null
}

function parseRanking(html) {
  const rows = []
  const re = /<tr[^>]*>([\s\S]*?)<\/tr>/g
  let m
  while ((m = re.exec(html))) {
    const cells = [...m[1].matchAll(/<td[^>]*>([\s\S]*?)<\/td>/g)].map((c) =>
      c[1]
        .replace(/<[^>]*>/g, ' ')
        .replace(/&#39;|&apos;/g, "'")
        .replace(/&amp;/g, '&')
        .replace(/\s+/g, ' ')
        .trim(),
    )
    if (cells.length >= 5 && /^\d+$/.test(cells[0])) {
      rows.push({
        rank: Number(cells[0]),
        name: cells[1],
        topMove: cells[2],
        topItem: cells[3],
        topAbility: cells[4],
      })
    }
  }
  return rows
}

async function main() {
  await mkdir(OUT, { recursive: true })
  await mkdir(CBD_CACHE, { recursive: true })
  await mkdir(POKEAPI_CACHE, { recursive: true })

  const [index, moves, localSpecies] = await Promise.all([
    cached(CBD_CACHE, 'index', `${CBD}/api`),
    readJson(join(DATA, 'moves.json')),
    readJson(join(DATA, 'champions', 'species.json')),
  ])
  const moveNames = new Set(moves.map((m) => m.name))

  // PokéAPI: especies y variedades necesarias
  const baseNames = [
    ...new Set(index.pokemon.flatMap((p) => p.summary.forms.map((f) => f.pokemon_name))),
  ]
  const speciesBySlug = {}
  await pool(baseNames, 6, async (n) => {
    speciesBySlug[slug(n)] = await pokeapi(`pokemon-species/${slug(n)}`)
  })
  const varietyNames = [
    ...new Set(
      Object.values(speciesBySlug).flatMap((s) =>
        s ? s.varieties.map((v) => v.pokemon.name) : [],
      ),
    ),
  ]
  const pokemonByName = {}
  await pool(varietyNames, 6, async (n) => (pokemonByName[n] = await pokeapi(`pokemon/${n}`)))

  const audit = { noVariety: [], noSprite: [], unknownMoves: new Set(), local: [] }

  const pokedex = {}
  const learnsets = {}
  for (const entry of index.pokemon) {
    const { primary, forms } = entry.summary
    const species = speciesBySlug[slug(primary.pokemon_name)]
    const own = forms.filter(
      (f, i, arr) =>
        arr.findIndex((x) => x.saved_name === f.saved_name) === i &&
        (f.saved_name === primary.saved_name ||
          (primary.form_kind === 'Base' &&
            (f.form_kind.startsWith('Mega') || IN_BATTLE_KINDS.test(f.form_kind)))),
    )
    // forma principal primero
    own.sort((a, b) =>
      a.saved_name === primary.saved_name ? -1 : b.saved_name === primary.saved_name ? 1 : 0,
    )

    pokedex[entry.showdownId] = {
      name: entry.name,
      baseName: primary.pokemon_name,
      dex: species?.id ?? null,
      forms: own.map((f) => {
        const variety = species ? pickVariety(f, species, pokemonByName) : null
        if (!variety) audit.noVariety.push(f.saved_name)
        // variantes cosméticas (Vivillon, Furfrou, Florges): misma ficha que la variedad por defecto
        const p =
          pokemonByName[variety || species?.varieties.find((v) => v.is_default).pokemon.name]
        const hidden = new Set(
          (p?.abilities || []).filter((a) => a.is_hidden).map((a) => a.ability.name),
        )
        const sprite = p?.sprites?.other?.['official-artwork']?.front_default || null
        if (!sprite) audit.noSprite.push(f.saved_name)
        return {
          name: f.saved_name,
          kind: f.form_kind,
          types: f.types,
          abilities: f.abilities
            .split('|')
            .filter(Boolean)
            .map((a) => (hidden.has(slug(a)) ? { name: a, hidden: true } : { name: a })),
          stats: toBaseStats(f),
          sprite,
        }
      }),
    }

    const learn = (entry.learnableMoveNames || []).filter((n) => {
      if (!moveNames.has(n)) audit.unknownMoves.add(n)
      return moveNames.has(n)
    })
    learnsets[entry.showdownId] = learn
  }

  // Rankings de uso (páginas públicas de CBD)
  const nameToId = Object.fromEntries(index.pokemon.map((p) => [p.name, p.showdownId]))
  const ranking = {}
  for (const format of ['Doubles', 'Singles']) {
    const html = await cached(
      CBD_CACHE,
      `ranking-${format}`,
      `${CBD}/pokemon-champions-${format.toLowerCase()}-usage/`,
      text,
    )
    ranking[format] = parseRanking(html).map((r) => ({ ...r, id: nameToId[r.name] || null }))
  }

  // Auditoría de species.json (datos locales de la app) frente a CBD
  for (const [key, s] of Object.entries(localSpecies.species)) {
    const remote = pokedex[key]
    if (!remote) {
      audit.local.push(`${key}: no existe en CBD`)
      continue
    }
    s.forms.forEach((lf) => {
      const target =
        lf.name === 'Base' ? remote.forms[0] : remote.forms.find((f) => f.kind === lf.name)
      if (!target) return audit.local.push(`${s.name} ${lf.name}: forma no encontrada en CBD`)
      const diffs = Object.keys(target.stats).filter((k) => lf.stats[k] !== target.stats[k])
      if (diffs.length) {
        audit.local.push(
          `${s.name} ${lf.name}: stats distintas (${diffs.map((k) => `${k} ${lf.stats[k]}→${target.stats[k]}`).join(', ')})`,
        )
      }
      const localAb = Object.values(lf.abilities).filter(Boolean).sort().join('|')
      const remoteAb = target.abilities
        .map((a) => a.name)
        .sort()
        .join('|')
      if (localAb !== remoteAb)
        audit.local.push(`${s.name} ${lf.name}: habilidades ${localAb} → ${remoteAb}`)
    })
  }

  const meta = {
    generatedAt: today,
    source: 'championsbattledata-api',
    attribution: 'Pokemon Champions Battle Data — https://championsbattledata.com/',
    season: index.defaultSeason,
    dataVersion: index.dataVersion,
  }

  await writeFile(join(OUT, 'pokedex.json'), JSON.stringify({ meta, species: pokedex }))
  await writeFile(join(OUT, 'learnsets.json'), JSON.stringify({ meta, learnsets }))
  // Movimientos: solo los aprendibles en Champions y los campos que usa la app
  const usedMoves = new Set(Object.values(learnsets).flat())
  const compactMoves = moves
    .filter((m) => usedMoves.has(m.name))
    .map((m) => ({
      name: m.name,
      type: m.type,
      category: m.category,
      power: m.power || 0,
      accuracy: m.accuracy ?? null,
      pp: m.pp,
      priority: m.priority || 0,
      target: m.target,
      description: m.description,
      ...(m.championsChanges ? { championsChanges: m.championsChanges } : {}),
    }))
  await writeFile(
    join(OUT, 'moves.json'),
    JSON.stringify({
      meta: { ...meta, source: 'serebii-champions (moves.json)' },
      moves: compactMoves,
    }),
  )
  await writeFile(join(OUT, 'ranking.json'), JSON.stringify({ meta, ranking }, null, 1))

  const totalForms = Object.values(pokedex).reduce((a, s) => a + s.forms.length, 0)
  const md = [
    `# Sincronización con Champions Battle Data (${today})`,
    '',
    `Regenerar: \`node scripts/sync-battle-data.mjs\` (\`--refresh\` ignora la caché de \`reports/.cache\`).`,
    '',
    `- Entradas: ${Object.keys(pokedex).length} · formas: ${totalForms}`,
    `- Ranking Dobles: ${ranking.Doubles.length} · Individual: ${ranking.Singles.length}`,
    `- Temporada CBD: ${index.defaultSeason} · dataVersion ${index.dataVersion}`,
    '',
    '## species.json frente a CBD',
    '',
    ...(audit.local.length ? audit.local.map((l) => `- ${l}`) : ['Sin diferencias.']),
    '',
    '## Formas sin variedad propia en PokéAPI (usan el artwork de la variedad por defecto)',
    '',
    ...(audit.noVariety.length ? audit.noVariety.map((l) => `- ${l}`) : ['Ninguna.']),
    '',
    '## Formas sin artwork oficial en PokéAPI',
    '',
    ...(audit.noSprite.length ? audit.noSprite.map((l) => `- ${l}`) : ['Ninguna.']),
    '',
    '## Movimientos de los learnsets de CBD que no están en moves.json (descartados)',
    '',
    [...audit.unknownMoves].sort().join(', ') || 'Ninguno.',
    '',
  ].join('\n')
  await writeFile(join(REPORTS, `sync-battle-data-${today}.md`), md)
  console.log(md.split('\n').slice(0, 8).join('\n'))
  console.log(
    `species.json: ${audit.local.length} diferencias · sin variedad: ${audit.noVariety.length} · sin artwork: ${audit.noSprite.length} · movimientos desconocidos: ${audit.unknownMoves.size}`,
  )
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
