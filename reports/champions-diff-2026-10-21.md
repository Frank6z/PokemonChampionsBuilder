# Informe de diferencias: datos locales vs PokéAPI

- Generado: 2026-10-21T00:37:14.364Z
- Script: `scripts/diff-champions-data.mjs` (solo lectura sobre `src/data`)
- PokéAPI: version-group `champions`, pokedex/36 — fuente **complementaria**, no oficial
- Datos locales: `roster.json`, `learnsets.json`, `moves.json` (origen declarado: serebii-champions, fuente **secundaria**)

> Coincidir con PokéAPI no convierte un dato en `confirmed`: ninguna de las dos fuentes es oficial.

## 1. Especies

| | Cantidad |
|---|---|
| Pokédex `champions` de PokéAPI | 231 |
| Especies distintas en `roster.json` | 186 (258 entradas, 59 Megas) |
| Solo en PokéAPI | 45 |
| Solo en local | 0 |

### Solo en PokéAPI (45)
- #40 wigglytuff
- #45 vileplume — nombrado oficialmente como nuevo en M-B
- #53 persian
- #83 farfetchd
- #122 mr-mime
- #211 qwilfish — nombrado oficialmente como nuevo en M-B
- #254 sceptile — nombrado oficialmente como nuevo en M-B — está en species.json (app)
- #257 blaziken — nombrado oficialmente como nuevo en M-B
- #260 swampert — nombrado oficialmente como nuevo en M-B — está en species.json (app)
- #303 mawile — nombrado oficialmente como nuevo en M-B
- #317 swalot
- #373 salamence — está en species.json (app)
- #376 metagross — nombrado oficialmente como nuevo en M-B
- #398 staraptor — nombrado oficialmente como nuevo en M-B — está en species.json (app)
- #518 musharna — nombrado oficialmente como nuevo en M-B
- #545 scolipede — nombrado oficialmente como nuevo en M-B
- #560 scrafty — nombrado oficialmente como nuevo en M-B
- #604 eelektross — nombrado oficialmente como nuevo en M-B — está en species.json (app)
- #668 pyroar — nombrado oficialmente como nuevo en M-B
- #673 gogoat
- #687 malamar — nombrado oficialmente como nuevo en M-B
- #689 barbaracle — nombrado oficialmente como nuevo en M-B
- #691 dragalge — nombrado oficialmente como nuevo en M-B
- #768 golisopod — está en species.json (app)
- #812 rillaboom — nombrado oficialmente como nuevo en M-C
- #815 cinderace
- #818 inteleon
- #828 thievul
- #849 toxtricity
- #853 grapploct
- #861 grimmsnarl — nombrado oficialmente como nuevo en M-B
- #863 perrserker
- #865 sirfetchd
- #870 falinks — nombrado oficialmente como nuevo en M-B
- #871 pincurchin
- #876 indeedee
- #904 overqwil — nombrado oficialmente como nuevo en M-B
- #923 pawmot
- #930 arboliva
- #931 squawkabilly
- #943 mabosstiff
- #972 houndstone — nombrado oficialmente como nuevo en M-B
- #979 annihilape — nombrado oficialmente como nuevo en M-B
- #998 baxcalibur
- #1000 gholdengo — nombrado oficialmente como nuevo en M-B

### Solo en local (0)
- Ninguno

## 2. Formas (258)

- Sin correspondencia o ambiguas: 1
- Tipos distintos: 0
- Habilidades distintas: 1
- Sin learnset `champions` en PokéAPI: 1
- Learnset con diferencias: 99

### Sin correspondencia o ambiguas
- Mega Meowstic: ambigua (meowstic-male-mega, meowstic-female-mega)

### Tipos distintos
- Ninguno

### Habilidades distintas
- Greninja (greninja): local [torrent, protean, battle-bond] · PokéAPI [torrent, protean]

### Learnsets con diferencias
- Alolan Raichu: local 75 · PokéAPI 74 · solo local: brutal-swing, drain-punch · solo PokéAPI: psychic
- Raichu: local 75 · PokéAPI 66 · solo local: calm-mind, expanding-force, magic-room, psychic-noise, psychic-terrain, psyshock, skill-swap, speed-swap, stored-power
- Clefable: local 90 · PokéAPI 91 · solo PokéAPI: psychic
- Mega Clefable: local 90 · PokéAPI 91 · solo PokéAPI: psychic
- Alolan Ninetales: local 85 · PokéAPI 64 · solo local: burning-jealousy, energy-ball, fire-blast, fire-spin, flame-charge, flamethrower, flare-blitz, healing-wish, heat-wave, inferno, memento, mystical-fire, night-shade, overheat, quick-attack, scorching-sands, shadow-ball, snarl, solar-beam, sunny-day, will-o-wisp
- Ninetales: local 85 · PokéAPI 67 · solo local: aurora-veil, avalanche, blizzard, chilling-water, dazzling-gleam, draining-kiss, freeze-dry, ice-beam, ice-shard, icicle-spear, icy-wind, misty-terrain, moonblast, play-rough, rain-dance, snowscape, triple-axel, wonder-room
- Arcanine: local 67 · PokéAPI 57 · solo local: head-smash, power-gem, rock-blast, rock-slide, rock-tomb, sandstorm, smack-down, smart-strike, stealth-rock, stone-edge
- Hisuian Arcanine: local 67 · PokéAPI 64 · solo local: charm, curse, play-rough
- Alakazam: local 59 · PokéAPI 60 · solo PokéAPI: psychic
- Mega Alakazam: local 59 · PokéAPI 60 · solo PokéAPI: psychic
- Mega Victreebel: local 58 · PokéAPI 59 · solo PokéAPI: grassy-terrain
- Victreebel: local 58 · PokéAPI 59 · solo PokéAPI: grassy-terrain
- Galarian Slowbro: local 94 · PokéAPI 92 · solo local: focus-punch, psychic-noise, scald · solo PokéAPI: psychic
- Mega Slowbro: local 94 · PokéAPI 78 · solo local: acid-spray, double-edge, gunk-shot, haze, ice-fang, poison-jab, power-gem, rock-blast, sandstorm, scary-face, shell-side-arm, sludge-bomb, sludge-wave, smack-down, toxic, toxic-spikes, venoshock · solo PokéAPI: psychic
- Slowbro: local 94 · PokéAPI 78 · solo local: acid-spray, double-edge, gunk-shot, haze, ice-fang, poison-jab, power-gem, rock-blast, sandstorm, scary-face, shell-side-arm, sludge-bomb, sludge-wave, smack-down, toxic, toxic-spikes, venoshock · solo PokéAPI: psychic
- Gengar: local 75 · PokéAPI 76 · solo PokéAPI: psychic
- Mega Gengar: local 75 · PokéAPI 76 · solo PokéAPI: psychic
- Mega Starmie: local 61 · PokéAPI 62 · solo PokéAPI: psychic
- Starmie: local 61 · PokéAPI 62 · solo PokéAPI: psychic
- Paldean Tauros: local 72 · PokéAPI 48 · solo local: aqua-jet, blizzard, chilling-water, fire-blast, fire-spin, flame-charge, flamethrower, flare-blitz, helping-hand, hydro-pump, ice-beam, icy-wind, liquidation, overheat, payback, shadow-ball, solar-beam, temper-flare, thunder, thunderbolt, water-pulse, wave-crash, whirlpool, will-o-wisp
- Tauros: local 72 · PokéAPI 57 · solo local: aqua-jet, body-press, bulk-up, chilling-water, drill-run, fire-spin, flame-charge, flare-blitz, hydro-pump, liquidation, overheat, temper-flare, water-pulse, wave-crash, will-o-wisp
- Hisuian Typhlosion: local 71 · PokéAPI 66 · solo local: fling, helping-hand, rock-tomb, scorching-sands, throat-chop
- Typhlosion: local 71 · PokéAPI 63 · solo local: calm-mind, confuse-ray, hex, infernal-parade, mystical-fire, night-shade, poltergeist, spite
- Ariados: local 64 · PokéAPI 64 · solo local: psychic-fangs · solo PokéAPI: psychic
- Politoed: local 56 · PokéAPI 57 · solo PokéAPI: psychic
- Espeon: local 66 · PokéAPI 67 · solo PokéAPI: psychic
- Umbreon: local 66 · PokéAPI 67 · solo PokéAPI: psychic
- Galarian Slowking: local 99 · PokéAPI 95 · solo local: focus-punch, reflect, rock-slide, rock-tomb, scald · solo PokéAPI: psychic
- Slowking: local 99 · PokéAPI 85 · solo local: acid-spray, eerie-spell, gunk-shot, hex, low-sweep, poison-jab, scary-face, sludge-bomb, sludge-wave, snarl, stomping-tantrum, taunt, toxic, toxic-spikes, venoshock · solo PokéAPI: psychic
- Gardevoir: local 79 · PokéAPI 80 · solo PokéAPI: psychic
- Mega Gardevoir: local 79 · PokéAPI 80 · solo PokéAPI: psychic
- Mega Sableye: local 87 · PokéAPI 88 · solo PokéAPI: psychic
- Sableye: local 87 · PokéAPI 88 · solo PokéAPI: psychic
- Medicham: local 76 · PokéAPI 77 · solo PokéAPI: psychic
- Mega Medicham: local 76 · PokéAPI 77 · solo PokéAPI: psychic
- Banette: local 65 · PokéAPI 66 · solo PokéAPI: psychic
- Mega Banette: local 65 · PokéAPI 66 · solo PokéAPI: psychic
- Chimecho: local 64 · PokéAPI 65 · solo PokéAPI: psychic
- Mega Chimecho: local 64 · PokéAPI 65 · solo PokéAPI: psychic
- Spiritomb: local 53 · PokéAPI 54 · solo PokéAPI: psychic
- Lucario: local 82 · PokéAPI 83 · solo PokéAPI: psychic
- Mega Lucario: local 82 · PokéAPI 83 · solo PokéAPI: psychic
- Gallade: local 104 · PokéAPI 105 · solo PokéAPI: psychic
- Mega Gallade: local 104 · PokéAPI 105 · solo PokéAPI: psychic
- Froslass: local 67 · PokéAPI 68 · solo PokéAPI: psychic
- Mega Froslass: local 67 · PokéAPI 68 · solo PokéAPI: psychic
- Rotom: local 47 · PokéAPI 42 · solo local: air-slash, blizzard, hydro-pump, leaf-storm, overheat
- Samurott: local 67 · PokéAPI 61 · solo local: ceaseless-edge, dark-pulse, lash-out, snarl, sucker-punch, throat-chop
- Audino: local 68 · PokéAPI 69 · solo PokéAPI: psychic
- Mega Audino: local 68 · PokéAPI 69 · solo PokéAPI: psychic
- Whimsicott: local 49 · PokéAPI 50 · solo PokéAPI: psychic
- Cofagrigus: local 53 · PokéAPI 54 · solo PokéAPI: psychic
- Garbodor: local 52 · PokéAPI 53 · solo PokéAPI: psychic
- Hisuian Zoroark: local 79 · PokéAPI 73 · solo local: counter, encore, night-daze, night-slash, sucker-punch, sunny-day, toxic · solo PokéAPI: psychic
- Zoroark: local 79 · PokéAPI 70 · solo local: bitter-malice, comeuppance, curse, focus-punch, icy-wind, phantom-force, poltergeist, shadow-sneak, snowscape, will-o-wisp · solo PokéAPI: psychic
- Reuniclus: local 65 · PokéAPI 66 · solo PokéAPI: psychic
- Chandelure: local 53 · PokéAPI 54 · solo PokéAPI: psychic
- Mega Chandelure: local 53 · PokéAPI 54 · solo PokéAPI: psychic
- Galarian Stunfisk: local 59 · PokéAPI 52 · solo local: charge, discharge, eerie-impulse, electric-terrain, electroweb, thunder, thunderbolt
- Stunfisk: local 59 · PokéAPI 48 · solo local: bind, counter, crunch, flash-cannon, ice-fang, iron-defense, metal-sound, screech, snap-trap, steel-beam, terrain-pulse
- Golurk: local 77 · PokéAPI 78 · solo PokéAPI: psychic
- Mega Golurk: local 77 · PokéAPI 78 · solo PokéAPI: psychic
- Volcarona: local 56 · PokéAPI 57 · solo PokéAPI: psychic
- Delphox: local 71 · PokéAPI 72 · solo PokéAPI: psychic
- Mega Delphox: local 71 · PokéAPI 72 · solo PokéAPI: psychic
- Vivillon: local 42 · PokéAPI 43 · solo PokéAPI: psychic
- Floette: local 40 · PokéAPI 0 · solo local: alluring-voice, baton-pass, calm-mind, charm, chilling-water, copycat, dazzling-gleam, draining-kiss, endeavor, endure, energy-ball, facade, giga-drain, grass-knot, grassy-terrain, helping-hand, hyper-beam, light-screen, light-of-ruin, misty-terrain, moonblast, petal-blizzard, petal-dance, pollen-puff, protect, rain-dance, rest, safeguard, seed-bomb, skill-swap, sleep-talk, solar-beam, stored-power, substitute, sunny-day, synthesis, tearful-look, trailblaze, trick, wish
- Mega Floette: local 40 · PokéAPI 41 · solo PokéAPI: psychic
- Florges: local 45 · PokéAPI 46 · solo PokéAPI: psychic
- Mega Meowstic: local 60 · PokéAPI 59 · solo local: extrasensory, future-sight · solo PokéAPI: psychic
- Meowstic: local 60 · PokéAPI 59 · solo local: extrasensory, future-sight · solo PokéAPI: psychic
- Aegislash: local 44 · PokéAPI 45 · solo PokéAPI: kings-shield
- Aromatisse: local 47 · PokéAPI 48 · solo PokéAPI: psychic
- Slurpuff: local 41 · PokéAPI 42 · solo PokéAPI: psychic
- Aurorus: local 55 · PokéAPI 56 · solo PokéAPI: psychic
- Sylveon: local 54 · PokéAPI 55 · solo PokéAPI: psychic
- Goodra: local 77 · PokéAPI 65 · solo local: ancient-power, flash-cannon, gyro-ball, heavy-slam, ice-spinner, iron-head, lash-out, rock-tomb, sandstorm, scary-face, shelter, steel-beam
- Hisuian Goodra: local 77 · PokéAPI 63 · solo local: acid-armor, aqua-tail, assurance, brutal-swing, focus-blast, focus-punch, giga-drain, mega-kick, power-whip, round, scald, snore, superpower, toxic
- Klefki: local 43 · PokéAPI 44 · solo PokéAPI: psychic
- Trevenant: local 71 · PokéAPI 73 · solo PokéAPI: psychic, forests-curse
- … y 19 más (ver JSON)

## 3. Movimientos con `inChampions: true` (494)

- No encontrados en PokéAPI: 0
- Con diferencias: 399 (con `championsChanges` local: 399; sin explicación: 0)

PokéAPI publica valores de los juegos principales, así que una diferencia **no** indica un error local: es lo esperable cuando Champions cambió el movimiento.

### No encontrados
- Ninguno

### Diferencias sin `championsChanges` local
- Ninguno

### Diferencias con `championsChanges` local (primeras 40)
- Acrobatics: pp 16 vs 15 — local: "PP 15→16"
- Acupressure: pp 20 vs 30 — local: "PP 30→20"
- After You: pp 16 vs 15 — local: "PP 15→16"
- Agility: pp 20 vs 30 — local: "PP 30→20"
- Air Cutter: pp 20 vs 25 — local: "PP 25→20"
- Air Slash: pp 16 vs 15 — local: "PP 15→16"
- Alluring Voice: pp 12 vs 10 — local: "PP 10→12"
- Ally Switch: pp 16 vs 15 — local: "PP 15→16"
- Ancient Power: pp 8 vs 5 — local: "PP 5→8"
- Apple Acid: power 90 vs 80; pp 12 vs 10 — local: "power 80→90, PP 10→12"
- Aqua Step: pp 12 vs 10 — local: "PP 10→12"
- Aqua Tail: pp 12 vs 10 — local: "PP 10→12"
- Armor Cannon: pp 8 vs 5 — local: "PP 5→8"
- Assurance: pp 12 vs 10 — local: "PP 10→12"
- Attract: pp 16 vs 15 — local: "PP 15→16"
- Aura Wheel: pp 12 vs 10 — local: "PP 10→12"
- Avalanche: pp 12 vs 10 — local: "PP 10→12"
- Axe Kick: pp 12 vs 10 — local: "PP 10→12"
- Baby-Doll Eyes: pp 20 vs 30 — local: "PP 30→20"
- Baneful Bunker: pp 8 vs 10 — local: "PP 10→8"
- Baton Pass: pp 20 vs 40 — local: "PP 40→20"
- Beak Blast: power 120 vs 100; pp 8 vs 15 — local: "power 100→120, PP 15→8"
- Beat Up: pp 12 vs 10 — local: "PP 10→12"
- Belch: pp 12 vs 10 — local: "PP 10→12"
- Belly Drum: pp 12 vs 10 — local: "PP 10→12"
- Bite: pp 20 vs 25 — local: "PP 25→20"
- Bitter Blade: pp 12 vs 10 — local: "PP 10→12"
- Bitter Malice: pp 12 vs 10 — local: "PP 10→12"
- Blast Burn: pp 8 vs 5 — local: "PP 5→8"
- Blaze Kick: pp 12 vs 10 — local: "PP 10→12"
- Blizzard: pp 8 vs 5 — local: "PP 5→8"
- Block: pp 8 vs 5 — local: "PP 5→8"
- Body Press: pp 12 vs 10 — local: "PP 10→12"
- Body Slam: pp 16 vs 15 — local: "PP 15→16"
- Bone Rush: power 30 vs 25; pp 12 vs 10 — local: "power 25→30, PP 10→12"
- Boomburst: pp 12 vs 10 — local: "PP 10→12"
- Bounce: pp 8 vs 5 — local: "PP 5→8"
- Brave Bird: pp 16 vs 15 — local: "PP 15→16"
- Breaking Swipe: pp 16 vs 15 — local: "PP 15→16"
- Brick Break: pp 16 vs 15 — local: "PP 15→16"
- … y 359 más (ver JSON)
