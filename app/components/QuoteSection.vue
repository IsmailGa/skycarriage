<script setup lang="ts">
import gsap from 'gsap'
import { airports, cityOf, distanceKm, transitDays } from '~/data/network'
import { cargoKeys } from '~/data/services'
import { site } from '~/data/site'

type Mode = 'export' | 'import'
const { t } = useI18n()
const fmt = useNumFmt()
const title = useMsgList('quote.title')
const cargo = useState<string>('cargoType', () => 'general')
const form = reactive({ mode: 'export' as Mode, from: '', to: '', weight: '', pieces: '', date: '', name: '', email: '', website: '' })
const errors = reactive<Record<string, string>>({}) // field → error code (see `quote.errors.*`)
const status = ref<'idle' | 'loading' | 'success' | 'error'>('idle')
const ref_ = ref('')
const serverError = ref('')
const minDate = ref('')
const card = ref<HTMLElement>()

onMounted(() => {
  const d = new Date()
  const iso = (x: Date) => new Date(x.getTime() - x.getTimezoneOffset() * 6e4).toISOString().slice(0, 10)
  minDate.value = iso(d)
  d.setDate(d.getDate() + 3)
  form.date = iso(d)
})

const options = computed(() => Object.keys(airports).map((code) => `${code} — ${t(`airports.${code}`)}`))
const codeOf = (v: string) => {
  const m = v.toUpperCase().match(/\b([A-Z]{3})\b/)
  if (m && airports[m[1]!]) return m[1]!
  const q = v.trim().toLowerCase()
  return Object.keys(airports).find((c) => cityOf(t(`airports.${c}`)).toLowerCase() === q)
}
const fromCode = computed(() => codeOf(form.from))
const toCode = computed(() => codeOf(form.to))
const estimate = computed(() => {
  if (!fromCode.value || !toCode.value || fromCode.value === toCode.value) return null
  const km = distanceKm(fromCode.value, toCode.value)
  const [a, b] = transitDays(km)
  const days = a === b ? (a === 1 ? t('quote.days.one', { n: a }) : t('quote.days.many', { n: a })) : t('quote.days.range', { a, b })
  return { km, days }
})
const tween = reactive({ km: 0 })
watch(() => estimate.value?.km, (km) => {
  if (km == null) return
  prefersReducedMotion() ? (tween.km = km) : gsap.to(tween, { km, duration: 0.9, ease: 'power3.out' })
})

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
    const res = await $fetch<{ ok: boolean; ref: string }>('/api/quote', { method: 'POST', body: { ...form, cargo: cargo.value } })
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
  <section id="quote" class="section section--white" aria-labelledby="quote-title">
    <div class="container">
      <div class="q">
        <div class="q__glow" aria-hidden="true" />
        <div class="q__copy">
          <p v-reveal class="eyebrow">{{ t('quote.eyebrow') }}</p>
          <h2 id="quote-title" v-reveal="0.08" class="q__h"><BrLines :lines="title" /></h2>
          <p v-reveal="0.16" class="q__lead">{{ t('quote.lead') }}</p>
          <ul v-reveal="0.24" class="q__contact">
            <li><span><AppIcon name="phone" :size="18" /></span><a :href="`tel:${site.phoneHref}`">{{ site.phone }}</a> · {{ t('quote.phoneNote') }}</li>
            <li><span><AppIcon name="mail" :size="18" /></span><a :href="`mailto:${site.email}`">{{ site.email }}</a></li>
          </ul>
          <div class="q__scene" aria-hidden="true"><CargoArt model="parcels" decorative /></div>
        </div>

        <div ref="card" v-reveal="0.1" class="q__card">
          <template v-if="status !== 'success'">
            <div class="q__top">
              <h3>{{ t('quote.formTitle') }}</h3>
              <div class="q__seg" role="radiogroup" :aria-label="t('quote.direction')">
                <button v-for="m in (['export', 'import'] as Mode[])" :key="m" type="button" role="radio" :aria-checked="form.mode === m" :class="{ on: form.mode === m }" @click="form.mode = m">{{ t(`quote.${m}`) }}</button>
              </div>
            </div>

            <form novalidate @submit.prevent="submit">
              <div class="q__row">
                <label class="f" :class="{ bad: errors.from }">
                  <span>{{ lbl.a }}</span>
                  <input v-model="form.from" list="airports" :placeholder="t('quote.ph.from')" autocomplete="off" :aria-invalid="!!errors.from" @input="delete errors.from" />
                  <small v-if="errors.from" role="alert">{{ t(`quote.errors.${errors.from}`) }}</small>
                </label>
                <label class="f" :class="{ bad: errors.to }">
                  <span>{{ lbl.b }}</span>
                  <input v-model="form.to" list="airports" :placeholder="t('quote.ph.to')" autocomplete="off" :aria-invalid="!!errors.to" @input="delete errors.to" />
                  <small v-if="errors.to" role="alert">{{ t(`quote.errors.${errors.to}`) }}</small>
                </label>
              </div>
              <datalist id="airports"><option v-for="o in options" :key="o" :value="o" /></datalist>

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
                  <span class="sel"><select v-model="cargo"><option v-for="c in cargoKeys" :key="c" :value="c">{{ t(`quote.cargoTypes.${c}`) }}</option></select><AppIcon name="chevronDown" :size="18" :stroke="2" /></span>
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
      </div>
    </div>
  </section>
</template>

<style scoped>
/* The CTA block stays dark in both themes (strong accent moment); the form card follows the theme. */
.q { position: relative; overflow: hidden; isolation: isolate; border-radius: clamp(28px, 3vw, 40px); background: linear-gradient(120deg, #0a1333, #07080b 70%); color: #fff; padding: clamp(28px, 5vw, 72px); display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 540px); gap: clamp(32px, 5vw, 64px); align-items: center; border: 1px solid var(--line); }
.q__glow { position: absolute; z-index: -1; left: -200px; top: -260px; width: 700px; height: 600px; border-radius: 50%; background: var(--blue); opacity: 0.4; filter: blur(130px); }
.q__copy { display: grid; gap: 24px; justify-items: start; position: relative; align-self: stretch; align-content: center; }
.q__copy .eyebrow { color: var(--blue-2); }
.q__h { font-family: var(--font-display); font-weight: 600; font-size: clamp(40px, 6vw, 72px); line-height: 1; letter-spacing: var(--ls-display); }
.q__lead { font-size: 18px; line-height: 1.55; color: #9aa0ac; max-width: 470px; }
.q__contact { display: grid; gap: 14px; padding-top: 8px; }
.q__contact li { display: flex; align-items: center; gap: 12px; font-weight: 500; flex-wrap: wrap; }
.q__contact span { width: 40px; height: 40px; border-radius: 50%; display: grid; place-items: center; color: var(--blue-2); background: rgb(255 255 255 / 0.08); }
.q__contact a:hover { text-decoration: underline; text-underline-offset: 4px; }
.q__scene { position: absolute; right: -40px; bottom: -60px; width: 300px; height: 300px; pointer-events: none; opacity: 0.95; }

.q__card { background: var(--surface); color: var(--fg); border-radius: var(--radius); padding: clamp(24px, 2.6vw, 36px); box-shadow: 0 30px 60px rgb(0 0 0 / 0.4); position: relative; z-index: 1; }
.q__top { display: flex; justify-content: space-between; align-items: center; gap: 12px; margin-bottom: 22px; flex-wrap: wrap; }
.q__top h3 { font-family: var(--font-display); font-weight: 600; font-size: 26px; letter-spacing: var(--ls-display); }
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
.f input::placeholder { color: var(--mute); opacity: 0.75; font-weight: 400; }
.f input:focus, .f select:focus { outline: none; background: var(--input-bg-focus); border-color: var(--blue); box-shadow: 0 0 0 4px rgb(79 123 255 / 0.18); }
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

@media (max-width: 1000px) { .q { grid-template-columns: 1fr; } .q__card { max-width: 640px; } .q__scene { display: none; } }
@media (max-width: 520px) { .q__row { grid-template-columns: 1fr; } }
</style>
