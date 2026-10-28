<template>
  <div class="diag">
    <section class="diag__col diag__col--ok glass">
      <header class="diag__head">
        <q-icon name="mdi-check-decagram" size="22px" />
        <span class="font-display">Por qué funciona</span>
        <q-badge rounded :label="report.strengths.length" class="diag__count" />
      </header>
      <transition-group name="list" tag="ul" class="diag__list">
        <li v-for="s in report.strengths" :key="s.title">
          <q-icon :name="s.icon" class="diag__icon" />
          <div>
            <div class="diag__title">{{ s.title }}</div>
            <div class="diag__detail">{{ s.detail }}</div>
          </div>
        </li>
      </transition-group>
      <div v-if="!report.strengths.length" class="diag__empty">
        Aún no hay puntos fuertes claros. Añade miembros y movimientos.
      </div>
    </section>

    <section class="diag__col diag__col--risk glass">
      <header class="diag__head">
        <q-icon name="mdi-alert-decagram" size="22px" />
        <span class="font-display">Por qué puede fallar</span>
        <q-badge rounded :label="report.risks.length" class="diag__count" />
      </header>
      <transition-group name="list" tag="ul" class="diag__list">
        <li v-for="r in report.risks" :key="r.title" :class="`is-${r.level}`">
          <q-icon :name="r.icon" class="diag__icon" />
          <div>
            <div class="diag__title">{{ r.title }}</div>
            <div class="diag__detail">{{ r.detail }}</div>
          </div>
        </li>
      </transition-group>
      <div v-if="!report.risks.length" class="diag__empty">Sin riesgos detectados.</div>
    </section>

    <section class="diag__col diag__col--fix glass">
      <header class="diag__head">
        <q-icon name="mdi-wrench" size="22px" />
        <span class="font-display">Cómo mejorarlo</span>
      </header>
      <transition-group name="list" tag="ol" class="diag__list diag__steps">
        <li v-for="(s, i) in report.steps" :key="s.text">
          <span class="diag__step font-display">{{ i + 1 }}</span>
          <div class="col">
            <div class="diag__title diag__title--step">{{ s.text }}</div>
            <q-btn
              v-if="s.action?.type === 'add'"
              dense
              flat
              no-caps
              size="sm"
              color="amber"
              class="pc-btn q-mt-xs"
              :icon="s.action.rec.replaces ? 'mdi-swap-horizontal' : 'mdi-plus'"
              :label="
                s.action.rec.replaces ? 'Aplicar cambio' : `Añadir ${s.action.rec.species.name}`
              "
              @click="$emit('apply', s.action.rec)"
            />
          </div>
        </li>
      </transition-group>
      <div v-if="!report.steps.length" class="diag__empty">
        Nada urgente: prueba el equipo en combate.
      </div>
    </section>
  </div>
</template>

<script setup>
defineProps({
  // salida de diagnose() en utils/diagnosis.js
  report: { type: Object, required: true },
})
defineEmits(['apply'])
</script>

<style lang="scss" scoped>
.diag {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 12px;

  &__col {
    position: relative;
    padding: 14px 16px;
    border-radius: 18px 4px 18px 18px;
    border-top: 3px solid var(--tone);
    overflow: hidden;
    &::before {
      content: '';
      position: absolute;
      inset: 0 0 auto 0;
      height: 80px;
      background: linear-gradient(
        180deg,
        color-mix(in srgb, var(--tone) 14%, transparent),
        transparent
      );
      pointer-events: none;
    }
    &--ok {
      --tone: #34e0a1;
    }
    &--risk {
      --tone: #ff4d6d;
    }
    &--fix {
      --tone: #e9c80d;
    }
  }
  &__head {
    position: relative;
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 10px;
    color: var(--tone);
    font-size: 1.1rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }
  &__count {
    background: var(--tone);
    color: #111;
    font-weight: 800;
  }
  &__list {
    position: relative;
    list-style: none;
    margin: 0;
    padding: 0;
    li {
      display: flex;
      gap: 10px;
      padding: 8px 0;
      border-bottom: 1px solid var(--pc-border);
      &:last-child {
        border-bottom: 0;
      }
      &.is-high .diag__icon {
        color: var(--pc-danger);
        animation: pc-warn-pulse 2s ease-in-out infinite;
        border-radius: 50%;
      }
      &.is-medium .diag__icon {
        color: #ffb03a;
      }
      &.is-low .diag__icon {
        color: var(--pc-text-dim);
      }
    }
  }
  &__icon {
    font-size: 20px;
    color: var(--tone);
    flex-shrink: 0;
    margin-top: 1px;
  }
  &__title {
    font-weight: 700;
    font-size: 0.92rem;
    line-height: 1.25;
    &--step {
      font-weight: 500;
    }
  }
  &__detail {
    font-size: 0.8rem;
    color: var(--pc-text-dim);
    line-height: 1.3;
    margin-top: 2px;
  }
  &__step {
    flex-shrink: 0;
    display: grid;
    place-items: center;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: var(--tone);
    color: #111;
    font-weight: 700;
  }
  &__empty {
    position: relative;
    color: var(--pc-text-dim);
    font-size: 0.85rem;
  }
}
</style>
