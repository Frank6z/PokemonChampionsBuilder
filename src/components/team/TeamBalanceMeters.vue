<template>
  <div class="meters">
    <div v-for="m in meters" :key="m.key" class="meter glass">
      <q-circular-progress
        show-value
        :value="m.value"
        size="96px"
        :thickness="0.16"
        :color="m.color"
        track-color="grey-9"
        class="meter__dial"
        :style="{ '--glow': m.hex }"
        :animation-speed="900"
      >
        <span class="font-display meter__value">{{ m.value }}</span>
      </q-circular-progress>
      <div>
        <div class="meter__label font-display">{{ m.label }}</div>
        <div class="meter__grade" :style="{ color: m.hex }">{{ grade(m.value) }}</div>
        <div class="text-caption text-dim">{{ m.hint }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  scores: { type: Object, required: true }, // { offensive, defensive, meta } de 0 a 100
  format: { type: String, default: 'Doubles' },
  threatCount: { type: Number, default: 12 },
})

function tone(v) {
  if (v >= 75) return { color: 'teal-4', hex: '#34e0a1' }
  if (v >= 50) return { color: 'amber', hex: '#e9c80d' }
  return { color: 'red-5', hex: '#ff4d6d' }
}

function grade(v) {
  if (v >= 85) return 'S'
  if (v >= 70) return 'A'
  if (v >= 55) return 'B'
  if (v >= 40) return 'C'
  return 'D'
}

const meters = computed(() => [
  {
    key: 'off',
    label: 'Cobertura ofensiva',
    value: props.scores.offensive,
    hint: 'Tipos a los que golpeas supereficaz',
    ...tone(props.scores.offensive),
  },
  {
    key: 'def',
    label: 'Solidez defensiva',
    value: props.scores.defensive,
    hint: 'Tipos cubiertos sin debilidades apiladas',
    ...tone(props.scores.defensive),
  },
  {
    key: 'meta',
    label: 'Preparación meta',
    value: props.scores.meta,
    hint: `Top ${props.threatCount} de ${props.format === 'Doubles' ? 'Dobles' : 'Individual'} con respuesta`,
    ...tone(props.scores.meta),
  },
])
</script>

<style lang="scss" scoped>
.meters {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 12px;
}
.meter {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 14px 16px;
  border-radius: 18px 4px 18px 18px;

  &__dial {
    flex-shrink: 0;
    filter: drop-shadow(0 0 10px color-mix(in srgb, var(--glow) 45%, transparent));
  }
  &__value {
    font-size: 1.6rem;
    font-weight: 700;
  }
  &__label {
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }
  &__grade {
    font-family: var(--pc-font-display);
    font-size: 2rem;
    font-weight: 700;
    line-height: 1;
  }
}
</style>
