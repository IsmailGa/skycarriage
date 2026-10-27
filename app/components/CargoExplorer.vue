<script setup lang="ts">
import type { CargoKey } from '~/data/services'
import type { ArtKey } from '~/data/cargo'

const { t } = useI18n()
const title = useMsgList('explorer.title')
const { openQuote } = useQuote()

interface Tab { key: ArtKey; icon: 'zap' | 'box' | 'truck' | 'plane' | 'globe'; cargo: CargoKey }
const tabs: Tab[] = [
  { key: 'parcels', icon: 'zap', cargo: 'general' },
  { key: 'uld', icon: 'box', cargo: 'general' },
  { key: 'pallet', icon: 'truck', cargo: 'oversized' },
  { key: 'plane', icon: 'plane', cargo: 'oversized' },
  { key: 'globe', icon: 'globe', cargo: 'general' },
]
const active = ref<ArtKey>('uld') // which illustration the stage shows
const opened = ref<ArtKey | null>('uld') // which card is expanded; null = all collapsed
const specs = (k: ArtKey) => Array.from({ length: 3 }, (_, i) => ({ k: t(`explorer.tabs.${k}.specs[${i}].k`), v: t(`explorer.tabs.${k}.specs[${i}].v`) }))

function quote(tab: Tab) {
  openQuote({ cargo: tab.cargo })
}
// click toggles the card; the illustration keeps showing the last one picked
function toggle(k: ArtKey) {
  active.value = k
  opened.value = opened.value === k ? null : k
}
// arrow keys move focus between the card headers
function onKey(e: KeyboardEvent) {
  const i = tabs.findIndex((x) => `cx-tab-${x.key}` === (e.target as HTMLElement).id)
  const d = e.key === 'ArrowDown' ? 1 : e.key === 'ArrowUp' ? -1 : 0
  if (i < 0 || !d) return
  e.preventDefault()
  document.getElementById(`cx-tab-${tabs[(i + d + tabs.length) % tabs.length]!.key}`)?.focus()
}
</script>

<template>
  <section id="cargo" class="section section--white cx" aria-labelledby="cx-title">
    <div class="container">
      <div class="sec-head">
        <div class="sec-head__l">
          <h2 id="cx-title" v-reveal="0.08" class="h2"><BrLines :lines="title" /></h2>
        </div>
        <p v-reveal="0.16" class="lead">{{ t('explorer.lead') }}</p>
      </div>

      <div class="cx__grid">
        <div v-reveal class="cx__stage">
          <div class="cx__scene" aria-hidden="true"><CargoArt :key="active" :model="active" /></div>
          <div class="cx__chips">
            <span v-for="s in specs(active)" :key="s.k"><small>{{ s.k }}</small><b>{{ s.v }}</b></span>
          </div>
        </div>

        <div v-reveal="0.08" class="cx__tabs" role="group" :aria-label="t('explorer.tabsLabel')" @keydown="onKey">
          <div v-for="tab in tabs" :key="tab.key" class="cx__tab" :class="{ on: opened === tab.key, cur: active === tab.key }">
            <button :id="`cx-tab-${tab.key}`" :aria-expanded="opened === tab.key" :aria-controls="`cx-panel-${tab.key}`" @click="toggle(tab.key)">
              <span class="cx__ic"><AppIcon :name="tab.icon" :size="22" /></span>
              <span class="cx__name">{{ t(`explorer.tabs.${tab.key}.tab`) }}</span>
              <AppIcon name="chevronDown" :size="18" :stroke="2" class="cx__chev" />
            </button>
            <div :id="`cx-panel-${tab.key}`" class="cx__panel" role="region" :aria-labelledby="`cx-tab-${tab.key}`" :inert="opened !== tab.key">
              <div>
                <h3>{{ t(`explorer.tabs.${tab.key}.title`) }}</h3>
                <p>{{ t(`explorer.tabs.${tab.key}.desc`) }}</p>
                <a href="#quote" class="btn btn--blue btn--sm" @click.prevent="quote(tab)">{{ t('explorer.cta') }} <AppIcon name="arrow" :size="16" :stroke="2" /></a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.cx__grid { display: grid; grid-template-columns: minmax(0, 1.25fr) minmax(0, 0.9fr); gap: 16px; align-items: stretch; }
.cx__stage {
  --stage: radial-gradient(ellipse 65% 60% at 50% 42%, #1c3260 0%, #0a1220 78%);
  position: relative; border-radius: var(--radius); overflow: hidden; background: var(--stage); border: 1px solid var(--line); min-height: clamp(380px, 46vw, 600px);
}
[data-theme='light'] .cx__stage { --stage: radial-gradient(ellipse 65% 60% at 50% 42%, #ffffff 0%, #eef0f6 55%, #e2e6ef 100%); }
.cx__scene { position: absolute; inset: 14px 14px 76px; }
.cx__chips { position: absolute; left: 16px; right: 16px; bottom: 16px; display: flex; flex-wrap: wrap; gap: 8px; z-index: 1; pointer-events: none; }
.cx__chips span { display: grid; gap: 1px; padding: 9px 14px; border-radius: 14px; background: var(--glass); border: 1px solid var(--glass-border); backdrop-filter: blur(12px); color: var(--fg); animation: chipIn 0.6s var(--ease) both; }
.cx__chips small { font-size: 11px; color: var(--mute); letter-spacing: 0.02em; }
.cx__chips b { font-family: var(--font-display); font-weight: 600; font-size: 15px; letter-spacing: -0.01em; }
@keyframes chipIn { from { opacity: 0; transform: translateY(8px); } }

.cx__tabs { display: grid; gap: 10px; align-content: start; }
.cx__tab { border-radius: var(--radius-sm); background: var(--card); border: 1px solid var(--line); overflow: hidden; transition: border-color 0.4s, box-shadow 0.5s var(--ease), background 0.4s; }
.cx__tab.on { border-color: rgb(207 170 99 / 0.55); box-shadow: 0 0 0 4px rgb(207 170 99 / 0.1); }
.cx__tab > button { width: 100%; display: flex; align-items: center; gap: 14px; padding: 16px 18px; text-align: left; }
.cx__ic { width: 44px; height: 44px; border-radius: 13px; display: grid; place-items: center; flex: none; color: var(--accent-text); background: var(--accent-soft); transition: background 0.4s, color 0.4s, transform 0.5s var(--ease); }
.cx__tab.on .cx__ic { background: var(--blue); color: var(--on-accent); transform: rotate(-6deg) scale(1.05); }
.cx__name { flex: 1; font-family: var(--font-display); font-weight: 600; font-size: 18px; letter-spacing: var(--ls-display); }
.cx__chev { color: var(--mute); transition: transform 0.5s var(--ease); flex: none; }
.cx__tab.on .cx__chev { transform: rotate(180deg); color: var(--fg); }
.cx__panel { display: grid; grid-template-rows: 0fr; transition: grid-template-rows 0.55s var(--ease); }
.cx__tab.on .cx__panel { grid-template-rows: 1fr; }
.cx__panel > div { overflow: hidden; display: grid; gap: 12px; justify-items: start; padding: 0 20px; }
.cx__tab.on .cx__panel > div { padding-bottom: 20px; }
.cx__panel h3 { font-family: var(--font-display); font-weight: 600; font-size: 20px; letter-spacing: var(--ls-display); line-height: 1.2; padding-top: 2px; }
.cx__panel p { font-size: 15px; line-height: 1.55; color: var(--mute); }

@media (max-width: 1000px) {
  .cx__grid { grid-template-columns: 1fr; }
  .cx__stage { min-height: clamp(340px, 88vw, 520px); }
}
@media (max-width: 520px) { .cx__chips { left: 10px; right: 10px; bottom: 10px; } .cx__chips span { padding: 7px 11px; } .cx__scene { inset: 8px 8px 96px; } }
</style>

