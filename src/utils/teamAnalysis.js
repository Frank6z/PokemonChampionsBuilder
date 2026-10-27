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
export function offensiveCoverage(members, movesByMember) {
  const attackers = members.map((m, i) => {
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

  const rows = TYPE_IDS.map((defType) => {
    let best = 0
    const hitters = []
    for (const a of attackers) {
      for (const src of a.sources) {
        const mult = attackMultiplier(src.type, [defType])
        if (mult > best) best = mult
        if (mult > 1) hitters.push(`${a.name}: ${src.label}`)
      }
    }
    return { type: defType, best, hitters: [...new Set(hitters)] }
  })

  return { rows, usesStabFallback: attackers.some((a) => a.fromStab) }
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
