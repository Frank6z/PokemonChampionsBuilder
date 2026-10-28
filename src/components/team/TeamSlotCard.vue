<template>
  <div
    class="slot glass metal-border"
    :class="{ 'slot--empty': !member, 'slot--drop': dropping, 'slot--dragging': dragging }"
    :style="{ '--c1': c1, '--c2': c2 }"
    @dragover.prevent="onDragOver"
    @dragleave="dropping = false"
    @drop.prevent="onDrop"
  >
    <transition name="slot-swap" mode="out-in">
      <!-- Hueco vacío: selector de especie -->
      <div v-if="!member" key="empty" class="slot__inner slot__inner--empty">
        <div class="slot__index font-display">{{ index + 1 }}</div>
        <q-icon name="mdi-pokeball" size="44px" class="slot__ball" />
        <q-select
          :model-value="null"
          :options="pickerOptions"
          use-input
          input-debounce="0"
          outlined
          dense
          emit-value
          map-options
          label="Añadir Pokémon"
          class="full-width"
          popup-content-class="slot__picker"
          @filter="filterPicker"
          @update:model-value="pick"
        >
          <template #option="scope">
            <q-item v-bind="scope.itemProps">
              <q-item-section avatar
                ><img :src="scope.opt.sprite" alt="" class="slot__opt-img"
              /></q-item-section>
              <q-item-section>
                <q-item-label>{{ scope.opt.label }}</q-item-label>
                <q-item-label caption>
                  <TypeBadge
                    v-for="t in scope.opt.types"
                    :key="t"
                    :type="t"
                    size="sm"
                    icon-only
                    class="q-mr-xs"
                  />
                </q-item-label>
              </q-item-section>
            </q-item>
          </template>
        </q-select>
      </div>

      <!-- Miembro -->
      <div v-else :key="`${slot.key}-${slot.formIndex}`" class="slot__inner slot__inner--member">
        <div class="slot__glow" />
        <div class="slot__burst" aria-hidden="true" />
        <div class="slot__head">
          <div
            class="slot__handle"
            draggable="true"
            @dragstart="onDragStart"
            @dragend="dragging = false"
          >
            <PokeSprite :form="form" :alt="species.name" :size="84" variant="slot" eager />
            <q-icon name="mdi-drag" class="slot__drag-icon" />
            <q-tooltip>Arrastra para reordenar</q-tooltip>
          </div>
          <div class="col">
            <router-link
              :to="{ name: 'pokemon', params: { key: species.key } }"
              class="slot__name font-display"
            >
              {{ species.name }}
            </router-link>
            <div class="row q-gutter-xs q-mt-xs">
              <TypeBadge v-for="t in form.types" :key="t" :type="t" size="sm" />
            </div>
          </div>
          <div class="column q-gutter-xs">
            <q-btn
              flat
              round
              dense
              size="sm"
              icon="mdi-close"
              class="pc-btn"
              @click="team.clear(index)"
            >
              <q-tooltip>Quitar</q-tooltip>
            </q-btn>
          </div>
        </div>

        <div class="row q-col-gutter-xs q-mt-sm">
          <div v-if="species.forms.length > 1" class="col-12">
            <q-btn-toggle
              :model-value="slot.formIndex"
              spread
              dense
              no-caps
              unelevated
              toggle-color="amber"
              toggle-text-color="dark"
              class="slot__forms"
              :options="species.forms.map((f, i) => ({ label: f.name, value: i }))"
              @update:model-value="(i) => team.setForm(index, i)"
            />
          </div>
          <div class="col-6">
            <q-select
              v-model="slot.ability"
              :options="form.abilities.map((a) => a.name)"
              dense
              outlined
              options-dense
              label="Habilidad"
            />
          </div>
          <div class="col-6">
            <q-select
              v-model="slot.item"
              :options="itemOptions"
              dense
              outlined
              options-dense
              use-input
              hide-selected
              fill-input
              input-debounce="0"
              new-value-mode="add-unique"
              clearable
              label="Objeto"
              @filter="filterItems"
            />
          </div>
          <div v-for="(m, mi) in slot.moves" :key="mi" class="col-6">
            <q-select
              v-model="slot.moves[mi]"
              :options="moveOptionsFiltered"
              dense
              outlined
              options-dense
              use-input
              hide-selected
              fill-input
              input-debounce="0"
              clearable
              emit-value
              map-options
              :label="`Movimiento ${mi + 1}`"
              :loading="!moveData"
              class="slot__move"
              :style="{ '--mc': moveColor(m) }"
              @filter="filterMoves"
            >
              <template #option="scope">
                <q-item v-bind="scope.itemProps" dense>
                  <q-item-section side
                    ><TypeBadge :type="scope.opt.type" size="sm" icon-only
                  /></q-item-section>
                  <q-item-section>
                    <q-item-label>{{ scope.opt.label }}</q-item-label>
                    <q-item-label caption>
                      {{ CATEGORY_META[scope.opt.category].es }} · BP {{ scope.opt.power || '—' }}
                    </q-item-label>
                  </q-item-section>
                  <q-item-section v-if="scope.opt.usage != null" side>
                    <q-badge
                      :color="scope.opt.usage >= META_THRESHOLD ? 'amber' : 'grey-8'"
                      :text-color="scope.opt.usage >= META_THRESHOLD ? 'dark' : 'white'"
                    >
                      {{ scope.opt.usage.toFixed(0) }}%
                    </q-badge>
                  </q-item-section>
                </q-item>
              </template>
            </q-select>
          </div>
        </div>

        <div class="row items-center justify-between q-mt-sm">
          <div class="row q-gutter-xs">
            <q-icon
              v-for="r in roles"
              :key="r"
              :name="ROLE_META[r].icon"
              :style="{ color: ROLE_META[r].color }"
              size="20px"
            >
              <q-tooltip>{{ ROLE_META[r].label }}</q-tooltip>
            </q-icon>
          </div>
          <q-btn
            flat
            dense
            no-caps
            size="sm"
            icon="mdi-auto-fix"
            label="Set meta"
            color="amber"
            class="pc-btn"
            :loading="usageLoading"
            :disable="!usage || !moveData"
            @click="applyMetaSet"
          >
            <q-tooltip
              >Rellena con los 4 movimientos, el objeto y la habilidad más usados</q-tooltip
            >
          </q-btn>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import TypeBadge from '@/components/TypeBadge.vue'
import PokeSprite from '@/components/PokeSprite.vue'
import { useTeamStore } from '@/stores/team.js'
import { speciesList, formIndexForItem } from '@/services/pokedex.js'
import { learnsetFor, CATEGORY_META } from '@/services/moves.js'
import { META_THRESHOLD } from '@/services/battleData.js'
import { useMoveData } from '@/composables/useMoveData.js'
import { useUsage } from '@/composables/useUsage.js'
import { typeColor } from '@/utils/types.js'
import { inferRoles, ROLE_META } from '@/utils/roles.js'

const props = defineProps({ index: { type: Number, required: true } })

const team = useTeamStore()
const moveData = useMoveData()

const slot = computed(() => team.slots[props.index])
const member = computed(() => team.members.find((m) => m.index === props.index) || null)
const species = computed(() => member.value?.species)
const form = computed(() => member.value?.form)

const c1 = computed(() => (form.value ? typeColor(form.value.types[0]) : '#556'))
const c2 = computed(() =>
  form.value ? typeColor(form.value.types[1] || form.value.types[0]) : '#556',
)

const { usage, loading: usageLoading } = useUsage(
  () => slot.value.key,
  () => team.format,
)

// ---- selector de especie ----
const allPickerOptions = speciesList.flatMap((s) =>
  s.forms.map((f, i) => ({
    label: f.name === 'Base' ? s.name : `${s.name} (${f.name})`,
    value: `${s.key}|${i}`,
    sprite: f.sprite,
    types: f.types,
  })),
)
const pickerOptions = ref(allPickerOptions)
function filterPicker(val, update) {
  update(() => {
    const q = val.toLowerCase()
    pickerOptions.value = allPickerOptions.filter((o) => o.label.toLowerCase().includes(q))
  })
}
function pick(value) {
  if (!value) return
  const [key, i] = value.split('|')
  team.setMember(props.index, key, Number(i))
}

// ---- arrastrar para reordenar (HTML5 drag & drop; el asa es el sprite) ----
const DRAG_TYPE = 'application/x-pcb-slot'
const dragging = ref(false)
const dropping = ref(false)

function onDragStart(e) {
  dragging.value = true
  e.dataTransfer.effectAllowed = 'move'
  e.dataTransfer.setData(DRAG_TYPE, String(props.index))
}
function onDragOver(e) {
  if (e.dataTransfer.types.includes(DRAG_TYPE)) dropping.value = true
}
function onDrop(e) {
  dropping.value = false
  const from = Number(e.dataTransfer.getData(DRAG_TYPE))
  if (!Number.isNaN(from) && from !== props.index) team.swap(from, props.index)
}

// ---- objetos: los más usados según los datos de uso, o texto libre ----
const itemQuery = ref('')
const itemOptions = computed(() => {
  const list = (usage.value?.items || []).map((i) => i.name)
  const q = itemQuery.value.toLowerCase()
  return q ? list.filter((n) => n.toLowerCase().includes(q)) : list
})
function filterItems(val, update) {
  update(() => (itemQuery.value = val))
}

// ---- movimientos: learnset + los vistos en datos de uso ----
const moveOptions = computed(() => {
  if (!moveData.value || !species.value) return []
  const usageMap = new Map((usage.value?.moves || []).map((m) => [m.name, m.pct]))
  const byName = new Map()
  for (const m of learnsetFor(moveData.value, species.value) || []) byName.set(m.name, m)
  for (const name of usageMap.keys()) {
    const m = moveData.value.movesByName.get(name)
    if (m) byName.set(name, m)
  }
  return [...byName.values()]
    .map((m) => ({
      label: m.name,
      value: m.name,
      type: m.type,
      category: m.category,
      power: m.power,
      usage: usageMap.get(m.name) ?? null,
    }))
    .sort((a, b) => (b.usage ?? -1) - (a.usage ?? -1) || a.label.localeCompare(b.label))
})
const moveQuery = ref('')
const moveOptionsFiltered = computed(() => {
  const q = moveQuery.value.toLowerCase()
  const taken = new Set(slot.value.moves.filter(Boolean))
  return moveOptions.value.filter(
    (o) => (!q || o.label.toLowerCase().includes(q)) && !taken.has(o.value),
  )
})
function filterMoves(val, update) {
  update(() => (moveQuery.value = val))
}
function moveColor(name) {
  const m = name && moveData.value?.movesByName.get(name)
  return m ? typeColor(m.type) : 'transparent'
}

const resolvedMoves = computed(() =>
  moveData.value
    ? slot.value.moves.map((n) => n && moveData.value.movesByName.get(n)).filter(Boolean)
    : [],
)
const roles = computed(() =>
  form.value ? inferRoles(form.value, slot.value.ability, resolvedMoves.value) : [],
)

function applyMetaSet() {
  const u = usage.value
  if (!u) return
  const legal = new Set(moveOptions.value.map((o) => o.value))
  const top = u.moves
    .map((m) => m.name)
    .filter((n) => legal.has(n))
    .slice(0, 4)
  slot.value.moves = [...top, null, null, null, null].slice(0, 4)
  if (u.items[0]) {
    slot.value.item = u.items[0].name
    // Mega Piedra → forma Mega correspondiente (Charizardite Y → Mega Y)
    const fi = formIndexForItem(species.value, slot.value.item)
    if (fi !== slot.value.formIndex) team.setForm(props.index, fi)
  }
  // En Mega, setForm ya dejó la habilidad de la Mega (la que cuenta para el análisis)
  if (form.value.isMega) return
  const ability = u.abilities.find((a) => form.value.abilities.some((fa) => fa.name === a.name))
  if (ability) slot.value.ability = ability.name
}
</script>

<style lang="scss" scoped>
.slot {
  position: relative;
  overflow: hidden;
  padding: 14px;
  min-height: 320px;
  border-radius: 18px 4px 18px 18px;
  transition:
    transform 0.3s var(--pc-ease),
    box-shadow 0.3s,
    border-color 0.3s,
    opacity 0.2s;
  &:hover {
    transform: translateY(-3px);
    box-shadow:
      0 14px 36px rgba(0, 0, 0, 0.45),
      0 0 22px color-mix(in srgb, var(--c1) 30%, transparent);
  }

  &--empty {
    border-style: dashed;
  }
  // destino de arrastre
  &--drop {
    border-color: var(--pc-accent);
    box-shadow:
      0 0 0 2px var(--pc-accent),
      0 0 30px rgba(233, 200, 13, 0.35);
    transform: scale(1.02);
  }
  &--dragging {
    opacity: 0.45;
  }

  &__inner {
    position: relative;
    height: 100%;
    &--empty {
      min-height: 290px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 14px;
    }
  }

  &__index {
    position: absolute;
    top: -6px;
    left: 0;
    font-size: 1.6rem;
    font-weight: 700;
    color: var(--pc-text-dim);
    opacity: 0.5;
  }
  &__ball {
    color: var(--pc-text-dim);
    opacity: 0.4;
    animation: pc-float 3.5s ease-in-out infinite;
  }
  &__glow {
    position: absolute;
    inset: -60% -30% auto -30%;
    height: 70%;
    background: radial-gradient(
      circle at 25% 60%,
      color-mix(in srgb, var(--c1) 45%, transparent),
      transparent 65%
    );
    filter: blur(16px);
    pointer-events: none;
  }

  // Destello del color del tipo al entrar un Pokémon (una sola vez por clave)
  &__burst {
    position: absolute;
    top: 42px;
    left: 42px;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    pointer-events: none;
    box-shadow:
      0 0 0 0 color-mix(in srgb, var(--c1) 80%, white),
      0 0 0 0 color-mix(in srgb, var(--c2) 70%, transparent);
    animation: slot-burst 0.9s var(--pc-ease) forwards;
  }

  &__head {
    position: relative;
    display: flex;
    align-items: center;
    gap: 10px;
  }
  &__handle {
    position: relative;
    cursor: grab;
    border-radius: 14px;
    transition: background 0.2s;
    &:hover {
      background: rgba(255, 255, 255, 0.05);
    }
    &:active {
      cursor: grabbing;
    }
    :deep(img) {
      filter: drop-shadow(0 6px 10px color-mix(in srgb, var(--c1) 55%, transparent));
    }
  }
  &__drag-icon {
    position: absolute;
    bottom: 0;
    right: -2px;
    font-size: 16px;
    color: var(--pc-text-dim);
    opacity: 0;
    transition: opacity 0.2s;
  }
  &__handle:hover &__drag-icon {
    opacity: 1;
  }
  &__name {
    font-size: 1.3rem;
    font-weight: 700;
    color: inherit;
    text-decoration: none;
    &:hover {
      color: var(--pc-accent);
    }
  }
  &__forms {
    border-radius: 10px;
    background: rgba(255, 255, 255, 0.04);
  }
  &__move :deep(.q-field__control) {
    box-shadow: inset 3px 0 0 var(--mc);
  }
  &__opt-img {
    width: 36px;
    height: 36px;
    object-fit: contain;
  }
}

@keyframes slot-burst {
  0% {
    box-shadow:
      0 0 0 0 color-mix(in srgb, var(--c1) 80%, white),
      0 0 0 0 color-mix(in srgb, var(--c2) 70%, transparent);
    opacity: 1;
  }
  100% {
    box-shadow:
      0 0 0 160px transparent,
      0 0 0 240px transparent;
    opacity: 0;
  }
}

// Entrada: el Pokémon "sale" de la Poké Ball; salida: vuelve a ella (encoge con destello)
.slot-swap-enter-active {
  transition:
    opacity 0.35s ease,
    transform 0.45s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.slot-swap-leave-active {
  transition:
    opacity 0.22s ease,
    transform 0.25s ease-in,
    filter 0.25s;
}
.slot-swap-enter-from {
  opacity: 0;
  transform: scale(0.85) translateY(10px);
}
.slot-swap-leave-to {
  opacity: 0;
  transform: scale(0.6);
  filter: brightness(2.5) saturate(0);
}
</style>
