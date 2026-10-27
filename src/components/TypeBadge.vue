<template>
  <span
    class="type-badge"
    :class="[
      `type-badge--${size}`,
      {
        'type-badge--clickable': clickable,
        'type-badge--off': dimmed,
        'type-badge--icon-only': iconOnly,
      },
    ]"
    :style="{ '--tc': color }"
  >
    <img v-if="icon" :src="icon" alt="" class="type-badge__icon" />
    <span v-if="!iconOnly">{{ label }}</span>
    <q-tooltip v-if="iconOnly">{{ label }}</q-tooltip>
  </span>
</template>

<script setup>
import { computed } from 'vue'
import { TYPES, typeColor, typeIconUrl } from '@/utils/types.js'

const props = defineProps({
  type: { type: String, required: true },
  size: { type: String, default: 'md' }, // sm | md | lg
  iconOnly: { type: Boolean, default: false },
  clickable: { type: Boolean, default: false },
  dimmed: { type: Boolean, default: false },
})

const label = computed(() => TYPES[props.type]?.es || props.type)
const color = computed(() => typeColor(props.type))
const icon = computed(() => typeIconUrl(props.type))
</script>

<style lang="scss" scoped>
.type-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 3px 10px 3px 4px;
  border-radius: 999px;
  font-family: var(--pc-font-display);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #fff;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.55);
  background: linear-gradient(135deg, var(--tc), color-mix(in srgb, var(--tc) 60%, #000));
  box-shadow:
    0 0 0 1px color-mix(in srgb, var(--tc) 70%, #fff) inset,
    0 2px 10px color-mix(in srgb, var(--tc) 35%, transparent);
  white-space: nowrap;
  user-select: none;
  transition:
    transform 0.2s var(--pc-ease),
    box-shadow 0.2s,
    opacity 0.2s,
    filter 0.2s;

  &__icon {
    width: 1.35em;
    height: 1.35em;
    object-fit: contain;
  }

  &--sm {
    font-size: 0.68rem;
    padding: 2px 8px 2px 3px;
  }
  &--md {
    font-size: 0.78rem;
  }
  &--lg {
    font-size: 0.95rem;
    padding: 5px 14px 5px 6px;
  }

  &--clickable {
    cursor: pointer;
    &:hover {
      transform: translateY(-2px) scale(1.04);
      box-shadow:
        0 0 0 1px color-mix(in srgb, var(--tc) 70%, #fff) inset,
        0 4px 18px color-mix(in srgb, var(--tc) 60%, transparent);
    }
  }
  &--icon-only {
    padding: 3px;
  }
  &--off {
    opacity: 0.38;
    filter: saturate(0.4);
  }
}
</style>
