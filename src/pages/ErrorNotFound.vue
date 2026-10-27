<template>
  <div class="fullscreen text-center q-pa-md flex flex-center not-found">
    <div>
      <q-icon name="mdi-pokeball" size="96px" class="float text-amber" />
      <div class="not-found__code font-display">404</div>
      <div class="text-h5 text-dim">Este Pokémon huyó…</div>
      <q-btn
        class="q-mt-xl pc-btn"
        color="amber"
        text-color="dark"
        unelevated
        to="/"
        label="Volver a la Pokédex"
        no-caps
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.not-found__code {
  font-size: 22vh;
  font-weight: 700;
  line-height: 1;
  background: linear-gradient(90deg, #fff, var(--pc-accent));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}
</style>
