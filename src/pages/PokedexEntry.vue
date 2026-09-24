<template>
  <div class="q-pa-md flex flex-center">
    <q-card class="my-card shadow-3" flat bordered>
      
      <q-card-section :class="[currentPokemon.bgColor, 'text-white']">
        <div class="text-h6">{{ currentPokemon.name }}</div>
        <div class="text-subtitle2">{{ currentInfo.species }}</div>
      </q-card-section>

      <q-tabs 
        v-model="selectedPokemonKey" 
        dense 
        class="bg-grey-2 text-dark" 
        active-color="primary" 
        indicator-color="primary"
        align="left"
        outside-arrows
        mobile-arrows
      >
        <q-tab v-for="(poke, key) in pokedexData" :key="key" :name="key" class="q-px-sm">
          <div class="row items-center no-wrap q-gutter-x-xs">
            <q-img 
              :src="getFormImg(poke.forms[0].img)" 
              style="height: 30px; width: 30px" 
              fit="contain" 
            />
          </div>
        </q-tab>
      </q-tabs>

      <q-separator />
      <q-tabs v-model="tabSection" dense class="text-teal" active-color="primary" indicator-color="primary" align="justify">
        <q-tab name="info" label="Bibliografia" icon="info" />
        <q-tab name="details" label="Detalles" icon="list" />
      </q-tabs>

      <q-separator />

      <q-tab-panels v-model="tabSection" animated>
        
        <!-- Panel 1: Descripcion -->
        <q-tab-panel name="info">
          <div class="row items-center justify-center q-mb-md q-gutter-md">
            
            <q-img 
              :src="getFormImg(currentPokemon.forms[0].img)" 
              style="height: 100px; width: 100px" 
              fit="contain" 
            />

            <div class="column q-gutter-xs">
              <q-img 
                v-if="currentPokemon.forms[0].icon1" 
                :src="getIconImg(currentPokemon.forms[0].icon1)" 
                style="height: 28px; width: 28px" 
                fit="contain" 
              />
              <q-img 
                v-if="currentPokemon.forms[0].icon2" 
                :src="getIconImg(currentPokemon.forms[0].icon2)" 
                style="height: 28px; width: 28px" 
                fit="contain" 
              />
            </div>

          </div>

          <div class="text-body1 text-weight-medium q-mb-sm">Descripción de la Pokédex:</div>
          <p class="text-grey-8">{{ currentInfo.description }}</p>
          <div class="q-mt-md text-caption text-grey-6">Región / Origen: {{ currentInfo.generation }}</div>
        </q-tab-panel>

        <!-- Panel 2: Detalles -->
        <q-tab-panel name="details">
          <q-list dense separator>
            <q-item>
              <q-item-section><strong>Altura:</strong></q-item-section>
              <q-item-section side>{{ currentInfo.height }}</q-item-section>
            </q-item>
            <q-item>
              <q-item-section><strong>Peso:</strong></q-item-section>
              <q-item-section side>{{ currentInfo.weight }}</q-item-section>
            </q-item>
            <q-item>
              <q-item-section><strong>Habitat natural:</strong></q-item-section>
              <q-item-section side>{{ currentInfo.habitat }}</q-item-section>
            </q-item>
          </q-list>
        </q-tab-panel>

      </q-tab-panels>

      <q-separator />

      <q-card-actions align="center" class="q-pa-md">
        <q-btn icon="arrow_back" color="deep-orange-7" to="/" glossy label="Volver al Inicio" no-caps class="full-width" />
        <q-btn color="red-7" type="a" href="https://www.wikidex.net/wiki/WikiDex" target="_blank" glossy label="MAS INFORMACION" no-caps class="full-width" />
    </q-card-actions>

    </q-card>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import pokedexData from '../data/pokedex.json'
import pokeInfoData from '../data/PokeInfo.json'

const route = useRoute()

const tabSection = ref('info')

const selectedPokemonKey = ref(route.params.pokemon || 'golisopod')

watch(() => route.params.pokemon, (newVal) => {
  if (newVal && pokedexData[newVal]) {
    selectedPokemonKey.value = newVal
  }
})

const currentPokemon = computed(() => {
  return pokedexData[selectedPokemonKey.value] || pokedexData['golisopod']
})

const currentInfo = computed(() => {
  return pokeInfoData[selectedPokemonKey.value] || pokeInfoData['golisopod']
})

function getFormImg(imgName) {
  if (!imgName) return ''
  const images = import.meta.glob('../assets/*.png', { eager: true, import: 'default' })
  return images[`../assets/${imgName}`] || ''
}

function getIconImg(iconName) {
  if (!iconName) return ''
  const icons = import.meta.glob('../assets/Icon_Types/*.ico', { eager: true, import: 'default' })
  return icons[`../assets/Icon_Types/${iconName}`] || ''
}
</script>

<style lang="sass" scoped>
.my-card
  width: 100%
  max-width: 420px
</style>