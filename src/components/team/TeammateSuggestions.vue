<template>
  <div class="suggest">
    <PokeLoader v-if="loading && !suggestions.length" label="Buscando sinergias…" :rows="1" />
    <div v-else-if="suggestions.length" class="suggest__list">
      <transition-group name="list">
        <button
          v-for="s in suggestions"
          :key="s.key"
          type="button"
          class="suggest__chip pc-btn"
          :style="{ '--c1': typeColor(s.species.forms[0].types[0]) }"
          :disabled="team.isFull"
          @click="add(s)"
        >
          <PokeSprite :form="s.species.forms[0]" :alt="s.species.name" :size="34" variant="mini" />
          <span class="font-display">{{ s.species.name }}</span>
          <q-icon name="mdi-plus-circle" size="18px" />
          <q-tooltip>Compañero frecuente de {{ s.with.join(', ') }}</q-tooltip>
        </button>
      </transition-group>
    </div>
    <div v-else class="text-dim text-caption">Sin sugerencias para este equipo.</div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useQuasar } from 'quasar'
import PokeLoader from '@/components/PokeLoader.vue'
import PokeSprite from '@/components/PokeSprite.vue'
import { useTeamStore } from '@/stores/team.js'
import { fetchUsage } from '@/services/battleData.js'
import { speciesList, getSpecies } from '@/services/pokedex.js'
import { typeColor } from '@/utils/types.js'

const MAX = 8

const $q = useQuasar()
const team = useTeamStore()
const suggestions = ref([])
const loading = ref(false)
let seq = 0

// Los compañeros llegan por nombre ("Indeedee-F"); se traducen a la clave de la app
const keyByName = Object.fromEntries(speciesList.map((s) => [s.name, s.key]))

// Puntúa cada compañero frecuente de los miembros actuales: cuanto más arriba en sus
// listas y en más listas aparezca, mejor. Datos de uso reales, no una regla inventada.
async function refresh() {
  const members = team.members
  if (!members.length) {
    suggestions.value = []
    return
  }
  loading.value = true
  const token = ++seq
  const present = new Set(members.map((m) => m.species.key))
  const results = await Promise.allSettled(
    members.map((m) => fetchUsage(m.species.key, team.format)),
  )
  if (token !== seq) return // llegó una petición más nueva
  const score = new Map()
  results.forEach((r, i) => {
    if (r.status !== 'fulfilled') return
    r.value.teammates.slice(0, 10).forEach((mate, rank) => {
      const key = keyByName[mate.name]
      if (!key || present.has(key)) return
      const entry = score.get(key) || { key, points: 0, with: [] }
      entry.points += 10 - rank
      entry.with.push(members[i].species.name)
      score.set(key, entry)
    })
  })
  suggestions.value = [...score.values()]
    .sort((a, b) => b.points - a.points)
    .slice(0, MAX)
    .map((s) => ({ ...s, species: getSpecies(s.key) }))
  loading.value = false
}

watch(() => [team.members.map((m) => m.species.key).join(','), team.format], refresh, {
  immediate: true,
})

function add(s) {
  if (team.add(s.key) === -1) return
  $q.notify({
    color: 'dark',
    icon: 'mdi-check-circle',
    iconColor: 'positive',
    message: `${s.species.name} añadido`,
  })
}
</script>

<style lang="scss" scoped>
.suggest__list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.suggest__chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px 4px 4px;
  border-radius: 999px;
  border: 1px solid color-mix(in srgb, var(--c1) 50%, transparent);
  background: linear-gradient(
    90deg,
    color-mix(in srgb, var(--c1) 25%, transparent),
    rgba(255, 255, 255, 0.03)
  );
  color: var(--pc-text);
  cursor: pointer;
  font-weight: 600;
  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
}
</style>
