<template>
  <q-page class="builder q-pa-md">
    <section class="builder__head row items-end justify-between q-col-gutter-md q-mb-lg">
      <div class="col-12 col-md">
        <div class="builder__kicker font-display">Team Builder</div>
        <q-input
          v-model="team.name"
          borderless
          dense
          class="builder__name font-display"
          input-class="builder__name-input"
          maxlength="40"
        />
        <div class="text-dim">
          {{ team.members.length }}/6 miembros · formato
          {{ team.format === 'Doubles' ? 'Dobles' : 'Individual' }}
        </div>
      </div>
      <div class="col-12 col-md-auto row q-gutter-sm items-center">
        <FormatToggle />
        <q-btn
          flat
          no-caps
          class="pc-btn"
          icon="mdi-content-copy"
          label="Exportar"
          :disable="!team.members.length"
          @click="exportTeam"
        />
        <q-btn
          flat
          no-caps
          class="pc-btn"
          color="negative"
          icon="mdi-delete-sweep"
          label="Vaciar"
          :disable="!team.members.length"
          @click="confirmReset"
        />
      </div>
    </section>

    <!-- 6 HUECOS -->
    <section class="builder__slots q-mb-xl">
      <TeamSlotCard v-for="(s, i) in team.slots" :key="i" :index="i" />
    </section>

    <transition name="pop" mode="out-in">
      <section v-if="!team.members.length" key="empty" class="glass q-pa-xl text-center">
        <q-icon name="mdi-chart-donut" size="48px" class="text-dim" />
        <div class="text-h6 q-mt-sm">Añade Pokémon para ver el análisis de sinergia</div>
        <q-btn
          flat
          no-caps
          color="amber"
          icon="mdi-pokeball"
          label="Ir a la Pokédex"
          :to="{ name: 'home' }"
          class="q-mt-sm"
        />
      </section>

      <section v-else key="analysis">
        <!-- RESUMEN -->
        <div class="row q-col-gutter-md q-mb-md">
          <div class="col-12 col-md-4">
            <div class="glass q-pa-md full-height">
              <div class="section-title q-mb-sm"><q-icon name="mdi-alert-octagon" />Alertas</div>
              <transition-group name="list" tag="div" class="column q-gutter-sm">
                <div v-for="a in alerts" :key="a.key" class="alert" :class="`alert--${a.level}`">
                  <q-icon :name="a.icon" size="20px" />
                  <span>{{ a.text }}</span>
                </div>
              </transition-group>
              <div v-if="!alerts.length" class="alert alert--ok">
                <q-icon name="mdi-check-decagram" size="20px" />
                <span>Sin debilidades compartidas graves ni huecos de cobertura.</span>
              </div>
            </div>
          </div>

          <div class="col-12 col-md-4">
            <div class="glass q-pa-md full-height">
              <div class="section-title q-mb-sm"><q-icon name="mdi-account-hard-hat" />Roles</div>
              <div class="column q-gutter-xs">
                <div
                  v-for="(meta, key) in ROLE_META"
                  :key="key"
                  class="role-row"
                  :class="{ 'role-row--off': !roleCount[key] }"
                >
                  <q-icon :name="meta.icon" :style="{ color: meta.color }" size="20px" />
                  <span class="col">{{ meta.label }}</span>
                  <span class="role-row__count">{{ roleCount[key] || 0 }}</span>
                </div>
              </div>
              <div class="text-caption text-dim q-mt-sm">
                Inferidos de stats base, habilidad y movimientos elegidos.
              </div>
            </div>
          </div>

          <div class="col-12 col-md-4">
            <div class="glass q-pa-md full-height">
              <div class="section-title q-mb-sm">
                <q-icon name="mdi-speedometer" />Velocidad base
              </div>
              <transition-group name="list" tag="div">
                <div v-for="m in bySpeed" :key="m.index" class="speed-row">
                  <img :src="m.form.sprite" :alt="m.species.name" />
                  <span class="col ellipsis">{{ m.species.name }}</span>
                  <div class="speed-row__bar">
                    <div :style="{ width: `${(m.form.stats.spe / 160) * 100}%` }" />
                  </div>
                  <b>{{ m.form.stats.spe }}</b>
                </div>
              </transition-group>
            </div>
          </div>
        </div>

        <!-- MATRIZ DEFENSIVA -->
        <div class="glass q-pa-md q-mb-md">
          <div class="row items-center justify-between q-mb-sm">
            <div class="section-title">
              <q-icon name="mdi-shield-half-full" />Debilidades y resistencias compartidas
            </div>
            <div class="legend text-caption">
              <span class="cell cell--x4">4×</span><span class="cell cell--x2">2×</span
              ><span class="cell cell--h">½×</span> <span class="cell cell--q">¼×</span
              ><span class="cell cell--immune">0×</span>
            </div>
          </div>
          <TeamDefenseMatrix :members="team.members" :rows="defense" />
        </div>

        <!-- COBERTURA OFENSIVA -->
        <div class="glass q-pa-md">
          <div class="section-title q-mb-xs">
            <q-icon name="mdi-sword-cross" />Cobertura ofensiva
          </div>
          <div class="text-caption text-dim q-mb-md">
            Mejor multiplicador que el equipo consigue contra cada tipo.
            <span v-if="coverage.usesStabFallback">
              Los miembros sin movimientos elegidos cuentan con su STAB teórico.
            </span>
          </div>
          <div class="coverage">
            <div
              v-for="row in coverage.rows"
              :key="row.type"
              class="coverage__cell"
              :class="
                row.best > 1
                  ? 'coverage__cell--se'
                  : row.best < 1
                    ? 'coverage__cell--bad'
                    : 'coverage__cell--neutral'
              "
            >
              <TypeBadge :type="row.type" size="sm" />
              <span class="coverage__mult">{{ formatMult(row.best) }}</span>
              <q-tooltip v-if="row.hitters.length" max-width="280px">
                <div v-for="h in row.hitters" :key="h">{{ h }}</div>
              </q-tooltip>
            </div>
          </div>
        </div>
      </section>
    </transition>
  </q-page>
</template>

<script setup>
import { computed } from 'vue'
import { useQuasar, copyToClipboard } from 'quasar'
import TeamSlotCard from '@/components/team/TeamSlotCard.vue'
import TeamDefenseMatrix from '@/components/team/TeamDefenseMatrix.vue'
import TypeBadge from '@/components/TypeBadge.vue'
import FormatToggle from '@/components/FormatToggle.vue'
import { useTeamStore } from '@/stores/team.js'
import { useMoveData } from '@/composables/useMoveData.js'
import { TYPES, formatMult } from '@/utils/types.js'
import { inferRoles, ROLE_META } from '@/utils/roles.js'
import {
  defensiveAnalysis,
  offensiveCoverage,
  toShowdown,
  SHARED_WEAKNESS_ALERT,
} from '@/utils/teamAnalysis.js'

const $q = useQuasar()
const team = useTeamStore()
const moveData = useMoveData()

const movesByMember = computed(() =>
  team.members.map((m) =>
    moveData.value
      ? m.slot.moves.map((n) => n && moveData.value.movesByName.get(n)).filter(Boolean)
      : [],
  ),
)

const defense = computed(() => defensiveAnalysis(team.members))
const coverage = computed(() => offensiveCoverage(team.members, movesByMember.value))

const roleCount = computed(() => {
  const count = {}
  team.members.forEach((m, i) => {
    for (const r of inferRoles(m.form, m.ability, movesByMember.value[i]))
      count[r] = (count[r] || 0) + 1
  })
  return count
})

const bySpeed = computed(() =>
  [...team.members].sort((a, b) => b.form.stats.spe - a.form.stats.spe),
)

const alerts = computed(() => {
  const list = []
  for (const row of defense.value) {
    if (row.level !== 'danger') continue
    const es = TYPES[row.type].es
    list.push({
      key: `def-${row.type}`,
      level: 'danger',
      icon: 'mdi-shield-alert',
      text:
        row.weak >= SHARED_WEAKNESS_ALERT
          ? `${row.weak} miembros débiles a ${es} (${row.resist + row.immune} lo resisten)`
          : `${es}: ${row.weak} débiles frente a ${row.resist + row.immune} resistencias`,
    })
  }
  const holes = coverage.value.rows.filter((r) => r.best < 1).map((r) => TYPES[r.type].es)
  if (holes.length) {
    list.push({
      key: 'off-holes',
      level: 'warn',
      icon: 'mdi-sword-cross',
      text: `Sin daño neutro contra: ${holes.join(', ')}`,
    })
  }
  const noSE = coverage.value.rows.filter((r) => r.best <= 1).length
  if (noSE >= 6) {
    list.push({
      key: 'off-se',
      level: 'warn',
      icon: 'mdi-target',
      text: `${noSE} tipos sin golpe supereficaz`,
    })
  }
  const seen = new Set()
  for (const m of team.members) {
    if (seen.has(m.species.key)) {
      list.push({
        key: `dup-${m.species.key}`,
        level: 'warn',
        icon: 'mdi-content-duplicate',
        text: `${m.species.name} repetido en el equipo`,
      })
    }
    seen.add(m.species.key)
  }
  if (team.members.length >= 4 && !roleCount.value.speed && !roleCount.value.fast) {
    list.push({
      key: 'speed',
      level: 'info',
      icon: 'mdi-wind-turbine',
      text: 'Sin control de velocidad ni Pokémon rápidos',
    })
  }
  return list
})

function exportTeam() {
  copyToClipboard(toShowdown(team.members))
    .then(() =>
      $q.notify({
        color: 'dark',
        icon: 'mdi-content-copy',
        iconColor: 'amber',
        message: 'Equipo copiado en formato Showdown',
      }),
    )
    .catch(() => $q.notify({ type: 'negative', message: 'No se pudo copiar al portapapeles' }))
}

function confirmReset() {
  $q.dialog({
    title: 'Vaciar equipo',
    message: '¿Quitar a los 6 miembros?',
    cancel: { flat: true, label: 'Cancelar', noCaps: true },
    ok: { color: 'negative', label: 'Vaciar', noCaps: true },
  }).onOk(team.reset)
}
</script>

<style lang="scss" scoped>
.builder {
  max-width: 1400px;
  margin: 0 auto;

  &__kicker {
    color: var(--pc-accent-2);
    text-transform: uppercase;
    font-weight: 700;
    letter-spacing: 0.2em;
    font-size: 0.85rem;
  }
  &__name :deep(.builder__name-input) {
    font-family: var(--pc-font-display);
    font-size: clamp(1.8rem, 4vw, 2.6rem);
    font-weight: 700;
    color: var(--pc-text);
  }
  &__slots {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(290px, 1fr));
    gap: 16px;
  }
}

.alert {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  border-radius: 10px;
  font-size: 0.88rem;
  &--danger {
    background: rgba(255, 77, 109, 0.12);
    border: 1px solid rgba(255, 77, 109, 0.4);
    color: #ffb3c1;
    animation: pc-warn-pulse 2s ease-in-out infinite;
  }
  &--warn {
    background: rgba(255, 176, 58, 0.1);
    border: 1px solid rgba(255, 176, 58, 0.35);
    color: #ffd59a;
  }
  &--info {
    background: rgba(61, 224, 255, 0.08);
    border: 1px solid rgba(61, 224, 255, 0.3);
    color: #b5f3ff;
  }
  &--ok {
    background: rgba(52, 224, 161, 0.1);
    border: 1px solid rgba(52, 224, 161, 0.35);
    color: #a6f5d6;
  }
}

.role-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 3px 0;
  transition: opacity 0.3s;
  &--off {
    opacity: 0.35;
  }
  &__count {
    font-weight: 800;
    font-variant-numeric: tabular-nums;
  }
}

.speed-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 2px 0;
  img {
    width: 32px;
    height: 32px;
    object-fit: contain;
  }
  &__bar {
    width: 40%;
    height: 6px;
    border-radius: 3px;
    background: rgba(255, 255, 255, 0.07);
    div {
      height: 100%;
      border-radius: inherit;
      background: linear-gradient(90deg, #7ac74c, #f7d02c);
      transition: width 0.6s var(--pc-ease);
    }
  }
}

.legend {
  display: flex;
  gap: 4px;
  .cell {
    padding: 2px 8px;
    border-radius: 5px;
    font-weight: 800;
  }
}
.cell--x4 {
  background: #c9184a;
  color: #fff;
}
.cell--x2 {
  background: rgba(255, 77, 109, 0.55);
  color: #fff;
}
.cell--h {
  background: rgba(52, 224, 161, 0.35);
}
.cell--q {
  background: rgba(52, 224, 161, 0.65);
  color: #062;
}
.cell--immune {
  background: rgba(180, 140, 255, 0.55);
  color: #fff;
}

.coverage {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 8px;
  &__cell {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 6px 10px 6px 6px;
    border-radius: 12px;
    border: 1px solid transparent;
    transition: transform 0.2s var(--pc-ease);
    &:hover {
      transform: translateY(-2px);
    }
    &--se {
      background: rgba(52, 224, 161, 0.1);
      border-color: rgba(52, 224, 161, 0.35);
      .coverage__mult {
        color: var(--pc-ok);
      }
    }
    &--neutral {
      background: rgba(255, 255, 255, 0.04);
      .coverage__mult {
        color: var(--pc-text-dim);
      }
    }
    &--bad {
      background: rgba(255, 77, 109, 0.1);
      border-color: rgba(255, 77, 109, 0.4);
      .coverage__mult {
        color: var(--pc-danger);
      }
    }
  }
  &__mult {
    font-weight: 800;
  }
}
</style>
