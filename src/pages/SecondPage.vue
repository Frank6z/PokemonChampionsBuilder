<template>
  <div class="q-pa-md row items-start q-gutter-md">

    <!-- CARTA PRESENTACION DE POKEMON -->
    <q-card 
      v-for="(pokemonData, key) in filtroPokedex" 
      :key="key" 
      :class="['column', 'no-wrap', 'bg-' + pokemonData.color, 'text-white']" 
      style="width: 300px;"
    >
      <q-img :alt="pokemonData.name" :src="getForm(pokemonData, key).img" height="200px" fit="contain" class="q-ma-sm" />

      <q-card-section class="q-py-xs">
        <div class="text-body1 flex row items-center no-wrap">
          <q-img :src="getForm(pokemonData, key).type1" class="q-mx-xs" width="80px" height="30px" fit="contain"/>
          <span v-if="getForm(pokemonData, key).type2" class="text-h6 q-mx-xs text-grey-7">/</span>
          <q-img v-if="getForm(pokemonData, key).type2" :src="getForm(pokemonData, key).type2" class="q-mx-xs" width="80px" height="30px" fit="contain"/>
        </div>
        <div class="text-subtitle2 q-mt-sm">{{ pokemonData.category }}</div>
        <div class="q-mt-xs text-body2">
          Habilidad: <q-badge color="white" text-color="black" class="text-bold">{{ getForm(pokemonData, key).ability }}</q-badge>
        </div>
      </q-card-section>

      <!-- STATS POKEMON -->
      <q-card-section class="q-py-none">
        <div class="q-px-sm">
          <div class="row justify-between items-center"><span>HP: {{ getForm(pokemonData, key).stats.hp }}</span></div>
          <q-linear-progress :value="getForm(pokemonData, key).stats.hp / 255" color="red" class="q-mb-sm" size="md"/>
          
          <div class="row justify-between items-center"><span>ATK: {{ getForm(pokemonData, key).stats.atk }}</span></div>
          <q-linear-progress :value="getForm(pokemonData, key).stats.atk / 255" color="orange" class="q-mb-sm" size="md"/>
          
          <div class="row justify-between items-center"><span>DEF: {{ getForm(pokemonData, key).stats.def }}</span></div>
          <q-linear-progress :value="getForm(pokemonData, key).stats.def / 255" color="yellow" class="q-mb-sm" size="md"/>
          
          <div class="row justify-between items-center"><span>SPA: {{ getForm(pokemonData, key).stats.spa }}</span></div>
          <q-linear-progress :value="getForm(pokemonData, key).stats.spa / 255" color="blue" class="q-mb-sm" size="md"/>
          
          <div class="row justify-between items-center"><span>SPD: {{ getForm(pokemonData, key).stats.spd }}</span></div>
          <q-linear-progress :value="getForm(pokemonData, key).stats.spd / 255" color="green" class="q-mb-sm" size="md"/>
          
          <div class="row justify-between items-center"><span>SPE: {{ getForm(pokemonData, key).stats.spe }}</span></div>
          <q-linear-progress :value="getForm(pokemonData, key).stats.spe / 255" color="pink" class="q-mb-sm" size="md"/>
        </div>
      </q-card-section>
      
      <q-card-actions align="center" class="q-px-md q-pb-none">
        <q-btn 
          push 
          color="red-10" 
          icon="image" 
          label="Cambiar Forma" 
          @click="changeForm(pokemonData, key)" 
          class="full-width"
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

// IMPORT POKEMON
import GolisopodImg from '../assets/Golisopod.png'
import MegaGolisopodImg from '../assets/Mega_Golisopod.png'
import GarchompImg from '../assets/Garchomp.png'
import MegaGarchompImg from '../assets/Mega_Garchomp.png'
import MegaGarchompZImg from '../assets/Mega_GarchompZ.png'
import SwampertImg from '../assets/Swampert.png'
import MegaSwampertImg from '../assets/Mega_Swampert.png'
import StaraptorImg from '../assets/Staraptor.png'
import MegaStaraptorImg from '../assets/Mega_Staraptor.png'
import AbsolImg from '../assets/Absol.png'
import MegaAbsolImg from '../assets/Mega_Absol.png'
import MegaAbsolZImg from '../assets/Mega_AbsolZ.png'
import AggronImg from '../assets/Aggron.png'
import MegaAggronImg from '../assets/Mega_Aggron.png'
import CharizardImg from '../assets/Charizard.png'
import MegaCharizardXImg from '../assets/Mega_CharizardX.png'
import MegaCharizardYImg from '../assets/Mega_CharizardY.png'
import EelektrossImg from '../assets/Eelektross.png'
import MegaEelektrossImg from '../assets/Mega_Eelektross.png'
import LucarioImg from '../assets/Lucario.png'
import MegaLucarioImg from '../assets/Mega_Lucario.png'
import MegaLucarioZImg from '../assets/Mega_LucarioZ.png'
import SceptileImg from '../assets/Sceptile.png'
import MegaSceptileImg from '../assets/Mega_Sceptile.png'

// IMPORT TIPOS (Carpeta TYPES)
import bichoIcon from '../assets/TYPES/BICHO.png'
import aguaIcon from '../assets/TYPES/AGUA.png'
import dragonIcon from '../assets/TYPES/DRAGON_.png'
import tierraIcon from '../assets/TYPES/TIERRA.png'
import aceroIcon from '../assets/TYPES/ACERO.png'
import normalIcon from '../assets/TYPES/NORMAL_.png'
import voladorIcon from '../assets/TYPES/VOLADOR.png'
import siniestroIcon from '../assets/TYPES/SINIESTRO.png'
import rocaIcon from '../assets/TYPES/ROCA.png'
import fuegoIcon from '../assets/TYPES/FUEGO.png'
import electricoIcon from '../assets/TYPES/ELECTRICO.png'
import plantaIcon from '../assets/TYPES/PLANTA.png'
import luchaIcon from '../assets/TYPES/LUCHA.png'
import fantasmaIcon from '../assets/TYPES/FANTASMA.png'

const route = useRoute()
const pokemonSelect = route.params.pokemon 

// POKEDEX COMPLETA
const pokedex = {
  golisopod: {
    name: 'Golisopod',
    category: 'Hard Scale Pokemon',
    color: 'grey-8',
    forms: [
      { name: 'Base', img: GolisopodImg, type1: bichoIcon, type2: aguaIcon, ability: 'Emergency Exit', stats: { hp: 75, atk: 125, def: 140, spa: 60, spd: 90, spe: 40 } },
      { name: 'Mega', img: MegaGolisopodImg, type1: bichoIcon, type2: aceroIcon, ability: 'Tough Claws', stats: { hp: 75, atk: 150, def: 175, spa: 70, spd: 120, spe: 40 } } 
    ]
  },
  garchomp: {
    name: 'Garchomp',
    category: 'Sharp Claw Pokemon',
    color: 'indigo-6',
    forms: [
      { name: 'Base', img: GarchompImg, type1: dragonIcon, type2: tierraIcon, ability: 'Rough Skin', stats: { hp: 108, atk: 130, def: 95, spa: 80, spd: 85, spe: 102 } },
      { name: 'Mega', img: MegaGarchompImg, type1: dragonIcon, type2: tierraIcon, ability: 'Sand Force', stats: { hp: 108, atk: 170, def: 115, spa: 120, spd: 95, spe: 92 } },
      { name: 'Mega Z', img: MegaGarchompZImg, type1: dragonIcon, type2: null, ability: 'Levitate', stats: { hp: 108, atk: 130, def: 85, spa: 141, spd: 85, spe: 151 } } 
    ]
  },
  swampert: {
    name: 'Swampert',
    category: 'Mud Fish Pokemon',
    color: 'blue-9',
    forms: [
      { name: 'Base', img: SwampertImg, type1: aguaIcon, type2: tierraIcon, ability: 'Torrent', stats: { hp: 100, atk: 110, def: 90, spa: 85, spd: 90, spe: 60 } },
      { name: 'Mega', img: MegaSwampertImg, type1: aguaIcon, type2: tierraIcon, ability: 'Swift Swim', stats: { hp: 100, atk: 150, def: 110, spa: 95, spd: 110, spe: 70 } }
    ]
  },
  staraptor: {
    name: 'Staraptor',
    category: 'Predator Pokemon',
    color: 'grey-9',
    forms: [
      { name: 'Base', img: StaraptorImg, type1: normalIcon, type2: voladorIcon, ability: 'Intimidate', stats: { hp: 85, atk: 120, def: 70, spa: 50, spd: 60, spe: 100 } },
      { name: 'Mega', img: MegaStaraptorImg, type1: luchaIcon, type2: voladorIcon, ability: 'Contrary', stats: { hp: 85, atk: 140, def: 100, spa: 60, spd: 90, spe: 110 } }
    ]
  },
  absol: {
    name: 'Absol',
    category: 'Disaster Pokemon',
    color: 'purple-9',
    forms: [
      { name: 'Base', img: AbsolImg, type1: siniestroIcon, type2: null, ability: 'Justified', stats: { hp: 65, atk: 130, def: 60, spa: 75, spd: 60, spe: 75 } },
      { name: 'Mega', img: MegaAbsolImg, type1: siniestroIcon, type2: null, ability: 'Magic Bounce', stats: { hp: 65, atk: 150, def: 60, spa: 115, spd: 60, spe: 115 } },
      { name: 'Mega Z', img: MegaAbsolZImg, type1: siniestroIcon, type2: fantasmaIcon, ability: 'Sharpness', stats: { hp: 65, atk: 154, def: 60, spa: 75, spd: 60, spe: 151 } }
    ]
  },
  aggron: {
    name: 'Aggron',
    category: 'Iron Armor Pokemon',
    color: 'blue-grey-8',
    forms: [
      { name: 'Base', img: AggronImg, type1: aceroIcon, type2: rocaIcon, ability: 'Sturdy', stats: { hp: 70, atk: 110, def: 180, spa: 60, spd: 60, spe: 50 } },
      { name: 'Mega', img: MegaAggronImg, type1: aceroIcon, type2: null, ability: 'Filter', stats: { hp: 70, atk: 140, def: 230, spa: 60, spd: 80, spe: 50 } }
    ]
  },
  charizard: {
    name: 'Charizard',
    category: 'Flame Pokemon',
    color: 'orange-14',
    forms: [
      { name: 'Base', img: CharizardImg, type1: fuegoIcon, type2: voladorIcon, ability: 'Solar Power', stats: { hp: 78, atk: 84, def: 78, spa: 109, spd: 85, spe: 100 } },
      { name: 'Mega X', img: MegaCharizardXImg, type1: fuegoIcon, type2: dragonIcon, ability: 'Tough Claws', stats: { hp: 78, atk: 130, def: 111, spa: 130, spd: 85, spe: 100 } },
      { name: 'Mega Y', img: MegaCharizardYImg, type1: fuegoIcon, type2: voladorIcon, ability: 'Drought', stats: { hp: 78, atk: 104, def: 78, spa: 159, spd: 115, spe: 100 } }
    ]
  },
  eelektross: {
    name: 'Eelektross',
    category: 'EleFish Pokemon',
    color: 'indigo-10',
    forms: [
      { name: 'Base', img: EelektrossImg, type1: electricoIcon, type2: null, ability: 'Levitate', stats: { hp: 85, atk: 115, def: 80, spa: 105, spd: 80, spe: 50 } },
      { name: 'Mega', img: MegaEelektrossImg, type1: electricoIcon, type2: null, ability: 'Eelevate', stats: { hp: 85, atk: 145, def: 80, spa: 135, spd: 90, spe: 80 } }
    ]
  },
  lucario: {
    name: 'Lucario',
    category: 'Aura Pokemon',
    color: 'cyan-9',
    forms: [
      { name: 'Base', img: LucarioImg, type1: luchaIcon, type2: aceroIcon, ability: 'Inner Focus', stats: { hp: 70, atk: 110, def: 70, spa: 115, spd: 70, spe: 90 } },
      { name: 'Mega', img: MegaLucarioImg, type1: luchaIcon, type2: aceroIcon, ability: 'Adaptability', stats: { hp: 70, atk: 145, def: 88, spa: 140, spd: 70, spe: 112 } },
      { name: 'Mega Z', img: MegaLucarioZImg, type1: luchaIcon, type2: aceroIcon, ability: 'Aura Guard', stats: { hp: 70, atk: 100, def: 70, spa: 164, spd: 70, spe: 151 } }
    ]
  },
  sceptile: {
    name: 'Sceptile',
    category: 'Forest Tree Pokemon',
    color: 'green-9',
    forms: [
      { name: 'Base', img: SceptileImg, type1: plantaIcon, type2: null, ability: 'Unburden', stats: { hp: 70, atk: 85, def: 65, spa: 105, spd: 85, spe: 120 } },
      { name: 'Mega', img: MegaSceptileImg, type1: plantaIcon, type2: dragonIcon, ability: 'Lightning Rod', stats: { hp: 70, atk: 110, def: 75, spa: 145, spd: 85, spe: 145 } }
    ]
  }
}

const formIndexes = ref({
  golisopod: 0,
  garchomp: 0,
  swampert: 0,
  staraptor: 0,
  absol: 0,
  aggron: 0,
  charizard: 0,
  eelektross: 0,
  lucario: 0,
  sceptile: 0
})

const filtroPokedex = computed(() => {
  if (pokemonSelect && pokedex[pokemonSelect]) {
    return { [pokemonSelect]: pokedex[pokemonSelect] }
  }
  return pokedex
})

// OBTENER DATOS DE POKEMON SELECCIONADO/ACTUAL
function getForm(pokemonData, key) {
  const currentIndex = formIndexes.value[key] || 0
  return pokemonData.forms[currentIndex]
}

// CAMBIO DE FORMA INDIVIDUAL
function changeForm(pokemonData, key) {
  formIndexes.value[key]++
  if (formIndexes.value[key] >= pokemonData.forms.length) {
    formIndexes.value[key] = 0
  }
}
</script>