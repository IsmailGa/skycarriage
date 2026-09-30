<script setup lang="ts">
// PLACEHOLDER COPY (see i18n `reviews.items`) — replace with real, client-approved testimonials before launch.
const { t } = useI18n()
const title = useMsgList('reviews.title')
const reviews = useMsgList('reviews.items', ['q', 'n', 'r'] as const)
const colors = ['#4f7bff', '#8e6cff', '#1fb57a', '#ff9f43']

const track = ref<HTMLElement>()
const canPrev = ref(false)
const canNext = ref(true)
const sync = () => {
  const el = track.value
  if (!el) return
  canPrev.value = Math.abs(el.scrollLeft) > 8
  canNext.value = Math.abs(el.scrollLeft) + el.clientWidth < el.scrollWidth - 8
}
function nudge(dir: 1 | -1) {
  const el = track.value
  if (!el) return
  const card = el.querySelector<HTMLElement>('.rv')
  el.scrollBy({ left: dir * ((card?.offsetWidth ?? 360) + 16), behavior: prefersReducedMotion() ? 'auto' : 'smooth' })
}
onMounted(() => { sync(); window.addEventListener('resize', sync) })
onBeforeUnmount(() => window.removeEventListener('resize', sync))
</script>

<template>
  <section id="reviews" class="section section--white" aria-labelledby="rv-title">
    <div class="container">
      <div class="sec-head">
        <div class="sec-head__l">
          <p v-reveal class="eyebrow">{{ t('reviews.eyebrow') }}</p>
          <h2 id="rv-title" v-reveal="0.08" class="h2"><BrLines :lines="title" /></h2>
        </div>
        <div v-reveal="0.16" class="rv__ctrl">
          <div class="rv__score"><strong class="num"><AnimatedNumber :to="4.9" :decimals="1" /></strong><span><b>{{ t('reviews.ratingTitle') }}</b>{{ t('reviews.ratingSub') }}</span></div>
          <div class="rv__btns">
            <button :disabled="!canPrev" :aria-label="t('a11y.prev')" @click="nudge(-1)"><AppIcon name="chevronLeft" :size="20" :stroke="2" /></button>
            <button :disabled="!canNext" :aria-label="t('a11y.next')" @click="nudge(1)"><AppIcon name="chevronRight" :size="20" :stroke="2" /></button>
          </div>
        </div>
      </div>
    </div>

    <div ref="track" class="rv__track" tabindex="0" role="region" :aria-label="t('reviews.region')" @scroll.passive="sync">
      <figure v-for="(r, i) in reviews" :key="i" v-reveal="i * 0.08" class="rv">
        <blockquote>“{{ r.q }}”</blockquote>
        <figcaption>
          <span class="rv__av" :style="{ '--c': colors[i % colors.length] }"><AppIcon name="user" :size="20" :stroke="2" /></span>
          <span><b>{{ r.n }}</b>{{ r.r }}</span>
        </figcaption>
      </figure>
    </div>
  </section>
</template>

<style scoped>
.rv__ctrl { display: flex; align-items: center; gap: 32px; flex-wrap: wrap; }
.rv__score { display: flex; align-items: center; gap: 16px; }
.rv__score strong { font-family: var(--font-display); font-weight: 600; font-size: clamp(44px, 5vw, 64px); letter-spacing: -0.05em; line-height: 1; }
.rv__score > span { display: grid; font-size: 14px; color: var(--mute); }
.rv__score b { font-size: 16px; color: var(--fg); font-weight: 600; }
.rv__btns { display: flex; gap: 8px; }
.rv__btns button { width: 48px; height: 48px; border-radius: 50%; display: grid; place-items: center; background: var(--card); border: 1px solid var(--line-strong); transition: all 0.3s; }
.rv__btns button:hover:not(:disabled) { background: var(--fg); color: var(--bg); }
.rv__btns button:disabled { opacity: 0.35; cursor: default; }

.rv__track { display: flex; gap: 16px; overflow-x: auto; scroll-snap-type: x mandatory; padding: 4px var(--gutter) 24px; scroll-padding-inline: var(--gutter); scrollbar-width: none; }
.rv__track::-webkit-scrollbar { display: none; }
.rv { flex: 0 0 min(440px, 84vw); scroll-snap-align: start; padding: 36px; border-radius: var(--radius); background: var(--card); border: 1px solid var(--line); display: flex; flex-direction: column; justify-content: space-between; gap: 40px; min-height: 340px; transition: transform 0.6s var(--ease), box-shadow 0.6s var(--ease); }
.rv:hover { transform: translateY(-6px); box-shadow: var(--shadow-card); }
.rv blockquote { font-family: var(--font-display); font-weight: 500; font-size: clamp(18px, 1.6vw, 21px); line-height: 1.42; letter-spacing: -0.02em; }
.rv figcaption { display: flex; align-items: center; gap: 14px; font-size: 14px; color: var(--mute); }
.rv figcaption > span:last-child { display: grid; }
.rv figcaption b { color: var(--fg); font-size: 15px; font-weight: 600; }
.rv__av { width: 44px; height: 44px; border-radius: 50%; display: grid; place-items: center; flex: none; color: var(--c); background: color-mix(in srgb, var(--c) 16%, transparent); }
@media (min-width: 1400px) { .rv__track { padding-inline: calc((100vw - 1280px) / 2); scroll-padding-inline: calc((100vw - 1280px) / 2); } }
@media (max-width: 640px) { .rv { padding: 28px; min-height: 320px; } }
</style>
