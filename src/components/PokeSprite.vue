<template>
  <span
    class="poke-sprite"
    :class="[`poke-sprite--${variant}`, { 'is-loading': !loaded, 'is-animated': showAnimated }]"
    :style="{ '--size': `${size}px`, '--c1': color }"
  >
    <span v-if="!loaded" class="poke-sprite__orb" aria-hidden="true" />
    <transition name="pop" mode="out-in">
      <img
        v-if="src"
        :key="src"
        :src="src"
        :alt="alt"
        :loading="eager ? 'eager' : 'lazy'"
        decoding="async"
        @load="loaded = true"
        @error="onError"
      />
    </transition>
  </span>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useUiStore } from '@/stores/ui.js'
import { typeColor } from '@/utils/types.js'

// Sprite con cadena de respaldo: GIF animado → imagen estática (local o artwork) → orbe del color del tipo
const props = defineProps({
  form: { type: Object, required: true },
  alt: { type: String, default: '' },
  size: { type: Number, default: 96 },
  // 'auto' sigue la preferencia global; 'static' fuerza la imagen fija
  mode: { type: String, default: 'auto' },
  // card | slot | mini: ajusta la sombra y el escalado
  variant: { type: String, default: 'card' },
  eager: { type: Boolean, default: false },
})

const ui = useUiStore()
const animFailed = ref(false)
const staticFailed = ref(false)
const loaded = ref(false)

const showAnimated = computed(
  () => props.mode === 'auto' && ui.animatedSprites && !!props.form.animated && !animFailed.value,
)

const src = computed(() => {
  if (showAnimated.value) return props.form.animated
  return staticFailed.value ? '' : props.form.sprite
})

const color = computed(() => typeColor(props.form.types[0]))

watch(src, () => (loaded.value = false))
watch(
  () => props.form,
  () => {
    animFailed.value = false
    staticFailed.value = false
  },
)

function onError() {
  if (showAnimated.value) animFailed.value = true
  else staticFailed.value = true
}
</script>

<style lang="scss" scoped>
.poke-sprite {
  position: relative;
  display: inline-grid;
  place-items: center;
  width: var(--size);
  height: var(--size);
  flex-shrink: 0;

  img {
    grid-area: 1 / 1;
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
    transition:
      transform 0.45s var(--pc-ease),
      filter 0.45s,
      opacity 0.3s;
    filter: drop-shadow(0 6px 10px rgba(0, 0, 0, 0.5));
  }
  &.is-loading img {
    opacity: 0;
  }

  // Los GIF de Showdown miden ~60–100 px: se escalan sin desbordar y con el pie apoyado abajo
  &.is-animated img {
    width: auto;
    height: auto;
    min-height: 55%;
    align-self: end;
  }
  &.is-animated::after {
    // sombra elíptica en el suelo, como en combate
    content: '';
    grid-area: 1 / 1;
    align-self: end;
    width: 60%;
    height: 10%;
    border-radius: 50%;
    background: radial-gradient(
      ellipse,
      color-mix(in srgb, var(--c1) 45%, rgba(0, 0, 0, 0.6)),
      transparent 70%
    );
    z-index: -1;
  }

  &__orb {
    grid-area: 1 / 1;
    width: 70%;
    height: 70%;
    border-radius: 50%;
    background: radial-gradient(
      circle,
      color-mix(in srgb, var(--c1) 40%, transparent),
      transparent 70%
    );
    animation: pc-float 2.4s ease-in-out infinite;
  }

  &--mini img {
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.5));
  }
}
</style>
