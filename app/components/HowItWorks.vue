<script setup lang="ts">
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

const { t } = useI18n()
const title = useMsgList('how.title')
const steps = useMsgList('how.steps', ['t', 'd'] as const)
const root = ref<HTMLElement>()
const reached = ref(0) // how many steps the progress line has passed
let ctx: gsap.Context | undefined

onMounted(() => {
  if (prefersReducedMotion()) { reached.value = steps.value.length; return }
  ctx = gsap.context(() => {
    const update = (s: ScrollTrigger) => {
      root.value!.style.setProperty('--p', String(s.progress))
      reached.value = Math.min(steps.value.length, Math.floor(s.progress * steps.value.length + 0.35))
    }
    const mm = gsap.matchMedia()
    mm.add('(min-width: 901px)', () => { ScrollTrigger.create({ trigger: '.hiw__steps', start: 'top 70%', end: 'bottom 60%', scrub: true, onUpdate: update }) })
    mm.add('(max-width: 900px)', () => { ScrollTrigger.create({ trigger: '.hiw__steps', start: 'top 60%', end: 'bottom 70%', scrub: true, onUpdate: update }) })
  }, root.value)
})
onBeforeUnmount(() => ctx?.revert())
</script>

<template>
  <section id="how-it-works" ref="root" class="section section--white" aria-labelledby="hiw-title">
    <div class="container">
      <div class="sec-head sec-head--center">
        <h2 id="hiw-title" v-reveal="0.08" class="h2"><BrLines :lines="title" /></h2>
        <p v-reveal="0.16" class="lead">{{ t('how.lead') }}</p>
      </div>

      <ol class="hiw__steps">
        <span class="hiw__rail" aria-hidden="true"><span class="hiw__rail-fill" /></span>
        <li v-for="(s, i) in steps" :key="i" v-reveal="i * 0.08" class="hiw__step" :class="{ on: reached > i }">
          <span class="hiw__n num">0{{ i + 1 }}</span>
          <h3>{{ s.t }}</h3>
          <p>{{ s.d }}</p>
        </li>
      </ol>
    </div>
  </section>
</template>

<style scoped>
.hiw__steps { --p: 0; position: relative; display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
.hiw__rail { position: absolute; left: 26px; right: 26px; top: 26px; height: 2px; background: var(--line-strong); border-radius: 2px; }
.hiw__rail-fill { position: absolute; inset: 0; transform-origin: left; transform: scaleX(var(--p)); background: linear-gradient(90deg, var(--blue), var(--blue-2)); border-radius: 2px; box-shadow: 0 0 14px rgb(207 170 99 / 0.6); }
.hiw__step { position: relative; padding: 32px 32px 36px; border-radius: var(--radius); background: var(--card); border: 1px solid var(--line); display: grid; gap: 12px; align-content: start; transition: background 0.6s var(--ease), color 0.6s, border-color 0.6s; }
.hiw__n { width: 52px; height: 52px; border-radius: 50%; display: grid; place-items: center; font-family: var(--font-display); font-weight: 600; font-size: 17px; background: var(--bg); border: 1px solid var(--line-strong); margin-bottom: 36px; position: relative; z-index: 1; transition: background 0.5s, color 0.5s, box-shadow 0.5s, border-color 0.5s; }
.hiw__step h3 { font-family: var(--font-display); font-weight: 600; font-size: 24px; letter-spacing: var(--ls-display); line-height: 1.15; }
.hiw__step p { font-size: 16px; line-height: 1.5; color: var(--mute); transition: color 0.5s; }
.hiw__step.on { background: var(--on-bg); color: var(--on-fg); border-color: transparent; }
.hiw__step.on p { color: var(--on-mute); }
.hiw__step.on .hiw__n { background: var(--blue); color: var(--on-accent); border-color: transparent; box-shadow: 0 0 0 8px rgb(207 170 99 / 0.22); }

@media (max-width: 900px) {
  .hiw__steps { grid-template-columns: 1fr; }
  .hiw__rail { left: 52px; right: auto; top: 26px; bottom: 26px; width: 2px; height: auto; }
  .hiw__rail-fill { transform-origin: top; transform: scaleY(var(--p)); }
  .hiw__step { padding: 28px 28px 30px 88px; }
  .hiw__n { position: absolute; left: 26px; top: 28px; margin: 0; }
}
</style>

