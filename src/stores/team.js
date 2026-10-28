import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { getSpecies, getForm } from '@/services/pokedex.js'

const STORAGE_KEY = 'pcb:team:v1'
export const TEAM_SIZE = 6

function emptySlot() {
  return { key: null, formIndex: 0, ability: null, item: null, moves: [null, null, null, null] }
}

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed.slots)) return null
    // descartar especies que ya no existan en species.json
    parsed.slots = parsed.slots
      .slice(0, TEAM_SIZE)
      .map((s) => (s && getSpecies(s.key) ? { ...emptySlot(), ...s } : emptySlot()))
    while (parsed.slots.length < TEAM_SIZE) parsed.slots.push(emptySlot())
    return parsed
  } catch {
    return null
  }
}

export const useTeamStore = defineStore('team', () => {
  const saved = load()
  const name = ref(saved?.name || 'Mi equipo')
  const format = ref(saved?.format === 'Singles' ? 'Singles' : 'Doubles')
  const slots = ref(saved?.slots || Array.from({ length: TEAM_SIZE }, emptySlot))

  const members = computed(() =>
    slots.value
      .map((slot, index) => {
        if (!slot.key) return null
        const species = getSpecies(slot.key)
        const form = getForm(slot.key, slot.formIndex)
        return { index, slot, species, form, ability: slot.ability || form.abilities[0]?.name }
      })
      .filter(Boolean),
  )

  const isFull = computed(() => members.value.length >= TEAM_SIZE)

  function setMember(index, key, formIndex = 0) {
    const form = getForm(key, formIndex)
    slots.value[index] = {
      ...emptySlot(),
      key,
      formIndex,
      ability: form?.abilities[0]?.name || null,
    }
  }

  // Añade al primer hueco libre; devuelve el índice o -1 si el equipo está lleno
  function add(key, formIndex = 0) {
    const index = slots.value.findIndex((s) => !s.key)
    if (index === -1) return -1
    setMember(index, key, formIndex)
    return index
  }

  function setForm(index, formIndex) {
    const slot = slots.value[index]
    const form = getForm(slot.key, formIndex)
    slot.formIndex = formIndex
    if (!form.abilities.some((a) => a.name === slot.ability)) {
      slot.ability = form.abilities[0]?.name || null
    }
  }

  function clear(index) {
    slots.value[index] = emptySlot()
  }

  // Intercambia dos huecos (arrastrar y soltar); funciona también con huecos vacíos
  function swap(a, b) {
    const next = [...slots.value]
    ;[next[a], next[b]] = [next[b], next[a]]
    slots.value = next
  }

  function reset() {
    slots.value = Array.from({ length: TEAM_SIZE }, emptySlot)
  }

  watch(
    [name, format, slots],
    () => {
      try {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({ name: name.value, format: format.value, slots: slots.value }),
        )
      } catch {
        // modo privado o almacenamiento bloqueado: el equipo vive solo en memoria
      }
    },
    { deep: true },
  )

  return { name, format, slots, members, isFull, setMember, add, setForm, clear, swap, reset }
})
