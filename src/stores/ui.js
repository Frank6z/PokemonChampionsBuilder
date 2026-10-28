import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

const STORAGE_KEY = 'pcb:ui:v1'

function load() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}
  } catch {
    return {}
  }
}

// Preferencias de interfaz del visitante (solo su navegador)
export const useUiStore = defineStore('ui', () => {
  const saved = load()
  const animatedSprites = ref(saved.animatedSprites ?? true)

  watch(animatedSprites, () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ animatedSprites: animatedSprites.value }))
    } catch {
      // almacenamiento bloqueado: la preferencia dura lo que la sesión
    }
  })

  return { animatedSprites }
})
