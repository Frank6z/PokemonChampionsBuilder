<template>
  <div class="matrix-wrap">
    <table class="matrix">
      <thead>
        <tr>
          <th class="matrix__type-col">Ataque</th>
          <th v-for="m in members" :key="m.index" class="matrix__member">
            <img :src="m.form.sprite" :alt="m.species.name" />
            <q-tooltip>{{ m.species.name }} · {{ m.ability }}</q-tooltip>
          </th>
          <th class="matrix__sum text-negative">Déb.</th>
          <th class="matrix__sum text-positive">Res.</th>
          <th class="matrix__sum" style="color: #b48cff">Inm.</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in rows" :key="row.type" :class="`matrix__row--${row.level}`">
          <td class="matrix__type-col">
            <TypeBadge :type="row.type" size="sm" />
            <q-icon
              v-if="row.level === 'danger'"
              name="mdi-alert"
              color="negative"
              size="18px"
              class="q-ml-xs matrix__alert"
            >
              <q-tooltip>
                {{ row.weak }} miembros débiles a {{ TYPES[row.type].es }} y solo
                {{ row.resist + row.immune }} lo resisten
              </q-tooltip>
            </q-icon>
          </td>
          <td v-for="(mult, i) in row.mults" :key="i" class="matrix__cell" :class="cellClass(mult)">
            {{ mult === 1 ? '' : formatMult(mult) }}
          </td>
          <td class="matrix__sum" :class="{ 'text-negative text-weight-bold': row.weak > 0 }">
            {{ row.weak || '' }}
          </td>
          <td class="matrix__sum" :class="{ 'text-positive text-weight-bold': row.resist > 0 }">
            {{ row.resist || '' }}
          </td>
          <td class="matrix__sum" :class="{ 'text-weight-bold': row.immune > 0 }">
            {{ row.immune || '' }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import TypeBadge from '@/components/TypeBadge.vue'
import { TYPES, formatMult } from '@/utils/types.js'

defineProps({
  members: { type: Array, required: true },
  rows: { type: Array, required: true },
})

function cellClass(m) {
  if (m === 0) return 'cell--immune'
  if (m >= 4) return 'cell--x4'
  if (m > 1) return 'cell--x2'
  if (m <= 0.25) return 'cell--q'
  if (m < 1) return 'cell--h'
  return ''
}
</script>

<style lang="scss" scoped>
.matrix-wrap {
  overflow-x: auto;
}
.matrix {
  width: 100%;
  border-collapse: separate;
  border-spacing: 3px;
  font-size: 0.8rem;

  th {
    font-family: var(--pc-font-display);
    font-weight: 700;
    color: var(--pc-text-dim);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
  &__type-col {
    text-align: left;
    white-space: nowrap;
    width: 1%;
    padding-right: 8px;
  }
  &__member img {
    width: 40px;
    height: 40px;
    object-fit: contain;
  }
  &__cell {
    text-align: center;
    min-width: 40px;
    height: 28px;
    border-radius: 6px;
    background: rgba(255, 255, 255, 0.03);
    font-weight: 800;
    transition: transform 0.2s var(--pc-ease);
    &:hover {
      transform: scale(1.12);
    }
  }
  &__sum {
    text-align: center;
    width: 44px;
  }

  tr.matrix__row--danger td:first-child {
    border-radius: 999px;
    animation: pc-warn-pulse 1.8s ease-in-out infinite;
  }
  tr.matrix__row--danger td {
    background-color: rgba(255, 77, 109, 0.06);
  }
}

.cell--x4 {
  background: #c9184a !important;
  color: #fff;
}
.cell--x2 {
  background: rgba(255, 77, 109, 0.55) !important;
  color: #fff;
}
.cell--h {
  background: rgba(52, 224, 161, 0.35) !important;
}
.cell--q {
  background: rgba(52, 224, 161, 0.65) !important;
  color: #062;
}
.cell--immune {
  background: rgba(180, 140, 255, 0.55) !important;
  color: #fff;
}
</style>
