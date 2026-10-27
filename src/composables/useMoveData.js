import { shallowRef } from 'vue'
import { loadMoveData } from '@/services/moves.js'

// Carga diferida compartida de moves.json + learnsets.json
const data = shallowRef(null)

export function useMoveData() {
  if (!data.value) {
    loadMoveData().then((d) => {
      data.value = d
    })
  }
  return data
}
