<template>
  <div class="stat-bars">
    <div v-for="key in STAT_KEYS" :key="key" class="stat-row">
      <span class="stat-row__label">{{ STAT_LABELS[key] }}</span>
      <span class="stat-row__value">{{ stats[key] }}</span>
      <div class="stat-row__track">
        <div
          class="stat-row__fill"
          :style="{
            width: ready ? `${Math.min(100, (stats[key] / MAX_STAT) * 100)}%` : '0%',
            '--sc': statColor(stats[key]),
          }"
        />
        <div
          v-if="compare"
          class="stat-row__compare"
          :style="{ left: `${Math.min(100, (compare[key] / MAX_STAT) * 100)}%` }"
        >
          <q-tooltip>{{ compareLabel }}: {{ compare[key] }}</q-tooltip>
        </div>
      </div>
      <span v-if="compare" class="stat-row__delta" :class="deltaClass(stats[key] - compare[key])">
        {{ formatDelta(stats[key] - compare[key]) }}
      </span>
    </div>
    <div class="stat-row stat-row--total">
      <span class="stat-row__label">Total</span>
      <span class="stat-row__value">{{ total }}</span>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { STAT_KEYS, STAT_LABELS } from '@/services/pokedex.js'

const props = defineProps({
  stats: { type: Object, required: true },
  // stats de otra forma (p. ej. la base) para mostrar la diferencia de la Mega
  compare: { type: Object, default: null },
  compareLabel: { type: String, default: 'Base' },
})

const MAX_STAT = 200
const ready = ref(false)
onMounted(() => requestAnimationFrame(() => (ready.value = true)))

const total = computed(() => STAT_KEYS.reduce((a, k) => a + (props.stats[k] || 0), 0))

function statColor(v) {
  if (v < 60) return '#ff4d6d'
  if (v < 90) return '#ffb03a'
  if (v < 110) return '#f7d02c'
  if (v < 130) return '#7ac74c'
  return '#3de0ff'
}

function formatDelta(d) {
  return d === 0 ? '' : d > 0 ? `+${d}` : `${d}`
}
function deltaClass(d) {
  return d > 0 ? 'text-positive' : d < 0 ? 'text-negative' : ''
}
</script>

<style lang="scss" scoped>
.stat-row {
  display: grid;
  grid-template-columns: 78px 38px 1fr auto;
  align-items: center;
  gap: 10px;
  padding: 4px 0;
  font-size: 0.85rem;

  &__label {
    color: var(--pc-text-dim);
    font-family: var(--pc-font-display);
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }
  &__value {
    font-weight: 700;
    text-align: right;
    font-variant-numeric: tabular-nums;
  }
  &__track {
    position: relative;
    height: 10px;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.06);
    overflow: visible;
  }
  &__fill {
    height: 100%;
    border-radius: inherit;
    background: linear-gradient(90deg, color-mix(in srgb, var(--sc) 55%, #000), var(--sc));
    box-shadow: 0 0 12px color-mix(in srgb, var(--sc) 55%, transparent);
    transition: width 0.9s var(--pc-ease);
  }
  &__compare {
    position: absolute;
    top: -3px;
    width: 2px;
    height: 16px;
    background: #fff;
    opacity: 0.6;
    border-radius: 1px;
    transition: left 0.6s var(--pc-ease);
  }
  &__delta {
    min-width: 32px;
    font-size: 0.75rem;
    font-weight: 700;
    text-align: right;
  }

  &--total {
    border-top: 1px solid var(--pc-border);
    margin-top: 4px;
    padding-top: 8px;
    .stat-row__value {
      color: var(--pc-accent);
    }
  }
}
</style>
