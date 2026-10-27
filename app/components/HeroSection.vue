<script setup lang="ts">
import gsap from 'gsap'
import { site } from '~/data/site'

const { t } = useI18n()
const { openQuote } = useQuote()
const h1 = useMsgList('hero.h1')
const features = useMsgList('hero.features', ['t', 'd'] as const)
const featureIcons = ['plane', 'door', 'file', 'shield'] as const
const root = ref<HTMLElement>()
const media = ref<HTMLElement>()
let ctx: gsap.Context | undefined

onMounted(() => {
  if (prefersReducedMotion()) return
  ctx = gsap.context(() => {
    // the photo drifts and slowly pushes in as the hero scrolls away
    gsap.to(media.value!, {
      yPercent: 12, scale: 1.1, ease: 'none',
      scrollTrigger: { trigger: root.value!, start: 'top top', end: 'bottom top', scrub: true },
    })
    gsap.to('.hero__copy', {
      yPercent: -10, opacity: 0.15, ease: 'none',
      scrollTrigger: { trigger: root.value!, start: '45% top', end: 'bottom top', scrub: true },
    })
  }, root.value)
})
onBeforeUnmount(() => ctx?.revert())
</script>

<template>
  <section id="top" ref="root" class="hero" aria-labelledby="hero-title">
    <div class="hero__stage">
      <div ref="media" class="hero__media" aria-hidden="true">
        <picture>
          <source type="image/webp" srcset="/media/hero.webp" />
          <img src="/media/hero.jpg" alt="" width="2200" height="1243" fetchpriority="high" />
        </picture>
        <div class="hero__shade" />
      </div>

      <div class="container hero__in">
        <div class="hero__copy">
          <h1 id="hero-title" class="hero__h1">
            <span v-for="(line, i) in h1" :key="i" class="ln"><span :style="{ '--d': `${0.15 + i * 0.12}s` }" :class="{ 'gradient-text': i === 1 }">{{ line }}</span></span>
          </h1>
          <p class="hero__lead rise" style="--d: 0.6s">{{ t('hero.lead') }}</p>
          <div class="hero__cta rise" style="--d: 0.72s">
            <a href="#quote" class="btn btn--blue" @click.prevent="openQuote()">{{ t('nav.quote') }} <AppIcon name="arrow" :size="18" :stroke="2" /></a>
            <a :href="`tel:${site.phoneHref}`" class="btn btn--ghost"><AppIcon name="phone" :size="18" :stroke="2" /> {{ site.phone }}</a>
          </div>
        </div>

        <div class="hero__visual rise" style="--d: 0.5s"><HeroCalc /></div>
      </div>
    </div>

    <div class="container">
      <ul class="feat">
        <li v-for="(f, i) in features" :key="i">
          <span class="feat__ic"><AppIcon :name="featureIcons[i] ?? 'check'" :size="26" :stroke="1.6" /></span>
          <span><strong>{{ f.t }}</strong><small>{{ f.d }}</small></span>
        </li>
      </ul>
    </div>
  </section>
</template>

<style scoped>
.hero { position: relative; background: var(--bg); color: var(--fg); }
/* the photo area is dark in both themes, so its text is always light */
.hero__stage { --fg: #f5f6f8; --fg-2: rgb(245 246 248 / 0.84); --mute: #b4bfd2; --chip: rgb(255 255 255 / 0.08); --chip-2: rgb(255 255 255 / 0.14); --line-strong: rgb(255 255 255 / 0.22); color: #fff; }
.hero__stage { position: relative; overflow: hidden; isolation: isolate; padding: calc(var(--header-h) + clamp(32px, 6vw, 80px)) 0 clamp(56px, 7vw, 96px); display: flex; align-items: center; }
.hero__media { position: absolute; inset: -2% 0 0; z-index: -1; will-change: transform; }
.hero__media img { width: 100%; height: 100%; object-fit: cover; object-position: 50% 45%; filter: saturate(1) brightness(1) contrast(1.05); }
.hero__shade { position: absolute; inset: 0; background: linear-gradient(180deg, rgb(8 15 29 / 0.55) 0%, rgb(8 15 29 / 0) 28%, rgb(8 15 29 / 0.25) 70%, rgb(8 15 29 / 0.7) 100%), linear-gradient(95deg, rgb(8 15 29 / 0.9) 0%, rgb(10 20 40 / 0.62) 34%, rgb(10 20 40 / 0.12) 72%, rgb(10 20 40 / 0) 100%); }
.hero__in { position: relative; width: min(1280px, 100% - 2 * var(--gutter)); margin-inline: auto; display: grid; grid-template-columns: minmax(0, 1.1fr) minmax(0, 0.9fr); align-items: center; gap: clamp(32px, 4vw, 64px); }
.hero__copy { display: grid; gap: 28px; justify-items: start; max-width: 680px; }
.hero__eyebrow { display: inline-flex; align-items: center; gap: 14px; font-size: 13px; font-weight: 600; letter-spacing: 0.28em; text-transform: uppercase; color: var(--fg-2); }
.hero__eyebrow i { width: 36px; height: 1px; background: var(--blue); }
.hero__h1 { font-family: var(--font-display); font-weight: 600; font-size: clamp(38px, 5.6vw, 82px); line-height: 1.02; letter-spacing: var(--ls-display); text-transform: uppercase; }
.ln { display: block; overflow: hidden; padding-bottom: 0.1em; margin-bottom: -0.1em; }
.ln > span { display: inline-block; animation: lineUp 1.1s var(--ease) both; animation-delay: var(--d); }
.hero__lead { max-width: 520px; font-size: clamp(16px, 1.4vw, 19px); line-height: 1.55; color: var(--fg-2); }
.hero__cta { display: flex; flex-wrap: wrap; gap: 12px; }

/* feature strip under the bar */
.feat { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px 32px; padding: 44px 0 8px; }
.feat li { display: flex; align-items: flex-start; gap: 14px; }
.feat__ic { flex: none; width: 48px; height: 48px; border-radius: 14px; display: grid; place-items: center; color: var(--accent-text); background: var(--accent-soft); }
.feat strong { display: block; font-size: 15px; font-weight: 600; line-height: 1.3; }
.feat small { display: block; margin-top: 3px; font-size: 13.5px; color: var(--mute); line-height: 1.45; }

.rise { animation: rise 1s var(--ease) both; animation-delay: var(--d, 0s); }
@keyframes rise { from { opacity: 0; transform: translateY(28px); } }
@keyframes lineUp { from { transform: translateY(105%); } }

@media (max-width: 1000px) {
  .hero__in { grid-template-columns: 1fr; }
  .hero__visual { max-width: 520px; }
  .feat { grid-template-columns: repeat(2, 1fr); }
  .hero__media img { object-position: 38% 45%; }
}
@media (max-width: 640px) {
  .hero__cta .btn { flex: 1 1 100%; }
  .hero__eyebrow { letter-spacing: 0.2em; font-size: 12px; }
  .feat { grid-template-columns: 1fr; padding-top: 32px; }
}
</style>
