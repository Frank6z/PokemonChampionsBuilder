<template>
  <q-page class="pokedex-page q-pa-md">
    <section class="hero q-mb-lg">
      <div>
        <div class="hero__kicker font-display">Pokémon Champions · Pokédex competitiva</div>
        <h1 class="hero__title font-display">Elige a tus campeones</h1>
        <p class="text-dim q-mb-none">
          {{ speciesList.length }} especies · {{ totalForms }} formas. Filtra por tipo, busca por
          nombre o habilidad y añádelos al Team Builder.
        </p>
      </div>
      <q-btn
        unelevated
        no-caps
        class="pc-btn hero__cta"
        icon="mdi-account-group"
        :label="`Team Builder (${team.members.length}/6)`"
        :to="{ name: 'team' }"
      />
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
          <q-toggle v-model="onlyMega" label="Con Mega" color="pink-4" />
          <q-btn
            v-if="hasFilters"
            flat
            dense
            no-caps
            icon="mdi-filter-remove"
            label="Limpiar"
            class="pc-btn"
            @click="clearFilters"
          />
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

    <transition-group name="grid" tag="div" class="poke-grid">
      <PokemonCard
        v-for="s in filtered"
        :key="s.key"
        v-model:form-index="formIndices[s.key]"
        :species="s"
      />
    </transition-group>

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
import { speciesList } from '@/services/pokedex.js'
import { TYPE_IDS } from '@/utils/types.js'
import { useTeamStore } from '@/stores/team.js'

const team = useTeamStore()

const search = ref('')
const selectedTypes = ref([])
const onlyMega = ref(false)
const sortBy = ref('dex')

const sortOptions = [
  { label: 'Nº Pokédex', value: 'dex' },
  { label: 'Nombre', value: 'name' },
  { label: 'Total stats (BST)', value: 'bst' },
  { label: 'Velocidad', value: 'spe' },
  { label: 'Ataque', value: 'atk' },
  { label: 'At. Especial', value: 'spa' },
]

const totalForms = speciesList.reduce((a, s) => a + s.forms.length, 0)
const formIndices = reactive(Object.fromEntries(speciesList.map((s) => [s.key, 0])))

const hasFilters = computed(
  () => !!search.value || selectedTypes.value.length > 0 || onlyMega.value,
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
}

// Una forma coincide si contiene todos los tipos seleccionados
function formMatches(form) {
  return (
    selectedTypes.value.every((t) => form.types.includes(t)) && (!onlyMega.value || form.isMega)
  )
}

const filtered = computed(() => {
  const q = (search.value || '').trim().toLowerCase()
  const list = speciesList.filter((s) => {
    if (!s.forms.some(formMatches)) return false
    if (!q) return true
    return (
      s.name.toLowerCase().includes(q) ||
      String(s.dexNumber).includes(q) ||
      s.forms.some((f) => f.abilities.some((a) => a.name.toLowerCase().includes(q)))
    )
  })
  const shown = (s) => s.forms[formIndices[s.key]] || s.forms[0]
  const sorters = {
    dex: (a, b) => a.dexNumber - b.dexNumber,
    name: (a, b) => a.name.localeCompare(b.name),
    bst: (a, b) => shown(b).bst - shown(a).bst,
  }
  const sorter =
    sorters[sortBy.value] || ((a, b) => shown(b).stats[sortBy.value] - shown(a).stats[sortBy.value])
  return list.sort(sorter)
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
