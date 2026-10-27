<script setup lang="ts">
import gsap from 'gsap'

const { t } = useI18n()
const words = computed(() => t('band.text').split(' '))
const chips = useMsgList('band.chips')
const chipIcons = ['scale', 'eye', 'shield'] as const

const root = ref<HTMLElement>()
const frame = ref<HTMLElement>()
const video = ref<HTMLVideoElement>()
let ctx: gsap.Context | undefined
usePlayInView(video)

onMounted(() => {
  if (prefersReducedMotion()) return
  ctx = gsap.context(() => {
    gsap.fromTo('.cb__w', { opacity: 0.16 }, {
      opacity: 1, stagger: 0.12, ease: 'none',
      scrollTrigger: { trigger: '.cb__text', start: 'top 82%', end: 'bottom 48%', scrub: true },
    })
    // the video frame opens up to full-bleed as you scroll
    gsap.fromTo(frame.value!, { clipPath: 'inset(0% 14% round 40px)' }, {
      clipPath: 'inset(0% 0% round 0px)', ease: 'none',
      scrollTrigger: { trigger: frame.value!, start: 'top 92%', end: 'top 15%', scrub: true },
    })
    gsap.fromTo('.cb__video', { scale: 1.25 }, {
      scale: 1, ease: 'none',
      scrollTrigger: { trigger: frame.value!, start: 'top 92%', end: 'bottom 30%', scrub: true },
    })
    gsap.from('.cb__chip', {
      y: 40, opacity: 0, stagger: 0.12, duration: 0.9, ease: 'power3.out',
      scrollTrigger: { trigger: frame.value!, start: 'top 35%', once: true },
    })
  }, root.value)
})
onBeforeUnmount(() => ctx?.revert())
</script>

<template>
  <section ref="root" class="cb" aria-label="Independence">
    <div class="container">
      <p class="cb__text">
        <template v-for="(w, i) in words" :key="i"><span class="cb__w">{{ w }}</span>{{ ' ' }}</template>
      </p>
    </div>

    <div ref="frame" class="cb__frame">
      <video ref="video" class="cb__video" muted loop playsinline preload="metadata" poster="/media/hero-poster.jpg" aria-hidden="true" tabindex="-1">
        <source src="/media/hero.webm" type="video/webm" />
        <source src="/media/hero.mp4" type="video/mp4" />
      </video>
      <div class="cb__shade" />
      <ul class="cb__chips">
        <li v-for="(c, i) in chips" :key="i" class="cb__chip"><AppIcon :name="chipIcons[i] ?? 'check'" :size="18" /> {{ c }}</li>
      </ul>
    </div>
  </section>
</template>

<style scoped>
.cb { background: var(--bg-alt); color: var(--fg); padding-top: clamp(80px, 11vw, 160px); position: relative; }
.cb .container { display: grid; gap: 32px; }
.cb__text { font-family: var(--font-display); font-weight: 600; font-size: clamp(30px, 5.2vw, 76px); line-height: 1.06; letter-spacing: var(--ls-display); max-width: 1100px; padding-bottom: clamp(56px, 8vw, 112px); text-wrap: balance; }
.cb__w { display: inline; }
.cb__frame { position: relative; height: clamp(380px, 62vw, 780px); overflow: hidden; clip-path: inset(0% 14% round 40px); background: #0d1a33; }
.cb__video { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; object-position: 35% 40%; will-change: transform; }
.cb__shade { position: absolute; inset: 0; background: linear-gradient(180deg, rgb(7 8 11 / 0.15), rgb(7 8 11 / 0.05) 40%, rgb(7 8 11 / 0.72)); }
.cb__chips { position: absolute; left: var(--gutter); right: var(--gutter); bottom: clamp(20px, 4vw, 48px); display: flex; flex-wrap: wrap; gap: 12px; }
.cb__chip { display: inline-flex; align-items: center; gap: 10px; padding: 12px 18px; border-radius: 999px; font-weight: 500; font-size: 15px; color: #fff; background: rgb(10 14 26 / 0.55); border: 1px solid rgb(255 255 255 / 0.18); backdrop-filter: blur(14px); }
.cb__chip svg { color: var(--blue-2); flex: none; }
@media (max-width: 640px) { .cb__chip { font-size: 13px; padding: 10px 14px; } .cb__frame { clip-path: inset(0% 6% round 28px); } }
</style>
