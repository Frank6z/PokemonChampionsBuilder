<template>
  <div class="poke-loader" role="status" :aria-label="label">
    <div class="poke-loader__head">
      <span class="poke-loader__ball" aria-hidden="true"><span /></span>
      <span class="poke-loader__label font-display">{{ label }}</span>
    </div>
    <div
      v-for="n in rows"
      :key="n"
      class="poke-loader__row"
      :style="{ '--w': `${widths[(n - 1) % widths.length]}%`, '--d': `${n * 80}ms` }"
    />
  </div>
</template>

<script setup>
defineProps({
  label: { type: String, default: 'Cargando…' },
  rows: { type: Number, default: 4 },
})

const widths = [92, 76, 84, 64, 88, 70]
</script>

<style lang="scss" scoped>
.poke-loader {
  padding: 8px 0;

  &__head {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 14px;
  }
  &__label {
    color: var(--pc-text-dim);
    text-transform: uppercase;
    letter-spacing: 0.14em;
    font-weight: 700;
    font-size: 0.85rem;
  }

  // Poké Ball en CSS: mitad superior roja, franja y botón central
  &__ball {
    position: relative;
    width: 28px;
    height: 28px;
    border-radius: 50%;
    border: 2px solid #111;
    background: linear-gradient(180deg, #ff3b4f 0 46%, #111 46% 54%, #f2f4f8 54% 100%);
    animation: ball-wobble 1.1s var(--pc-ease) infinite;
    span {
      position: absolute;
      inset: 50% auto auto 50%;
      width: 10px;
      height: 10px;
      transform: translate(-50%, -50%);
      border-radius: 50%;
      background: #f2f4f8;
      border: 2px solid #111;
      animation: ball-glow 1.1s ease-in-out infinite;
    }
  }

  // Filas con barrido de brillo
  &__row {
    height: 14px;
    width: var(--w);
    margin-bottom: 12px;
    border-radius: 7px;
    background: linear-gradient(
      100deg,
      rgba(255, 255, 255, 0.04) 20%,
      rgba(140, 170, 255, 0.16) 40%,
      rgba(255, 255, 255, 0.04) 60%
    );
    background-size: 300% 100%;
    animation: shimmer 1.4s linear infinite;
    animation-delay: var(--d);
  }
}

@keyframes ball-wobble {
  0%,
  100% {
    transform: rotate(0);
  }
  20% {
    transform: rotate(-22deg);
  }
  40% {
    transform: rotate(18deg);
  }
  60% {
    transform: rotate(0);
  }
}
@keyframes ball-glow {
  50% {
    background: var(--pc-accent);
    box-shadow: 0 0 10px var(--pc-accent);
  }
}
@keyframes shimmer {
  from {
    background-position: 100% 0;
  }
  to {
    background-position: -200% 0;
  }
}
</style>
