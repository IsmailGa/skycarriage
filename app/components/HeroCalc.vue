<script setup lang="ts">
import gsap from 'gsap'
import type { RouteOption } from '~/composables/useRoutePicker'

// Hero calculator: live distance / transit estimate, then the contact step and the send itself happen inside this card, so nothing scrolls away.
const { t } = useI18n()
const fmt = useNumFmt()
const { openQuote, cargo } = useQuote()
const form = reactive({ from: '', to: '', weight: '', name: '', email: '', website: '' })
const errors = reactive<Record<string, string>>({})
const step = ref<'route' | 'contact' | 'done'>('route')
const sending = ref(false)
const serverError = ref('')
const refNo = ref('')
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

const clearErrors = () => Object.keys(errors).forEach((k) => delete errors[k])
const focusInvalid = async () => {
  await nextTick()
  root.value?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus()
}

function next() {
  clearErrors()
  if (!form.from.trim()) errors.from = 'from'
  if (!form.to.trim()) errors.to = 'to'
  if (form.from.trim() && form.from.trim().toLowerCase() === form.to.trim().toLowerCase()) errors.to = 'same'
  if (Object.keys(errors).length) return focusInvalid()
  step.value = 'contact'
  nextTick(() => root.value?.querySelector<HTMLElement>('input[inputmode="decimal"]')?.focus())
}

async function send() {
  if (sending.value) return
  clearErrors()
  if (!(Number(form.weight) > 0)) errors.weight = 'weight'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email)) errors.email = 'email'
  if (Object.keys(errors).length) return focusInvalid()
  sending.value = true
  serverError.value = ''
  try {
    const res = await sendQuote({ ...form, cargo: cargo.value })
    refNo.value = res.ref
    step.value = 'done'
  } catch (e: any) {
    const errs = e?.data?.data?.errors
    serverError.value = errs ? t('quote.fixFields') : t('quote.serverError')
    if (errs) Object.assign(errors, errs)
  } finally {
    sending.value = false
  }
}

// the full form (pieces, date, cargo type) opens in the dialog, prefilled with what was entered here
const more = () => openQuote({ from: form.from, to: form.to, weight: form.weight })
function again() {
  Object.assign(form, { from: '', to: '', weight: '', name: '', email: '' })
  step.value = 'route'
}
const firstName = computed(() => (form.name.trim() ? `, ${form.name.trim().split(/\s+/)[0]}` : ''))
</script>

<template>
  <div ref="root" class="hc">
    <template v-if="step === 'route'">
      <div class="hc__head">
        <h2>{{ t('hero.calcTitle') }}</h2>
        <p>{{ t('hero.calcSub') }}</p>
      </div>

      <form novalidate @submit.prevent="next">
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

        <button class="btn btn--blue hc__go">{{ t('hero.calcNext') }} <AppIcon name="arrow" :size="18" :stroke="2" /></button>
      </form>
    </template>

    <template v-else-if="step === 'contact'">
      <div class="hc__head">
        <h2>{{ t('hero.calcContactTitle') }}</h2>
        <p class="hc__sum"><b>{{ fromCode ?? form.from }} → {{ toCode ?? form.to }}</b><template v-if="estimate"> · {{ t('quote.estKm', { km: fmt(estimate.km) }) }} · {{ estimate.days }}</template></p>
      </div>

      <form novalidate @submit.prevent="send">
        <label class="f" :class="{ bad: errors.weight }">
          <span>{{ t('quote.weight') }}</span>
          <input v-model="form.weight" inputmode="decimal" :placeholder="t('quote.ph.weight')" :aria-invalid="!!errors.weight" @input="delete errors.weight" />
          <small v-if="errors.weight" role="alert">{{ t(`quote.errors.${errors.weight}`) }}</small>
        </label>
        <label class="f" :class="{ bad: errors.email }">
          <span>{{ t('quote.email') }}</span>
          <input v-model="form.email" type="email" autocomplete="email" :placeholder="t('quote.ph.email')" :aria-invalid="!!errors.email" @input="delete errors.email" />
          <small v-if="errors.email" role="alert">{{ t(`quote.errors.${errors.email}`) }}</small>
        </label>
        <label class="f"><span>{{ t('quote.name') }} <em>{{ t('quote.optional') }}</em></span><input v-model="form.name" autocomplete="name" :placeholder="t('quote.ph.name')" /></label>
        <input v-model="form.website" class="hp" tabindex="-1" autocomplete="off" aria-hidden="true" name="website" />

        <button class="btn btn--blue hc__go" :disabled="sending">
          <template v-if="sending"><span class="spin" aria-hidden="true" /> {{ t('quote.sending') }}</template>
          <template v-else>{{ t('quote.submit') }} <AppIcon name="arrow" :size="18" :stroke="2" /></template>
        </button>
        <p v-if="serverError" class="hc__err" role="alert">{{ serverError }}</p>
        <div class="hc__links">
          <button type="button" @click="step = 'route'">← {{ t('hero.calcBack') }}</button>
          <button type="button" @click="more">{{ t('hero.calcFull') }}</button>
        </div>
      </form>
    </template>

    <div v-else class="hc__done" role="status">
      <span class="hc__tick"><AppIcon name="check" :size="28" :stroke="2.4" /></span>
      <h2>{{ t('quote.doneTitle') }}</h2>
      <i18n-t keypath="quote.doneText" tag="p">
        <template #name>{{ firstName }}</template>
        <template #email><b>{{ form.email }}</b></template>
        <template #route><b>{{ fromCode ?? form.from }} → {{ toCode ?? form.to }}</b></template>
      </i18n-t>
      <p class="hc__ref">{{ t('quote.ref') }} <b class="num">{{ refNo }}</b></p>
      <button class="btn btn--outline btn--sm" @click="again">{{ t('quote.again') }}</button>
    </div>
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
.f em { font-style: normal; opacity: 0.7; }
.f input { width: 100%; min-width: 0; padding: 14px 15px; border-radius: 14px; background: var(--input-bg); border: 1px solid var(--input-line); font-weight: 500; font-size: 16px; transition: border-color 0.25s, box-shadow 0.25s, background 0.25s; }
.f input::placeholder { color: var(--mute); opacity: 0.95; font-weight: 400; }
.f input:focus { outline: none; background: var(--input-bg-focus); border-color: var(--blue); box-shadow: 0 0 0 4px rgb(207 170 99 / 0.2); }
.f.bad input { border-color: var(--err); background: var(--err-bg); }
.f small { font-size: 12.5px; color: var(--err); }
.hp { position: absolute; left: -9999px; width: 1px; height: 1px; opacity: 0; }
.hc__est { display: flex; align-items: flex-start; gap: 10px; padding: 12px 14px; border-radius: 14px; background: var(--accent-soft); color: var(--accent-text); font-size: 14px; line-height: 1.45; }
.hc__est svg { flex: none; margin-top: 2px; transform: rotate(45deg); }
.est-enter-active, .est-leave-active { transition: all 0.5s var(--ease); overflow: hidden; }
.est-enter-from, .est-leave-to { opacity: 0; transform: translateY(-8px); max-height: 0; padding-block: 0; }
.est-enter-to { max-height: 120px; }
.hc__go { width: 100%; padding-block: 17px; }
.hc__go:disabled { opacity: 0.75; cursor: progress; }
.hc__sum b { color: var(--accent-text); }
.hc__err { color: var(--err); font-size: 14px; text-align: center; }
.hc__links { display: flex; justify-content: space-between; gap: 12px; flex-wrap: wrap; font-size: 13.5px; }
.hc__links button { color: var(--mute); text-decoration: underline; text-underline-offset: 4px; text-decoration-color: transparent; transition: color 0.25s, text-decoration-color 0.25s; }
.hc__links button:hover { color: var(--fg); text-decoration-color: currentColor; }
.spin { width: 16px; height: 16px; border-radius: 50%; border: 2px solid rgb(0 0 0 / 0.25); border-top-color: var(--on-accent); animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.hc__done { display: grid; gap: 12px; justify-items: center; text-align: center; padding: 14px 0; }
.hc__done h2 { font-family: var(--font-display); font-weight: 600; font-size: 26px; letter-spacing: var(--ls-display); }
.hc__done p { color: var(--mute); font-size: 14.5px; line-height: 1.55; overflow-wrap: anywhere; }
.hc__done p b { color: var(--fg); }
.hc__tick { width: 64px; height: 64px; border-radius: 50%; display: grid; place-items: center; color: #17a86a; background: rgb(61 220 151 / 0.16); box-shadow: 0 0 0 9px rgb(61 220 151 / 0.08); }
.hc__ref { padding: 7px 14px; background: var(--chip); border-radius: 999px; font-size: 13.5px !important; }
@media (max-width: 1000px) { .hc { margin-left: 0; } }
@media (max-width: 520px) { .hc { padding: 22px 18px; } .hc__route { grid-template-columns: 1fr; } .hc__swap { justify-self: center; height: 34px; transform: rotate(90deg); } .hc__swap:hover { transform: rotate(270deg); } }
</style>
