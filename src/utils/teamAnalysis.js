import { TYPES, TYPE_IDS, defensiveMultiplier, attackMultiplier } from '@/utils/types.js'

// Umbrales de alerta del análisis defensivo
export const SHARED_WEAKNESS_ALERT = 3 // ≥3 miembros débiles a un tipo
export const UNCOVERED_GAP = 2 // débiles − (resistentes + inmunes) ≥ 2

/**
 * Análisis defensivo: para cada tipo atacante, el multiplicador que recibe cada miembro.
 * members: [{ form, ability, species }]
 */
export function defensiveAnalysis(members) {
  return TYPE_IDS.map((attackType) => {
    const mults = members.map((m) => defensiveMultiplier(attackType, m.form.types, m.ability))
    const weak = mults.filter((x) => x > 1).length
    const resist = mults.filter((x) => x > 0 && x < 1).length
    const immune = mults.filter((x) => x === 0).length
    const level =
      weak >= SHARED_WEAKNESS_ALERT || weak - (resist + immune) >= UNCOVERED_GAP
        ? 'danger'
        : weak > resist + immune
          ? 'warn'
          : resist + immune > 0 && weak === 0
            ? 'solid'
            : 'neutral'
    return { type: attackType, mults, weak, resist, immune, level }
  })
}

/**
 * Cobertura ofensiva: mejor multiplicador que el equipo consigue contra cada tipo (monotipo).
 * movesByMember: array paralelo a members con los movimientos de daño ya resueltos.
 * Si un miembro no tiene movimientos elegidos se usan sus tipos como STAB teórico.
 */
function buildAttackers(members, movesByMember) {
  return members.map((m, i) => {
    const damaging = (movesByMember[i] || []).filter((mv) => mv.category !== 'Status')
    return damaging.length
      ? {
          name: m.species.name,
          sources: damaging.map((mv) => ({ type: mv.type, label: mv.name })),
          fromStab: false,
        }
      : {
          name: m.species.name,
          sources: m.form.types.map((t) => ({ type: t, label: `STAB ${TYPES[t].es}` })),
          fromStab: true,
        }
  })
}

// Mejor multiplicador del equipo contra una combinación de tipos, y quién lo consigue
function bestHit(attackers, defTypes) {
  let best = 0
  const hitters = []
  for (const a of attackers) {
    for (const src of a.sources) {
      const mult = attackMultiplier(src.type, defTypes)
      if (mult > best) best = mult
      if (mult > 1) hitters.push(`${a.name}: ${src.label}`)
    }
  }
  return { best, hitters: [...new Set(hitters)] }
}

export function offensiveCoverage(members, movesByMember) {
  const attackers = buildAttackers(members, movesByMember)
  const rows = TYPE_IDS.map((defType) => ({ type: defType, ...bestHit(attackers, [defType]) }))
  return { rows, usesStabFallback: attackers.some((a) => a.fromStab) }
}

/**
 * Preparación frente a las amenazas más usadas del formato (services/ranking.js → topThreats).
 * Ataque: ¿algún miembro le pega supereficaz? Defensa: ¿algún miembro resiste todos sus
 * tipos de ataque (STAB + tipo de su movimiento más usado)?
 */
export function metaReadiness(members, movesByMember, threats, movesByName) {
  const attackers = buildAttackers(members, movesByMember)
  return threats.map((t) => {
    const top = movesByName?.get(t.topMove)
    const attackTypes = [
      ...new Set([...t.form.types, ...(top && top.category !== 'Status' ? [top.type] : [])]),
    ]
    const offense = bestHit(attackers, t.form.types)
    const walls = members
      .filter((m) =>
        attackTypes.every((at) => defensiveMultiplier(at, m.form.types, m.ability) < 1),
      )
      .map((m) => m.species.name)
    const threatened = members.filter((m) =>
      attackTypes.some((at) => defensiveMultiplier(at, m.form.types, m.ability) > 1),
    ).length
    const ok = (offense.best > 1 ? 1 : 0) + (walls.length ? 1 : 0)
    return {
      ...t,
      attackTypes,
      offense,
      walls,
      threatened,
      status: ok === 2 ? 'answered' : ok === 1 ? 'partial' : 'open',
    }
  })
}

// Medidores 0–100 para el panel de equilibrio
export function balanceScores(defense, coverage, readiness) {
  const offensive = coverage.rows.filter((r) => r.best > 1).length / coverage.rows.length
  const defensive =
    defense.reduce((acc, r) => {
      if (r.level === 'danger' || r.level === 'warn') return acc
      return acc + (r.resist + r.immune > 0 && r.weak <= 1 ? 1 : 0.5)
    }, 0) / defense.length
  const meta = readiness.length
    ? readiness.reduce(
        (a, r) => a + (r.status === 'answered' ? 1 : r.status === 'partial' ? 0.5 : 0),
        0,
      ) / readiness.length
    : 0
  return {
    offensive: Math.round(offensive * 100),
    defensive: Math.round(defensive * 100),
    meta: Math.round(meta * 100),
  }
}

// Texto Showdown para exportar el equipo
export function toShowdown(members) {
  return members
    .map(({ species, slot, ability }) => {
      const lines = [`${species.name}${slot.item ? ` @ ${slot.item}` : ''}`]
      if (ability) lines.push(`Ability: ${ability}`)
      for (const mv of slot.moves.filter(Boolean)) lines.push(`- ${mv}`)
      return lines.join('\n')
    })
    .join('\n\n')
}
