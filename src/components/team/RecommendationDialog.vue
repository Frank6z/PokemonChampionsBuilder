<template>
  <q-dialog
    :model-value="!!rec"
    transition-show="jump-up"
    transition-hide="jump-down"
    @update:model-value="(v) => !v && $emit('close')"
  >
    <q-card v-if="rec" class="rec-dialog metal-border" :style="{ '--c1': c1, '--c2': c2 }">
      <div class="rec-dialog__bg" />
      <q-card-section class="row items-center no-wrap q-gutter-md relative-position">
        <PokeSprite :form="rec.form" :alt="rec.species.name" :size="120" variant="slot" eager />
        <div class="col">
          <div class="text-caption text-dim font-display rec-dialog__kicker">Recomendación</div>
          <div class="rec-dialog__name font-display">
            {{ rec.form.isMega ? rec.form.fullName : rec.species.name }}
          </div>
          <div class="row q-gutter-xs q-mb-xs">
            <TypeBadge v-for="t in rec.form.types" :key="t" :type="t" size="sm" />
          </div>
          <div class="text-caption">
            Habilidad: <b>{{ rec.ability }}</b>
            <span v-if="rec.rank">
              · objeto más usado: <b>{{ rec.rank.topItem }}</b></span
            >
          </div>
        </div>
        <q-btn flat round dense icon="mdi-close" class="self-start" @click="$emit('close')" />
      </q-card-section>

      <q-card-section class="relative-position q-pt-none">
        <div class="section-title q-mb-sm">
          <q-icon name="mdi-chart-timeline-variant" />Impacto en el equipo
        </div>
        <div v-for="m in meters" :key="m.key" class="impact-row">
          <span class="impact-row__label">{{ m.label }}</span>
          <div class="impact-row__track">
            <div class="impact-row__before" :style="{ width: `${m.before}%` }" />
            <div
              class="impact-row__after"
              :class="m.after >= m.before ? 'is-up' : 'is-down'"
              :style="{
                left: `${Math.min(m.before, m.after)}%`,
                width: `${Math.abs(m.after - m.before)}%`,
              }"
            />
          </div>
          <span class="impact-row__value">
            {{ m.before }} →
            <b
              :class="
                m.after > m.before ? 'text-positive' : m.after < m.before ? 'text-negative' : ''
              "
              >{{ m.after }}</b
            >
          </span>
        </div>
        <div v-if="rec.replaces" class="text-caption text-amber q-mt-xs">
          <q-icon name="mdi-swap-horizontal" /> Calculado sustituyendo a
          {{ rec.replaces.species.name }}.
        </div>
      </q-card-section>

      <q-card-section class="relative-position q-pt-none">
        <div class="section-title q-mb-sm"><q-icon name="mdi-lightbulb-on" />Por qué encaja</div>
        <transition-group name="list" tag="ul" class="reasons">
          <li v-for="r in rec.reasons" :key="r.text" :class="r.points < 0 ? 'is-negative' : ''">
            <q-icon :name="r.icon" />
            <span class="col">{{ r.text }}</span>
            <span class="reasons__pts">{{ r.points > 0 ? '+' : '' }}{{ r.points.toFixed(1) }}</span>
          </li>
        </transition-group>
        <div class="text-caption text-dim q-mt-sm">
          Puntuación heurística: tabla de tipos, roles inferidos de stats y learnset, y ranking de
          uso. No sustituye a probar el equipo en combate.
        </div>
      </q-card-section>

      <q-card-actions align="right" class="relative-position q-pa-md">
        <q-btn
          flat
          no-caps
          label="Ver ficha"
          icon="mdi-open-in-new"
          :to="{
            name: 'pokemon',
            params: { key: rec.species.key },
            query: rec.formIndex ? { form: rec.formIndex } : {},
          }"
        />
        <q-btn
          unelevated
          no-caps
          class="pc-btn rec-dialog__cta"
          :icon="rec.replaces ? 'mdi-swap-horizontal' : 'mdi-plus'"
          :label="rec.replaces ? `Sustituir a ${rec.replaces.species.name}` : 'Añadir al equipo'"
          @click="$emit('apply', rec)"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { computed } from 'vue'
import PokeSprite from '@/components/PokeSprite.vue'
import TypeBadge from '@/components/TypeBadge.vue'
import { typeColor } from '@/utils/types.js'

const props = defineProps({
  rec: { type: Object, default: null },
  // medidores actuales del equipo
  scores: { type: Object, required: true },
})
defineEmits(['close', 'apply'])

const c1 = computed(() => (props.rec ? typeColor(props.rec.form.types[0]) : '#888'))
const c2 = computed(() =>
  props.rec ? typeColor(props.rec.form.types[1] || props.rec.form.types[0]) : '#888',
)

const meters = computed(() => [
  {
    key: 'def',
    label: 'Solidez defensiva',
    before: props.scores.defensive,
    after: props.rec.after.defensive,
  },
  {
    key: 'off',
    label: 'Cobertura ofensiva',
    before: props.scores.offensive,
    after: props.rec.after.offensive,
  },
  {
    key: 'meta',
    label: 'Preparación meta',
    before: props.scores.meta,
    after: props.rec.after.meta,
  },
])
</script>

<style lang="scss" scoped>
.rec-dialog {
  position: relative;
  width: 560px;
  max-width: 94vw;
  overflow: hidden;
  border-radius: 22px 6px 22px 22px !important;

  &__bg {
    position: absolute;
    inset: 0;
    background:
      radial-gradient(
        420px 220px at 15% 0%,
        color-mix(in srgb, var(--c1) 35%, transparent),
        transparent 70%
      ),
      radial-gradient(
        360px 200px at 100% 100%,
        color-mix(in srgb, var(--c2) 22%, transparent),
        transparent 70%
      );
    pointer-events: none;
  }
  &__kicker {
    text-transform: uppercase;
    letter-spacing: 0.16em;
    font-weight: 700;
  }
  &__name {
    font-size: 1.8rem;
    font-weight: 700;
    line-height: 1.05;
    margin-bottom: 6px;
  }
  &__cta {
    background: linear-gradient(135deg, var(--c1), color-mix(in srgb, var(--c2) 70%, #000));
    color: #fff;
    font-weight: 700;
  }
}

.impact-row {
  display: grid;
  grid-template-columns: 130px 1fr 82px;
  align-items: center;
  gap: 10px;
  padding: 4px 0;
  font-size: 0.85rem;
  &__label {
    color: var(--pc-text-dim);
  }
  &__track {
    position: relative;
    height: 10px;
    border-radius: 5px;
    background: rgba(255, 255, 255, 0.06);
    overflow: hidden;
  }
  &__before {
    height: 100%;
    background: rgba(255, 255, 255, 0.28);
  }
  &__after {
    position: absolute;
    top: 0;
    height: 100%;
    animation: grow 0.8s var(--pc-ease) both;
    transform-origin: left;
    &.is-up {
      background: var(--pc-ok);
      box-shadow: 0 0 10px var(--pc-ok);
    }
    &.is-down {
      background: var(--pc-danger);
    }
  }
  &__value {
    text-align: right;
    font-variant-numeric: tabular-nums;
  }
}

@keyframes grow {
  from {
    transform: scaleX(0);
  }
}

.reasons {
  list-style: none;
  margin: 0;
  padding: 0;
  li {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px 10px;
    margin-bottom: 4px;
    border-radius: 10px;
    background: rgba(52, 224, 161, 0.08);
    font-size: 0.88rem;
    &.is-negative {
      background: rgba(255, 77, 109, 0.1);
      color: #ffb3c1;
    }
  }
  &__pts {
    font-weight: 800;
    font-variant-numeric: tabular-nums;
  }
}
</style>
