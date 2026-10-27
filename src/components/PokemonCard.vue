<template>
  <article
    class="poke-card glass metal-border shine"
    :class="{ 'pulse-select': flashing }"
    :style="{ '--c1': c1, '--c2': c2 }"
    tabindex="0"
    @click="open"
    @keydown.enter="open"
  >
    <div class="poke-card__glow" />

    <header class="poke-card__head">
      <span class="poke-card__dex">#{{ String(species.dexNumber).padStart(4, '0') }}</span>
      <q-btn
        v-if="species.forms.length > 1"
        round
        dense
        flat
        size="sm"
        icon="mdi-swap-horizontal"
        class="pc-btn poke-card__form-btn"
        @click.stop="nextForm"
      >
        <q-tooltip>Cambiar forma ({{ species.forms.length }})</q-tooltip>
      </q-btn>
    </header>

    <div class="poke-card__art">
      <transition name="pop" mode="out-in">
        <img
          :key="form.sprite"
          :src="form.sprite"
          :alt="`${species.name} ${form.name}`"
          loading="lazy"
        />
      </transition>
    </div>

    <div class="poke-card__body">
      <div class="poke-card__name font-display">
        {{ species.name }}
        <q-badge v-if="form.isMega" class="poke-card__mega" :label="form.name" />
      </div>
      <div class="row q-gutter-xs no-wrap">
        <TypeBadge v-for="t in form.types" :key="t" :type="t" size="sm" />
      </div>
      <div class="poke-card__meta">
        <span
          ><b>{{ form.bst }}</b> BST</span
        >
        <span><q-icon name="mdi-lightning-bolt" /> {{ form.stats.spe }}</span>
      </div>
    </div>

    <footer class="poke-card__actions">
      <q-btn
        unelevated
        dense
        no-caps
        class="pc-btn col"
        color="white"
        text-color="dark"
        icon="mdi-account-multiple-plus"
        label="Equipo"
        @click.stop="addToTeam"
      />
      <q-btn
        unelevated
        dense
        no-caps
        class="pc-btn col poke-card__more"
        icon-right="mdi-chevron-right"
        label="Ficha"
        @click.stop="open"
      />
    </footer>
  </article>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import TypeBadge from '@/components/TypeBadge.vue'
import { typeColor } from '@/utils/types.js'
import { useTeamStore } from '@/stores/team.js'

const props = defineProps({
  species: { type: Object, required: true },
  formIndex: { type: Number, default: 0 },
})
const emit = defineEmits(['update:formIndex'])

const router = useRouter()
const $q = useQuasar()
const team = useTeamStore()
const flashing = ref(false)

const form = computed(() => props.species.forms[props.formIndex] || props.species.forms[0])
const c1 = computed(() => typeColor(form.value.types[0]))
const c2 = computed(() => typeColor(form.value.types[1] || form.value.types[0]))

function nextForm() {
  emit('update:formIndex', (props.formIndex + 1) % props.species.forms.length)
}

function open() {
  router.push({
    name: 'pokemon',
    params: { key: props.species.key },
    query: props.formIndex ? { form: props.formIndex } : {},
  })
}

function addToTeam() {
  const index = team.add(props.species.key, props.formIndex)
  flashing.value = false
  requestAnimationFrame(() => (flashing.value = true))
  setTimeout(() => (flashing.value = false), 650)
  $q.notify(
    index === -1
      ? { type: 'warning', message: 'El equipo ya tiene 6 miembros', icon: 'mdi-alert' }
      : {
          color: 'dark',
          icon: 'mdi-check-circle',
          iconColor: 'positive',
          message: `${props.species.name} añadido al equipo (${team.members.length}/6)`,
          actions: [
            { label: 'Ver equipo', color: 'amber', handler: () => router.push({ name: 'team' }) },
          ],
        },
  )
}
</script>

<style lang="scss" scoped>
.poke-card {
  position: relative;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  cursor: pointer;
  outline: none;
  transition:
    transform 0.35s var(--pc-ease),
    box-shadow 0.35s var(--pc-ease),
    border-color 0.35s;

  &:hover,
  &:focus-visible {
    transform: translateY(-8px);
    border-color: color-mix(in srgb, var(--c1) 60%, transparent);
    box-shadow:
      0 18px 40px rgba(0, 0, 0, 0.45),
      0 0 28px color-mix(in srgb, var(--c1) 40%, transparent);
    .poke-card__art img {
      transform: scale(1.08) translateY(-4px);
      filter: drop-shadow(0 10px 16px color-mix(in srgb, var(--c1) 55%, transparent));
    }
    .poke-card__glow {
      opacity: 0.9;
    }
  }

  &__glow {
    position: absolute;
    inset: -30% -30% auto -30%;
    height: 75%;
    background:
      radial-gradient(
        circle at 30% 60%,
        color-mix(in srgb, var(--c1) 55%, transparent),
        transparent 60%
      ),
      radial-gradient(
        circle at 75% 50%,
        color-mix(in srgb, var(--c2) 45%, transparent),
        transparent 60%
      );
    opacity: 0.55;
    filter: blur(18px);
    transition: opacity 0.35s;
    pointer-events: none;
  }

  &__head {
    position: relative;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 10px 0 14px;
    z-index: 1;
  }
  &__dex {
    font-family: var(--pc-font-display);
    font-weight: 700;
    color: var(--pc-text-dim);
    letter-spacing: 0.1em;
    font-size: 0.8rem;
  }
  &__form-btn {
    background: rgba(255, 255, 255, 0.08);
  }

  &__art {
    position: relative;
    height: 140px;
    display: grid;
    place-items: center;
    z-index: 1;
    img {
      max-height: 130px;
      max-width: 85%;
      object-fit: contain;
      transition:
        transform 0.45s var(--pc-ease),
        filter 0.45s;
      filter: drop-shadow(0 6px 10px rgba(0, 0, 0, 0.5));
    }
  }

  &__body {
    position: relative;
    padding: 4px 14px 10px;
    display: flex;
    flex-direction: column;
    gap: 6px;
    z-index: 1;
  }
  &__name {
    font-size: 1.25rem;
    font-weight: 700;
    line-height: 1.1;
    display: flex;
    align-items: center;
    gap: 6px;
  }
  &__mega {
    background: linear-gradient(135deg, #ff4fd8, #7a5cff);
    font-size: 0.65rem;
  }
  &__meta {
    display: flex;
    justify-content: space-between;
    font-size: 0.78rem;
    color: var(--pc-text-dim);
    b {
      color: var(--pc-text);
    }
  }

  &__actions {
    position: relative;
    display: flex;
    gap: 8px;
    padding: 0 12px 12px;
    z-index: 1;
  }
  &__more {
    background: linear-gradient(135deg, var(--c1), color-mix(in srgb, var(--c2) 70%, #000));
    color: #fff;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
  }
}
</style>
