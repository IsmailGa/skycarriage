<script setup lang="ts">
import gsap from 'gsap'

const { t } = useI18n()
const h1 = useMsgList('hero.h1')
const statLabels = useMsgList('hero.stats')
const root = ref<HTMLElement>()
const video = ref<HTMLVideoElement>()
const media = ref<HTMLElement>()
let ctx: gsap.Context | undefined
usePlayInView(video)

const nums = [
  { to: 120, suffix: '+' },
  { to: 180, suffix: '+' },
  { to: 98.6, suffix: '%', decimals: 1 },
  { text: '24/7' },
] as const

onMounted(() => {
  if (prefersReducedMotion()) return
  ctx = gsap.context(() => {
    // video drifts + dims as the hero scrolls away
    gsap.to(media.value!, {
      yPercent: 14, scale: 1.08, ease: 'none',
      scrollTrigger: { trigger: root.value!, start: 'top top', end: 'bottom top', scrub: true },
    })
    gsap.to('.hero__copy', {
      yPercent: -8, opacity: 0.2, ease: 'none',
      scrollTrigger: { trigger: root.value!, start: '55% top', end: 'bottom top', scrub: true },
    })
  }, root.value)
})
onBeforeUnmount(() => ctx?.revert())
</script>

<template>
  <section id="top" ref="root" class="hero" aria-labelledby="hero-title">
    <div ref="media" class="hero__media" aria-hidden="true">
      <video ref="video" autoplay muted loop playsinline preload="metadata" poster="/media/hero-poster.jpg" disablepictureinpicture>
        <source src="/media/hero.webm" type="video/webm" />
        <source src="/media/hero.mp4" type="video/mp4" />
      </video>
      <div class="hero__shade" />
    </div>

    <div class="container hero__grid">
      <div class="hero__copy">
        <p class="hero__badge rise" style="--d: 0.05s"><i />{{ t('hero.badge') }}</p>
        <h1 id="hero-title" class="hero__h1">
          <span v-for="(line, i) in h1" :key="i" class="ln"><span :style="{ '--d': `${0.15 + i * 0.12}s` }" :class="{ 'gradient-text': i === h1.length - 1 }">{{ line }}</span></span>
        </h1>
        <p class="hero__lead rise" style="--d: 0.6s">{{ t('hero.lead') }}</p>
        <div class="hero__cta rise" style="--d: 0.72s">
          <a href="#quote" class="btn btn--solid" @click.prevent="scrollToId('quote')">{{ t('hero.cta1') }} <AppIcon name="arrow" :size="18" :stroke="2" /></a>
          <a href="#services" class="btn btn--ghost" @click.prevent="scrollToId('services')">{{ t('hero.cta2') }}</a>
        </div>
        <div class="hero__proof rise" style="--d: 0.84s">
          <span class="avatars" aria-hidden="true"><i /><i /><i /><i /></span>
          <p><strong>{{ t('hero.proofTitle') }}</strong><span>{{ t('hero.proofSub') }}</span></p>
        </div>
      </div>

    </div>

    <div class="container">
      <ul class="stats">
        <li v-for="(n, i) in nums" :key="i">
          <strong class="num"><AnimatedNumber v-if="'to' in n" :to="n.to" :decimals="'decimals' in n ? n.decimals : 0" :suffix="n.suffix" /><template v-else>{{ n.text }}</template></strong>
          <span>{{ statLabels[i] }}</span>
        </li>
      </ul>
    </div>
  </section>
</template>

<style scoped>
.hero { position: relative; overflow: hidden; background: var(--bg); color: var(--fg); padding: calc(var(--header-h) + clamp(32px, 7vw, 88px)) 0 clamp(40px, 6vw, 72px); isolation: isolate; }
.hero__media { position: absolute; inset: -2% 0 0; z-index: -1; will-change: transform; }
.hero__media video { width: 100%; height: 100%; object-fit: cover; object-position: 62% 35%; filter: var(--hero-filter); }
.hero__shade { position: absolute; inset: 0; background: var(--hero-overlay); }
.hero__grid { display: grid; grid-template-columns: minmax(0, 1fr); align-items: center; }
.hero__copy { max-width: 720px; }
.hero__copy { display: grid; gap: 32px; justify-items: start; }
.hero__badge { display: inline-flex; align-items: center; gap: 10px; padding: 8px 16px 8px 14px; border-radius: 999px; font-size: 14px; font-weight: 500; color: var(--fg-2); background: var(--chip); border: 1px solid var(--line-strong); backdrop-filter: blur(10px); }
.hero__badge i { width: 8px; height: 8px; border-radius: 50%; background: var(--green); box-shadow: 0 0 0 4px rgb(61 220 151 / 0.2); animation: pulse 2s infinite; flex: none; }
.hero__h1 { font-family: var(--font-display); font-weight: 600; font-size: clamp(42px, 7vw, 92px); line-height: 1; letter-spacing: var(--ls-display); }
.ln { display: block; overflow: hidden; padding-bottom: 0.1em; margin-bottom: -0.1em; }
.ln > span { display: inline-block; animation: lineUp 1.1s var(--ease) both; animation-delay: var(--d); }
.hero__lead { max-width: 560px; font-size: clamp(16px, 1.45vw, 19px); line-height: 1.55; color: var(--fg-2); }
.hero__cta { display: flex; flex-wrap: wrap; gap: 12px; }
.hero__proof { display: flex; align-items: center; gap: 20px; padding-top: 8px; }
.hero__proof p { display: grid; font-size: 14px; color: var(--mute); }
.hero__proof strong { font-size: 15px; color: var(--fg); font-weight: 600; }
.avatars { display: flex; flex: none; }
.avatars i { width: 32px; height: 32px; border-radius: 50%; border: 2px solid var(--bg); margin-left: -10px; }
.avatars i:first-child { margin-left: 0; background: #4f7bff; }
.avatars i:nth-child(2) { background: #8e6cff; }
.avatars i:nth-child(3) { background: #3ddc97; }
.avatars i:nth-child(4) { background: #ffb547; }

.stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 32px; margin-top: clamp(56px, 9vw, 96px); padding-top: 40px; border-top: 1px solid var(--line-strong); }
.stats li { display: grid; gap: 8px; align-content: start; }
.stats strong { font-family: var(--font-display); font-weight: 600; font-size: clamp(36px, 4.4vw, 56px); letter-spacing: -0.05em; line-height: 1; }
.stats span { font-size: 15px; color: var(--mute); }

.rise { animation: rise 1s var(--ease) both; animation-delay: var(--d, 0s); }
@keyframes rise { from { opacity: 0; transform: translateY(28px); } }
@keyframes lineUp { from { transform: translateY(105%); } }
@keyframes pulse { 50% { opacity: 0.4; } }

@media (max-width: 1000px) {
  .stats { grid-template-columns: repeat(2, 1fr); gap: 36px 24px; }
}
@media (max-width: 560px) {
  .hero__cta .btn { flex: 1 1 100%; }
  .hero__proof { align-items: flex-start; }
}
</style>
