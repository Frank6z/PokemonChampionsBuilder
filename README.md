# PokeChampBuilder (pokemonchampsbuild)

## Install the dependencies

```bash
pnpm install
# or: yarn/npm/bun install
```

### Start the app in development mode (HMR, error reporting, etc.)

```bash
quasar dev
```

### Format & Lint the files

```bash
pnpm run lint
# or: yarn/npm/bun run lint
```

...or just check formatting & linting:

```bash
pnpm run lint:check
# or: yarn/npm/bun run lint:check
```

### Build the app for production

```bash
quasar build
```

### Customize the configuration

See [Configuring quasar.config.js](https://v2.quasar.dev/quasar-cli-vite/quasar-config-file).

## Datos de Pokémon Champions

```
src/data/
  champions/
    species.json      ← capa curada: sprites locales, textos de Pokédex en español y procedencia (18 especies)
    generated/        ← generado por scripts/sync-battle-data.mjs; NO editar a mano
      pokedex.json    ← 263 Pokémon / 347 formas: tipos, habilidades (oculta marcada), stats base, artwork  (~125 KB, carga inicial)
      ranking.json    ← top 50 de uso en Dobles e Individual                                                 (~17 KB, carga inicial)
      learnsets.json  ← movimientos aprendibles por Pokémon                                                  (~195 KB, diferido)
      moves.json      ← solo los 511 movimientos aprendibles, campos que usa la app                          (~180 KB, diferido)
    sources.json      ← registro de fuentes: URL, tipo (official | complementary | secondary) y fecha de consulta
    regulations.json  ← Regulation Sets M-A, M-B, M-C (fechas, Megas y Pokémon nuevos)
  roster.json, moves.json, learnsets.json  ← catálogo completo (origen: Serebii, sin verificar)
  effectiveness.json                       ← tabla de tipos
```

Cada registro lleva `status` (`confirmed` | `otherGames` | `unknown`) y `sources` (ids de `sources.json`).
Solo se marca `confirmed` lo que respalda una fuente oficial; PokéAPI y Bulbapedia son complementarias.

Scripts (Node 24, sin dependencias):

```bash
node scripts/diff-champions-data.mjs   # compara con PokéAPI → reports/champions-diff-<fecha>.md (solo lectura)
node scripts/add-provenance.mjs        # añade status/sources a roster, moves y learnsets (idempotente)
```
