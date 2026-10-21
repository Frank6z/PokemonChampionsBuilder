// Compara los datos locales de Pokémon Champions con PokéAPI y genera un informe.
// Solo lectura sobre src/data: escribe únicamente en reports/ (informe + caché de PokéAPI).
// Uso: node scripts/diff-champions-data.mjs [--refresh]   (--refresh ignora la caché)

import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const DATA = join(ROOT, 'src', 'data')
const REPORTS = join(ROOT, 'reports')
const CACHE = join(REPORTS, '.cache', 'pokeapi')
const API = 'https://pokeapi.co/api/v2'
const VERSION_GROUP = 'champions'
const POKEDEX_ID = 36
const REFRESH = process.argv.includes('--refresh')
const today = new Date().toISOString().slice(0, 10)

const readJson = async (file) => JSON.parse(await readFile(file, 'utf8'))

// "King's Shield" -> "kings-shield", "Double-Edge" -> "double-edge"
const slug = (name) =>
  name
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/['’.:]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

async function api(path) {
  const file = join(CACHE, path.replace(/[^a-z0-9-]+/gi, '_') + '.json')
  if (!REFRESH && existsSync(file)) return readJson(file)
  const res = await fetch(`${API}/${path}`)
  if (res.status === 404) return null
  if (!res.ok) throw new Error(`PokéAPI ${path}: HTTP ${res.status}`)
  const json = await res.json()
  await writeFile(file, JSON.stringify(json))
  return json
}

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

const FORM_TOKENS = {
  Mega: 'mega',
  Alolan: 'alola',
  Galarian: 'galar',
  Hisuian: 'hisui',
  Paldean: 'paldea',
}

// Elige la variedad de PokéAPI que corresponde a una entrada local ("Mega Charizard X", "Alolan Raichu"...)
function pickVariety(entry, species, pokemonByName) {
  const varieties = species.varieties.map((v) => v.pokemon.name)
  if (entry.form === 'Base') {
    return { name: species.varieties.find((v) => v.is_default).pokemon.name, ambiguous: false }
  }
  const prefix = entry.name.split(' ')[0]
  const token = FORM_TOKENS[prefix]
  const suffix = entry.name.match(/ ([XYZ])$/)?.[1]?.toLowerCase()
  let candidates = varieties.filter((v) => token && v.split('-').includes(token))
  if (suffix) candidates = candidates.filter((v) => v.endsWith(`-${suffix}`))
  else if (token === 'mega') candidates = candidates.filter((v) => !/-mega-[xyz]$/.test(v))
  if (candidates.length > 1) {
    const local = entry.types.map(slug).join('/')
    const byType = candidates.filter(
      (c) => pokemonByName[c] && pokemonByName[c].types.map((t) => t.type.name).join('/') === local,
    )
    if (byType.length) candidates = byType
  }
  return { name: candidates[0] ?? null, ambiguous: candidates.length > 1, candidates }
}

const sameSet = (a, b) => a.length === b.length && a.every((x) => b.includes(x))

async function main() {
  await mkdir(CACHE, { recursive: true })
  const [roster, learnsets, moves, speciesData] = await Promise.all([
    readJson(join(DATA, 'roster.json')),
    readJson(join(DATA, 'learnsets.json')),
    readJson(join(DATA, 'moves.json')),
    readJson(join(DATA, 'champions', 'species.json')),
  ])
  const regulations = await readJson(join(DATA, 'champions', 'regulations.json'))

  // 1. Especies: roster local frente a la pokédex 'champions' de PokéAPI
  const dex = await api(`pokedex/${POKEDEX_ID}`)
  const apiSpecies = dex.pokemon_entries.map((e) => ({
    name: e.pokemon_species.name,
    id: Number(e.pokemon_species.url.match(/\/(\d+)\/$/)[1]),
    entry: e.entry_number,
  }))
  const localDex = new Map()
  for (const r of roster) localDex.set(r.dexNumber, [...(localDex.get(r.dexNumber) || []), r.name])
  const apiDexIds = new Set(apiSpecies.map((s) => s.id))
  const onlyApi = apiSpecies.filter((s) => !localDex.has(s.id))
  const onlyLocal = [...localDex.keys()].filter((id) => !apiDexIds.has(id))

  const officialNew = new Map()
  for (const reg of regulations.regulations)
    for (const n of reg.newPokemon.names) officialNew.set(slug(n), reg.id)
  const pokedexLocalDex = new Set(Object.values(speciesData.species).map((p) => p.dexNumber))

  // 2. Formas: tipos, habilidades y movimientos aprendibles
  const speciesIds = [...new Set(roster.map((r) => r.dexNumber))]
  const speciesById = {}
  await pool(speciesIds, 6, async (id) => (speciesById[id] = await api(`pokemon-species/${id}`)))

  const pokemonByName = {}
  const varieties = [
    ...new Set(
      Object.values(speciesById).flatMap((s) => (s ? s.varieties.map((v) => v.pokemon.name) : [])),
    ),
  ]
  await pool(varieties, 6, async (name) => (pokemonByName[name] = await api(`pokemon/${name}`)))

  const forms = roster.map((entry) => {
    const species = speciesById[entry.dexNumber]
    if (!species)
      return { name: entry.name, variety: null, problem: 'Especie no encontrada en PokéAPI' }
    const pick = pickVariety(entry, species, pokemonByName)
    const p = pick.name && pokemonByName[pick.name]
    if (!p)
      return {
        name: entry.name,
        variety: pick.name,
        problem: 'Variedad no encontrada en PokéAPI',
        candidates: pick.candidates,
      }

    const apiTypes = p.types.map((t) => t.type.name)
    const localTypes = entry.types.map(slug)
    const apiAbilities = p.abilities.map((a) => a.ability.name)
    const localAbilities = Object.values(entry.abilities).filter(Boolean).map(slug)
    const apiMoves = p.moves
      .filter((m) => m.version_group_details.some((d) => d.version_group.name === VERSION_GROUP))
      .map((m) => m.move.name)
    const localMoves = (learnsets[entry.name]?.moves || []).map((m) => slug(m.name))
    return {
      name: entry.name,
      variety: pick.name,
      ambiguous: pick.ambiguous,
      candidates: pick.candidates,
      typesMatch: sameSet(localTypes, apiTypes),
      localTypes,
      apiTypes,
      abilitiesMatch: sameSet(localAbilities, apiAbilities),
      localAbilities,
      apiAbilities,
      apiHasChampionsLearnset: apiMoves.length > 0,
      learnset: {
        local: localMoves.length,
        api: apiMoves.length,
        onlyLocal: localMoves.filter((m) => !apiMoves.includes(m)),
        onlyApi: apiMoves.filter((m) => !localMoves.includes(m)),
      },
    }
  })

  // 3. Movimientos marcados inChampions: valores locales frente a PokéAPI (valores de juegos principales)
  const champMoves = moves.filter((m) => m.inChampions)
  const apiMoves = await pool(champMoves, 6, (m) => api(`move/${slug(m.name)}`))
  const moveRows = champMoves.map((m, i) => {
    const a = apiMoves[i]
    if (!a) return { name: m.name, problem: 'Movimiento no encontrado en PokéAPI' }
    const fields = {
      type: [slug(m.type), a.type.name],
      category: [slug(m.category), a.damage_class.name],
      // los movimientos de estado tienen potencia 0 en local y null en PokéAPI
      power: [m.power || null, a.power],
      accuracy: [m.accuracy ?? null, a.accuracy],
      pp: [m.pp ?? null, a.pp],
      priority: [m.priority ?? 0, a.priority],
    }
    const diffs = Object.entries(fields)
      .filter(([, [l, r]]) => l !== r && !(l === true && r === null))
      .map(([k, [l, r]]) => ({ field: k, local: l, api: r }))
    return { name: m.name, diffs, championsChanges: m.championsChanges ?? null }
  })

  // 4. Informe
  const formIssues = forms.filter((f) => f.problem || f.ambiguous)
  const typeDiffs = forms.filter((f) => f.typesMatch === false)
  const abilityDiffs = forms.filter((f) => f.abilitiesMatch === false)
  const noApiLearnset = forms.filter((f) => f.apiHasChampionsLearnset === false)
  const learnsetDiffs = forms.filter(
    (f) => f.learnset && (f.learnset.onlyLocal.length || f.learnset.onlyApi.length),
  )
  const moveMissing = moveRows.filter((m) => m.problem)
  const moveDiffs = moveRows.filter((m) => m.diffs?.length)
  const explained = moveDiffs.filter((m) => m.championsChanges)
  const unexplained = moveDiffs.filter((m) => !m.championsChanges)

  const summary = {
    generatedAt: new Date().toISOString(),
    pokeapi: { versionGroup: VERSION_GROUP, pokedex: POKEDEX_ID, species: apiSpecies.length },
    local: {
      rosterEntries: roster.length,
      rosterSpecies: localDex.size,
      megas: roster.filter((r) => r.form === 'Mega').length,
      movesInChampions: champMoves.length,
    },
    species: {
      onlyApi: onlyApi.map((s) => ({
        ...s,
        officialRegulation: officialNew.get(s.name) ?? null,
        inLocalPokedex: pokedexLocalDex.has(s.id),
      })),
      onlyLocal: onlyLocal.map((id) => ({ id, names: localDex.get(id) })),
    },
    forms,
    moves: moveRows,
  }

  const list = (arr, fn, max = 400) =>
    arr.length
      ? arr.slice(0, max).map(fn).join('\n') +
        (arr.length > max ? `\n- … y ${arr.length - max} más (ver JSON)` : '')
      : '- Ninguno'

  const md = `# Informe de diferencias: datos locales vs PokéAPI

- Generado: ${summary.generatedAt}
- Script: \`scripts/diff-champions-data.mjs\` (solo lectura sobre \`src/data\`)
- PokéAPI: version-group \`${VERSION_GROUP}\`, pokedex/${POKEDEX_ID} — fuente **complementaria**, no oficial
- Datos locales: \`roster.json\`, \`learnsets.json\`, \`moves.json\` (origen declarado: serebii-champions, fuente **secundaria**)

> Coincidir con PokéAPI no convierte un dato en \`confirmed\`: ninguna de las dos fuentes es oficial.

## 1. Especies

| | Cantidad |
|---|---|
| Pokédex \`champions\` de PokéAPI | ${apiSpecies.length} |
| Especies distintas en \`roster.json\` | ${localDex.size} (${roster.length} entradas, ${summary.local.megas} Megas) |
| Solo en PokéAPI | ${onlyApi.length} |
| Solo en local | ${onlyLocal.length} |

### Solo en PokéAPI (${onlyApi.length})
${list(summary.species.onlyApi, (s) => `- #${s.id} ${s.name}${s.officialRegulation ? ` — nombrado oficialmente como nuevo en ${s.officialRegulation}` : ''}${s.inLocalPokedex ? ' — está en species.json (app)' : ''}`)}

### Solo en local (${onlyLocal.length})
${list(summary.species.onlyLocal, (s) => `- #${s.id} ${s.names.join(', ')}`)}

## 2. Formas (${forms.length})

- Sin correspondencia o ambiguas: ${formIssues.length}
- Tipos distintos: ${typeDiffs.length}
- Habilidades distintas: ${abilityDiffs.length}
- Sin learnset \`champions\` en PokéAPI: ${noApiLearnset.length}
- Learnset con diferencias: ${learnsetDiffs.length}

### Sin correspondencia o ambiguas
${list(formIssues, (f) => `- ${f.name}: ${f.problem ?? 'ambigua'} (${(f.candidates || [f.variety]).join(', ')})`)}

### Tipos distintos
${list(typeDiffs, (f) => `- ${f.name} (${f.variety}): local ${f.localTypes.join('/')} · PokéAPI ${f.apiTypes.join('/')}`)}

### Habilidades distintas
${list(abilityDiffs, (f) => `- ${f.name} (${f.variety}): local [${f.localAbilities.join(', ')}] · PokéAPI [${f.apiAbilities.join(', ')}]`)}

### Learnsets con diferencias
${list(learnsetDiffs, (f) => `- ${f.name}: local ${f.learnset.local} · PokéAPI ${f.learnset.api}${f.learnset.onlyLocal.length ? ` · solo local: ${f.learnset.onlyLocal.join(', ')}` : ''}${f.learnset.onlyApi.length ? ` · solo PokéAPI: ${f.learnset.onlyApi.join(', ')}` : ''}`, 80)}

## 3. Movimientos con \`inChampions: true\` (${champMoves.length})

- No encontrados en PokéAPI: ${moveMissing.length}
- Con diferencias: ${moveDiffs.length} (con \`championsChanges\` local: ${explained.length}; sin explicación: ${unexplained.length})

PokéAPI publica valores de los juegos principales, así que una diferencia **no** indica un error local: es lo esperable cuando Champions cambió el movimiento.

### No encontrados
${list(moveMissing, (m) => `- ${m.name}`)}

### Diferencias sin \`championsChanges\` local
${list(unexplained, (m) => `- ${m.name}: ${m.diffs.map((d) => `${d.field} ${d.local} vs ${d.api}`).join('; ')}`)}

### Diferencias con \`championsChanges\` local (primeras 40)
${list(explained, (m) => `- ${m.name}: ${m.diffs.map((d) => `${d.field} ${d.local} vs ${d.api}`).join('; ')} — local: "${m.championsChanges}"`, 40)}
`

  await writeFile(join(REPORTS, `champions-diff-${today}.md`), md)
  await writeFile(join(REPORTS, `champions-diff-${today}.json`), JSON.stringify(summary, null, 2))
  console.log(`Informe: reports/champions-diff-${today}.md`)
  console.log(
    `Especies: PokéAPI ${apiSpecies.length} · local ${localDex.size} · solo PokéAPI ${onlyApi.length} · solo local ${onlyLocal.length}`,
  )
  console.log(
    `Formas: ${forms.length} · sin correspondencia ${formIssues.length} · tipos ≠ ${typeDiffs.length} · habilidades ≠ ${abilityDiffs.length} · learnsets ≠ ${learnsetDiffs.length}`,
  )
  console.log(
    `Movimientos: ${champMoves.length} · no encontrados ${moveMissing.length} · con diferencias ${moveDiffs.length} (sin explicar ${unexplained.length})`,
  )
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
