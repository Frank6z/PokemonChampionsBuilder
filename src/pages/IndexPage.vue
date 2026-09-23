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

      <!-- TARJETA SWAMPERT -->
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

      <!-- TARJETA STARAPTOR -->
      <q-card class="bg-grey-8 q-pa-sm">
        <q-btn
          push
          color="grey-9"
          icon="style"
          @click="refresh('staraptor')" 
          class="q-ma-md block"
        />
        <q-bar dense flat class="bg-grey-8">
          <q-img :src="staraptorIcon1" class="q-md-xs" style="height: 50px; width: 50px" />
          <q-img :src="staraptorIcon2" class="q-md-xs" style="height: 50px; width: 50px" />
        </q-bar>
        <q-img
          :src="urlStaraptor"
          spinner-color="red"
          style="height: 150px; width: 150px"
        />
        <q-btn icon="add" class="q-mt-md" color="grey-10" to="/second/staraptor" label="SEE MORE" no-caps />
      </q-card>

      <!-- TARJETA ABSOL -->
      <q-card class="bg-purple-9 q-pa-sm">
        <q-btn
          push
          color="purple-10"
          icon="style"
          @click="refresh('absol')" 
          class="q-ma-md block"
        />
        <q-bar dense flat class="bg-purple-9">
          <q-img :src="absolIcon1" class="q-md-xs" style="height: 50px; width: 50px" />
          <q-img v-if="absolIcon2" :src="absolIcon2" class="q-md-xs" style="height: 50px; width: 50px" />
        </q-bar>
        <q-img
          :src="urlAbsol"
          spinner-color="purple"
          style="height: 150px; width: 150px"
        />
        <q-btn icon="add" class="q-mt-md" color="purple-8" to="/second/absol" label="SEE MORE" no-caps />
      </q-card>

      <!-- TARJETA AGGRON -->
      <q-card class="bg-blue-grey-8 q-pa-sm">
        <q-btn
          push
          color="blue-grey-9"
          icon="style"
          @click="refresh('aggron')" 
          class="q-ma-md block"
        />
        <q-bar dense flat class="bg-blue-grey-8">
          <q-img :src="aggronIcon1" class="q-md-xs" style="height: 50px; width: 50px" />
          <q-img v-if="aggronIcon2" :src="aggronIcon2" class="q-md-xs" style="height: 50px; width: 50px" />
        </q-bar>
        <q-img
          :src="urlAggron"
          spinner-color="grey"
          style="height: 150px; width: 150px"
        />
        <q-btn icon="add" class="q-mt-md" color="blue-grey-10" to="/second/aggron" label="SEE MORE" no-caps />
      </q-card>

      <!-- TARJETA CHARIZARD -->
      <q-card class="bg-deep-orange-8 q-pa-sm">
        <q-btn
          push
          color="deep-orange-9"
          icon="style"
          @click="refresh('charizard')" 
          class="q-ma-md block"
        />
        <q-bar dense flat class="bg-deep-orange-8">
          <q-img :src="charizardIcon1" class="q-md-xs" style="height: 50px; width: 50px" />
          <q-img v-if="charizardIcon2" :src="charizardIcon2" class="q-md-xs" style="height: 50px; width: 50px" />
        </q-bar>
        <q-img
          :src="urlCharizard"
          spinner-color="orange"
          style="height: 150px; width: 150px"
        />
        <q-btn icon="add" class="q-mt-md" color="deep-orange-10" to="/second/charizard" label="SEE MORE" no-caps />
      </q-card>

      <!-- TARJETA EELEKTROSS -->
      <q-card class="bg-amber-9 q-pa-sm">
        <q-btn
          push
          color="amber-10"
          icon="style"
          @click="refresh('eelektross')" 
          class="q-ma-md block"
        />
        <q-bar dense flat class="bg-amber-9">
          <q-img :src="eelektrossIcon1" class="q-md-xs" style="height: 50px; width: 50px" />
          <q-img v-if="eelektrossIcon2" :src="eelektrossIcon2" class="q-md-xs" style="height: 50px; width: 50px" />
        </q-bar>
        <q-img
          :src="urlEelektross"
          spinner-color="yellow"
          style="height: 150px; width: 150px"
        />
        <q-btn icon="add" class="q-mt-md" color="amber-8" to="/second/eelektross" label="SEE MORE" no-caps />
      </q-card>

      <!-- TARJETA LUCARIO -->
      <q-card class="bg-cyan-9 q-pa-sm">
        <q-btn
          push
          color="cyan-10"
          icon="style"
          @click="refresh('lucario')" 
          class="q-ma-md block"
        />
        <q-bar dense flat class="bg-cyan-9">
          <q-img :src="lucarioIcon1" class="q-md-xs" style="height: 50px; width: 50px" />
          <q-img v-if="lucarioIcon2" :src="lucarioIcon2" class="q-md-xs" style="height: 50px; width: 50px" />
        </q-bar>
        <q-img
          :src="urlLucario"
          spinner-color="blue"
          style="height: 150px; width: 150px"
        />
        <q-btn icon="add" class="q-mt-md" color="cyan-8" to="/second/lucario" label="SEE MORE" no-caps />
      </q-card>

      <!-- TARJETA SCEPTILE -->
      <q-card class="bg-green-9 q-pa-sm">
        <q-btn
          push
          color="green-10"
          icon="style"
          @click="refresh('sceptile')" 
          class="q-ma-md block"
        />
        <q-bar dense flat class="bg-green-9">
          <q-img :src="sceptileIcon1" class="q-md-xs" style="height: 50px; width: 50px" />
          <q-img v-if="sceptileIcon2" :src="sceptileIcon2" class="q-md-xs" style="height: 50px; width: 50px" />
        </q-bar>
        <q-img
          :src="urlSceptile"
          spinner-color="green"
          style="height: 150px; width: 150px"
        />
        <q-btn icon="add" class="q-mt-md" color="green-8" to="/second/sceptile" label="SEE MORE" no-caps />
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
import Staraptor from '../assets/Staraptor.png'
import MegaStaraptor from '../assets/Mega_Staraptor.png'
import Absol from '../assets/Absol.png'
import MegaAbsol from '../assets/Mega_Absol.png'
import MegaAbsolZ from '../assets/Mega_AbsolZ.png'
import Aggron from '../assets/Aggron.png'
import MegaAggron from '../assets/Mega_Aggron.png'
import Charizard from '../assets/Charizard.png'
import MegaCharizardX from '../assets/Mega_CharizardX.png'
import MegaCharizardY from '../assets/Mega_CharizardY.png'
import Eelektross from '../assets/Eelektross.png'
import MegaEelektross from '../assets/Mega_Eelektross.png'
import Lucario from '../assets/Lucario.png'
import MegaLucario from '../assets/Mega_Lucario.png'
import MegaLucarioZ from '../assets/Mega_LucarioZ.png'
import Sceptile from '../assets/Sceptile.png'
import MegaSceptile from '../assets/Mega_Sceptile.png'

// Iconos importados (Tipos completos)
import bugicon from '../assets/Icon_Types/Bug type.ico'
import watericon from '../assets/Icon_Types/Water type.ico'
import groundicon from '../assets/Icon_Types/Ground type.ico'
import dragonicon from '../assets/Icon_Types/Dragon type.ico'
import steelicon from '../assets/Icon_Types/Steel type.ico'
import normalicon from '../assets/Icon_Types/Normal type.ico'
import flyingicon from '../assets/Icon_Types/Flying type.ico'
import fightingicon from '../assets/Icon_Types/Fighting type.ico'
import darkicon from '../assets/Icon_Types/Dark type.ico'
import rockicon from '../assets/Icon_Types/Rock type.ico'
import fireicon from '../assets/Icon_Types/Fire type.ico'
import electricicon from '../assets/Icon_Types/Electric type.ico'
import grassicon from '../assets/Icon_Types/Grass type.ico'
//import iceicon from '../assets/Icon_Types/Ice type.ico'
//import poisonicon from '../assets/Icon_Types/Poison type.ico'
//import psychicicon from '../assets/Icon_Types/Psychic type.ico'
import ghosticon from '../assets/Icon_Types/Ghost type.ico'
//import fairyicon from '../assets/Icon_Types/Fairy type.ico'

// Pokemon
const urlGolisopod = ref(Golisopod)
const urlGarchomp = ref(Garchomp)
const urlSwampert = ref(Swampert)
const urlStaraptor = ref(Staraptor)
const urlAbsol = ref(Absol)
const urlAggron = ref(Aggron)
const urlCharizard = ref(Charizard)
const urlEelektross = ref(Eelektross)
const urlLucario = ref(Lucario)
const urlSceptile = ref(Sceptile)

// Iconos
const golisopodIcon1 = ref(bugicon)
const golisopodIcon2 = ref(watericon)

const garchompIcon1 = ref(dragonicon)
const garchompIcon2 = ref(groundicon)

const swampertIcon1 = ref(watericon)
const swampertIcon2 = ref(groundicon)

const staraptorIcon1 = ref(normalicon)
const staraptorIcon2 = ref(flyingicon)

const absolIcon1 = ref(darkicon)
const absolIcon2 = ref(null)

const aggronIcon1 = ref(steelicon)
const aggronIcon2 = ref(rockicon)

const charizardIcon1 = ref(fireicon)
const charizardIcon2 = ref(flyingicon)

const eelektrossIcon1 = ref(electricicon)
const eelektrossIcon2 = ref(null)

const lucarioIcon1 = ref(fightingicon)
const lucarioIcon2 = ref(steelicon)

const sceptileIcon1 = ref(grassicon)
const sceptileIcon2 = ref(null)


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

  else if (pokemon === 'staraptor') {
    if (urlStaraptor.value === Staraptor) {
      urlStaraptor.value = MegaStaraptor
      staraptorIcon1.value = fightingicon
      staraptorIcon2.value = flyingicon
    } else {
      urlStaraptor.value = Staraptor
      staraptorIcon1.value = normalicon
      staraptorIcon2.value = flyingicon
    }
  }

  else if (pokemon === 'absol') {
    if (urlAbsol.value === Absol) {
      urlAbsol.value = MegaAbsol
      absolIcon1.value = darkicon
      absolIcon2.value = null
    } else if (urlAbsol.value === MegaAbsol) {
      urlAbsol.value = MegaAbsolZ
      absolIcon1.value = darkicon
      absolIcon2.value = ghosticon
    } else {
      urlAbsol.value = Absol
      absolIcon1.value = darkicon
      absolIcon2.value = null
    }
  }

  else if (pokemon === 'aggron') {
    if (urlAggron.value === Aggron) {
      urlAggron.value = MegaAggron
      aggronIcon1.value = steelicon
      aggronIcon2.value = null
    } else {
      urlAggron.value = Aggron
      aggronIcon1.value = steelicon
      aggronIcon2.value = rockicon
    }
  }

  else if (pokemon === 'charizard') {
    if (urlCharizard.value === Charizard) {
      urlCharizard.value = MegaCharizardX
      charizardIcon1.value = fireicon
      charizardIcon2.value = dragonicon
    } else if (urlCharizard.value === MegaCharizardX) {
      urlCharizard.value = MegaCharizardY
      charizardIcon1.value = fireicon
      charizardIcon2.value = flyingicon
    } else {
      urlCharizard.value = Charizard
      charizardIcon1.value = fireicon
      charizardIcon2.value = flyingicon
    }
  }

  else if (pokemon === 'eelektross') {
    if (urlEelektross.value === Eelektross) {
      urlEelektross.value = MegaEelektross
      eelektrossIcon1.value = electricicon
      eelektrossIcon2.value = null
    } else {
      urlEelektross.value = Eelektross
      eelektrossIcon1.value = electricicon
      eelektrossIcon2.value = null
    }
  }

  else if (pokemon === 'lucario') {
    if (urlLucario.value === Lucario) {
      urlLucario.value = MegaLucario
      lucarioIcon1.value = fightingicon
      lucarioIcon2.value = steelicon
    } else if (urlLucario.value === MegaLucario) {
      urlLucario.value = MegaLucarioZ
      lucarioIcon1.value = fightingicon
      lucarioIcon2.value = steelicon
    } else {
      urlLucario.value = Lucario
      lucarioIcon1.value = fightingicon
      lucarioIcon2.value = steelicon
    }
  }

  else if (pokemon === 'sceptile') {
    if (urlSceptile.value === Sceptile) {
      urlSceptile.value = MegaSceptile
      sceptileIcon1.value = grassicon
      sceptileIcon2.value = dragonicon
    } else {
      urlSceptile.value = Sceptile
      sceptileIcon1.value = grassicon
      sceptileIcon2.value = null
    }
  }
}
</script>