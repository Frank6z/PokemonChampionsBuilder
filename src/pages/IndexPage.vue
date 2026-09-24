<template>
  <div class="q-pa-md">
    <div class="q-gutter-md row items-start">
      
      <!-- TARJETA POKEMON -->
      <q-card 
        v-for="(poke, key) in pokedex" 
        :key="key" 
        :class="[poke.bgColor, 'q-pa-sm', 'relative-position']" 
        style="width: 200px;"
      >
        <div class="absolute-top-right q-pa-sm row items-center q-gutter-xs" style="z-index: 1;">
          <q-img v-if="getCurrentForm(key).icon1" :src="getIconImg(getCurrentForm(key).icon1)" style="height: 28px; width: 28px" fit="contain" />
          <q-img v-if="getCurrentForm(key).icon2" :src="getIconImg(getCurrentForm(key).icon2)" style="height: 28px; width: 28px" fit="contain" />
        </div>

        <q-btn push :color="poke.btnColor" icon="style" @click="nextForm(key)" class="q-ma-xs block" size="sm"/>

        <div class="flex flex-center q-my-sm">
          <q-img :src="getFormImg(getCurrentForm(key).img)" :spinner-color="poke.spinnerColor" style="height: 130px; width: 130px" fit="contain" />
        </div>

        <q-btn icon="add" class="full-width" :color="poke.seeMoreColor" :to="`/second/${key}`" label="SEE MORE" no-caps size="sm" />
      </q-card>

    </div>

    <div class="q-mt-lg">
      <q-btn icon="arrow_forward" class="q-mt-md" color="blue-10" to="/second" glossy label="Go to Second Page" no-caps />  
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import pokedex from '../data/pokedex.json'

const formIndices = ref(
  Object.keys(pokedex).reduce((acc, key) => {
    acc[key] = 0
    return acc
  }, {})
)

function getCurrentForm(key) {
  const index = formIndices.value[key] || 0
  return pokedex[key].forms[index]
}

// POKEMON
function getFormImg(imgName) {
  const images = import.meta.glob('../assets/*.png', { eager: true, import: 'default' })
  return images[`../assets/${imgName}`] || ''
}

// ICON
function getIconImg(iconName) {
  if (!iconName) return ''
  const icons = import.meta.glob('../assets/Icon_Types/*.ico', { eager: true, import: 'default' })
  return icons[`../assets/Icon_Types/${iconName}`] || ''
}

function nextForm(key) {
  const totalForms = pokedex[key].forms.length
  formIndices.value[key] = (formIndices.value[key] + 1) % totalForms
}
</script>