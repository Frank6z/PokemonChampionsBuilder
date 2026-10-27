<template>
  <div class="arsenal">
    <div v-if="!data" class="q-pa-lg flex flex-center">
      <q-spinner-orbit size="48px" color="amber" />
    </div>

    <template v-else>
      <q-banner v-if="!learnset" dense rounded class="arsenal__notice q-mb-md">
        <template #avatar><q-icon name="mdi-database-alert" color="amber" /></template>
        <span>
          No hay learnset local de <b>{{ species.name }}</b> en <code>learnsets.json</code>. Se
          muestran solo los movimientos que aparecen en los datos de uso.
        </span>
      </q-banner>
      <div
        v-else-if="learnset.usedName !== form.learnsetName"
        class="text-caption text-dim q-mb-sm"
      >
        Learnset de {{ learnset.usedName }} (la forma {{ form.name }} no tiene entrada propia).
      </div>

      <div class="arsenal__filters row q-col-gutter-sm items-center q-mb-md">
        <div class="col-12 col-sm-auto">
          <q-btn-toggle
            v-model="category"
            no-caps
            unelevated
            toggle-color="amber"
            toggle-text-color="dark"
            class="arsenal__cat glass"
            :options="categoryOptions"
          />
        </div>
        <div class="col-12 col-sm">
          <q-input
            v-model="search"
            dense
            outlined
            clearable
            debounce="120"
            placeholder="Buscar movimiento…"
          >
            <template #prepend><q-icon name="mdi-magnify" /></template>
          </q-input>
        </div>
        <div class="col-6 col-sm-3">
          <q-select
            v-model="typeFilter"
            :options="typeOptions"
            dense
            outlined
            clearable
            emit-value
            map-options
            label="Tipo"
          />
        </div>
        <div class="col-6 col-sm-auto row no-wrap">
          <q-toggle v-model="onlyMeta" color="amber" label="Meta" :disable="!usage" />
          <q-toggle v-model="onlyStab" color="cyan" label="STAB" />
        </div>
      </div>

      <q-table
        flat
        dense
        :rows="rows"
        :columns="columns"
        row-key="name"
        :grid="$q.screen.lt.md"
        :pagination="{ rowsPerPage: 25, sortBy: usage ? 'usage' : 'power', descending: true }"
        :rows-per-page-options="[25, 50, 0]"
        rows-per-page-label="Filas"
        no-data-label="Sin movimientos con estos filtros"
        class="arsenal__table"
        :card-container-class="'q-col-gutter-sm'"
      >
        <template #body="props">
          <q-tr
            :props="props"
            :class="{ 'row--meta': props.row.isMeta }"
            @click="toggleExpand(props.row.name)"
          >
            <q-td key="name" :props="props">
              <div class="row items-center no-wrap q-gutter-x-xs">
                <span class="text-weight-bold">{{ props.row.name }}</span>
                <q-badge v-if="props.row.isMeta" class="badge-meta" label="META" />
                <q-badge v-if="props.row.stab" outline color="cyan-3" label="STAB" />
                <q-badge v-if="props.row.spread" outline color="purple-3" label="Área">
                  <q-tooltip>Golpea a varios objetivos (daño reducido en dobles)</q-tooltip>
                </q-badge>
                <q-badge
                  v-if="props.row.priority"
                  outline
                  color="green-3"
                  :label="`P${props.row.priority > 0 ? '+' : ''}${props.row.priority}`"
                />
              </div>
            </q-td>
            <q-td key="type" :props="props"><TypeBadge :type="props.row.type" size="sm" /></q-td>
            <q-td key="category" :props="props">
              <q-icon
                :name="CATEGORY_META[props.row.category].icon"
                :style="{ color: CATEGORY_META[props.row.category].color }"
                size="18px"
              >
                <q-tooltip>{{ CATEGORY_META[props.row.category].es }}</q-tooltip>
              </q-icon>
            </q-td>
            <q-td key="power" :props="props">{{ props.row.power || '—' }}</q-td>
            <q-td key="accuracy" :props="props">{{ props.row.accuracy ?? '—' }}</q-td>
            <q-td key="pp" :props="props">{{ props.row.pp }}</q-td>
            <q-td key="usage" :props="props">
              <div v-if="props.row.usage != null" class="usage-cell">
                <span>{{ props.row.usage.toFixed(1) }}%</span>
                <div class="usage-cell__bar"><div :style="{ width: `${props.row.usage}%` }" /></div>
              </div>
              <span v-else class="text-dim">—</span>
            </q-td>
          </q-tr>
          <q-tr v-if="expanded === props.row.name" :props="props" class="row--detail">
            <q-td colspan="100%">
              <div class="text-body2">{{ props.row.description }}</div>
              <div v-if="props.row.championsChanges" class="text-caption text-amber q-mt-xs">
                Cambio en Champions: {{ props.row.championsChanges }}
              </div>
            </q-td>
          </q-tr>
        </template>

        <!-- Vista tarjeta para móvil -->
        <template #item="props">
          <div class="col-12 col-sm-6">
            <div
              class="move-card glass"
              :class="{ 'move-card--meta': props.row.isMeta }"
              :style="{ '--tc': typeColor(props.row.type) }"
            >
              <div class="row items-center justify-between no-wrap">
                <div class="text-weight-bold">{{ props.row.name }}</div>
                <TypeBadge :type="props.row.type" size="sm" />
              </div>
              <div class="row q-gutter-xs q-my-xs">
                <q-badge
                  v-if="props.row.isMeta"
                  class="badge-meta"
                  :label="`META ${props.row.usage.toFixed(0)}%`"
                />
                <q-badge v-if="props.row.stab" outline color="cyan-3" label="STAB" />
                <q-badge v-if="props.row.spread" outline color="purple-3" label="Área" />
              </div>
              <div class="move-card__stats">
                <span
                  ><q-icon :name="CATEGORY_META[props.row.category].icon" />
                  {{ CATEGORY_META[props.row.category].es }}</span
                >
                <span
                  >BP <b>{{ props.row.power || '—' }}</b></span
                >
                <span
                  >ACC <b>{{ props.row.accuracy ?? '—' }}</b></span
                >
                <span
                  >PP <b>{{ props.row.pp }}</b></span
                >
              </div>
              <div class="text-caption text-dim q-mt-xs">{{ props.row.description }}</div>
            </div>
          </div>
        </template>
      </q-table>

      <div class="text-caption text-dim q-mt-sm">
        BP/ACC/PP: <code>moves.json</code> (Serebii, sin verificar). Uso: championsbattledata.com,
        formato {{ format === 'Doubles' ? 'Dobles' : 'Individual' }}. "META" = usado por ≥{{
          META_THRESHOLD
        }}% de los {{ species.name }}.
      </div>
    </template>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import TypeBadge from '@/components/TypeBadge.vue'
import { useMoveData } from '@/composables/useMoveData.js'
import { learnsetFor, isSpread, CATEGORY_META } from '@/services/moves.js'
import { META_THRESHOLD } from '@/services/battleData.js'
import { TYPES, TYPE_IDS, typeColor } from '@/utils/types.js'

const props = defineProps({
  species: { type: Object, required: true },
  form: { type: Object, required: true },
  usage: { type: Object, default: null },
  format: { type: String, default: 'Doubles' },
})

const data = useMoveData()

const category = ref('all')
const search = ref('')
const typeFilter = ref(null)
const onlyMeta = ref(false)
const onlyStab = ref(false)
const expanded = ref(null)

const categoryOptions = [
  { label: 'Todos', value: 'all' },
  { label: 'Físico', value: 'Physical', icon: 'mdi-sword' },
  { label: 'Especial', value: 'Special', icon: 'mdi-creation' },
  { label: 'Estado', value: 'Status', icon: 'mdi-shield-half-full' },
]
const typeOptions = TYPE_IDS.map((t) => ({ label: TYPES[t].es, value: t }))

const columns = [
  { name: 'name', label: 'Movimiento', field: 'name', align: 'left', sortable: true },
  { name: 'type', label: 'Tipo', field: 'type', align: 'left', sortable: true },
  { name: 'category', label: 'Cat.', field: 'category', align: 'center', sortable: true },
  { name: 'power', label: 'BP', field: 'power', align: 'right', sortable: true },
  {
    name: 'accuracy',
    label: 'ACC',
    field: (r) => r.accuracy ?? 101,
    align: 'right',
    sortable: true,
  },
  { name: 'pp', label: 'PP', field: 'pp', align: 'right', sortable: true },
  { name: 'usage', label: 'Uso', field: (r) => r.usage ?? -1, align: 'left', sortable: true },
]

const learnset = computed(() =>
  data.value ? learnsetFor(data.value, props.species, props.form) : null,
)

const usageByMove = computed(() => new Map((props.usage?.moves || []).map((m) => [m.name, m.pct])))

const allRows = computed(() => {
  if (!data.value) return []
  const byName = new Map()
  for (const m of learnset.value?.moves || []) byName.set(m.name, m)
  // movimientos usados en competitivo que no estén en el learnset local
  for (const name of usageByMove.value.keys()) {
    const m = data.value.movesByName.get(name)
    if (m && !byName.has(name)) byName.set(name, m)
  }
  return [...byName.values()].map((m) => {
    const usage = usageByMove.value.get(m.name) ?? null
    return {
      ...m,
      usage,
      isMeta: usage != null && usage >= META_THRESHOLD,
      stab: m.category !== 'Status' && props.form.types.includes(m.type),
      spread: isSpread(m),
    }
  })
})

const rows = computed(() => {
  const q = (search.value || '').trim().toLowerCase()
  return allRows.value.filter(
    (m) =>
      (category.value === 'all' || m.category === category.value) &&
      (!typeFilter.value || m.type === typeFilter.value) &&
      (!onlyMeta.value || m.isMeta) &&
      (!onlyStab.value || m.stab) &&
      (!q || m.name.toLowerCase().includes(q)),
  )
})

function toggleExpand(name) {
  expanded.value = expanded.value === name ? null : name
}
</script>

<style lang="scss" scoped>
.arsenal__notice {
  background: rgba(233, 200, 13, 0.08);
  border: 1px solid rgba(233, 200, 13, 0.3);
}
.arsenal__cat {
  border-radius: 12px;
  overflow: hidden;
}
.arsenal__table {
  :deep(tbody tr) {
    cursor: pointer;
  }
  :deep(tbody tr:hover) {
    background: rgba(255, 255, 255, 0.04);
  }
  :deep(.row--meta) {
    background: linear-gradient(90deg, rgba(233, 200, 13, 0.1), transparent 60%);
  }
  :deep(.row--detail) {
    background: rgba(0, 0, 0, 0.25);
  }
}
.badge-meta {
  background: linear-gradient(135deg, var(--pc-accent), #ff9d00);
  color: #111;
  font-weight: 800;
  box-shadow: 0 0 10px rgba(233, 200, 13, 0.45);
}
.usage-cell {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 110px;
  font-variant-numeric: tabular-nums;
  &__bar {
    flex: 1;
    height: 6px;
    border-radius: 3px;
    background: rgba(255, 255, 255, 0.08);
    div {
      height: 100%;
      border-radius: inherit;
      background: linear-gradient(90deg, #ff9d00, var(--pc-accent));
      transition: width 0.6s var(--pc-ease);
    }
  }
}
.move-card {
  padding: 12px;
  border-left: 3px solid var(--tc);
  &--meta {
    box-shadow:
      0 0 0 1px rgba(233, 200, 13, 0.35),
      0 8px 24px rgba(0, 0, 0, 0.3);
  }
  &__stats {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    font-size: 0.8rem;
    color: var(--pc-text-dim);
    b {
      color: var(--pc-text);
    }
  }
}
</style>
