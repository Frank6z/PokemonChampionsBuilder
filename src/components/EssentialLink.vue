<template>
  <q-item clickable :tag="isExternal ? 'a' : 'router-link'" :target="isExternal ? '_blank' : undefined" :to="!isExternal ? props.link : undefined" :href="isExternal ? props.link : undefined"
  >
    <q-item-section v-if="props.icon" avatar>
      <q-icon :name="props.icon" />
    </q-item-section>

    <q-item-section>
      <q-item-label>{{ props.label }}</q-item-label>
      <q-item-label caption>{{ props.caption }}</q-item-label>
    </q-item-section>
  </q-item>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  label: {
    type: String,
    required: true,
  },
  caption: {
    type: String,
    default: '',
  },
  link: {
    type: String,
    default: '#',
  },
  icon: {
    type: String,
    default: '',
  },
})

const isExternal = computed(() => {
  return props.link.startsWith('http') || props.link.startsWith('mailto:')
})
</script>