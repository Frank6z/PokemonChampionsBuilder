<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn flat dense round icon="menu" aria-label="Menu" @click="toggleLeftDrawer" />

        <div class="row items-center q-gutter-sm">
          <q-toolbar-title> Pokemon Champions Data </q-toolbar-title>
          <img class="shadow-box q-ml-sm" :class="`shadow-${n}`" src="../assets/Logo_Pokémon_Champions.png" alt="Logo" style="height: 50px; width: auto"/> 
        </div>  
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" show-if-above bordered>
      <q-list>
        <q-item-label header> PokeChampsData MENU </q-item-label>

        <EssentialLink v-for="link in linksList" :key="link.label" v-bind="link" />
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref } from 'vue'
import EssentialLink from '@/components/EssentialLink.vue'

const linksList = [
  {
    label: 'Pokemons - Menu Principal',
    caption: 'Listado de Pokemons',
    icon: 'home',
    link: '/',
  },
  {
    label: 'POKEDEX INFO',
    caption: 'Informacion de Pokemons',
    icon: 'menu_book',
    link: '/pokedex-entry',
  },
  {
    label: 'Para más Info ir a WikiDex',
    caption: 'wikidex.net',
    icon: 'link',
    link: 'https://www.wikidex.net/wiki/WikiDex',
  },
  {
    label: 'TABLA DE TIPOS',
    caption: 'Informacion de debilidades y fortalezas',
    icon: 'list',
    link: '/typing-info',
  },
  {
    label: 'Facebook',
    caption: '@QuasarFramework',
    icon: 'public',
    link: 'https://facebook.quasar.dev',
  },
  {
    label: 'Quasar Awesome',
    caption: 'Community Quasar projects',
    icon: 'favorite',
    link: 'https://awesome.quasar.dev',
  },
]

const leftDrawerOpen = ref(false)

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value
}
</script>

<style lang="sass" scoped>
.shadow-box
  width: 90px
  height: 90px
  margin: 25px
  border-radius: 50%
  font-size: 12px
</style>