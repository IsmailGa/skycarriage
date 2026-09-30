<script setup lang="ts">
import { services, type Service } from '~/data/services'

const { t } = useI18n()
const title = useMsgList('services.title')
const cargo = useState<string>('cargoType', () => 'general')

function spotlight(e: PointerEvent) {
  const card = (e.target as HTMLElement).closest<HTMLElement>('.svc')
  if (!card) return
  const r = card.getBoundingClientRect()
  card.style.setProperty('--mx', `${e.clientX - r.left}px`)
  card.style.setProperty('--my', `${e.clientY - r.top}px`)
}
function pick(s: Service) {
  cargo.value = s.cargo
  scrollToId('quote')
}
</script>

<template>
  <section id="services" class="section section--light" aria-labelledby="services-title">
    <div class="container">
      <div class="sec-head">
        <div class="sec-head__l">
          <p v-reveal class="eyebrow">{{ t('services.eyebrow') }}</p>
          <h2 id="services-title" v-reveal="0.08" class="h2"><BrLines :lines="title" /></h2>
        </div>
        <div v-reveal="0.16" class="sec-head__r">
          <p class="lead">{{ t('services.lead') }}</p>
          <a href="#quote" class="btn btn--outline btn--sm" @click.prevent="scrollToId('quote')">{{ t('services.cta') }} <AppIcon name="arrow" :size="16" :stroke="2" /></a>
        </div>
      </div>

      <ul class="bento" @pointermove="spotlight">
        <li v-for="(s, i) in services" :key="s.key" v-reveal="(i % 3) * 0.08" class="svc" :class="[`svc--${s.theme}`, { 'svc--wide': s.wide }]">
          <article>
            <div class="svc__top">
              <span class="svc__icon"><AppIcon :name="s.icon" :size="26" /></span>
              <span v-if="s.hasTag" class="svc__tag">{{ t(`services.items.${s.key}.tag`) }}</span>
            </div>
            <div class="svc__bot">
              <div class="svc__txt">
                <h3>{{ t(`services.items.${s.key}.title`) }}</h3>
                <p>{{ t(`services.items.${s.key}.desc`) }}</p>
              </div>
              <div v-if="s.hasStat" class="svc__stat"><strong class="num">{{ t(`services.items.${s.key}.stat`) }}</strong><span>{{ t(`services.items.${s.key}.statLabel`) }}</span></div>
            </div>
            <button class="svc__go" :class="{ 'svc__go--low': s.hasTag }" :aria-label="t('services.request', { name: t(`services.items.${s.key}.title`) })" @click="pick(s)"><AppIcon name="arrowUpRight" :size="20" :stroke="2" /></button>
          </article>
        </li>
      </ul>
    </div>
  </section>
</template>

<style scoped>
.sec-head__r { display: grid; gap: 24px; justify-items: start; }
.bento { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
.svc { grid-column: span 1; }
.svc--wide { grid-column: span 2; }
.svc article {
  position: relative; height: 100%; min-height: 360px; padding: 36px; border-radius: var(--radius); overflow: hidden;
  display: flex; flex-direction: column; justify-content: space-between; gap: 48px; isolation: isolate; border: 1px solid transparent;
  transition: transform 0.6s var(--ease), box-shadow 0.6s var(--ease), border-color 0.4s;
}
.svc article:hover { transform: translateY(-6px); box-shadow: var(--shadow-card); }
.svc article::before { /* cursor spotlight */
  content: ''; position: absolute; inset: 0; z-index: -1; opacity: 0; transition: opacity 0.4s;
  background: radial-gradient(420px circle at var(--mx, 50%) var(--my, 50%), rgb(79 123 255 / 0.16), transparent 60%);
}
.svc article:hover::before { opacity: 1; }
.svc--light article { background: var(--card); border-color: var(--line); }
.svc--dark article { background: #07080b; color: #fff; border-color: rgb(255 255 255 / 0.08); }
.svc--dark article::after { content: ''; position: absolute; z-index: -2; right: -120px; top: -200px; width: 520px; height: 520px; border-radius: 50%; background: var(--blue); opacity: 0.45; filter: blur(110px); }
.svc--blue article { background: linear-gradient(115deg, #3e66f5, #7c9dff); color: #fff; }
.svc--dark article::before, .svc--blue article::before { background: radial-gradient(420px circle at var(--mx, 50%) var(--my, 50%), rgb(255 255 255 / 0.16), transparent 60%); }

.svc__top { display: flex; justify-content: space-between; align-items: center; }
.svc__icon { width: 56px; height: 56px; border-radius: 16px; display: grid; place-items: center; color: var(--accent-text); background: var(--accent-soft); transition: transform 0.5s var(--ease); }
.svc article:hover .svc__icon { transform: scale(1.08) rotate(-6deg); }
.svc--dark .svc__icon, .svc--blue .svc__icon { color: #fff; background: rgb(255 255 255 / 0.12); }
.svc__tag { padding: 6px 12px; border-radius: 999px; font-size: 13px; font-weight: 600; background: rgb(255 255 255 / 0.12); }
.svc__bot { display: flex; justify-content: space-between; align-items: flex-end; gap: 24px; }
.svc h3 { font-family: var(--font-display); font-weight: 600; font-size: 28px; letter-spacing: var(--ls-display); margin-bottom: 12px; line-height: 1.1; }
.svc p { font-size: 16px; line-height: 1.5; color: var(--mute); max-width: 400px; }
.svc--dark p, .svc--blue p { color: rgb(255 255 255 / 0.74); }
.svc__stat { display: grid; justify-items: end; text-align: right; flex: none; }
.svc__stat strong { font-family: var(--font-display); font-weight: 600; font-size: clamp(40px, 5vw, 68px); letter-spacing: -0.05em; line-height: 1; white-space: nowrap; }
.svc__stat span { font-size: 14px; opacity: 0.7; max-width: 170px; }
.svc__go { position: absolute; top: 36px; right: 36px; width: 44px; height: 44px; border-radius: 50%; display: grid; place-items: center; opacity: 0; transform: scale(0.7) rotate(-45deg); transition: all 0.5s var(--ease); background: var(--fg); color: var(--bg); }
.svc--dark .svc__go, .svc--blue .svc__go { background: #fff; color: #0a0b0d; }
.svc__go--low { top: 96px; }
.svc article:hover .svc__go, .svc__go:focus-visible { opacity: 1; transform: none; }
@media (hover: none) { .svc__go { opacity: 1; transform: none; } }

@media (max-width: 1000px) {
  .bento { grid-template-columns: repeat(2, 1fr); }
  .svc--wide { grid-column: span 2; }
}
@media (max-width: 640px) {
  .bento { grid-template-columns: 1fr; }
  .svc, .svc--wide { grid-column: span 1; }
  .svc article { padding: 28px; min-height: 320px; }
  .svc__bot { flex-direction: column; align-items: flex-start; }
  .svc__stat { justify-items: start; text-align: left; }
  .svc__go { top: 28px; right: 28px; }
  .svc__go--low { top: 88px; }
}
</style>
