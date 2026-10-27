<template>
  <q-layout view="hHh Lpr lFf">
    <q-header class="app-header">
      <q-toolbar class="app-toolbar">
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menú"
          class="lt-md"
          @click="leftDrawerOpen = !leftDrawerOpen"
        />

        <router-link :to="{ name: 'home' }" class="brand">
          <img
            src="../assets/Logo_Pokémon_Champions.png"
            alt="Pokémon Champions"
            class="brand__logo"
          />
          <span class="brand__text font-display gt-xs">Champions<b>Builder</b></span>
        </router-link>

        <q-space />

        <q-tabs
          dense
          no-caps
          shrink
          inline-label
          active-color="amber"
          indicator-color="amber"
          class="gt-sm app-nav"
        >
          <q-route-tab
            v-for="link in navLinks"
            :key="link.label"
            :to="link.to"
            :icon="link.icon"
            :label="link.label"
            :exact="link.exact"
          >
            <q-badge
              v-if="link.badge"
              rounded
              color="amber"
              text-color="dark"
              :label="link.badge"
              class="q-ml-xs"
            />
          </q-route-tab>
        </q-tabs>

        <q-btn
          flat
          round
          dense
          icon="mdi-open-in-new"
          href="https://www.wikidex.net/wiki/WikiDex"
          target="_blank"
          class="q-ml-sm"
        >
          <q-tooltip>WikiDex</q-tooltip>
        </q-btn>
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" overlay behavior="mobile" class="app-drawer" :width="270">
      <q-list padding>
        <q-item-label header class="font-display">ChampionsBuilder</q-item-label>
        <EssentialLink v-for="link in drawerLinks" :key="link.label" v-bind="link" />
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view #default="{ Component, route }">
        <transition name="page" mode="out-in">
          <component :is="Component" :key="route.name === 'pokemon' ? 'pokemon' : route.fullPath" />
        </transition>
      </router-view>
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { computed, ref } from 'vue'
import EssentialLink from '@/components/EssentialLink.vue'
import { useTeamStore } from '@/stores/team.js'

const team = useTeamStore()
const leftDrawerOpen = ref(false)

const navLinks = computed(() => [
  { label: 'Pokédex', icon: 'mdi-pokeball', to: { name: 'home' }, exact: true },
  {
    label: 'Team Builder',
    icon: 'mdi-account-group',
    to: { name: 'team' },
    badge: team.members.length ? `${team.members.length}/6` : null,
  },
])

const drawerLinks = [
  { label: 'Pokédex', caption: 'Listado y filtros por tipo', icon: 'mdi-pokeball', link: '/' },
  { label: 'Team Builder', caption: 'Equipo y sinergia', icon: 'mdi-account-group', link: '/team' },
  {
    label: 'WikiDex',
    caption: 'wikidex.net',
    icon: 'mdi-open-in-new',
    link: 'https://www.wikidex.net/wiki/WikiDex',
  },
  {
    label: 'Champions Battle Data',
    caption: 'Fuente de datos de uso',
    icon: 'mdi-chart-box',
    link: 'https://championsbattledata.com',
  },
]
</script>

<style lang="scss" scoped>
.app-header {
  background: rgba(7, 11, 22, 0.72);
  backdrop-filter: blur(16px) saturate(150%);
  -webkit-backdrop-filter: blur(16px) saturate(150%);
  border-bottom: 1px solid var(--pc-border);
}
.app-toolbar {
  max-width: 1400px;
  margin: 0 auto;
  min-height: 64px;
}
.brand {
  display: flex;
  align-items: center;
  gap: 10px;
  color: inherit;
  text-decoration: none;
  &__logo {
    height: 44px;
    width: auto;
    filter: drop-shadow(0 0 10px rgba(233, 200, 13, 0.35));
    transition: transform 0.4s var(--pc-ease);
  }
  &:hover &__logo {
    transform: rotate(-6deg) scale(1.06);
  }
  &__text {
    font-size: 1.35rem;
    font-weight: 600;
    b {
      color: var(--pc-accent);
      font-weight: 700;
    }
  }
}
.app-nav :deep(.q-tab) {
  border-radius: 10px;
  margin: 0 2px;
}
.app-drawer {
  background: var(--pc-surface-strong);
}
</style>
