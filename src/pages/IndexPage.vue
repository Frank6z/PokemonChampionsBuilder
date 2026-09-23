<template>
  <div class="q-pa-md">

    <div class="q-gutter-sm row items-start">
      <!-- TARJETA GOLISOPOD -->
      <q-card class="bg-grey-6 q-pa-sm">
        <q-btn
          push
          color="grey-7"
          icon="style"
          @click="refresh('golisopod')" 
          class="q-ma-md block"
        />
        <q-bar dense flat class="bg-grey-6">
          <q-img :src="golisopodIcon1" class="q-md-xs" style="height: 50px; width: 50px" />
          <q-img :src="golisopodIcon2" class="q-md-xs" style="height: 50px; width: 50px" />
        </q-bar>
        <q-img
          :src="urlGolisopod"
          spinner-color="red"
          style="height: 150px; width: 150px"
        />
        <q-btn icon="add" class="q-mt-md" color="grey-8" to="/second/golisopod" label="SEE MORE" no-caps />
      </q-card>
      
      <!-- TARJETA GARCHOMP -->
      <q-card class="bg-indigo-6 q-pa-sm">
        <q-btn
          push
          color="indigo-9"
          icon="style"
          @click="refresh('garchomp')" 
          class="q-ma-md block"
        />
        <q-bar dense flat class="bg-indigo-6">
          <q-img :src="garchompIcon1" class="q-md-xs" style="height: 50px; width: 50px" />
          <q-img v-if="garchompIcon2" :src="garchompIcon2" class="q-md-xs" style="height: 50px; width: 50px" />
        </q-bar>
        <q-img
          :src="urlGarchomp"
          spinner-color="indigo"
          style="height: 150px; width: 150px"
        />
        <q-btn icon="add" class="q-mt-md" color="indigo-10" to="/second/garchomp" label="SEE MORE" no-caps />
      </q-card>


      <q-card class="bg-blue-9 q-pa-sm">
        <q-btn
          push
          color="blue"
          icon="style"
          @click="refresh('swampert')" 
          class="q-ma-md block"
        />
        <q-bar dense flat class="bg-blue-9">
          <q-img :src="swampertIcon1" class="q-md-xs" style="height: 50px; width: 50px" />
          <q-img v-if="swampertIcon2" :src="swampertIcon2" class="q-md-xs" style="height: 50px; width: 50px" />
        </q-bar>
        <q-img
          :src="urlSwampert"
          spinner-color="blue"
          style="height: 150px; width: 150px"
        />
        <q-btn icon="add" class="q-mt-md" color="blue-10" to="/second/swampert" label="SEE MORE" no-caps />
      </q-card>
    </div>
    <div class="q-mt-lg">
      <q-btn icon="arrow_forward" class="q-mt-md" color="blue-10" to="/second" glossy label="Go to Second Page" no-caps />  
      </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

// Pokemon importados
import Golisopod from '../assets/Golisopod.png'
import MegaGolisopod from '../assets/Mega_Golisopod.png'
import Garchomp from '../assets/Garchomp.png'
import MegaGarchomp from '../assets/Mega_Garchomp.png'
import MegaGarchompZ from '../assets/Mega_GarchompZ.png'
import Swampert from '../assets/Swampert.png'
import MegaSwampert from '../assets/Mega_Swampert.png'

// Iconos importados
import bugicon from '../assets/Icon_Types/Bug type.ico'
import watericon from '../assets/Icon_Types/Water type.ico'
import groundicon from '../assets/Icon_Types/Ground type.ico'
import dragonicon from '../assets/Icon_Types/Dragon type.ico'
import steelicon from '../assets/Icon_Types/Steel type.ico'

// Pokemon
const urlGolisopod = ref(Golisopod)
const urlGarchomp = ref(Garchomp)
const urlSwampert = ref(Swampert)

// Iconos
const golisopodIcon1 = ref(bugicon)
const golisopodIcon2 = ref(watericon)

const garchompIcon1 = ref(dragonicon)
const garchompIcon2 = ref(groundicon)

const swampertIcon1 = ref(watericon)
const swampertIcon2 = ref(groundicon)


function refresh(pokemon) {
  if (pokemon === 'golisopod') {
    if (urlGolisopod.value === Golisopod) {
      urlGolisopod.value = MegaGolisopod
      golisopodIcon1.value = bugicon
      golisopodIcon2.value = steelicon
    } else {
      urlGolisopod.value = Golisopod
      golisopodIcon1.value = bugicon
      golisopodIcon2.value = watericon
    }
  } 
  
  else if (pokemon === 'garchomp') {
    if (urlGarchomp.value === Garchomp) {
      urlGarchomp.value = MegaGarchomp
      garchompIcon1.value = dragonicon
      garchompIcon2.value = groundicon
    } else if (urlGarchomp.value === MegaGarchomp) {
      urlGarchomp.value = MegaGarchompZ
      garchompIcon1.value = dragonicon
      garchompIcon2.value = null
    } else {
      urlGarchomp.value = Garchomp
      garchompIcon1.value = dragonicon
      garchompIcon2.value = groundicon
    }
  } 
  
  else if (pokemon === 'swampert') {
    if (urlSwampert.value === Swampert) {
      urlSwampert.value = MegaSwampert
      swampertIcon1.value = watericon
      swampertIcon2.value = groundicon
    } else {
      urlSwampert.value = Swampert
      swampertIcon1.value = watericon
      swampertIcon2.value = groundicon
    }
  }
}
</script>
