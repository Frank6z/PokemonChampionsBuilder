// Recomendaciones inteligentes para el Team Builder.
// Heurística propia y transparente: cada punto de la puntuación deja una razón legible.
// Entradas reales: tabla de tipos, stats y habilidades de Champions, learnsets y ranking de uso.
import { TYPES, defensiveMultiplier, attackMultiplier } from '@/utils/types.js'
import { inferRoles } from '@/utils/roles.js'
import {
  defensiveAnalysis,
  offensiveCoverage,
  metaReadiness,
  balanceScores,
} from '@/utils/teamAnalysis.js'
import { speciesList, formIndexForItem } from '@/services/pokedex.js'
import { rankOf } from '@/services/ranking.js'

const SPEED_CONTROL_MOVES = ['Tailwind', 'Trick Room', 'Icy Wind', 'Electroweb', 'Thunder Wave']
const HAZARD_REMOVAL_MOVES = ['Rapid Spin', 'Defog', 'Court Change', 'Mortal Spin', 'Tidy Up']
const SUPPORT_MOVES = ['Fake Out', 'Follow Me', 'Rage Powder', 'Wide Guard', 'Helping Hand']

const es = (t) => TYPES[t].es

// Un candidato como "miembro" para reutilizar el análisis del equipo (sin movimientos → STAB)
function asMember(species, formIndex, ability) {
  const form = species.forms[formIndex]
  return { index: -1, species, form, ability, slot: { moves: [] } }
}

// Forma y habilidad con las que se juega cada especie según el ranking (Mega Piedra → Mega)
function candidateFor(species, format) {
  const rank = rankOf(species.key, format)
  const formIndex = rank ? formIndexForItem(species, rank.topItem) : 0
  const form = species.forms[formIndex]
  const ability =
    form.abilities.find((a) => a.name === rank?.topAbility)?.name || form.abilities[0]?.name
  return { species, formIndex, form, ability, rank }
}

// Estado del equipo que necesitan las recomendaciones y el diagnóstico
export function teamContext(members, movesByMember, threats, movesByName, learnsets) {
  const defense = defensiveAnalysis(members)
  const coverage = offensiveCoverage(members, movesByMember)
  const readiness = metaReadiness(members, movesByMember, threats, movesByName)
  const roles = {}
  members.forEach((m, i) => {
    for (const r of inferRoles(m.form, m.ability, movesByMember[i] || []))
      roles[r] = (roles[r] || 0) + 1
  })
  // control de velocidad / hazards que el equipo PODRÍA llevar (aunque aún no lo tenga elegido)
  const learns = (m, list) => list.some((mv) => learnsets?.[m.species.key]?.includes(mv))
  const chosen = (i, list) => (movesByMember[i] || []).some((mv) => list.includes(mv.name))
  return {
    members,
    movesByMember,
    defense,
    coverage,
    readiness,
    roles,
    scores: balanceScores(defense, coverage, readiness),
    hasSpeedControl: members.some((m, i) => chosen(i, SPEED_CONTROL_MOVES)),
    canSpeedControl: members.some((m) => learns(m, SPEED_CONTROL_MOVES)),
    hasHazardRemoval: members.some((m, i) => chosen(i, HAZARD_REMOVAL_MOVES)),
    canHazardRemoval: members.some((m) => learns(m, HAZARD_REMOVAL_MOVES)),
  }
}

function scoreCandidate(c, ctx, format, learnsets) {
  const reasons = []
  let score = 0
  const add = (points, kind, icon, text) => {
    score += points
    if (text) reasons.push({ kind, icon, text, points })
  }

  // 1. Mitigar debilidades compartidas
  for (const row of ctx.defense) {
    const mult = defensiveMultiplier(row.type, c.form.types, c.ability)
    const pressing = row.level === 'danger' || row.level === 'warn' || row.weak >= 2
    if (pressing) {
      if (mult === 0) {
        add(
          4,
          'defense',
          'mdi-shield-star',
          `Inmune a ${es(row.type)}: ${row.weak} de tu equipo ${row.weak > 1 ? 'son débiles' : 'es débil'}`,
        )
      } else if (mult < 1) {
        add(
          3,
          'defense',
          'mdi-shield-check',
          `Resiste ${es(row.type)}, que amenaza a ${row.weak} ${row.weak > 1 ? 'miembros' : 'miembro'}`,
        )
      } else if (mult > 1) {
        add(-3, 'risk', 'mdi-alert', `También es débil a ${es(row.type)}`)
      }
    } else if (mult > 1 && row.weak >= 1) {
      add(-0.5)
    }
  }

  // 2. Cobertura ofensiva: tipos a los que el equipo no pega supereficaz
  const holes = ctx.coverage.rows.filter((r) => r.best <= 1).map((r) => r.type)
  const fills = holes.filter((h) => c.form.types.some((t) => attackMultiplier(t, [h]) > 1))
  if (fills.length) {
    add(
      Math.min(6, fills.length * 2),
      'offense',
      'mdi-sword-cross',
      `Su STAB golpea supereficaz a ${fills.map(es).join(', ')} (sin cobertura)`,
    )
  }

  // 3. Roles que faltan
  const roles = new Set(inferRoles(c.form, c.ability))
  const learn = (list) => list.filter((mv) => learnsets?.[c.species.key]?.includes(mv))
  const n = ctx.members.length
  if (n >= 2) {
    if (!ctx.roles.special && roles.has('special'))
      add(2, 'role', 'mdi-creation', 'Aporta el ataque especial que le falta al equipo')
    if (!ctx.roles.physical && roles.has('physical'))
      add(2, 'role', 'mdi-sword', 'Aporta el ataque físico que le falta al equipo')
    if (!ctx.roles.tank && roles.has('tank'))
      add(2, 'role', 'mdi-shield', 'Tanque: ningún miembro aguanta golpes de forma fiable')
    if (!ctx.roles.fast && roles.has('fast'))
      add(
        2,
        'role',
        'mdi-lightning-bolt',
        `Rápido (Vel. base ${c.form.stats.spe}): el equipo es lento`,
      )
  }
  const supportMoves = learn(SUPPORT_MOVES)
  if (format === 'Doubles' && !ctx.roles.support && (roles.has('support') || supportMoves.length)) {
    add(
      2.5,
      'role',
      'mdi-hand-heart',
      `Support para Dobles${supportMoves.length ? ` (aprende ${supportMoves.slice(0, 2).join(', ')})` : ''}`,
    )
  }
  const speed = learn(SPEED_CONTROL_MOVES)
  if (!ctx.hasSpeedControl && !ctx.canSpeedControl && speed.length) {
    add(
      2,
      'role',
      'mdi-wind-turbine',
      `Control de velocidad: aprende ${speed.slice(0, 2).join(' y ')}`,
    )
  }
  if (format === 'Singles' && !ctx.hasHazardRemoval && !ctx.canHazardRemoval) {
    const rockWeak = ctx.members.filter(
      (m) => defensiveMultiplier('Rock', m.form.types, m.ability) > 1,
    ).length
    const removal = learn(HAZARD_REMOVAL_MOVES)
    if (rockWeak && removal.length) {
      add(
        2.5,
        'role',
        'mdi-broom',
        `Quita hazards (${removal[0]}): ${rockWeak} miembro(s) sufren con Stealth Rock`,
      )
    }
  }

  // 4. Viabilidad en el meta y potencia bruta
  if (c.rank)
    add(
      (51 - c.rank.rank) / 10,
      'meta',
      'mdi-trophy',
      `#${c.rank.rank} en uso (${format === 'Doubles' ? 'Dobles' : 'Individual'})`,
    )
  add((c.form.bst - 500) / 60)

  return { score, reasons: reasons.sort((a, b) => b.points - a.points) }
}

/**
 * Devuelve hasta `limit` recomendaciones con razones e impacto en los medidores.
 * Con el equipo lleno propone sustituciones (a quién reemplazar) en lugar de añadidos.
 */
export function recommend({ ctx, format, threats, movesByName, learnsets, limit = 3 }) {
  const present = new Set(ctx.members.map((m) => m.species.key))
  const full = ctx.members.length >= 6

  const scored = speciesList
    .filter((s) => !present.has(s.key))
    .map((s) => {
      const c = candidateFor(s, format)
      return { ...c, ...scoreCandidate(c, ctx, format, learnsets) }
    })
    .sort((a, b) => b.score - a.score)

  const total = (sc) => sc.offensive + sc.defensive + sc.meta
  const evaluate = (members, movesByMember) => {
    const defense = defensiveAnalysis(members)
    const coverage = offensiveCoverage(members, movesByMember)
    const readiness = metaReadiness(members, movesByMember, threats, movesByName)
    return balanceScores(defense, coverage, readiness)
  }

  // Equipo vacío: no hay nada que complementar → pilares del meta para empezar
  if (!ctx.members.length) {
    return scored
      .filter((c) => c.rank)
      .sort((a, b) => a.rank.rank - b.rank.rank)
      .slice(0, limit)
      .map((c) => {
        const after = evaluate([asMember(c.species, c.formIndex, c.ability)], [[]])
        return {
          ...c,
          replaces: null,
          reasons: [
            {
              kind: 'meta',
              icon: 'mdi-trophy',
              text: `#${c.rank.rank} en uso: un pilar del meta para construir alrededor`,
              points: (51 - c.rank.rank) / 10,
            },
          ],
          impact: { ...after },
          after,
        }
      })
  }

  const picks = []
  for (const c of scored.slice(0, 40)) {
    if (picks.length >= limit) break
    // variedad: no recomendar tres Pokémon del mismo tipo principal
    if (picks.some((p) => p.form.types[0] === c.form.types[0])) continue
    const candidate = asMember(c.species, c.formIndex, c.ability)

    let after
    let replaces = null
    if (!full) {
      after = evaluate([...ctx.members, candidate], [...ctx.movesByMember, []])
    } else {
      // probar a sustituir a cada miembro y quedarse con el cambio que más suma
      let best = null
      ctx.members.forEach((m, i) => {
        const members = ctx.members.map((x, j) => (j === i ? candidate : x))
        const moves = ctx.movesByMember.map((x, j) => (j === i ? [] : x))
        const sc = evaluate(members, moves)
        if (!best || total(sc) > total(best.sc)) best = { sc, member: m }
      })
      if (total(best.sc) <= total(ctx.scores)) continue
      after = best.sc
      replaces = best.member
    }

    picks.push({
      ...c,
      replaces,
      impact: {
        offensive: after.offensive - ctx.scores.offensive,
        defensive: after.defensive - ctx.scores.defensive,
        meta: after.meta - ctx.scores.meta,
      },
      after,
    })
  }
  return picks
}
