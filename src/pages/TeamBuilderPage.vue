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

    <div class="builder__layout">
      <!-- 6 HUECOS (arrastra uno sobre otro para reordenar) -->
      <section class="builder__slots">
        <TeamSlotCard v-for="(s, i) in team.slots" :key="i" :index="i" />
      </section>

      <!-- PANEL LATERAL: recomendaciones heurísticas + compañeros frecuentes (datos de uso) -->
      <aside ref="asideEl" class="builder__aside">
        <section class="glass q-pa-md smart-panel">
          <div class="section-title q-mb-xs">
            <q-icon name="mdi-creation" />Smart Recommendations
          </div>
          <div class="text-caption text-dim q-mb-md">
            {{
              !team.members.length
                ? 'Pilares del meta para empezar tu equipo.'
                : team.isFull
                  ? 'Cambios que mejoran los medidores del equipo.'
                  : 'Complementos según cobertura, roles y debilidades.'
            }}
          </div>
          <SmartRecommendations
            :recommendations="recommendations"
            :loading="!moveData"
            :full="team.isFull"
            @apply="applyRec"
            @details="selectedRec = $event"
          />
        </section>

        <section v-if="team.members.length && !team.isFull" class="glass q-pa-md">
          <div class="section-title q-mb-sm">
            <q-icon name="mdi-link-variant" />Compañeros frecuentes
          </div>
          <TeammateSuggestions />
        </section>
      </aside>

      <div class="builder__main">
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
            <!-- EQUILIBRIO -->
            <TeamBalanceMeters
              :scores="scores"
              :format="team.format"
              :threat-count="THREAT_COUNT"
              class="q-mb-md"
            />

            <!-- DIAGNÓSTICO -->
            <div class="section-title q-mb-sm">
              <q-icon name="mdi-stethoscope" />Diagnóstico de equipo
            </div>
            <TeamDiagnosis :report="report" class="q-mb-md" @apply="applyRec" />

            <!-- RESUMEN -->
            <div class="row q-col-gutter-md q-mb-md">
              <div class="col-12 col-md-6">
                <div class="glass q-pa-md full-height">
                  <div class="section-title q-mb-sm">
                    <q-icon name="mdi-account-hard-hat" />Roles
                  </div>
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

              <div class="col-12 col-md-6">
                <div class="glass q-pa-md full-height">
                  <div class="section-title q-mb-sm">
                    <q-icon name="mdi-speedometer" />Velocidad base
                  </div>
                  <transition-group name="list" tag="div">
                    <div v-for="m in bySpeed" :key="m.index" class="speed-row">
                      <PokeSprite :form="m.form" :alt="m.species.name" :size="32" variant="mini" />
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

            <!-- AMENAZAS DEL META -->
            <div class="glass q-pa-md q-mt-md">
              <div class="section-title q-mb-xs">
                <q-icon name="mdi-sword-cross" />Amenazas del meta
              </div>
              <div class="text-caption text-dim q-mb-md">
                Top {{ THREAT_COUNT }} de uso en
                {{ team.format === 'Doubles' ? 'Dobles' : 'Individual' }} ({{
                  rankingMeta.generatedAt
                }}). La forma Mega se deduce de su objeto más usado.
                <span class="text-positive">Escudo verde</span>: lo golpeas supereficaz y alguien
                resiste sus ataques.
              </div>
              <MetaThreats :threats="readiness" />
            </div>
          </section>
        </transition>
      </div>
    </div>

    <RecommendationDialog
      :rec="selectedRec"
      :scores="scores"
      @close="selectedRec = null"
      @apply="applyRec"
    />

    <!-- Acceso rápido al panel cuando no está fijo en el lateral -->
    <q-page-sticky position="bottom-right" :offset="[18, 18]" class="builder__fab">
      <q-btn
        fab
        icon="mdi-creation"
        class="pc-btn builder__fab-btn"
        aria-label="Ver recomendaciones"
        @click="asideEl?.scrollIntoView({ behavior: 'smooth', block: 'start' })"
      >
        <q-badge v-if="recommendations.length" floating rounded color="amber" text-color="dark">
          {{ recommendations.length }}
        </q-badge>
        <q-tooltip anchor="center left" self="center right">Smart Recommendations</q-tooltip>
      </q-btn>
    </q-page-sticky>
  </q-page>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useQuasar, copyToClipboard } from 'quasar'
import TeamSlotCard from '@/components/team/TeamSlotCard.vue'
import TeamDefenseMatrix from '@/components/team/TeamDefenseMatrix.vue'
import TeamBalanceMeters from '@/components/team/TeamBalanceMeters.vue'
import MetaThreats from '@/components/team/MetaThreats.vue'
import TeammateSuggestions from '@/components/team/TeammateSuggestions.vue'
import SmartRecommendations from '@/components/team/SmartRecommendations.vue'
import RecommendationDialog from '@/components/team/RecommendationDialog.vue'
import TeamDiagnosis from '@/components/team/TeamDiagnosis.vue'
import PokeSprite from '@/components/PokeSprite.vue'
import TypeBadge from '@/components/TypeBadge.vue'
import FormatToggle from '@/components/FormatToggle.vue'
import { useTeamStore } from '@/stores/team.js'
import { useMoveData } from '@/composables/useMoveData.js'
import { formatMult } from '@/utils/types.js'
import { ROLE_META } from '@/utils/roles.js'
import { topThreats, rankingMeta } from '@/services/ranking.js'
import { teamContext, recommend } from '@/utils/recommendations.js'
import { diagnose } from '@/utils/diagnosis.js'
import {
  defensiveAnalysis,
  offensiveCoverage,
  metaReadiness,
  balanceScores,
  toShowdown,
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

const THREAT_COUNT = 12
const threats = computed(() => topThreats(team.format, THREAT_COUNT))
const readiness = computed(() =>
  metaReadiness(team.members, movesByMember.value, threats.value, moveData.value?.movesByName),
)
const scores = computed(() => balanceScores(defense.value, coverage.value, readiness.value))

// Contexto compartido por las recomendaciones y el diagnóstico
const ctx = computed(() =>
  teamContext(
    team.members,
    movesByMember.value,
    threats.value,
    moveData.value?.movesByName,
    moveData.value?.learnsets,
  ),
)
const roleCount = computed(() => ctx.value.roles)

const recommendations = computed(() =>
  moveData.value
    ? recommend({
        ctx: ctx.value,
        format: team.format,
        threats: threats.value,
        movesByName: moveData.value.movesByName,
        learnsets: moveData.value.learnsets,
      })
    : [],
)
const report = computed(() =>
  diagnose({
    ctx: ctx.value,
    format: team.format,
    recommendations: recommendations.value,
    learnsets: moveData.value?.learnsets,
  }),
)

const bySpeed = computed(() =>
  [...team.members].sort((a, b) => b.form.stats.spe - a.form.stats.spe),
)

const asideEl = ref(null)
const selectedRec = ref(null)

function applyRec(rec) {
  const index = rec.replaces ? rec.replaces.index : team.slots.findIndex((s) => !s.key)
  if (index === -1) return
  team.setMember(index, rec.species.key, rec.formIndex)
  team.slots[index].ability = rec.ability
  selectedRec.value = null
  $q.notify({
    color: 'dark',
    avatar: rec.form.sprite,
    message: rec.replaces
      ? `${rec.species.name} sustituye a ${rec.replaces.species.name}`
      : `${rec.species.name} añadido al equipo`,
    caption: rec.reasons[0]?.text,
  })
}

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
    grid-area: slots;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(290px, 1fr));
    gap: 16px;
  }

  // móvil/tablet: huecos → panel → análisis; escritorio: panel fijo a la derecha
  &__layout {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    grid-template-areas: 'slots' 'aside' 'main';
    gap: 24px;
  }
  &__main {
    grid-area: main;
    min-width: 0;
  }
  &__aside {
    grid-area: aside;
    display: flex;
    flex-direction: column;
    gap: 16px;
    scroll-margin-top: 70px;
  }
  &__fab-btn {
    background: linear-gradient(135deg, var(--pc-accent-2), var(--pc-accent));
    color: #111;
    box-shadow: 0 6px 24px color-mix(in srgb, var(--pc-accent) 45%, transparent);
  }

  @media (min-width: 1200px) {
    &__layout {
      grid-template-columns: minmax(0, 1fr) 340px;
      grid-template-areas: 'slots aside' 'main aside';
      grid-template-rows: auto 1fr;
    }
    &__aside {
      position: sticky;
      top: 70px;
      align-self: start;
      max-height: calc(100vh - 86px);
      overflow-y: auto;
      overscroll-behavior: contain;
      scrollbar-width: thin;
    }
    &__fab {
      display: none;
    }
  }
}

.smart-panel {
  border-top: 3px solid var(--pc-accent-2);
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
