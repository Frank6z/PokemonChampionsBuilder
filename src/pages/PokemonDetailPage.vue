<template>
  <q-page v-if="species" class="detail q-pa-md" :style="{ '--c1': c1, '--c2': c2 }">
    <div class="detail__nav row items-center justify-between q-mb-md">
      <q-btn
        flat
        no-caps
        class="pc-btn"
        icon="mdi-arrow-left"
        label="Pokédex"
        :to="{ name: 'home' }"
      />
      <div class="row q-gutter-sm">
        <q-btn flat round class="pc-btn" icon="mdi-chevron-left" :to="neighbor(-1)"
          ><q-tooltip>Anterior</q-tooltip></q-btn
        >
        <q-btn flat round class="pc-btn" icon="mdi-chevron-right" :to="neighbor(1)"
          ><q-tooltip>Siguiente</q-tooltip></q-btn
        >
      </div>
    </div>

    <!-- HERO -->
    <section class="hero glass metal-border q-mb-lg">
      <div class="hero__bg" />
      <div class="row q-col-gutter-lg items-center relative-position">
        <div class="col-12 col-md-5 hero__art">
          <div class="hero__ring" />
          <transition name="pop" mode="out-in">
            <img
              :key="form.sprite"
              :src="form.sprite"
              :alt="`${species.name} ${form.name}`"
              class="float"
            />
          </transition>
        </div>

        <div class="col-12 col-md-7">
          <div class="text-dim font-display hero__dex">
            #{{ String(species.dexNumber).padStart(4, '0') }} · {{ species.category }}
          </div>
          <h1 class="hero__name font-display">{{ species.name }}</h1>

          <q-tabs
            v-if="species.forms.length > 1"
            v-model="formIndex"
            dense
            no-caps
            inline-label
            align="left"
            active-color="amber"
            indicator-color="amber"
            class="q-mb-md hero__forms"
          >
            <q-tab
              v-for="(f, i) in species.forms"
              :key="f.name"
              :name="i"
              :label="f.name"
              :icon="f.isMega ? 'mdi-dna' : undefined"
            />
          </q-tabs>

          <div class="row q-gutter-sm q-mb-md">
            <TypeBadge v-for="t in form.types" :key="t" :type="t" size="lg" />
          </div>

          <div class="text-caption text-dim q-mb-xs">
            Habilidades · toca una para ver su efecto en la tabla de tipos
          </div>
          <div class="row q-gutter-sm q-mb-md">
            <q-chip
              v-for="a in form.abilities"
              :key="a.name"
              clickable
              :outline="selectedAbility !== a.name"
              :color="selectedAbility === a.name ? 'amber' : undefined"
              :text-color="selectedAbility === a.name ? 'dark' : undefined"
              :icon="a.hidden ? 'mdi-eye-off' : 'mdi-star-four-points'"
              class="pc-btn"
              @click="selectedAbility = a.name"
            >
              {{ a.name }}
              <q-badge v-if="a.hidden" color="purple-5" label="Oculta" class="q-ml-xs" />
              <span v-if="abilityUsage(a.name) != null" class="q-ml-xs text-caption"
                >· {{ abilityUsage(a.name) }}%</span
              >
            </q-chip>
          </div>

          <StatBars :stats="form.stats" :compare="form.isMega ? species.forms[0].stats : null" />

          <div class="row q-gutter-sm q-mt-md">
            <q-btn
              unelevated
              no-caps
              class="pc-btn hero__cta"
              icon="mdi-account-multiple-plus"
              label="Añadir al equipo"
              @click="addToTeam"
            />
            <q-btn
              outline
              no-caps
              class="pc-btn"
              icon="mdi-open-in-new"
              label="WikiDex"
              :href="wikiUrl"
              target="_blank"
            />
            <q-chip
              v-if="form.status !== 'confirmed'"
              outline
              color="grey-5"
              icon="mdi-help-circle-outline"
              class="q-ml-sm"
            >
              Datos sin verificar
              <q-tooltip max-width="320px">{{
                form.notes || 'Sin fuente oficial registrada.'
              }}</q-tooltip>
            </q-chip>
          </div>
        </div>
      </div>
    </section>

    <!-- SECCIONES -->
    <div class="row items-center justify-between q-col-gutter-y-sm q-mb-sm">
      <q-tabs
        v-model="tab"
        dense
        no-caps
        align="left"
        active-color="amber"
        indicator-color="amber"
        outside-arrows
        mobile-arrows
        class="detail__tabs col-12 col-sm-auto"
      >
        <q-tab name="meta" icon="mdi-trophy" label="Competitivo" />
        <q-tab name="moves" icon="mdi-sword-cross" label="Movimientos" />
        <q-tab name="types" icon="mdi-shield-half-full" label="Tipos" />
        <q-tab name="dex" icon="mdi-book-open-variant" label="Pokédex" />
      </q-tabs>
      <FormatToggle />
    </div>

    <q-tab-panels
      v-model="tab"
      animated
      transition-prev="jump-right"
      transition-next="jump-left"
      class="bg-transparent"
    >
      <q-tab-panel name="meta" class="q-px-none">
        <UsagePanel
          :usage="usage"
          :loading="usageLoading"
          :error="usageError"
          @retry="reloadUsage"
        />
      </q-tab-panel>

      <q-tab-panel name="moves" class="q-px-none">
        <div class="glass q-pa-md">
          <div class="section-title q-mb-md">
            <q-icon name="mdi-sword-cross" />Arsenal de movimientos
          </div>
          <MoveArsenal :species="species" :form="form" :usage="usage" :format="team.format" />
        </div>
      </q-tab-panel>

      <q-tab-panel name="types" class="q-px-none">
        <div class="glass q-pa-md">
          <div class="section-title q-mb-md">
            <q-icon name="mdi-shield-half-full" />Defensa de tipos · {{ form.name }}
          </div>
          <TypeMatchups :types="form.types" :ability="selectedAbility" />
        </div>
      </q-tab-panel>

      <q-tab-panel name="dex" class="q-px-none">
        <div class="glass q-pa-md">
          <div class="section-title q-mb-md">
            <q-icon name="mdi-book-open-variant" />{{ entry.species }}
          </div>
          <p class="text-body1">{{ entry.description }}</p>
          <div class="row q-col-gutter-md q-mt-sm">
            <div v-for="f in dexFacts" :key="f.label" class="col-6 col-md-3">
              <div class="dex-fact">
                <q-icon :name="f.icon" size="22px" class="text-amber" />
                <div class="text-caption text-dim">{{ f.label }}</div>
                <div class="text-weight-bold">{{ f.value }}</div>
              </div>
            </div>
          </div>
          <div v-if="entry.status !== 'confirmed'" class="text-caption text-dim q-mt-md">
            {{ entry.notes }}
          </div>
        </div>
      </q-tab-panel>
    </q-tab-panels>
  </q-page>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import TypeBadge from '@/components/TypeBadge.vue'
import StatBars from '@/components/StatBars.vue'
import MoveArsenal from '@/components/MoveArsenal.vue'
import UsagePanel from '@/components/UsagePanel.vue'
import TypeMatchups from '@/components/TypeMatchups.vue'
import FormatToggle from '@/components/FormatToggle.vue'
import { speciesList, getSpecies } from '@/services/pokedex.js'
import { typeColor } from '@/utils/types.js'
import { useUsage } from '@/composables/useUsage.js'
import { useTeamStore } from '@/stores/team.js'

const route = useRoute()
const router = useRouter()
const $q = useQuasar()
const team = useTeamStore()

const TABS = ['meta', 'moves', 'types', 'dex']

const species = computed(() => getSpecies(route.params.key))
const formIndex = ref(0)
const tab = ref('meta')
const selectedAbility = ref(null)

// Si la clave no existe, volver a la Pokédex
watch(
  () => route.params.key,
  (key) => {
    if (key && !getSpecies(key)) router.replace({ name: 'home' })
  },
  { immediate: true },
)

watch(
  () => [route.params.key, route.query.form, route.query.tab],
  () => {
    const i = Number(route.query.form) || 0
    formIndex.value = species.value && i < species.value.forms.length ? i : 0
    if (TABS.includes(route.query.tab)) tab.value = route.query.tab
  },
  { immediate: true },
)

const form = computed(() => species.value.forms[formIndex.value] || species.value.forms[0])

watch(form, (f) => (selectedAbility.value = f?.abilities[0]?.name || null), { immediate: true })

// Mantener forma y pestaña en la URL para poder compartir el enlace
watch([formIndex, tab], ([f, t]) => {
  router.replace({
    query: { ...route.query, form: f || undefined, tab: t === 'meta' ? undefined : t },
  })
})

const c1 = computed(() => typeColor(form.value.types[0]))
const c2 = computed(() => typeColor(form.value.types[1] || form.value.types[0]))

const {
  usage,
  loading: usageLoading,
  error: usageError,
  reload: reloadUsage,
} = useUsage(
  () => species.value?.key,
  () => team.format,
)

function abilityUsage(name) {
  const hit = usage.value?.abilities.find((a) => a.name === name)
  return hit ? hit.pct.toFixed(0) : null
}

const entry = computed(() => species.value.pokedexEntry || {})
const dexFacts = computed(() => [
  { label: 'Altura', value: entry.value.height, icon: 'mdi-human-male-height' },
  { label: 'Peso', value: entry.value.weight, icon: 'mdi-weight' },
  { label: 'Hábitat', value: entry.value.habitat, icon: 'mdi-pine-tree' },
  { label: 'Origen', value: entry.value.generation, icon: 'mdi-map-marker' },
])

const wikiUrl = computed(
  () => `https://www.wikidex.net/wiki/${encodeURIComponent(species.value.name)}`,
)

const order = speciesList.map((s) => s.key)
function neighbor(step) {
  const i = order.indexOf(species.value.key)
  const key = order[(i + step + order.length) % order.length]
  return { name: 'pokemon', params: { key } }
}

function addToTeam() {
  const index = team.add(species.value.key, formIndex.value)
  if (index === -1) {
    $q.notify({ type: 'warning', icon: 'mdi-alert', message: 'El equipo ya tiene 6 miembros' })
    return
  }
  if (selectedAbility.value) team.slots[index].ability = selectedAbility.value
  $q.notify({
    color: 'dark',
    icon: 'mdi-check-circle',
    iconColor: 'positive',
    message: `${species.value.name} (${form.value.name}) añadido`,
    actions: [
      { label: 'Ver equipo', color: 'amber', handler: () => router.push({ name: 'team' }) },
    ],
  })
}
</script>

<style lang="scss" scoped>
.detail {
  max-width: 1200px;
  margin: 0 auto;
}

.hero {
  position: relative;
  overflow: hidden;
  padding: 24px;

  &__bg {
    position: absolute;
    inset: 0;
    background:
      radial-gradient(
        600px 360px at 20% 50%,
        color-mix(in srgb, var(--c1) 40%, transparent),
        transparent 70%
      ),
      radial-gradient(
        500px 300px at 90% 0%,
        color-mix(in srgb, var(--c2) 30%, transparent),
        transparent 70%
      );
    transition: background 0.6s;
    pointer-events: none;
  }
  &__art {
    position: relative;
    display: grid;
    place-items: center;
    min-height: 280px;
    img {
      position: relative;
      max-width: 100%;
      max-height: 300px;
      object-fit: contain;
      filter: drop-shadow(0 18px 28px color-mix(in srgb, var(--c1) 55%, transparent));
    }
  }
  &__ring {
    position: absolute;
    width: 240px;
    height: 240px;
    border-radius: 50%;
    border: 2px solid color-mix(in srgb, var(--c1) 60%, transparent);
    box-shadow:
      0 0 40px color-mix(in srgb, var(--c1) 40%, transparent),
      inset 0 0 40px color-mix(in srgb, var(--c2) 30%, transparent);
    animation: spin 18s linear infinite;
    border-style: dashed;
  }
  &__dex {
    letter-spacing: 0.12em;
    text-transform: uppercase;
    font-weight: 600;
  }
  &__name {
    margin: 0 0 8px;
    font-size: clamp(2.2rem, 6vw, 3.6rem);
    line-height: 1;
    font-weight: 700;
  }
  &__forms {
    border-bottom: 1px solid var(--pc-border);
  }
  &__cta {
    background: linear-gradient(135deg, var(--c1), color-mix(in srgb, var(--c2) 70%, #000));
    color: #fff;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
    font-weight: 700;
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.detail__tabs {
  border-radius: 12px;
}

.dex-fact {
  padding: 12px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.04);
  height: 100%;
}
</style>
