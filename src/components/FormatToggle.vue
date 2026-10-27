<template>
  <q-btn-toggle
    v-model="team.format"
    no-caps
    dense
    unelevated
    rounded
    toggle-color="amber"
    toggle-text-color="dark"
    class="format-toggle glass"
    :options="[
      { label: 'Dobles', value: 'Doubles', icon: 'mdi-account-multiple' },
      { label: 'Individual', value: 'Singles', icon: 'mdi-account' },
    ]"
  >
    <q-tooltip>Formato de los datos de uso y del análisis</q-tooltip>
  </q-btn-toggle>
</template>

<script setup>
import { useTeamStore } from '@/stores/team.js'

const team = useTeamStore()
</script>

<style lang="scss" scoped>
.format-toggle {
  border-radius: 999px;
  padding: 2px;
  :deep(.q-btn) {
    padding: 2px 12px;
  }
}
</style>
