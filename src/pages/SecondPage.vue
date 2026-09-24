<template>
  <div class="q-pa-md row items-start q-gutter-md">

    <q-card 
      v-for="(pokemonData, key) in filtroPokedex" 
      :key="key" 
      class="column no-wrap text-white" 
      :class="pokemonData.bgColor"
      style="width: 300px;"
    >
      <q-img :alt="pokemonData.name" :src="getFormImg(getForm(pokemonData, key).img)" height="200px" fit="contain" class="q-ma-sm" />

      <q-card-section class="q-py-xs">
        <div class="text-body1 flex row items-center no-wrap">
          <q-img :src="getTypeImg(getForm(pokemonData, key).type1)" class="q-mx-xs" width="80px" height="30px" fit="contain"/>
          <span v-if="getForm(pokemonData, key).type2" class="text-h6 q-mx-xs text-grey-7">/</span>
          <q-img v-if="getForm(pokemonData, key).type2" :src="getTypeImg(getForm(pokemonData, key).type2)" class="q-mx-xs" width="80px" height="30px" fit="contain"/>
        </div>
        <div class="text-subtitle2 q-mt-sm">{{ pokemonData.category }}</div>
        <div class="q-mt-xs text-body2">
          Habilidad: <q-badge color="white" text-color="black" class="text-bold">{{ getForm(pokemonData, key).ability }}</q-badge>
        </div>
      </q-card-section>

      <!-- STATS POKEMON -->
      <q-card-section class="q-py-none">
        <div class="q-px-sm" v-for="(val, statName) in getForm(pokemonData, key).stats" :key="statName">
          <div class="row justify-between items-center text-uppercase"><span>{{ statName }}: {{ val }}</span></div>
          <q-linear-progress rounded :value="val / 255" color="teal-14" class="q-mb-sm" size="10px"/>
        </div>
      </q-card-section>
      
      <q-card-actions align="center" class="q-px-md q-pb-none">
        <q-btn push color="red-10" icon="image" label="Cambiar Forma" @click="changeForm(key)" class="full-width"
        />
      </q-card-actions>

      <q-card-actions align="stretch" class="q-pa-md">
        <q-btn icon="arrow_back" class="full-width" color="deep-orange-7" to="/" glossy label="Go to Index Page" no-caps />
      </q-card-actions>
    </q-card>

  </div>
</template>

<script setup>
import { useRoute } from 'vue-router'
import { ref, computed } from 'vue'
import pokedex from '../data/pokedex.json'

const route = useRoute()
const pokemonSelect = route.params.pokemon 

const formIndexes = ref(
  Object.keys(pokedex).reduce((acc, key) => {
    acc[key] = 0
    return acc
  }, {})
)

const filtroPokedex = computed(() => {
  if (pokemonSelect && pokedex[pokemonSelect]) {
    return { [pokemonSelect]: pokedex[pokemonSelect] }
  }
  return pokedex
})


function getFormImg(imgName) {
  const images = import.meta.glob('../assets/*.png', { eager: true, import: 'default' })
  return images[`../assets/${imgName}`] || ''
}

function getTypeImg(typeName) {
  if (!typeName) return ''
  const types = import.meta.glob('../assets/TYPES/*.png', { eager: true, import: 'default' })
  return types[`../assets/TYPES/${typeName}`] || ''
}

function getForm(pokemonData, key) {
  const currentIndex = formIndexes.value[key] || 0
  return pokemonData.forms[currentIndex]
}

function changeForm(key) {
  const total = pokedex[key].forms.length
  formIndexes.value[key] = (formIndexes.value[key] + 1) % total
}
</script>