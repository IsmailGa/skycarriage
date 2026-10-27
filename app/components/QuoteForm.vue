<script setup lang="ts">
import gsap from 'gsap'
import { DialogTitle } from 'reka-ui'
import type { RouteOption } from '~/composables/useRoutePicker'
import { cargoKeys } from '~/data/services'

type Mode = 'export' | 'import'
defineProps<{ dialog?: boolean }>()
const { t } = useI18n()
const fmt = useNumFmt()
const { form, cargo, status, ref: ref_ } = useQuote()
const errors = reactive<Record<string, string>>({}) // field → error code (see `quote.errors.*`)
const serverError = ref('')
const minDate = ref('')
const card = ref<HTMLElement>()

onMounted(() => {
  const d = new Date()
  const iso = (x: Date) => new Date(x.getTime() - x.getTimezoneOffset() * 6e4).toISOString().slice(0, 10)
  minDate.value = iso(d)
  if (!form.date) {
    d.setDate(d.getDate() + 3)
    form.date = iso(d)
  }
})

const cargoOptions = computed(() => cargoKeys.map((c) => ({ value: c, label: t(`quote.cargoTypes.${c}`) })))
const route = useRoutePicker(form)
const { fromCode, toCode, estimate } = route
const toField = ref<{ focus: () => void } | null>(null)
// once the origin is picked, jump to the destination so its re-ranked list opens straight away
function onPick(side: 'from' | 'to') { if (side === 'from' && !toCode.value) nextTick(() => toField.value?.focus()) }
function chip(side: 'from' | 'to', o: RouteOption) { route.choose(side, o); delete errors[side] }
const tween = reactive({ km: 0 })
watch(() => estimate.value?.km, (km) => {
  if (km == null) return
  prefersReducedMotion() ? (tween.km = km) : gsap.to(tween, { km, duration: 0.9, ease: 'power3.out' })
}, { immediate: true })

function validate() {
  Object.keys(errors).forEach((k) => delete errors[k])
  if (!form.from.trim()) errors.from = 'from'
  if (!form.to.trim()) errors.to = 'to'
  if (form.from.trim() && form.from.trim().toLowerCase() === form.to.trim().toLowerCase()) errors.to = 'same'
  if (!(Number(form.weight) > 0)) errors.weight = 'weight'
  if (!(Number.isInteger(Number(form.pieces)) && Number(form.pieces) > 0)) errors.pieces = 'pieces'
  if (form.date && form.date < minDate.value) errors.date = 'date'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email)) errors.email = 'email'
  return Object.keys(errors).length === 0
}

async function submit() {
  if (status.value === 'loading') return
  if (!validate()) {
    await nextTick()
    card.value?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus()
    return
  }
  status.value = 'loading'
  serverError.value = ''
  try {
    const res = await sendQuote({ ...form, cargo: cargo.value })
    ref_.value = res.ref
    status.value = 'success'
    await nextTick()
    if (!prefersReducedMotion()) gsap.from('.q__done > *', { y: 24, opacity: 0, stagger: 0.08, duration: 0.8, ease: 'power3.out' })
  } catch (e: any) {
    status.value = 'error'
    const errs = e?.data?.data?.errors
    serverError.value = errs ? t('quote.fixFields') : t('quote.serverError')
    if (errs) Object.assign(errors, errs)
  }
}
function reset() {
  status.value = 'idle'
  Object.assign(form, { from: '', to: '', weight: '', pieces: '', name: '', email: '' })
}
const lbl = computed(() => (form.mode === 'export' ? { a: t('quote.fromExport'), b: t('quote.toExport') } : { a: t('quote.fromImport'), b: t('quote.toImport') }))
const firstName = computed(() => (form.name.trim() ? `, ${form.name.trim().split(/\s+/)[0]}` : ''))
</script>

<template>
<div ref="card" class="qf">
          <template v-if="status !== 'success'">
            <div class="q__top">
              <DialogTitle v-if="dialog" class="q__title">{{ t('quote.formTitle') }}</DialogTitle>
              <h3 v-else class="q__title">{{ t('quote.formTitle') }}</h3>
              <div class="q__seg" role="radiogroup" :aria-label="t('quote.direction')">
                <button v-for="m in (['export', 'import'] as Mode[])" :key="m" type="button" role="radio" :aria-checked="form.mode === m" :class="{ on: form.mode === m }" @click="form.mode = m">{{ t(`quote.${m}`) }}</button>
              </div>
            </div>

            <form novalidate @submit.prevent="submit">
              <div class="q__row">
                <label class="f" :class="{ bad: errors.from }">
                  <span>{{ lbl.a }}</span>
                  <UiAutocomplete v-model="form.from" :groups="route.groupsFor('from')" :placeholder="t('quote.ph.from')" :invalid="!!errors.from" :empty-text="t('route.empty')" :clear-label="t('route.clear')" @update:model-value="delete errors.from" @pick="onPick('from')" />
                  <small v-if="errors.from" role="alert">{{ t(`quote.errors.${errors.from}`) }}</small>
                </label>
                <label class="f" :class="{ bad: errors.to }">
                  <span>{{ lbl.b }}</span>
                  <UiAutocomplete ref="toField" v-model="form.to" :groups="route.groupsFor('to')" :placeholder="t('quote.ph.to')" :invalid="!!errors.to" :empty-text="t('route.empty')" :clear-label="t('route.clear')" @update:model-value="delete errors.to" @pick="onPick('to')" />
                  <small v-if="errors.to" role="alert">{{ t(`quote.errors.${errors.to}`) }}</small>
                </label>
              </div>
              <RouteChips :label="route.chipsFor('to').label" :options="route.chipsFor('to').items" @pick="chip('to', $event)" />
              <RouteChips :label="route.chipsFor('from').label" :options="route.chipsFor('from').items" @pick="chip('from', $event)" />
              

              <div class="q__row">
                <label class="f" :class="{ bad: errors.weight }">
                  <span>{{ t('quote.weight') }}</span>
                  <input v-model="form.weight" inputmode="decimal" :placeholder="t('quote.ph.weight')" :aria-invalid="!!errors.weight" @input="delete errors.weight" />
                  <small v-if="errors.weight" role="alert">{{ t(`quote.errors.${errors.weight}`) }}</small>
                </label>
                <label class="f" :class="{ bad: errors.pieces }">
                  <span>{{ t('quote.pieces') }}</span>
                  <input v-model="form.pieces" inputmode="numeric" :placeholder="t('quote.ph.pieces')" :aria-invalid="!!errors.pieces" @input="delete errors.pieces" />
                  <small v-if="errors.pieces" role="alert">{{ t(`quote.errors.${errors.pieces}`) }}</small>
                </label>
              </div>

              <div class="q__row">
                <label class="f">
                  <span>{{ t('quote.cargo') }}</span>
                  <UiSelect v-model="cargo" :options="cargoOptions" :aria-label="t('quote.cargo')" />
                </label>
                <label class="f" :class="{ bad: errors.date }">
                  <span>{{ t('quote.date') }}</span>
                  <input v-model="form.date" type="date" :min="minDate" :aria-invalid="!!errors.date" @input="delete errors.date" />
                  <small v-if="errors.date" role="alert">{{ t(`quote.errors.${errors.date}`) }}</small>
                </label>
              </div>

              <div class="q__row">
                <label class="f"><span>{{ t('quote.name') }} <em>{{ t('quote.optional') }}</em></span><input v-model="form.name" autocomplete="name" :placeholder="t('quote.ph.name')" /></label>
                <label class="f" :class="{ bad: errors.email }">
                  <span>{{ t('quote.email') }}</span>
                  <input v-model="form.email" type="email" autocomplete="email" :placeholder="t('quote.ph.email')" :aria-invalid="!!errors.email" @input="delete errors.email" />
                  <small v-if="errors.email" role="alert">{{ t(`quote.errors.${errors.email}`) }}</small>
                </label>
              </div>

              <input v-model="form.website" class="hp" tabindex="-1" autocomplete="off" aria-hidden="true" name="website" />

              <Transition name="est">
                <p v-if="estimate" class="q__est" aria-live="polite">
                  <AppIcon name="plane" :size="18" :stroke="2" />
                  <span><b>{{ fromCode }} → {{ toCode }}</b> · <b class="num">{{ t('quote.estKm', { km: fmt(Math.round(tween.km)) }) }}</b> · {{ t('quote.est') }} <b>{{ estimate.days }}</b></span>
                </p>
              </Transition>

              <button class="btn btn--blue q__submit" :disabled="status === 'loading'">
                <template v-if="status === 'loading'"><span class="spin" aria-hidden="true" /> {{ t('quote.sending') }}</template>
                <template v-else>{{ t('quote.submit') }} <AppIcon name="arrow" :size="18" :stroke="2" /></template>
              </button>
              <p v-if="serverError" class="q__err" role="alert">{{ serverError }}</p>
              <p class="q__note"><AppIcon name="lock" :size="14" :stroke="2" /> {{ t('quote.note') }}</p>
            </form>
          </template>

          <div v-else class="q__done" role="status">
            <span class="q__tick"><AppIcon name="check" :size="30" :stroke="2.4" /></span>
            <h3>{{ t('quote.doneTitle') }}</h3>
            <i18n-t keypath="quote.doneText" tag="p">
              <template #name>{{ firstName }}</template>
              <template #email><b>{{ form.email }}</b></template>
              <template #route><b>{{ fromCode ?? form.from }} → {{ toCode ?? form.to }}</b></template>
            </i18n-t>
            <p class="q__ref">{{ t('quote.ref') }} <b class="num">{{ ref_ }}</b></p>
            <button class="btn btn--outline btn--sm" @click="reset">{{ t('quote.again') }}</button>
          </div>
</div>
</template>

<style scoped>
.q__top { display: flex; justify-content: space-between; align-items: center; gap: 12px; margin-bottom: 22px; flex-wrap: wrap; }
.q__title { font-family: var(--font-display); font-weight: 600; font-size: 26px; letter-spacing: var(--ls-display); }
.q__seg { display: inline-flex; padding: 4px; border-radius: 999px; background: var(--chip); }
.q__seg button { padding: 7px 16px; border-radius: 999px; font-size: 13px; font-weight: 600; color: var(--mute); transition: all 0.3s var(--ease); }
.q__seg button.on { background: var(--fg); color: var(--bg); }
form { display: grid; gap: 16px; }
.q__row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.f { display: grid; gap: 8px; align-content: start; min-width: 0; }
.f > span:first-child { font-size: 13px; font-weight: 500; color: var(--mute); }
.f em { font-style: normal; opacity: 0.7; }
.f input, .f select { width: 100%; min-width: 0; padding: 15px 16px; border-radius: 14px; background: var(--input-bg); border: 1px solid var(--input-line); font-weight: 500; font-size: 16px; transition: border-color 0.25s, box-shadow 0.25s, background 0.25s; appearance: none; color-scheme: inherit; }
.f select option { background: var(--surface); color: var(--fg); }
.f input::placeholder { color: var(--mute); opacity: 0.95; font-weight: 400; }
.f input:focus, .f select:focus { outline: none; background: var(--input-bg-focus); border-color: var(--blue); box-shadow: 0 0 0 4px rgb(207 170 99 / 0.18); }
.f.bad input { border-color: var(--err); background: var(--err-bg); }
.f small { font-size: 12.5px; color: var(--err); }
.sel { position: relative; display: block; }
.sel svg { position: absolute; right: 14px; top: 50%; transform: translateY(-50%); pointer-events: none; color: var(--mute); }
.sel select { padding-right: 40px; }
.hp { position: absolute; left: -9999px; width: 1px; height: 1px; opacity: 0; }
.q__est { display: flex; align-items: flex-start; gap: 10px; padding: 12px 14px; border-radius: 14px; background: var(--accent-soft); color: var(--accent-text); font-size: 14px; line-height: 1.45; }
.q__est svg { flex: none; margin-top: 2px; transform: rotate(45deg); }
.est-enter-active, .est-leave-active { transition: all 0.5s var(--ease); overflow: hidden; }
.est-enter-from, .est-leave-to { opacity: 0; transform: translateY(-8px); max-height: 0; padding-block: 0; }
.est-enter-to { max-height: 140px; }
.q__submit { width: 100%; padding-block: 18px; }
.q__submit:disabled { opacity: 0.75; cursor: progress; }
.spin { width: 16px; height: 16px; border-radius: 50%; border: 2px solid rgb(255 255 255 / 0.4); border-top-color: #fff; animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.q__err { color: var(--err); font-size: 14px; text-align: center; }
.q__note { display: flex; justify-content: center; align-items: center; gap: 8px; font-size: 13px; color: var(--mute); text-align: center; }

.q__done { display: grid; gap: 14px; justify-items: center; text-align: center; padding: 24px 8px; }
.q__tick { width: 72px; height: 72px; border-radius: 50%; display: grid; place-items: center; color: #17a86a; background: rgb(61 220 151 / 0.16); box-shadow: 0 0 0 10px rgb(61 220 151 / 0.08); }
.q__done h3 { font-family: var(--font-display); font-weight: 600; font-size: 30px; letter-spacing: var(--ls-display); }
.q__done p { color: var(--mute); max-width: 380px; line-height: 1.55; overflow-wrap: anywhere; }
.q__done p b { color: var(--fg); }
.q__ref { font-size: 14px; padding: 8px 14px; background: var(--chip); border-radius: 999px; }
@media (max-width: 520px) { .q__row { grid-template-columns: 1fr; } }
</style>
