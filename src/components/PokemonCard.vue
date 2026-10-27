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
    <div v-if="rank && rank.rank <= 10" class="poke-card__stripe" />

    <header class="poke-card__head">
      <span class="poke-card__dex font-display">
        {{ species.dexNumber ? `#${String(species.dexNumber).padStart(4, '0')}` : '—' }}
      </span>
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
        <q-tooltip>Cambiar forma ({{ formIndex + 1 }}/{{ species.forms.length }})</q-tooltip>
      </q-btn>
    </header>

    <div v-if="rank" class="poke-card__rank font-display">
      <span>#{{ rank.rank }}</span>
      <small>{{ format === 'Doubles' ? 'DOB' : 'IND' }}</small>
      <q-tooltip
        >Puesto {{ rank.rank }} de uso en
        {{ format === 'Doubles' ? 'Dobles' : 'Individual' }}</q-tooltip
      >
    </div>

    <div class="poke-card__art">
      <div v-if="!loaded" class="poke-card__placeholder" />
      <transition name="pop" mode="out-in">
        <img
          :key="form.sprite"
          :src="form.sprite"
          :alt="`${species.name} ${form.name}`"
          loading="lazy"
          decoding="async"
          :class="{ 'is-hidden': !loaded }"
          @load="loaded = true"
          @error="onError"
        />
      </transition>
    </div>

    <div class="poke-card__body">
      <div class="poke-card__name font-display">
        <span class="ellipsis">{{ species.name }}</span>
        <q-badge v-if="form.isMega" class="poke-card__mega" :label="form.name" />
        <q-badge v-else-if="form.name !== 'Base'" outline color="grey-5" :label="form.name" />
      </div>
      <div class="row q-gutter-xs no-wrap">
        <TypeBadge v-for="t in form.types" :key="t" :type="t" size="sm" />
      </div>
      <div class="poke-card__meta">
        <span class="poke-card__roles">
          <q-icon
            v-for="r in roles"
            :key="r"
            :name="ROLE_META[r].icon"
            :style="{ color: ROLE_META[r].color }"
          >
            <q-tooltip>{{ ROLE_META[r].label }}</q-tooltip>
          </q-icon>
        </span>
        <span
          ><b>{{ form.bst }}</b> BST · <q-icon name="mdi-lightning-bolt" />{{
            form.stats.spe
          }}</span
        >
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
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import TypeBadge from '@/components/TypeBadge.vue'
import { typeColor } from '@/utils/types.js'
import { inferRoles, ROLE_META } from '@/utils/roles.js'
import { useTeamStore } from '@/stores/team.js'

const props = defineProps({
  species: { type: Object, required: true },
  formIndex: { type: Number, default: 0 },
  // fila del ranking de uso (services/ranking.js) o null
  rank: { type: Object, default: null },
  format: { type: String, default: 'Doubles' },
})
const emit = defineEmits(['update:formIndex'])

const router = useRouter()
const $q = useQuasar()
const team = useTeamStore()
const flashing = ref(false)
const loaded = ref(false)

const form = computed(() => props.species.forms[props.formIndex] || props.species.forms[0])
const c1 = computed(() => typeColor(form.value.types[0]))
const c2 = computed(() => typeColor(form.value.types[1] || form.value.types[0]))

// Sin movimientos elegidos: roles por stats y por la habilidad más usada (o la primera)
const roles = computed(() =>
  inferRoles(form.value, props.rank?.topAbility || form.value.abilities[0]?.name).slice(0, 3),
)

watch(
  () => form.value.sprite,
  () => (loaded.value = false),
)

function onError(e) {
  // artwork remoto no disponible (sin conexión): se queda el marcador con los colores del tipo
  e.target.style.visibility = 'hidden'
}

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
  // esquina recortada: sello visual propio de las tarjetas de la app
  border-radius: 18px 4px 18px 18px;
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

  // franja dorada lateral para el top 10 de uso (elemento propio: ::before es del brillo .shine)
  &__stripe {
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 3px;
    background: linear-gradient(180deg, var(--pc-accent), transparent);
    z-index: 2;
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
    font-weight: 700;
    color: var(--pc-text-dim);
    letter-spacing: 0.1em;
    font-size: 0.8rem;
  }
  &__form-btn {
    background: rgba(255, 255, 255, 0.08);
  }

  &__rank {
    position: absolute;
    top: 44px;
    right: 0;
    z-index: 2;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 4px 8px 4px 12px;
    line-height: 1;
    color: #111;
    background: linear-gradient(135deg, var(--pc-accent), #ff9d00);
    clip-path: polygon(10px 0, 100% 0, 100% 100%, 10px 100%, 0 50%);
    span {
      font-weight: 700;
      font-size: 1rem;
    }
    small {
      font-size: 0.55rem;
      font-weight: 700;
      letter-spacing: 0.12em;
    }
  }

  &__art {
    position: relative;
    height: 140px;
    display: grid;
    place-items: center;
    z-index: 1;
    img {
      grid-area: 1 / 1;
      max-height: 130px;
      max-width: 85%;
      object-fit: contain;
      transition:
        transform 0.45s var(--pc-ease),
        filter 0.45s,
        opacity 0.3s;
      filter: drop-shadow(0 6px 10px rgba(0, 0, 0, 0.5));
      &.is-hidden {
        opacity: 0;
      }
    }
  }
  &__placeholder {
    grid-area: 1 / 1;
    width: 96px;
    height: 96px;
    border-radius: 50%;
    background: radial-gradient(
      circle,
      color-mix(in srgb, var(--c1) 35%, transparent),
      transparent 70%
    );
    animation: pc-float 2.4s ease-in-out infinite;
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
    font-size: 1.2rem;
    font-weight: 700;
    line-height: 1.1;
    display: flex;
    align-items: center;
    gap: 6px;
    min-width: 0;
  }
  &__mega {
    background: linear-gradient(135deg, #ff4fd8, #7a5cff);
    font-size: 0.65rem;
    flex-shrink: 0;
  }
  &__meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 0.78rem;
    color: var(--pc-text-dim);
    b {
      color: var(--pc-text);
    }
  }
  &__roles {
    display: inline-flex;
    gap: 4px;
    font-size: 1rem;
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
