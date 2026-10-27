import { ref, watch, toValue } from 'vue'
import { fetchUsage } from '@/services/battleData.js'

// Uso competitivo reactivo: se recarga al cambiar la especie o el formato
export function useUsage(keySource, formatSource) {
  const usage = ref(null)
  const loading = ref(false)
  const error = ref(null)

  async function load() {
    const key = toValue(keySource)
    const format = toValue(formatSource)
    if (!key) {
      usage.value = null
      return
    }
    loading.value = true
    error.value = null
    try {
      const data = await fetchUsage(key, format)
      // ignorar respuestas que llegan tarde tras cambiar de Pokémon
      if (key === toValue(keySource) && format === toValue(formatSource)) usage.value = data
    } catch (err) {
      usage.value = null
      error.value = err.message || 'Error de red'
    } finally {
      loading.value = false
    }
  }

  watch(() => [toValue(keySource), toValue(formatSource)], load, { immediate: true })

  return { usage, loading, error, reload: load }
}
