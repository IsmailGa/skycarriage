<script setup lang="ts">
import { services, type Service } from '~/data/services'

const { t } = useI18n()
const title = useMsgList('services.title')
const { openQuote } = useQuote()

function pick(s: Service) {
  openQuote({ cargo: s.cargo })
}
</script>

<template>
  <section id="services" class="section section--light" aria-labelledby="services-title">
    <div class="container">
      <div class="sec-head">
        <div class="sec-head__l">
          <h2 id="services-title" v-reveal="0.08" class="h2"><BrLines :lines="title" /></h2>
        </div>
        <div v-reveal="0.16" class="sec-head__r">
          <p class="lead">{{ t('services.lead') }}</p>
          <a href="#quote" class="btn btn--outline btn--sm" @click.prevent="openQuote()">{{ t('services.cta') }} <AppIcon name="arrow" :size="16" :stroke="2" /></a>
        </div>
      </div>

      <ul class="bento">
        <li v-for="(s, i) in services" :key="s.key" v-reveal="(i % 3) * 0.08" class="svc" :class="s.span ? `svc--span${s.span}` : ''">
          <article @click="pick(s)">
            <picture class="svc__img">
              <source type="image/webp" :srcset="`/media/${s.image}.webp`" />
              <img :src="`/media/${s.image}.jpg`" :style="{ objectPosition: s.focus }" alt="" width="1200" height="680" loading="lazy" decoding="async" />
            </picture>
            <div class="svc__shade" aria-hidden="true" />

            <div class="svc__top">
              <span class="svc__icon"><AppIcon :name="s.icon" :size="24" /></span>
              <span v-if="s.hasTag" class="svc__tag">{{ t(`services.items.${s.key}.tag`) }}</span>
            </div>

            <div class="svc__bot">
              <div class="svc__txt">
                <h3>{{ t(`services.items.${s.key}.title`) }}</h3>
                <p>{{ t(`services.items.${s.key}.desc`) }}</p>
              </div>
              <div v-if="s.hasStat" class="svc__stat"><strong class="num">{{ t(`services.items.${s.key}.stat`) }}</strong><span>{{ t(`services.items.${s.key}.statLabel`) }}</span></div>
              <button class="svc__go" :aria-label="t('services.request', { name: t(`services.items.${s.key}.title`) })" @click.stop="pick(s)"><AppIcon name="arrowUpRight" :size="20" :stroke="2" /></button>
            </div>
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
.svc--span2 { grid-column: span 2; }
.svc--span3 { grid-column: span 3; }

/* photo cards: image, navy gradient for legibility, text on top (same in both themes) */
.svc article {
  position: relative; height: 100%; min-height: 380px; padding: 28px; border-radius: var(--radius); overflow: hidden; isolation: isolate;
  display: flex; flex-direction: column; justify-content: space-between; gap: 40px; color: #fff; cursor: pointer;
  border: 1px solid rgb(255 255 255 / 0.08); background: #0d1a33;
  transition: transform 0.6s var(--ease), box-shadow 0.6s var(--ease), border-color 0.4s;
}
.svc--span3 article { min-height: 320px; }
.svc article:hover { transform: translateY(-6px); box-shadow: var(--shadow-card); border-color: rgb(207 170 99 / 0.5); }
.svc__img { position: absolute; inset: 0; z-index: -2; }
.svc__img img { width: 100%; height: 100%; object-fit: cover; transform: scale(1.04); transition: transform 1.2s var(--ease); filter: saturate(0.85) contrast(1.05); }
.svc article:hover .svc__img img { transform: scale(1.12); }
.svc__shade { position: absolute; inset: 0; z-index: -1; background: linear-gradient(180deg, rgb(8 15 29 / 0.35) 0%, rgb(8 15 29 / 0.5) 38%, rgb(8 15 29 / 0.92) 100%), linear-gradient(90deg, rgb(8 15 29 / 0.45), transparent 70%); }

.svc__top { display: flex; justify-content: space-between; align-items: center; }
.svc__icon { width: 52px; height: 52px; border-radius: 15px; display: grid; place-items: center; color: var(--blue-2); background: rgb(10 18 32 / 0.55); border: 1px solid rgb(255 255 255 / 0.16); backdrop-filter: blur(10px); transition: transform 0.5s var(--ease), background 0.3s, color 0.3s; }
.svc article:hover .svc__icon { transform: scale(1.06) rotate(-6deg); background: var(--blue); color: var(--on-accent); }
.svc__tag { padding: 7px 13px; border-radius: 999px; font-size: 12.5px; font-weight: 600; letter-spacing: 0.04em; color: var(--on-accent); background: var(--gold-grad); }

.svc__bot { display: flex; justify-content: space-between; align-items: flex-end; gap: 20px; }
.svc__txt { min-width: 0; }
.svc h3 { font-family: var(--font-display); font-weight: 600; font-size: 26px; letter-spacing: var(--ls-display); margin-bottom: 10px; line-height: 1.12; }
.svc p { font-size: 15px; line-height: 1.5; color: rgb(255 255 255 / 0.78); max-width: 420px; }
.svc__stat { display: grid; justify-items: end; text-align: right; flex: none; margin-left: auto; }
.svc__stat strong { font-family: var(--font-display); font-weight: 600; font-size: clamp(40px, 5vw, 64px); letter-spacing: -0.05em; line-height: 1; white-space: nowrap; background: var(--gold-grad); -webkit-background-clip: text; background-clip: text; color: transparent; }
.svc__stat span { font-size: 14px; color: rgb(255 255 255 / 0.7); max-width: 170px; }
.svc__go { flex: none; width: 46px; height: 46px; border-radius: 50%; display: grid; place-items: center; color: #fff; border: 1px solid rgb(255 255 255 / 0.4); background: rgb(10 18 32 / 0.35); backdrop-filter: blur(8px); transition: background 0.3s, color 0.3s, border-color 0.3s, transform 0.5s var(--ease); }
.svc article:hover .svc__go, .svc__go:hover { background: var(--blue); color: var(--on-accent); border-color: transparent; transform: rotate(45deg); }

@media (max-width: 1000px) {
  .bento { grid-template-columns: repeat(2, 1fr); }
  .svc--span2, .svc--span3 { grid-column: span 2; }
}
@media (max-width: 640px) {
  .bento { grid-template-columns: 1fr; }
  .svc, .svc--span2, .svc--span3 { grid-column: span 1; }
  .svc article { padding: 22px; min-height: 340px; }
  .svc__bot { flex-wrap: wrap; }
  .svc__stat { justify-items: start; text-align: left; margin-left: 0; order: 3; }
}
</style>
