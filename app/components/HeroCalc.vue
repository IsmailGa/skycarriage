<script setup lang="ts">
import gsap from 'gsap'
import type { RouteOption } from '~/composables/useRoutePicker'

// Compact calculator for the hero: shows a live distance / transit estimate, then hands the route to the full quote form.
const { t } = useI18n()
const fmt = useNumFmt()
const prefill = useState<{ from: string; to: string; weight: string } | null>('quotePrefill', () => null)
const form = reactive({ from: '', to: '', weight: '' })
const errors = reactive<Record<string, string>>({})
const root = ref<HTMLElement>()

const toField = ref<{ focus: () => void } | null>(null)
const route = useRoutePicker(form)
const { fromCode, toCode, estimate, swap } = route

// once the origin is picked, jump to the destination so its re-ranked list opens straight away
function onPick(side: 'from' | 'to') { if (side === 'from' && !toCode.value) nextTick(() => toField.value?.focus()) }
function chip(side: 'from' | 'to', o: RouteOption) { route.choose(side, o); delete errors[side] }

const tween = reactive({ km: 0 })
watch(() => estimate.value?.km, (km) => {
  if (km == null) return
  prefersReducedMotion() ? (tween.km = km) : gsap.to(tween, { km, duration: 0.8, ease: 'power3.out' })
})

function submit() {
  Object.keys(errors).forEach((k) => delete errors[k])
  if (!form.from.trim()) errors.from = 'from'
  if (!form.to.trim()) errors.to = 'to'
  if (form.from.trim() && form.from.trim().toLowerCase() === form.to.trim().toLowerCase()) errors.to = 'same'
  if (Object.keys(errors).length) {
    nextTick(() => root.value?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus())
    return
  }
  prefill.value = { from: form.from, to: form.to, weight: form.weight }
  scrollToId('quote')
}
</script>

<template>
  <div ref="root" class="hc">
    <div class="hc__head">
      <h2>{{ t('hero.calcTitle') }}</h2>
      <p>{{ t('hero.calcSub') }}</p>
    </div>

    <form novalidate @submit.prevent="submit">
      <div class="hc__route">
        <label class="f" :class="{ bad: errors.from }">
          <span>{{ t('quote.fromExport') }}</span>
          <UiAutocomplete v-model="form.from" :groups="route.groupsFor('from')" :placeholder="t('quote.ph.from')" :invalid="!!errors.from" :empty-text="t('route.empty')" :clear-label="t('route.clear')" @update:model-value="delete errors.from" @pick="onPick('from')" />
          <small v-if="errors.from" role="alert">{{ t(`quote.errors.${errors.from}`) }}</small>
        </label>
        <button type="button" class="hc__swap" :aria-label="t('hero.calcSwap')" @click="swap"><AppIcon name="rotate" :size="16" :stroke="2" /></button>
        <label class="f" :class="{ bad: errors.to }">
          <span>{{ t('quote.toExport') }}</span>
          <UiAutocomplete ref="toField" v-model="form.to" :groups="route.groupsFor('to')" :placeholder="t('quote.ph.to')" :invalid="!!errors.to" :empty-text="t('route.empty')" :clear-label="t('route.clear')" @update:model-value="delete errors.to" @pick="onPick('to')" />
          <small v-if="errors.to" role="alert">{{ t(`quote.errors.${errors.to}`) }}</small>
        </label>
      </div>

      <RouteChips :label="route.chipsFor('to').label" :options="route.chipsFor('to').items" @pick="chip('to', $event)" />
      <RouteChips :label="route.chipsFor('from').label" :options="route.chipsFor('from').items" @pick="chip('from', $event)" />

      <label class="f">
        <span>{{ t('quote.weight') }}</span>
        <input v-model="form.weight" inputmode="decimal" :placeholder="t('quote.ph.weight')" />
      </label>

      <Transition name="est">
        <p v-if="estimate" class="hc__est" aria-live="polite">
          <AppIcon name="plane" :size="18" :stroke="2" />
          <span><b>{{ fromCode }} → {{ toCode }}</b> · <b class="num">{{ t('quote.estKm', { km: fmt(Math.round(tween.km)) }) }}</b><br />{{ t('quote.est') }} <b>{{ estimate.days }}</b></span>
        </p>
      </Transition>

      <button class="btn btn--blue hc__go">{{ t('quote.submit') }} <AppIcon name="arrow" :size="18" :stroke="2" /></button>
    </form>
  </div>
</template>

<style scoped>
.hc { width: 100%; max-width: 460px; margin-left: auto; padding: 28px; border-radius: var(--radius); display: grid; gap: 20px; color: var(--fg); background: var(--glass); backdrop-filter: blur(24px) saturate(1.3); border: 1px solid var(--glass-border); box-shadow: var(--shadow-card), inset 0 1px 0 rgb(255 255 255 / 0.08); }
.hc__head h2 { font-family: var(--font-display); font-weight: 600; font-size: 24px; letter-spacing: var(--ls-display); line-height: 1.15; }
.hc__head p { margin-top: 6px; font-size: 14px; color: var(--mute); }
form { display: grid; gap: 14px; }
.hc__route { display: grid; grid-template-columns: 1fr auto 1fr; gap: 8px; align-items: end; }
.hc__swap { width: 40px; height: 48px; display: grid; place-items: center; color: var(--mute); border-radius: 12px; transition: color 0.3s, background 0.3s, transform 0.5s var(--ease); }
.hc__swap:hover { color: var(--fg); background: var(--chip); transform: rotate(180deg); }
.f { display: grid; gap: 7px; min-width: 0; align-content: start; }
.f > span { font-size: 13px; font-weight: 500; color: var(--mute); }
.f input { width: 100%; min-width: 0; padding: 14px 15px; border-radius: 14px; background: var(--input-bg); border: 1px solid var(--input-line); font-weight: 500; font-size: 16px; transition: border-color 0.25s, box-shadow 0.25s, background 0.25s; }
.f input::placeholder { color: var(--mute); opacity: 0.75; font-weight: 400; }
.f input:focus { outline: none; background: var(--input-bg-focus); border-color: var(--blue); box-shadow: 0 0 0 4px rgb(207 170 99 / 0.2); }
.f.bad input { border-color: var(--err); background: var(--err-bg); }
.f small { font-size: 12.5px; color: var(--err); }
.hc__est { display: flex; align-items: flex-start; gap: 10px; padding: 12px 14px; border-radius: 14px; background: var(--accent-soft); color: var(--accent-text); font-size: 14px; line-height: 1.45; }
.hc__est svg { flex: none; margin-top: 2px; transform: rotate(45deg); }
.est-enter-active, .est-leave-active { transition: all 0.5s var(--ease); overflow: hidden; }
.est-enter-from, .est-leave-to { opacity: 0; transform: translateY(-8px); max-height: 0; padding-block: 0; }
.est-enter-to { max-height: 120px; }
.hc__go { width: 100%; padding-block: 17px; }
@media (max-width: 1000px) { .hc { margin-left: 0; } }
@media (max-width: 520px) { .hc { padding: 22px 18px; } .hc__route { grid-template-columns: 1fr; } .hc__swap { justify-self: center; height: 34px; transform: rotate(90deg); } .hc__swap:hover { transform: rotate(270deg); } }
</style>