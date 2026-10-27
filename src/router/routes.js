const routes = [
  {
    path: '/',
    component: () => import('@/layouts/MainLayout.vue'),
    children: [
      { path: '', name: 'home', component: () => import('@/pages/IndexPage.vue') },
      {
        path: 'pokemon/:key',
        name: 'pokemon',
        component: () => import('@/pages/PokemonDetailPage.vue'),
      },
      { path: 'team', name: 'team', component: () => import('@/pages/TeamBuilderPage.vue') },

      // Rutas antiguas: sus vistas se integraron en la ficha del Pokémon
      {
        path: 'second/:pokemon?',
        redirect: (to) =>
          to.params.pokemon
            ? { name: 'pokemon', params: { key: to.params.pokemon } }
            : { name: 'home' },
      },
      {
        path: 'pokedex-entry',
        redirect: { name: 'pokemon', params: { key: 'golisopod' }, query: { tab: 'dex' } },
      },
      {
        path: 'typing-info',
        redirect: { name: 'pokemon', params: { key: 'golisopod' }, query: { tab: 'types' } },
      },
    ],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('@/pages/ErrorNotFound.vue'),
  },
]

export default routes
