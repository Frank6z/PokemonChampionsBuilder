<template>
  <div class="threats">
    <transition-group name="list" tag="div" class="threats__grid">
      <router-link
        v-for="t in threats"
        :key="t.id"
        :to="{
          name: 'pokemon',
          params: { key: t.id },
          query: t.formIndex ? { form: t.formIndex } : {},
        }"
        class="threat"
        :class="`threat--${t.status}`"
        :style="{ '--c1': typeColor(t.form.types[0]) }"
      >
        <span class="threat__rank font-display">#{{ t.rank }}</span>
        <PokeSprite :form="t.form" :alt="t.species.name" :size="48" variant="mini" />
        <div class="col threat__body">
          <div class="threat__name font-display ellipsis">
            {{ t.form.isMega ? t.form.fullName : t.species.name }}
          </div>
          <div class="row q-gutter-xs no-wrap">
            <TypeBadge v-for="at in t.attackTypes" :key="at" :type="at" size="sm" icon-only />
          </div>
        </div>
        <div class="threat__status">
          <q-icon :name="STATUS[t.status].icon" size="22px" />
        </div>
        <q-tooltip max-width="300px" class="threat__tip">
          <div class="text-weight-bold q-mb-xs">{{ STATUS[t.status].label }}</div>
          <div>Objeto más usado: {{ t.topItem }} · {{ t.topMove }}</div>
          <div class="q-mt-xs">
            <b>Ataque:</b>
            {{
              t.offense.best > 1
                ? t.offense.hitters.slice(0, 3).join(', ')
                : 'nadie le pega supereficaz'
            }}
          </div>
          <div>
            <b>Defensa:</b>
            {{
              t.walls.length
                ? `${t.walls.join(', ')} resiste sus ataques`
                : 'nadie resiste todos sus ataques'
            }}
          </div>
          <div v-if="t.threatened">{{ t.threatened }} miembro(s) reciben daño supereficaz</div>
        </q-tooltip>
      </router-link>
    </transition-group>
  </div>
</template>

<script setup>
import PokeSprite from '@/components/PokeSprite.vue'
import TypeBadge from '@/components/TypeBadge.vue'
import { typeColor } from '@/utils/types.js'

defineProps({
  // salida de metaReadiness() en utils/teamAnalysis.js
  threats: { type: Array, required: true },
})

const STATUS = {
  answered: { label: 'Cubierto: lo golpeas y lo aguantas', icon: 'mdi-shield-check' },
  partial: { label: 'Respuesta parcial', icon: 'mdi-shield-half-full' },
  open: { label: 'Sin respuesta', icon: 'mdi-shield-alert' },
}
</script>

<style lang="scss" scoped>
.threats__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(230px, 1fr));
  gap: 10px;
}
.threat {
  position: relative;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px 8px 8px;
  border-radius: 14px 4px 14px 14px;
  color: inherit;
  text-decoration: none;
  background: linear-gradient(
    90deg,
    color-mix(in srgb, var(--c1) 16%, transparent),
    rgba(255, 255, 255, 0.03)
  );
  border: 1px solid var(--pc-border);
  transition:
    transform 0.25s var(--pc-ease),
    border-color 0.25s;
  &:hover {
    transform: translateY(-2px);
  }
  &__rank {
    position: absolute;
    top: 4px;
    left: 8px;
    font-size: 0.7rem;
    font-weight: 700;
    color: var(--pc-text-dim);
  }
  &__body {
    min-width: 0;
  }
  &__name {
    font-weight: 700;
    font-size: 1rem;
  }

  &--answered {
    border-color: rgba(52, 224, 161, 0.4);
    .threat__status {
      color: var(--pc-ok);
    }
  }
  &--partial {
    border-color: rgba(233, 200, 13, 0.4);
    .threat__status {
      color: var(--pc-accent);
    }
  }
  &--open {
    border-color: rgba(255, 77, 109, 0.5);
    animation: pc-warn-pulse 2.2s ease-in-out infinite;
    .threat__status {
      color: var(--pc-danger);
    }
  }
}
</style>
