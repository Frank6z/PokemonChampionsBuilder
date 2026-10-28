// Diagnóstico del equipo: por qué funciona, por qué puede fallar y cómo mejorarlo.
// Reglas propias y explícitas sobre el contexto de utils/recommendations.js → teamContext().
import { TYPES, TYPE_IDS, defensiveMultiplier, attackMultiplier } from '@/utils/types.js'
import { topThreats } from '@/services/ranking.js'

const es = (t) => TYPES[t].es

// Bayas que reducen a la mitad el primer golpe supereficaz de su tipo
const RESIST_BERRY = {
  Fire: 'Occa Berry',
  Water: 'Passho Berry',
  Electric: 'Wacan Berry',
  Grass: 'Rindo Berry',
  Ice: 'Yache Berry',
  Fighting: 'Chople Berry',
  Poison: 'Kebia Berry',
  Ground: 'Shuca Berry',
  Flying: 'Coba Berry',
  Psychic: 'Payapa Berry',
  Bug: 'Tanga Berry',
  Rock: 'Charti Berry',
  Ghost: 'Kasib Berry',
  Dragon: 'Haban Berry',
  Dark: 'Colbur Berry',
  Steel: 'Babiri Berry',
  Fairy: 'Roseli Berry',
}

const PROTECT_MOVES = [
  'Protect',
  'Detect',
  'Spiky Shield',
  "King's Shield",
  'Baneful Bunker',
  'Silk Trap',
  'Burning Bulwark',
]
const SPEED_CONTROL = ['Tailwind', 'Trick Room', 'Icy Wind', 'Electroweb', 'Thunder Wave']

function weaknessesOf(m) {
  return TYPE_IDS.filter((t) => defensiveMultiplier(t, m.form.types, m.ability) > 1)
}

// Dos miembros forman núcleo si cada uno resiste (o es inmune a) todas las debilidades del otro
function defensiveCores(members) {
  const cores = []
  for (let i = 0; i < members.length; i++) {
    for (let j = i + 1; j < members.length; j++) {
      const a = members[i]
      const b = members[j]
      const covers = (x, y) =>
        weaknessesOf(x).every((t) => defensiveMultiplier(t, y.form.types, y.ability) < 1)
      if (weaknessesOf(a).length && weaknessesOf(b).length && covers(a, b) && covers(b, a)) {
        cores.push([a, b])
      }
    }
  }
  return cores
}

export function diagnose({ ctx, format, recommendations = [], learnsets }) {
  const { members, movesByMember, defense, coverage, readiness, scores } = ctx
  const strengths = []
  const risks = []
  const steps = []
  if (!members.length) return { strengths, risks, steps }

  const withMoves = members.filter((m, i) => movesByMember[i]?.length)
  const damaging = movesByMember.flat().filter((mv) => mv.category !== 'Status')
  const recFor = (pred) => recommendations.find(pred)

  // ---------- Por qué funciona ----------
  const seCount = coverage.rows.filter((r) => r.best > 1).length
  if (seCount >= 15) {
    strengths.push({
      icon: 'mdi-sword-cross',
      title: 'Cobertura ofensiva excelente',
      detail: `Golpeas supereficaz a ${seCount} de 18 tipos.`,
    })
  } else if (seCount >= 12) {
    strengths.push({
      icon: 'mdi-sword-cross',
      title: 'Buena cobertura ofensiva',
      detail: `Supereficaz contra ${seCount} de 18 tipos.`,
    })
  }

  const dangers = defense.filter((r) => r.level === 'danger')
  if (!dangers.length && members.length >= 3 && scores.defensive >= 65) {
    strengths.push({
      icon: 'mdi-shield-check',
      title: 'Defensa equilibrada',
      detail: 'Ningún tipo pone en apuros a la mitad del equipo.',
    })
  }

  for (const [a, b] of defensiveCores(members).slice(0, 2)) {
    strengths.push({
      icon: 'mdi-link-variant',
      title: `Núcleo defensivo ${a.species.name} + ${b.species.name}`,
      detail: 'Cada uno resiste las debilidades del otro: pueden rotar entre ellos.',
    })
  }

  for (const row of defense) {
    if (row.weak >= 2 && row.immune >= 1) {
      const absorber = members.find(
        (m) => defensiveMultiplier(row.type, m.form.types, m.ability) === 0,
      )
      strengths.push({
        icon: 'mdi-shield-star',
        title: `${absorber.species.name} absorbe ${es(row.type)}`,
        detail: `Es inmune a un tipo que amenaza a ${row.weak} de tus Pokémon.`,
      })
    }
  }

  const answered = readiness.filter((r) => r.status === 'answered').length
  if (members.length >= 3 && answered >= Math.ceil(readiness.length * 0.6)) {
    strengths.push({
      icon: 'mdi-trophy',
      title: 'Preparado para el meta',
      detail: `Respuesta completa a ${answered} de las ${readiness.length} amenazas más usadas.`,
    })
  }

  const phys = damaging.filter((mv) => mv.category === 'Physical').length
  const spec = damaging.filter((mv) => mv.category === 'Special').length
  if (phys >= 2 && spec >= 2) {
    strengths.push({
      icon: 'mdi-sword',
      title: 'Ataque mixto',
      detail: 'Daño físico y especial: un solo muro no te frena.',
    })
  }

  if (
    format === 'Doubles' &&
    withMoves.some(
      (m) =>
        m.ability === 'Intimidate' ||
        movesByMember[members.indexOf(m)].some((mv) => mv.name === 'Fake Out'),
    )
  ) {
    strengths.push({
      icon: 'mdi-hand-heart',
      title: 'Apoyo de Dobles',
      detail: 'Intimidate o Fake Out te dan turnos libres y debilitan a los atacantes físicos.',
    })
  }

  // ---------- Por qué puede fallar ----------
  for (const m of members) {
    for (const t of TYPE_IDS) {
      if (defensiveMultiplier(t, m.form.types, m.ability) >= 4) {
        risks.push({
          level: 'high',
          icon: 'mdi-alert-octagon',
          title: `${m.species.name}: debilidad 4× a ${es(t)}`,
          detail: 'Un solo golpe de ese tipo suele dejarlo fuera de combate.',
          type: t,
          member: m,
        })
      }
    }
  }

  for (const row of dangers) {
    risks.push({
      level: 'high',
      icon: 'mdi-shield-alert',
      title: `${row.weak} miembros débiles a ${es(row.type)}`,
      detail: `${row.resist + row.immune ? `Solo ${row.resist + row.immune} lo resiste${row.resist + row.immune > 1 ? 'n' : ''}` : 'Nadie lo resiste'}. Un atacante de ${es(row.type)} puede barrer al equipo.`,
      type: row.type,
    })
  }

  const open = readiness.filter((r) => r.status === 'open')
  for (const t of open.slice(0, 3)) {
    risks.push({
      level: 'medium',
      icon: 'mdi-target',
      title: `Sin respuesta a ${t.form.isMega ? t.form.fullName : t.species.name} (#${t.rank})`,
      detail: 'Nadie le golpea supereficaz ni resiste sus ataques principales.',
      threat: t,
    })
  }

  const walls = coverage.rows.filter((r) => r.best < 1).map((r) => es(r.type))
  if (walls.length) {
    risks.push({
      level: 'medium',
      icon: 'mdi-wall',
      title: `Sin daño neutro contra ${walls.join(', ')}`,
      detail: 'Un Pokémon de ese tipo puede quedarse en el campo sin miedo a tus ataques.',
    })
  }

  const seen = new Set()
  for (const m of members) {
    if (seen.has(m.species.key)) {
      risks.push({
        level: 'low',
        icon: 'mdi-content-duplicate',
        title: `${m.species.name} repetido`,
        detail: 'La cláusula de especie no permite dos iguales en el mismo equipo.',
      })
    }
    seen.add(m.species.key)
  }

  const rockWeak = members.filter((m) => defensiveMultiplier('Rock', m.form.types, m.ability) > 1)
  if (format === 'Singles' && rockWeak.length >= 2 && !ctx.hasHazardRemoval) {
    risks.push({
      level: 'medium',
      icon: 'mdi-terrain',
      title: 'Vulnerable a Stealth Rock',
      detail: `${rockWeak.map((m) => m.species.name).join(', ')} pierden mucha vida al entrar y nadie lleva Rapid Spin o Defog.`,
    })
  }

  if (format === 'Doubles' && withMoves.length >= 3 && !ctx.hasSpeedControl) {
    risks.push({
      level: 'medium',
      icon: 'mdi-wind-turbine',
      title: 'Sin control de velocidad',
      detail: 'Ni Tailwind, ni Trick Room, ni Icy Wind: los rivales rápidos atacan primero.',
    })
  }

  if (damaging.length >= 4 && (!phys || !spec)) {
    risks.push(
      phys
        ? {
            level: 'medium',
            icon: 'mdi-sword',
            title: 'Todo tu daño es físico',
            detail: 'Intimidate y las quemaduras (Will-O-Wisp) reducen el daño de todo el equipo.',
          }
        : {
            level: 'medium',
            icon: 'mdi-creation',
            title: 'Todo tu daño es especial',
            detail: 'Assault Vest, Snarl o los muros especiales te frenan sin respuesta.',
          },
    )
  }

  const noProtect =
    format === 'Doubles'
      ? members.filter(
          (m, i) =>
            movesByMember[i]?.length === 4 &&
            !movesByMember[i].some((mv) => PROTECT_MOVES.includes(mv.name)),
        )
      : []
  if (noProtect.length >= 2) {
    risks.push({
      level: 'low',
      icon: 'mdi-shield-off',
      title: `${noProtect.length} miembros sin Protect`,
      detail: 'En Dobles, Protect es clave para esquivar ataques dobles y ganar turnos.',
    })
  }

  const empty = members.length - withMoves.length
  if (empty) {
    risks.push({
      level: 'low',
      icon: 'mdi-help-rhombus',
      title: `${empty} miembro(s) sin movimientos`,
      detail: 'El análisis usa su STAB teórico; elige movimientos para un diagnóstico preciso.',
    })
  }

  const order = { high: 0, medium: 1, low: 2 }
  risks.sort((a, b) => order[a.level] - order[b.level])

  // ---------- Cómo mejorarlo (pasos accionables) ----------
  for (const row of dangers.slice(0, 2)) {
    const rec = recFor((r) => defensiveMultiplier(row.type, r.form.types, r.ability) < 1)
    steps.push(
      rec
        ? {
            icon: 'mdi-account-plus',
            text: `${rec.replaces ? `Sustituye a ${rec.replaces.species.name} por` : 'Añade a'} ${rec.species.name}: ${defensiveMultiplier(row.type, rec.form.types, rec.ability) === 0 ? 'es inmune' : 'resiste'} a ${es(row.type)}.`,
            action: { type: 'add', rec },
          }
        : {
            icon: 'mdi-account-search',
            text: `Busca un Pokémon que resista ${es(row.type)} para repartir los golpes.`,
          },
    )
  }

  for (const r of risks.filter((x) => x.icon === 'mdi-alert-octagon').slice(0, 2)) {
    steps.push({
      icon: 'mdi-fruit-cherries',
      text: `Equipa a ${r.member.species.name} una ${RESIST_BERRY[r.type]}: reduce a la mitad el primer golpe de ${es(r.type)}.`,
    })
  }

  for (const t of open.slice(0, 2)) {
    const seTypes = TYPE_IDS.filter((x) => attackMultiplier(x, t.form.types) > 1).map(es)
    steps.push({
      icon: 'mdi-target-account',
      text: `Contra ${t.form.isMega ? t.form.fullName : t.species.name}: lleva un ataque de ${seTypes.slice(0, 3).join(', ')} o un Pokémon que resista ${t.attackTypes.map(es).join(' y ')}.`,
    })
  }

  if (format === 'Doubles' && withMoves.length >= 3 && !ctx.hasSpeedControl) {
    const learner = members.find((m) =>
      SPEED_CONTROL.some((mv) => learnsets?.[m.species.key]?.includes(mv)),
    )
    if (learner) {
      const mv = SPEED_CONTROL.find((x) => learnsets[learner.species.key].includes(x))
      steps.push({
        icon: 'mdi-wind-turbine',
        text: `Enseña ${mv} a ${learner.species.name} para controlar la velocidad.`,
      })
    }
  }

  if (format === 'Singles' && rockWeak.length >= 2 && !ctx.hasHazardRemoval) {
    const remover = members.find((m) =>
      ['Rapid Spin', 'Defog'].some((mv) => learnsets?.[m.species.key]?.includes(mv)),
    )
    // ejemplos sacados del ranking: los más usados que aprenden Rapid Spin o Defog
    const examples = topThreats(format, 50)
      .filter((r) => ['Rapid Spin', 'Defog'].some((mv) => learnsets?.[r.id]?.includes(mv)))
      .slice(0, 2)
      .map((r) => r.species.name)
    steps.push({
      icon: 'mdi-broom',
      text: remover
        ? `Enseña Rapid Spin o Defog a ${remover.species.name}.`
        : `Incluye un Pokémon con Rapid Spin o Defog${examples.length ? ` (p. ej. ${examples.join(', ')})` : ''}.`,
    })
  }

  if (noProtect.length >= 2) {
    steps.push({
      icon: 'mdi-shield',
      text: `Añade Protect a ${noProtect.map((m) => m.species.name).join(' y ')}.`,
    })
  }
  if (empty)
    steps.push({
      icon: 'mdi-auto-fix',
      text: 'Pulsa "Set meta" en los huecos sin movimientos para cargar el set más usado.',
    })

  const firstRec = recommendations[0]
  if (members.length < 6 && firstRec && !steps.some((s) => s.action?.rec === firstRec)) {
    steps.push({
      icon: 'mdi-account-plus',
      text: `Completa el equipo con ${firstRec.species.name}: ${firstRec.reasons[0]?.text.toLowerCase() || 'mejor encaje'}.`,
      action: { type: 'add', rec: firstRec },
    })
  }

  return { strengths: strengths.slice(0, 6), risks: risks.slice(0, 7), steps: steps.slice(0, 6) }
}
