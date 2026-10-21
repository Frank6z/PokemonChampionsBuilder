# Etapa 2 — Análisis de diferencias (20-10-2026)

Informe automático: `champions-diff-2026-10-21.md` (+ `.json`). La fecha del nombre está en UTC.
Regenerar: `node scripts/diff-champions-data.mjs` (usa la caché de `reports/.cache`; `--refresh` la ignora).

Comprobación de solo lectura: el sha256 de todos los archivos de `src/data` antes y después de ejecutar el script es idéntico.

## 186 frente a 231: ¿por qué?

No son el mismo conjunto. **`roster.json` es una instantánea anterior a la Regulación M-B** y la pokédex `champions` de PokéAPI incluye las incorporaciones posteriores.

Evidencia:

1. Las 186 especies locales están todas en PokéAPI (0 solo en local). Las diferencias van en una sola dirección: 45 especies solo en PokéAPI.
2. Los **22 Pokémon que el artículo oficial de M-B nombra como nuevos** (Vileplume, Qwilfish, Sceptile… Gholdengo) faltan todos en `roster.json` y están todos en PokéAPI.
3. **Rillaboom**, el único nuevo de M-C nombrado oficialmente, también falta en local y está en PokéAPI.
4. Salamence, Golisopod y Baxcalibur, cuyas Megas son oficialmente novedad de M-C, faltan en local.
5. Bulbapedia (complementaria) da la misma cifra de 186 especies y 59 Megas que el roster local, así que ambos parecen reflejar el lanzamiento (M-A).

Lo que **no** se puede afirmar: el reparto exacto de las 45. Quedan 22 especies sin nombrar oficialmente (Wigglytuff, Persian, Cinderace, Inteleon, Salamence, Golisopod, Baxcalibur…). M-B dice "including" sin total y M-C dice 24 nuevos sin listarlos (22 nombrados en M-B + 24 de M-C = 46 ≠ 45). Hasta tener la lista del juego (Recruit → Roster Info), su regulación de llegada queda como `unknown`.

Inconsistencia interna detectada: Sceptile, Swampert, Staraptor, Eelektross, Salamence y Golisopod están en `pokedex.json` (la app) pero no en `roster.json`.

## Otros hallazgos (pendientes para la etapa 3)

| Área                                | Resultado                                                                                                                                                                                                 |
| ----------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Tipos (258 formas)                  | 0 diferencias con PokéAPI                                                                                                                                                                                 |
| Habilidades                         | 1: Greninja tiene Battle Bond en local, no en PokéAPI                                                                                                                                                     |
| Formas ambiguas                     | 1: Mega Meowstic (PokéAPI separa macho y hembra)                                                                                                                                                          |
| Learnsets                           | 99 formas con diferencias: 350 movimientos solo en local, 79 solo en PokéAPI                                                                                                                              |
| Movimiento Psychic                  | Existe en `moves.json` (`inChampions: true`) pero **no aparece en ningún learnset local**; PokéAPI lo da a 75 formas. Es probable que sea un error de extracción en los datos originales (sin confirmar). |
| Floette                             | PokéAPI no tiene learnset `champions` para la forma base                                                                                                                                                  |
| Movimientos (494 con `inChampions`) | 399 difieren de PokéAPI; los 399 coinciden con el `championsChanges` local. 0 sin explicar.                                                                                                               |
| Parche 1.2.0                        | En local Wish tiene 12 PP; una fuente secundaria (PlayNews) dice que 1.2.0 la bajó a 8. Si eso se confirma, los datos locales son anteriores al 9-9-2026. Sin fuente oficial: `unknown`.                  |

Nada de esto convierte datos en `confirmed`: PokéAPI es complementaria y los datos locales provienen de una fuente secundaria.
