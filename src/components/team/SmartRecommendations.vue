<template>
  <div class="smart">
    <PokeLoader v-if="loading" label="Analizando el equipo…" :rows="3" />

    <div v-else-if="!recommendations.length" class="text-dim text-caption">
      {{
        full
          ? 'Ningún cambio mejora los medidores: tu equipo está bien compensado.'
          : 'Sin recomendaciones por ahora.'
      }}
    </div>

    <transition-group v-else name="rec" tag="div" class="smart__list">
      <article
        v-for="(rec, i) in recommendations"
        :key="rec.species.key"
        class="rec glass"
        :style="{
          '--c1': typeColor(rec.form.types[0]),
          '--c2': typeColor(rec.form.types[1] || rec.form.types[0]),
          '--i': i,
        }"
      >
        <div class="rec__glow" />
        <header class="rec__head">
          <PokeSprite :form="rec.form" :alt="rec.species.name" :size="72" variant="slot" />
          <div class="col">
            <div class="rec__name font-display">
              {{ rec.form.isMega ? rec.form.fullName : rec.species.name }}
            </div>
            <div class="row q-gutter-xs no-wrap">
              <TypeBadge v-for="t in rec.form.types" :key="t" :type="t" size="sm" />
            </div>
            <div v-if="rec.replaces" class="rec__swap text-caption">
              <q-icon name="mdi-swap-horizontal" /> en lugar de {{ rec.replaces.species.name }}
            </div>
          </div>
          <span class="rec__rank font-display">{{ i + 1 }}</span>
        </header>

        <div class="rec__impact">
          <span
            v-for="d in impactChips(rec)"
            :key="d.key"
            class="impact"
            :class="d.value > 0 ? 'impact--up' : d.value < 0 ? 'impact--down' : ''"
          >
            <q-icon :name="d.icon" />{{ d.value > 0 ? '+' : '' }}{{ d.value }}
            <q-tooltip
              >{{ d.label }}: {{ d.value > 0 ? 'sube' : d.value < 0 ? 'baja' : 'igual' }}</q-tooltip
            >
          </span>
        </div>

        <ul class="rec__reasons">
          <li v-for="r in rec.reasons.filter((x) => x.points > 0).slice(0, 3)" :key="r.text">
            <q-icon :name="r.icon" :class="`reason--${r.kind}`" />
            <span>{{ r.text }}</span>
          </li>
        </ul>

        <footer class="row q-gutter-sm">
          <q-btn
            unelevated
            dense
            no-caps
            class="pc-btn col rec__add"
            :icon="rec.replaces ? 'mdi-swap-horizontal' : 'mdi-plus'"
            :label="rec.replaces ? 'Sustituir' : 'Añadir'"
            @click="$emit('apply', rec)"
          />
          <q-btn
            flat
            dense
            no-caps
            class="pc-btn"
            icon="mdi-information-outline"
            label="¿Por qué?"
            @click="$emit('details', rec)"
          />
        </footer>
      </article>
    </transition-group>
  </div>
</template>

<script setup>
import PokeLoader from '@/components/PokeLoader.vue'
import PokeSprite from '@/components/PokeSprite.vue'
import TypeBadge from '@/components/TypeBadge.vue'
import { typeColor } from '@/utils/types.js'

defineProps({
  recommendations: { type: Array, required: true },
  loading: { type: Boolean, default: false },
  full: { type: Boolean, default: false },
})
defineEmits(['apply', 'details'])

function impactChips(rec) {
  return [
    {
      key: 'def',
      icon: 'mdi-shield-half-full',
      label: 'Solidez defensiva',
      value: rec.impact.defensive,
    },
    {
      key: 'off',
      icon: 'mdi-sword-cross',
      label: 'Cobertura ofensiva',
      value: rec.impact.offensive,
    },
    { key: 'meta', icon: 'mdi-trophy', label: 'Preparación meta', value: rec.impact.meta },
  ]
}
</script>

<style lang="scss" scoped>
.smart__list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.rec {
  position: relative;
  overflow: hidden;
  padding: 12px;
  border-radius: 18px 4px 18px 18px;
  border-color: color-mix(in srgb, var(--c1) 35%, var(--pc-border));
  transition:
    transform 0.3s var(--pc-ease),
    box-shadow 0.3s;
  &:hover {
    transform: translateX(-3px);
    box-shadow: 0 10px 28px color-mix(in srgb, var(--c1) 30%, transparent);
  }

  &__glow {
    position: absolute;
    inset: -50% 40% 40% -30%;
    background: radial-gradient(
      circle,
      color-mix(in srgb, var(--c1) 40%, transparent),
      transparent 70%
    );
    filter: blur(14px);
    pointer-events: none;
  }
  &__head {
    position: relative;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  &__name {
    font-size: 1.15rem;
    font-weight: 700;
    line-height: 1.1;
    margin-bottom: 4px;
  }
  &__swap {
    color: var(--pc-accent);
    margin-top: 4px;
  }
  &__rank {
    align-self: flex-start;
    font-size: 1.6rem;
    font-weight: 700;
    color: var(--pc-text-dim);
    opacity: 0.4;
  }
  &__impact {
    position: relative;
    display: flex;
    gap: 6px;
    margin: 8px 0 6px;
  }
  &__reasons {
    position: relative;
    list-style: none;
    margin: 0 0 10px;
    padding: 0;
    font-size: 0.8rem;
    li {
      display: flex;
      gap: 6px;
      align-items: flex-start;
      padding: 2px 0;
      line-height: 1.3;
    }
    .q-icon {
      margin-top: 1px;
      flex-shrink: 0;
    }
  }
  &__add {
    background: linear-gradient(135deg, var(--c1), color-mix(in srgb, var(--c2) 70%, #000));
    color: #fff;
    font-weight: 700;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
  }
}

.impact {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 800;
  background: rgba(255, 255, 255, 0.05);
  color: var(--pc-text-dim);
  &--up {
    background: rgba(52, 224, 161, 0.14);
    color: var(--pc-ok);
  }
  &--down {
    background: rgba(255, 77, 109, 0.14);
    color: var(--pc-danger);
  }
}

.reason--defense {
  color: var(--pc-ok);
}
.reason--offense {
  color: #ff9d5c;
}
.reason--role {
  color: var(--pc-accent-2);
}
.reason--meta {
  color: var(--pc-accent);
}

// Entrada escalonada de las tarjetas (--i = posición)
.rec-enter-active {
  transition:
    opacity 0.4s ease,
    transform 0.5s var(--pc-ease);
  transition-delay: calc(var(--i) * 90ms);
}
.rec-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
  position: absolute;
  width: 100%;
}
.rec-enter-from {
  opacity: 0;
  transform: translateX(24px);
}
.rec-leave-to {
  opacity: 0;
  transform: scale(0.95);
}
.rec-move {
  transition: transform 0.4s var(--pc-ease);
}
</style>
