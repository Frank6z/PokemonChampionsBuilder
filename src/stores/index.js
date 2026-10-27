import { defineStore } from '#q-app'
import { createPinia } from 'pinia'

// Quasar detecta src/stores/index.js e instala Pinia antes que el router
export default defineStore((/* { ssrContext } */) => {
  return createPinia()
})
