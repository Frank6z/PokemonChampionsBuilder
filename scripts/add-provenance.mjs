// Etapa 3: añade `status` y `sources` a roster.json, moves.json y learnsets.json.
// No modifica ni elimina ningún campo existente; solo añade (o actualiza) esos dos campos.
// Es idempotente: ejecutarlo dos veces da el mismo resultado.
// Requiere el informe de la etapa 2: node scripts/diff-champions-data.mjs
// Uso: node scripts/add-provenance.mjs [--dry-run]

import { readFile, writeFile, readdir } from 'node:fs/promises'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const DATA = join(ROOT, 'src', 'data')
const DRY = process.argv.includes('--dry-run')
// cualquier carácter fuera del ASCII imprimible (los de control ya los escapa JSON.stringify)
const NON_ASCII = /[^\t\n\r -~]/

const SEREBII = 'serebii-champions'
const PKAPI_DEX = 'pokeapi-pokedex-champions'
const PKAPI_VG = 'pokeapi-version-group-champions'

// Fuentes oficiales que nombran expresamente una forma como presente en Champions.
// Solo confirman que la forma existe en el juego, no sus tipos, habilidades ni stats.
const OFFICIAL_PRESENCE = {
  'Mega Meganium': 'official-news-switch-launch',
  'Mega Emboar': 'official-news-switch-launch',
  'Mega Feraligatr': 'official-news-switch-launch',
  'Mega Dragonite': 'official-news-switch-launch',
}

async function readData(name) {
  const raw = await readFile(join(DATA, name), 'utf8')
  return {
    data: JSON.parse(raw),
    crlf: raw.includes('\r\n'),
    finalNewline: /\n$/.test(raw),
    asciiEscaped: !NON_ASCII.test(raw),
  }
}

// Reescribe respetando el formato original del archivo (saltos de línea, escape de no-ASCII)
async function writeData(name, file) {
  let text = JSON.stringify(file.data, null, 2)
  if (file.asciiEscaped)
    text = text.replace(
      new RegExp(NON_ASCII, 'g'),
      (c) => '\\u' + c.charCodeAt(0).toString(16).padStart(4, '0'),
    )
  if (file.finalNewline) text += '\n'
  if (file.crlf) text = text.replace(/\n/g, '\r\n')
  if (!DRY) await writeFile(join(DATA, name), text)
}

async function latestReport() {
  const files = (await readdir(join(ROOT, 'reports')))
    .filter((f) => /^champions-diff-.*\.json$/.test(f))
    .sort()
  if (!files.length)
    throw new Error('Falta el informe de la etapa 2: ejecuta node scripts/diff-champions-data.mjs')
  return JSON.parse(await readFile(join(ROOT, 'reports', files.at(-1)), 'utf8'))
}

const withProvenance = (record, status, sources) => ({
  ...record,
  status,
  sources: [...new Set(sources)],
})

async function main() {
  const report = await latestReport()
  const formByName = Object.fromEntries(report.forms.map((f) => [f.name, f]))
  const missingInApi = new Set(report.species.onlyLocal.map((s) => s.id))
  const stats = {}
  const count = (file, key) => ((stats[file] ??= {})[key] = (stats[file][key] || 0) + 1)

  // roster.json — todos `unknown`: el origen es secundario y PokéAPI es solo complementaria
  const roster = await readData('roster.json')
  roster.data = roster.data.map((r) => {
    const form = formByName[r.name]
    const sources = [SEREBII]
    // la especie está en la pokédex `champions` de PokéAPI y los tipos/habilidades coinciden
    if (form?.typesMatch && form?.abilitiesMatch && !missingInApi.has(r.dexNumber))
      sources.push(PKAPI_DEX)
    if (OFFICIAL_PRESENCE[r.name]) sources.push(OFFICIAL_PRESENCE[r.name])
    count('roster.json', sources.join('+'))
    return withProvenance(r, 'unknown', sources)
  })

  // learnsets.json — PokéAPI se añade solo si su learnset `champions` es idéntico al local
  const learnsets = await readData('learnsets.json')
  for (const [name, entry] of Object.entries(learnsets.data)) {
    const ls = formByName[name]?.learnset
    const sources = [SEREBII]
    if (ls && ls.api > 0 && !ls.onlyLocal.length && !ls.onlyApi.length) sources.push(PKAPI_VG)
    count('learnsets.json', sources.join('+'))
    learnsets.data[name] = withProvenance(entry, 'unknown', sources)
  }

  // moves.json — PokéAPI da valores de los juegos principales: no corrobora los de Champions
  const moves = await readData('moves.json')
  moves.data = moves.data.map((m) => {
    count('moves.json', SEREBII)
    return withProvenance(m, 'unknown', [SEREBII])
  })

  await writeData('roster.json', roster)
  await writeData('learnsets.json', learnsets)
  await writeData('moves.json', moves)
  console.log(DRY ? '[dry-run] sin escribir' : 'Escrito', JSON.stringify(stats, null, 2))
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
