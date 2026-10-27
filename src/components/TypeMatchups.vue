<template>
  <div class="matchups">
    <div v-if="abilityNote" class="text-caption text-amber q-mb-sm">
      <q-icon name="mdi-information" /> Incluye el efecto de {{ ability }}.
    </div>
    <div v-for="group in groups" :key="group.key" class="q-mb-md">
      <div class="matchups__label" :style="{ color: group.color }">{{ group.label }}</div>
      <transition-group name="list" tag="div" class="matchups__list">
        <div v-for="m in group.items" :key="m.type" class="matchups__item">
          <TypeBadge :type="m.type" size="sm" />
          <span class="matchups__mult" :style="{ color: group.color }">{{
            formatMult(m.mult)
          }}</span>
        </div>
      </transition-group>
      <div v-if="!group.items.length" class="text-dim text-caption">Ninguna</div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import TypeBadge from '@/components/TypeBadge.vue'
import { matchupsFor, formatMult, abilityAffectsTyping } from '@/utils/types.js'

const props = defineProps({
  types: { type: Array, required: true },
  ability: { type: String, default: null },
})

const abilityNote = computed(() => abilityAffectsTyping(props.ability))

const groups = computed(() => {
  const m = matchupsFor(props.types, props.ability)
  return [
    { key: 'weak', label: 'Débil a', color: '#ff4d6d', items: m.weak },
    { key: 'resist', label: 'Resiste', color: '#34e0a1', items: m.resist },
    { key: 'immune', label: 'Inmune a', color: '#b48cff', items: m.immune },
  ]
})
</script>

<style lang="scss" scoped>
.matchups__label {
  font-family: var(--pc-font-display);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-bottom: 6px;
}
.matchups__list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.matchups__item {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 8px 3px 3px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.04);
}
.matchups__mult {
  font-weight: 800;
  font-size: 0.8rem;
}
</style>
