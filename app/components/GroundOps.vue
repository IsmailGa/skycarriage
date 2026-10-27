<script setup lang="ts">
import gsap from 'gsap'

const { t } = useI18n()
const title = useMsgList('ground.title')
const points = useMsgList('ground.points', ['t', 'd'] as const)
const icons = ['scale', 'eye', 'clock'] as const

const root = ref<HTMLElement>()
let ctx: gsap.Context | undefined
onMounted(() => {
  if (prefersReducedMotion()) return
  ctx = gsap.context(() => {
    gsap.utils.toArray<HTMLElement>('.go__img').forEach((img) => {
      const speed = Number(img.dataset.speed || 10)
      gsap.fromTo(img, { yPercent: -speed }, {
        yPercent: speed, ease: 'none',
        scrollTrigger: { trigger: img.parentElement!, start: 'top bottom', end: 'bottom top', scrub: true },
      })
    })
  }, root.value)
})
onBeforeUnmount(() => ctx?.revert())
</script>

<template>
  <section id="operations" ref="root" class="section section--light go" aria-labelledby="go-title">
    <div class="container go__grid">
      <div class="go__copy">
        <h2 id="go-title" v-reveal="0.08" class="h2"><BrLines :lines="title" /></h2>
        <p v-reveal="0.16" class="lead">{{ t('ground.lead') }}</p>
        <ul class="go__list">
          <li v-for="(p, i) in points" :key="i" v-reveal="0.2 + i * 0.08">
            <span class="go__ic"><AppIcon :name="icons[i] ?? 'check'" :size="22" /></span>
            <div><h3>{{ p.t }}</h3><p>{{ p.d }}</p></div>
          </li>
        </ul>
      </div>

      <div class="go__photos">
        <figure v-reveal class="go__ph go__ph--a">
          <picture>
            <source type="image/webp" srcset="/media/apron-bw-640.webp 640w, /media/apron-bw-1200.webp 1200w" sizes="(max-width: 900px) 70vw, 380px" />
            <img class="go__img" data-speed="9" src="/media/apron-bw-640.jpg" srcset="/media/apron-bw-640.jpg 640w, /media/apron-bw-1200.jpg 1200w" sizes="(max-width: 900px) 70vw, 380px" width="640" height="960" loading="lazy" decoding="async" :alt="t('ground.altA')" />
          </picture>
          <figcaption><AppIcon name="box" :size="16" /> {{ t('ground.capA') }}</figcaption>
        </figure>
        <figure v-reveal="0.12" class="go__ph go__ph--b">
          <picture>
            <source type="image/webp" srcset="/media/apron-color-640.webp 640w, /media/apron-color-1200.webp 1200w" sizes="(max-width: 900px) 70vw, 380px" />
            <img class="go__img" data-speed="12" src="/media/apron-color-640.jpg" srcset="/media/apron-color-640.jpg 640w, /media/apron-color-1200.jpg 1200w" sizes="(max-width: 900px) 70vw, 380px" width="640" height="960" loading="lazy" decoding="async" :alt="t('ground.altB')" />
          </picture>
          <figcaption><AppIcon name="plane" :size="16" /> {{ t('ground.capB') }}</figcaption>
        </figure>
        <div class="go__badge" aria-hidden="true"><strong class="num"><AnimatedNumber :to="6" /></strong><span>{{ t('ground.badge') }}</span></div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.go { overflow: hidden; }
.go__grid { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: clamp(40px, 6vw, 96px); align-items: center; }
.go__copy { display: grid; gap: 24px; justify-items: start; }
.go__list { display: grid; gap: 28px; margin-top: 16px; }
.go__list li { display: flex; gap: 18px; align-items: flex-start; }
.go__ic { flex: none; width: 48px; height: 48px; border-radius: 14px; display: grid; place-items: center; color: var(--accent-text); background: var(--card); border: 1px solid var(--line); }
.go__list h3 { font-family: var(--font-display); font-weight: 600; font-size: 20px; letter-spacing: var(--ls-display); margin-bottom: 4px; }
.go__list p { color: var(--mute); font-size: 15px; line-height: 1.55; max-width: 440px; }

.go__photos { position: relative; display: grid; grid-template-columns: 1fr 1fr; gap: 16px; align-items: start; }
.go__ph { position: relative; aspect-ratio: 2 / 3; border-radius: var(--radius); overflow: hidden; background: var(--card); }
.go__ph--a { margin-top: 56px; }
.go__ph--b { margin-top: -24px; }
.go__img { position: absolute; left: 0; top: -12%; width: 100%; height: 124%; object-fit: cover; will-change: transform; }
.go__ph figcaption { position: absolute; left: 14px; right: 14px; bottom: 14px; width: fit-content; max-width: calc(100% - 28px); display: inline-flex; align-items: center; gap: 8px; padding: 9px 14px; border-radius: 999px; font-size: 13px; font-weight: 600; color: #fff; background: rgb(10 14 26 / 0.55); backdrop-filter: blur(12px); border: 1px solid rgb(255 255 255 / 0.18); }
.go__ph figcaption svg { flex: none; }
.go__badge { position: absolute; left: 50%; top: 40px; transform: translateX(-50%); display: grid; justify-items: center; padding: 14px 22px; border-radius: 20px; background: var(--surface); border: 1px solid var(--line); box-shadow: var(--shadow-card); z-index: 2; animation: bob 7s ease-in-out infinite; }
.go__badge strong { font-family: var(--font-display); font-weight: 600; font-size: 34px; letter-spacing: -0.05em; line-height: 1.1; }
.go__badge span { font-size: 12px; color: var(--mute); text-align: center; }
@keyframes bob { 50% { transform: translate(-50%, -8px); } }

@media (max-width: 900px) {
  .go__grid { grid-template-columns: 1fr; }
  .go__photos { max-width: 560px; margin-inline: auto; width: 100%; }
}
@media (max-width: 480px) { .go__ph--a { margin-top: 32px; } .go__badge { padding: 10px 16px; } .go__badge strong { font-size: 26px; } }
</style>
