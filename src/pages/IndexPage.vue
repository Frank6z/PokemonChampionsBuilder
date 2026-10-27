<template>
  <q-page class="pokedex-page q-pa-md">
    <section class="hero q-mb-lg">
      <div>
        <div class="hero__kicker font-display">Pokémon Champions · Pokédex competitiva</div>
        <h1 class="hero__title font-display">Elige a tus campeones</h1>
        <p class="text-dim q-mb-none">
          {{ speciesList.length }} Pokémon · {{ totalForms }} formas · ranking de uso del
          {{ rankingMeta.generatedAt }}.
        </p>
      </div>
      <div class="row items-center q-gutter-sm">
        <FormatToggle />
        <q-btn
          unelevated
          no-caps
          class="pc-btn hero__cta"
          icon="mdi-account-group"
          :label="`Team Builder (${team.members.length}/6)`"
          :to="{ name: 'team' }"
        />
      </div>
    </section>

    <!-- Podio del meta: top 3 del formato activo -->
    <section class="podium q-mb-lg">
      <router-link
        v-for="t in podium"
        :key="t.id"
        :to="{
          name: 'pokemon',
          params: { key: t.id },
          query: t.formIndex ? { form: t.formIndex } : {},
        }"
        class="podium__item glass"
        :style="{ '--c1': typeColor(t.form.types[0]) }"
      >
        <span class="podium__rank font-display">{{ t.rank }}</span>
        <img :src="t.form.sprite" :alt="t.species.name" loading="lazy" />
        <div class="col">
          <div class="podium__name font-display">{{ t.species.name }}</div>
          <div class="text-caption text-dim ellipsis">{{ t.topItem }} · {{ t.topMove }}</div>
        </div>
      </router-link>
    </section>

    <section class="filters glass q-pa-md q-mb-lg">
      <div class="row q-col-gutter-md items-center">
        <div class="col-12 col-md-5">
          <q-input
            v-model="search"
            outlined
            dense
            clearable
            debounce="150"
            placeholder="Buscar Pokémon, nº o habilidad…"
          >
            <template #prepend><q-icon name="mdi-magnify" /></template>
          </q-input>
        </div>
        <div class="col-6 col-md-3">
          <q-select
            v-model="sortBy"
            :options="sortOptions"
            outlined
            dense
            emit-value
            map-options
            label="Ordenar por"
          >
            <template #prepend><q-icon name="mdi-sort" /></template>
          </q-select>
        </div>
        <div class="col-6 col-md-4 row items-center justify-end q-gutter-sm">
          <q-toggle v-model="onlyMeta" label="Top 50" color="amber" />
          <q-toggle v-model="onlyMega" label="Mega" color="pink-4" />
          <q-btn
            v-if="hasFilters"
            flat
            dense
            round
            icon="mdi-filter-remove"
            class="pc-btn"
            @click="clearFilters"
          >
            <q-tooltip>Limpiar filtros</q-tooltip>
          </q-btn>
        </div>
      </div>

      <div class="type-filter q-mt-md">
        <TypeBadge
          v-for="t in TYPE_IDS"
          :key="t"
          :type="t"
          size="sm"
          clickable
          :dimmed="selectedTypes.length > 0 && !selectedTypes.includes(t)"
          @click="toggleType(t)"
        />
      </div>
    </section>

    <div class="row items-center q-mb-sm text-dim">
      <span>{{ filtered.length }} resultado{{ filtered.length === 1 ? '' : 's' }}</span>
    </div>

    <q-infinite-scroll :offset="400" :disable="visible.length >= filtered.length" @load="loadMore">
      <transition-group name="grid" tag="div" class="poke-grid">
        <PokemonCard
          v-for="s in visible"
          :key="s.key"
          v-model:form-index="formIndices[s.key]"
          :species="s"
          :rank="rankOf(s.key, team.format)"
          :format="team.format"
        />
      </transition-group>
      <template #loading>
        <div class="row justify-center q-my-md"><PokeLoader label="Más Pokémon…" :rows="0" /></div>
      </template>
    </q-infinite-scroll>

    <transition name="pop">
      <div v-if="!filtered.length" class="empty glass q-pa-xl text-center">
        <q-icon name="mdi-pokeball" size="56px" class="text-dim" />
        <div class="text-h6 q-mt-sm">Ningún Pokémon coincide</div>
        <q-btn
          flat
          no-caps
          color="amber"
          label="Limpiar filtros"
          class="q-mt-sm"
          @click="clearFilters"
        />
      </div>
    </transition>
  </q-page>
</template>

<script setup>
import { computed, reactive, ref, watch } from 'vue'
import PokemonCard from '@/components/PokemonCard.vue'
import TypeBadge from '@/components/TypeBadge.vue'
import FormatToggle from '@/components/FormatToggle.vue'
import PokeLoader from '@/components/PokeLoader.vue'
import { speciesList } from '@/services/pokedex.js'
import { rankOf, topThreats, rankingMeta } from '@/services/ranking.js'
import { TYPE_IDS, typeColor } from '@/utils/types.js'
import { useTeamStore } from '@/stores/team.js'

const PAGE = 36

const team = useTeamStore()

const search = ref('')
const selectedTypes = ref([])
const onlyMega = ref(false)
const onlyMeta = ref(false)
const sortBy = ref('usage')
const shown = ref(PAGE)

const sortOptions = [
  { label: 'Uso en el meta', value: 'usage' },
  { label: 'Nº Pokédex', value: 'dex' },
  { label: 'Nombre', value: 'name' },
  { label: 'Total stats (BST)', value: 'bst' },
  { label: 'Velocidad', value: 'spe' },
  { label: 'Ataque', value: 'atk' },
  { label: 'At. Especial', value: 'spa' },
]

const totalForms = speciesList.reduce((a, s) => a + s.forms.length, 0)
const formIndices = reactive(Object.fromEntries(speciesList.map((s) => [s.key, 0])))

const podium = computed(() => topThreats(team.format, 3))

const hasFilters = computed(
  () => !!search.value || selectedTypes.value.length > 0 || onlyMega.value || onlyMeta.value,
)

function toggleType(t) {
  const i = selectedTypes.value.indexOf(t)
  if (i >= 0) selectedTypes.value.splice(i, 1)
  else selectedTypes.value.push(t)
}

function clearFilters() {
  search.value = ''
  selectedTypes.value = []
  onlyMega.value = false
  onlyMeta.value = false
}

// Una forma coincide si contiene todos los tipos seleccionados
function formMatches(form) {
  return (
    selectedTypes.value.every((t) => form.types.includes(t)) && (!onlyMega.value || form.isMega)
  )
}

const filtered = computed(() => {
  const q = (search.value || '').trim().toLowerCase()
  const format = team.format
  const list = speciesList.filter((s) => {
    if (onlyMeta.value && !rankOf(s.key, format)) return false
    if (!s.forms.some(formMatches)) return false
    if (!q) return true
    return (
      s.name.toLowerCase().includes(q) ||
      String(s.dexNumber).includes(q) ||
      s.forms.some((f) => f.abilities.some((a) => a.name.toLowerCase().includes(q)))
    )
  })
  const formOf = (s) => s.forms[formIndices[s.key]] || s.forms[0]
  const rankValue = (s) => rankOf(s.key, format)?.rank ?? 999
  const sorters = {
    usage: (a, b) => rankValue(a) - rankValue(b) || (a.dexNumber ?? 9999) - (b.dexNumber ?? 9999),
    dex: (a, b) => (a.dexNumber ?? 9999) - (b.dexNumber ?? 9999),
    name: (a, b) => a.name.localeCompare(b.name),
    bst: (a, b) => formOf(b).bst - formOf(a).bst,
  }
  const sorter =
    sorters[sortBy.value] ||
    ((a, b) => formOf(b).stats[sortBy.value] - formOf(a).stats[sortBy.value])
  return list.sort(sorter)
})

// Renderizado incremental: 263 tarjetas con imagen de golpe saturan el primer pintado
const visible = computed(() => filtered.value.slice(0, shown.value))

function loadMore(_index, done) {
  shown.value += PAGE
  done()
}

watch([search, selectedTypes, onlyMega, onlyMeta, sortBy], () => (shown.value = PAGE), {
  deep: true,
})

// Al filtrar, mostrar la primera forma que cumpla el filtro (p. ej. Mega Charizard X con Dragón)
watch(
  [selectedTypes, onlyMega],
  () => {
    for (const s of speciesList) {
      if (!formMatches(s.forms[formIndices[s.key]])) {
        const i = s.forms.findIndex(formMatches)
        if (i >= 0) formIndices[s.key] = i
      }
    }
  },
  { deep: true },
)
</script>

<style lang="scss" scoped>
.pokedex-page {
  max-width: 1400px;
  margin: 0 auto;
}

.hero {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
  padding-top: 8px;

  &__kicker {
    color: var(--pc-accent-2);
    text-transform: uppercase;
    font-weight: 700;
    font-size: 0.85rem;
    letter-spacing: 0.2em;
  }
  &__title {
    margin: 4px 0 6px;
    font-size: clamp(2rem, 5vw, 3.2rem);
    font-weight: 700;
    line-height: 1;
    background: linear-gradient(90deg, #fff, var(--pc-accent));
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
  }
  &__cta {
    background: linear-gradient(135deg, var(--pc-accent), #ff9d00);
    color: #111;
    font-weight: 700;
    border-radius: 12px;
    padding: 6px 16px;
    box-shadow: 0 6px 24px rgba(233, 200, 13, 0.35);
  }
}

.podium {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 12px;

  &__item {
    position: relative;
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 14px 10px 10px;
    color: inherit;
    text-decoration: none;
    overflow: hidden;
    border-radius: 18px 4px 18px 18px;
    transition:
      transform 0.3s var(--pc-ease),
      box-shadow 0.3s;
    &::after {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(
        90deg,
        color-mix(in srgb, var(--c1) 22%, transparent),
        transparent 70%
      );
      pointer-events: none;
    }
    &:hover {
      transform: translateY(-3px);
      box-shadow: 0 10px 28px color-mix(in srgb, var(--c1) 35%, transparent);
    }
    img {
      width: 56px;
      height: 56px;
      object-fit: contain;
      position: relative;
      z-index: 1;
    }
  }
  &__rank {
    font-size: 2.2rem;
    font-weight: 700;
    width: 32px;
    text-align: center;
    color: var(--pc-accent);
    text-shadow: 0 0 18px rgba(233, 200, 13, 0.45);
  }
  &__name {
    font-size: 1.15rem;
    font-weight: 700;
  }
}

.type-filter {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.poke-grid {
  position: relative;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(210px, 1fr));
  gap: 18px;
}

.empty {
  max-width: 420px;
  margin: 24px auto;
}
</style>
