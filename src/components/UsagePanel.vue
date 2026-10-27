<template>
  <div class="usage">
    <div v-if="loading" class="row q-col-gutter-md">
      <div v-for="n in 4" :key="n" class="col-12 col-md-6">
        <div class="glass q-pa-md"><PokeLoader label="Consultando el meta…" :rows="5" /></div>
      </div>
    </div>

    <q-banner v-else-if="error" rounded class="usage__error">
      <template #avatar><q-icon name="mdi-wifi-off" color="negative" /></template>
      No se pudieron cargar los datos de uso ({{ error }}).
      <template #action
        ><q-btn flat no-caps color="amber" label="Reintentar" @click="$emit('retry')"
      /></template>
    </q-banner>

    <div v-else-if="usage" class="row q-col-gutter-md">
      <div v-for="block in blocks" :key="block.title" class="col-12 col-md-6">
        <div class="glass q-pa-md full-height">
          <div class="section-title q-mb-sm"><q-icon :name="block.icon" />{{ block.title }}</div>
          <transition-group name="list" tag="div">
            <div v-for="(entry, i) in block.rows" :key="entry.name" class="usage-row">
              <span class="usage-row__rank">{{ i + 1 }}</span>
              <span class="usage-row__name">
                {{ entry.name }}
                <span v-if="entry.sub" class="text-caption text-dim">{{ entry.sub }}</span>
              </span>
              <div class="usage-row__bar"><div :style="{ width: `${entry.pct}%` }" /></div>
              <span class="usage-row__pct">{{ entry.pct?.toFixed(1) }}%</span>
            </div>
          </transition-group>
          <div v-if="!block.rows.length" class="text-dim">Sin datos.</div>
        </div>
      </div>

      <div class="col-12 col-md-6">
        <div class="glass q-pa-md full-height">
          <div class="section-title q-mb-sm">
            <q-icon name="mdi-chart-bar-stacked" />Stat points
          </div>
          <div v-for="(sp, i) in usage.spreads.slice(0, 5)" :key="i" class="spread-row">
            <span class="usage-row__pct">{{ sp.pct?.toFixed(1) }}%</span>
            <span
              v-for="k in STAT_KEYS"
              :key="k"
              class="spread-chip"
              :class="{ 'spread-chip--on': sp.points[k] > 0 }"
            >
              {{ STAT_LABELS[k] }} {{ sp.points[k] }}
            </span>
          </div>
          <div v-if="!usage.spreads.length" class="text-dim">Sin datos.</div>
        </div>
      </div>

      <div class="col-12 col-md-6">
        <div class="glass q-pa-md full-height">
          <div class="section-title q-mb-sm">
            <q-icon name="mdi-account-multiple" />Compañeros frecuentes
          </div>
          <div class="row q-gutter-sm">
            <q-chip
              v-for="(mate, i) in usage.teammates.slice(0, 12)"
              :key="mate.name"
              :clickable="!!mateKey(mate.name)"
              class="mate-chip"
              @click="openMate(mate.name)"
            >
              <q-avatar v-if="mateSprite(mate.name)" size="28px"
                ><img :src="mateSprite(mate.name)" alt=""
              /></q-avatar>
              <span class="text-dim q-mr-xs">{{ i + 1 }}.</span>{{ mate.name }}
            </q-chip>
          </div>
        </div>
      </div>

      <div class="col-12 text-caption text-dim">
        Datos:
        <a href="https://championsbattledata.com/" target="_blank" rel="noopener" class="text-amber"
          >Pokemon Champions Battle Data</a
        >
        (secundaria) · temporada {{ usage.season }} ·
        {{ usage.format === 'Doubles' ? 'Dobles' : 'Individual' }}. Los porcentajes indican uso, no
        efectividad.
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import PokeLoader from '@/components/PokeLoader.vue'
import { speciesList, STAT_KEYS, STAT_LABELS } from '@/services/pokedex.js'

const props = defineProps({
  usage: { type: Object, default: null },
  loading: { type: Boolean, default: false },
  error: { type: String, default: null },
})
defineEmits(['retry'])

const router = useRouter()

const statEs = { Attack: 'Atq', Defense: 'Def', 'Sp. Atk': 'AtE', 'Sp. Def': 'DfE', Speed: 'Vel' }

const blocks = computed(() => {
  const u = props.usage
  if (!u) return []
  return [
    { title: 'Objetos más equipados', icon: 'mdi-bag-personal', rows: u.items.slice(0, 8) },
    { title: 'Habilidades', icon: 'mdi-star-four-points', rows: u.abilities },
    { title: 'Movimientos más usados', icon: 'mdi-sword-cross', rows: u.moves.slice(0, 8) },
    {
      title: 'Naturalezas',
      icon: 'mdi-leaf',
      rows: u.natures.slice(0, 6).map((n) => ({
        ...n,
        sub: n.up ? `+${statEs[n.up] || n.up} −${statEs[n.down] || n.down}` : '',
      })),
    },
  ]
})

// Los compañeros llegan por nombre de especie ("Charizard"); solo enlazamos los que están en la app
const byName = Object.fromEntries(speciesList.map((s) => [s.name, s]))
function mateKey(name) {
  return byName[name]?.key || null
}
function mateSprite(name) {
  return byName[name]?.forms[0].sprite || ''
}
function openMate(name) {
  const key = mateKey(name)
  if (key) router.push({ name: 'pokemon', params: { key } })
}
</script>

<style lang="scss" scoped>
.usage__error {
  background: rgba(255, 77, 109, 0.08);
  border: 1px solid rgba(255, 77, 109, 0.3);
}
.usage-row {
  display: grid;
  grid-template-columns: 20px minmax(0, 1.3fr) 1fr 52px;
  align-items: center;
  gap: 10px;
  padding: 5px 0;
  font-size: 0.88rem;
  &__rank {
    color: var(--pc-text-dim);
    font-family: var(--pc-font-display);
    font-weight: 700;
  }
  &__name {
    display: flex;
    flex-direction: column;
    line-height: 1.15;
    font-weight: 600;
  }
  &__bar {
    height: 6px;
    border-radius: 3px;
    background: rgba(255, 255, 255, 0.07);
    div {
      height: 100%;
      border-radius: inherit;
      background: linear-gradient(90deg, var(--pc-accent-2), var(--pc-accent));
      transition: width 0.8s var(--pc-ease);
    }
  }
  &__pct {
    text-align: right;
    font-variant-numeric: tabular-nums;
    font-weight: 700;
  }
}
.spread-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
  padding: 5px 0;
  .usage-row__pct {
    min-width: 52px;
    text-align: left;
  }
}
.spread-chip {
  font-size: 0.72rem;
  padding: 2px 7px;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.05);
  color: var(--pc-text-dim);
  &--on {
    background: rgba(61, 224, 255, 0.14);
    color: var(--pc-text);
  }
}
.mate-chip {
  background: rgba(255, 255, 255, 0.06);
  transition: transform 0.2s var(--pc-ease);
  &:hover {
    transform: translateY(-2px);
  }
}
</style>
