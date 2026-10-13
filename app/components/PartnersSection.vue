<script setup lang="ts">
import { partnerIcons, partners } from '~/data/partners'

const { t } = useI18n()
const title = useMsgList('partners.title')
const items = useMsgList('partners.items', ['t', 'd'] as const)

function glow(e: PointerEvent) {
  const el = e.currentTarget as HTMLElement
  const r = el.getBoundingClientRect()
  el.style.setProperty('--mx', `${e.clientX - r.left}px`)
  el.style.setProperty('--my', `${e.clientY - r.top}px`)
}
</script>

<template>
  <section id="partners" class="section section--white" aria-labelledby="pt-title">
    <div class="container">
      <div class="sec-head">
        <div class="sec-head__l">
          <p v-reveal class="eyebrow">{{ t('partners.eyebrow') }}</p>
          <h2 id="pt-title" v-reveal="0.08" class="h2"><BrLines :lines="title" /></h2>
        </div>
        <p v-reveal="0.16" class="lead">{{ t('partners.lead') }}</p>
      </div>

      <ul class="pt__grid">
        <li v-for="(p, i) in items" :key="i" v-reveal="i * 0.08" class="pt__card" @pointermove="glow">
          <span class="pt__ic"><AppIcon :name="partnerIcons[i] ?? 'check'" :size="26" /></span>
          <span class="pt__n num">0{{ i + 1 }}</span>
          <h3>{{ p.t }}</h3>
          <p>{{ p.d }}</p>
        </li>
      </ul>

      <ul v-if="partners.length" v-reveal class="pt__logos" :aria-label="t('partners.logos')">
        <li v-for="p in partners" :key="p.name">
          <component :is="p.url ? 'a' : 'span'" :href="p.url" :target="p.url ? '_blank' : undefined" :rel="p.url ? 'noopener' : undefined">
            <img :src="p.logo" :alt="p.name" loading="lazy" decoding="async" height="36" />
          </component>
        </li>
      </ul>
    </div>
  </section>
</template>

<style scoped>
.pt__grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
.pt__card { position: relative; display: grid; gap: 12px; align-content: start; padding: 32px; min-height: 300px; border-radius: var(--radius); background: var(--card); border: 1px solid var(--line); overflow: hidden; transition: transform 0.6s var(--ease), box-shadow 0.6s var(--ease), border-color 0.4s; }
.pt__card::before { content: ''; position: absolute; inset: 0; opacity: 0; transition: opacity 0.4s; background: radial-gradient(360px circle at var(--mx, 50%) var(--my, 0%), rgb(207 170 99 / 0.16), transparent 65%); pointer-events: none; }
.pt__card:hover { transform: translateY(-6px); box-shadow: var(--shadow-card); border-color: rgb(207 170 99 / 0.4); }
.pt__card:hover::before { opacity: 1; }
.pt__ic { position: relative; width: 56px; height: 56px; border-radius: 16px; display: grid; place-items: center; color: var(--accent-text); background: var(--accent-soft); margin-bottom: 28px; }
.pt__n { position: absolute; top: 32px; right: 32px; font-family: var(--font-display); font-size: 14px; font-weight: 600; letter-spacing: 0.08em; color: var(--mute); opacity: 0.6; }
.pt__card h3 { position: relative; font-family: var(--font-display); font-weight: 600; font-size: 24px; letter-spacing: var(--ls-display); line-height: 1.15; }
.pt__card p { position: relative; font-size: 15px; line-height: 1.55; color: var(--mute); }

.pt__logos { display: flex; flex-wrap: wrap; align-items: center; justify-content: center; gap: 20px 56px; margin-top: 48px; padding-top: 40px; border-top: 1px solid var(--line); }
.pt__logos img { height: 36px; width: auto; opacity: 0.7; filter: grayscale(1); transition: opacity 0.3s, filter 0.3s; }
.pt__logos li:hover img { opacity: 1; filter: none; }

@media (max-width: 1100px) { .pt__grid { grid-template-columns: repeat(2, 1fr); } .pt__card { min-height: 0; } }
@media (max-width: 560px) { .pt__grid { grid-template-columns: 1fr; } .pt__card { padding: 26px; } .pt__n { top: 26px; right: 26px; } }
</style>
