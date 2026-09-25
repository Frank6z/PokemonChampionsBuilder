<template>
  <div class="q-pa-md flex flex-center">
    <q-card class="my-card shadow-3" flat bordered>
      
      <q-card-section :class="[currentTyping.bgColor, 'text-white']">
        <div class="text-h6 text-weight-bold">{{ currentTyping.name }} - {{ currentForm.name }}</div>
        <div class="text-subtitle2">FORTALEZAS Y DEBILIDADES (Local JSON)</div>
      </q-card-section>

      <q-tabs 
        v-model="selectedKey" 
        dense 
        class="bg-grey-2 text-dark" 
        active-color="primary" 
        align="left" 
        outside-arrows 
        mobile-arrows
      >
        <q-tab v-for="(poke, key) in typingData" :key="key" :name="key" class="q-px-sm">
          <q-img :src="getFormImg(poke.forms[0].img)" style="height: 30px; width: 30px" fit="contain" />
        </q-tab>
      </q-tabs>

      <q-separator />

      <q-card-section class="q-pa-md" >
        
        <div class="row items-center justify-between q-mb-md">
          <q-btn v-if="currentTyping.forms.length > 1" push color="pink-13" icon="filter" @click="nextForm" size="sm" glossy label="Forma" no-caps />
          <div v-else></div>

          <q-img :src="getFormImg(currentForm.img)" style="height: 110px; width: 110px" fit="contain" />

          <div class="column q-gutter-xs items-center">
            <q-img v-if="currentForm.type1" :src="getTypeIcon(currentForm.type1)" style="height: 45px; width: 45px" fit="contain" />
            <q-img v-if="currentForm.type2" :src="getTypeIcon(currentForm.type2)" style="height: 45px; width: 45px" fit="contain" />
          </div>
        </div>

        <q-separator class="q-my-md" />

        <!-- Debilidades (Calculadas automáticamente) -->
        <div class="q-mb-sm" v-if="calculatedWeaknesses.length > 0">
          <div class="text-weight-bold text-negative q-mb-xs">Debilidades:</div>
          <div class="row q-gutter-xs items-center">
            <div v-for="(item, idx) in calculatedWeaknesses" :key="idx" class="row items-center bg-red-1 q-pa-xs rounded-borders">
              <q-img :src="getTypeIcon(item.icon)" style="height: 45px; width: 45px" fit="contain" class="q-mr-xs" />
              <q-badge color="red" dense>{{ item.multiplier }}</q-badge>
            </div>
          </div>
        </div>

        <!-- Resistencias (Calculadas automáticamente) -->
        <div class="q-mb-sm" v-if="calculatedResistances.length > 0">
          <div class="text-weight-bold text-positive q-mb-xs">Resistencias:</div>
          <div class="row q-gutter-xs items-center">
            <div v-for="(item, idx) in calculatedResistances" :key="idx" class="row items-center bg-green-1 q-pa-xs rounded-borders">
              <q-img :src="getTypeIcon(item.icon)" style="height: 45px; width: 45px" fit="contain" class="q-mr-xs" />
              <q-badge color="green" dense>{{ item.multiplier }}</q-badge>
            </div>
          </div>
        </div>

        <!-- Inmunidades (Calculadas automáticamente) -->
        <div v-if="calculatedImmunities.length > 0">
          <div class="text-weight-bold text-purple q-mb-xs">Inmunidades:</div>
          <div class="row q-gutter-xs items-center">
            <div v-for="(item, idx) in calculatedImmunities" :key="idx" class="row items-center bg-purple-1 q-pa-xs rounded-borders">
              <q-img v-if="item.icon" :src="getTypeIcon(item.icon)" style="height: 45px; width: 45px" fit="contain" class="q-mr-xs" />
              <q-badge color="purple" dense>{{ item.multiplier }}</q-badge>
            </div>
          </div>
        </div>

      </q-card-section>

      <q-separator />

      <q-card-actions class="q-pa-md column q-gutter-y-sm">
        <q-btn color="deep-orange-7" to="/pokedex-entry" glossy label="Ver Biografía" icon="visibility" no-caps class="full-width" />
        <q-btn icon="arrow_back" color="dark" to="/" flat label="Volver al Inicio" no-caps class="full-width" />
      </q-card-actions>

    </q-card>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import typingData from '../data/typingInfo.json'
import effectivenessData from '../data/effectiveness.json' // Importamos el JSON localmente

const route = useRoute()
const selectedKey = ref(route.params.pokemon || 'golisopod')
const formIndex = ref(0)

watch(selectedKey, () => { formIndex.value = 0 })

const currentTyping = computed(() => typingData[selectedKey.value] || typingData['golisopod'])
const currentForm = computed(() => currentTyping.value.forms[formIndex.value] || currentTyping.value.forms[0])

function nextForm() {
  formIndex.value = (formIndex.value + 1) % currentTyping.value.forms.length
}

// Función auxiliar para extraer el nombre limpio del tipo
function cleanType(typeName) {
  if (!typeName) return ''
  return typeName.replace('.png', '').replace('_', '').toLowerCase()
}

const computedEffectiveness = computed(() => {
  if (!effectivenessData || !effectivenessData.chart || !currentForm.value) return {}

  const translationMap = {
    'bicho': 'Bug',
    'agua': 'Water',
    'fuego': 'Fire',
    'planta': 'Grass',
    'volador': 'Flying',
    'roca': 'Rock',
    'tierra': 'Ground',
    'acero': 'Steel',
    'dragon': 'Dragon',
    'hielo': 'Ice',
    'psiquico': 'Psychic',
    'veneno': 'Poison',
    'lucha': 'Fighting',
    'normal': 'Normal',
    'fantasma': 'Ghost',
    'electrico': 'Electric',
    'siniestro': 'Dark',
    'hada': 'Fairy',
    'stellar': 'Stellar',
    'dragon_': 'Dragon'
  }

  const rawT1 = cleanType(currentForm.value.type1)
  const rawT2 = cleanType(currentForm.value.type2)

  const t1 = translationMap[rawT1] || rawT1
  const t2 = translationMap[rawT2] || rawT2
  
  const chart = effectivenessData.chart
  const result = {}

  const validPokemonTypes = [
    'Bug', 'Dark', 'Dragon', 'Electric', 'Fairy', 'Fighting', 
    'Fire', 'Flying', 'Ghost', 'Grass', 'Ground', 'Ice', 
    'Normal', 'Poison', 'Psychic', 'Rock', 'Steel', 'Stellar', 'Water'
  ]

  validPokemonTypes.forEach(attackingType => {
    const attackerRow = chart[attackingType]
    if (!attackerRow) return

    let mult1 = 1
    let mult2 = 1

    if (t1 && attackerRow[t1] !== undefined) {
      mult1 = attackerRow[t1]
    }

    if (t2 && attackerRow[t2] !== undefined) {
      mult2 = attackerRow[t2]
    }

    const finalMultiplier = mult1 * mult2

    if (finalMultiplier !== 1) {
      result[attackingType.toLowerCase()] = finalMultiplier
    }
  })

  return result
})

function getTypeNameForAsset(englishType) {
  const assetMap = {
    'bug': 'BICHO',
    'water': 'AGUA',
    'fire': 'FUEGO',
    'grass': 'PLANTA',
    'flying': 'VOLADOR',
    'rock': 'ROCA',
    'ground': 'TIERRA',
    'steel': 'ACERO',
    'dragon': 'DRAGON_',
    'ice': 'HIELO',
    'psychic': 'PSIQUICO',
    'poison': 'VENENO',
    'fighting': 'LUCHA',
    'normal': 'NORMAL_',
    'ghost': 'FANTASMA',
    'electric': 'ELECTRICO',
    'dark': 'SINIESTRO',
    'fairy': 'HADA'
  }
  return assetMap[englishType.toLowerCase()] || englishType.toUpperCase()
}

const calculatedWeaknesses = computed(() => {
  const list = []
  for (const [type, mult] of Object.entries(computedEffectiveness.value)) {
    if (mult > 1) {
      list.push({
        icon: `${getTypeNameForAsset(type)}.png`,
        multiplier: `${mult}x`
      })
    }
  }
  return list
})

const calculatedResistances = computed(() => {
  const list = []
  for (const [type, mult] of Object.entries(computedEffectiveness.value)) {
    if (mult > 0 && mult < 1) {
      list.push({
        icon: `${getTypeNameForAsset(type)}.png`,
        multiplier: `${mult}x`
      })
    }
  }
  return list
})

const calculatedImmunities = computed(() => {
  const list = []
  for (const [type, mult] of Object.entries(computedEffectiveness.value)) {
    if (mult === 0) {
      list.push({
        icon: `${getTypeNameForAsset(type)}.png`,
        multiplier: '0x'
      })
    }
  }
  return list
})

function getFormImg(imgName) {
  if (!imgName) return ''
  const images = import.meta.glob('../assets/*.png', { eager: true, import: 'default' })
  return images[`../assets/${imgName}`] || ''
}

function getTypeIcon(iconName) {
  if (!iconName) return ''
  const icons = import.meta.glob('../assets/TYPES/*.png', { eager: true, import: 'default' })
  return icons[`../assets/TYPES/${iconName}`] || ''
}
</script>

<style lang="sass" scoped>
.my-card
  width: 100%
  max-width: 440px
</style>