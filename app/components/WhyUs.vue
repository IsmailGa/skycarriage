<script setup lang="ts">
const { t } = useI18n()
const title = useMsgList('why.title')
const includes = useMsgList('why.includes')
const features = useMsgList('why.features', ['t', 'd'] as const)
const icons = ['user', 'eye', 'shield', 'clock'] as const

function glow(e: PointerEvent) {
  const el = e.currentTarget as HTMLElement
  const r = el.getBoundingClientRect()
  el.style.setProperty('--mx', `${e.clientX - r.left}px`)
  el.style.setProperty('--my', `${e.clientY - r.top}px`)
}
</script>

<template>
  <section id="why-us" class="section section--white why" aria-labelledby="why-title">
    <div class="why__glow" aria-hidden="true" />
    <div class="container">
      <div class="sec-head">
        <div class="sec-head__l">
          <h2 id="why-title" v-reveal="0.08" class="h2"><BrLines :lines="title" /></h2>
        </div>
        <p v-reveal="0.16" class="lead">{{ t('why.lead') }}</p>
      </div>

      <div class="why__grid">
        <article v-reveal class="why__price">
          <div>
            <p class="why__big num">€0</p>
            <h3>{{ t('why.priceTitle') }}</h3>
            <p class="why__sub">{{ t('why.priceSub') }}</p>
          </div>
          <ul>
            <li v-for="(i, k) in includes" :key="k"><span><AppIcon name="check" :size="14" :stroke="2.6" /></span>{{ i }}</li>
          </ul>
        </article>

        <div class="why__feats">
          <article v-for="(f, i) in features" :key="i" v-reveal="0.08 * i" class="feat" @pointermove="glow">
            <span class="feat__ic"><AppIcon :name="icons[i] ?? 'check'" :size="26" /></span>
            <div><h3>{{ f.t }}</h3><p>{{ f.d }}</p></div>
          </article>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.why { overflow: hidden; }
.why__glow { position: absolute; left: -15%; bottom: -10%; width: 70%; height: 55%; border-radius: 50%; background: var(--blue); opacity: 0.16; filter: blur(140px); pointer-events: none; }
[data-theme='dark'] .why__glow, :root:not([data-theme]) .why__glow { opacity: 0.22; }
.why .container { position: relative; }
.why__grid { display: grid; grid-template-columns: minmax(0, 0.9fr) minmax(0, 1.1fr); gap: 16px; }
.why__price { padding: clamp(28px, 3.2vw, 40px); border-radius: var(--radius); display: flex; flex-direction: column; justify-content: space-between; gap: 40px; border: 1px solid rgb(255 255 255 / 0.1); background: linear-gradient(160deg, #24407a, #0c1730 85%); color: #fff; position: relative; overflow: hidden; }
.why__big { font-family: var(--font-display); font-weight: 600; font-size: clamp(84px, 10vw, 120px); letter-spacing: -0.06em; line-height: 1; margin-bottom: 12px; }
.why__price h3 { font-family: var(--font-display); font-weight: 600; font-size: clamp(24px, 2.6vw, 32px); letter-spacing: var(--ls-display); margin-bottom: 12px; line-height: 1.1; }
.why__sub { font-size: 17px; line-height: 1.5; color: rgb(255 255 255 / 0.75); max-width: 380px; }
.why__price ul { display: grid; gap: 14px; }
.why__price li { display: flex; align-items: center; gap: 12px; font-weight: 500; }
.why__price li span { width: 24px; height: 24px; border-radius: 50%; display: grid; place-items: center; background: rgb(255 255 255 / 0.16); flex: none; }
.why__feats { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.feat { position: relative; padding: 32px 32px 36px; border-radius: var(--radius); background: var(--card); border: 1px solid var(--line); display: flex; flex-direction: column; justify-content: space-between; gap: 40px; overflow: hidden; transition: border-color 0.4s, transform 0.6s var(--ease), box-shadow 0.6s var(--ease); }
.feat::before { content: ''; position: absolute; inset: 0; opacity: 0; transition: opacity 0.4s; background: radial-gradient(360px circle at var(--mx, 50%) var(--my, 0%), rgb(207 170 99 / 0.18), transparent 65%); pointer-events: none; }
.feat:hover { border-color: rgb(207 170 99 / 0.4); transform: translateY(-4px); box-shadow: var(--shadow-card); }
.feat:hover::before { opacity: 1; }
.feat__ic { position: relative; width: 56px; height: 56px; border-radius: 16px; display: grid; place-items: center; color: var(--accent-text); background: var(--accent-soft); }
.feat h3 { position: relative; font-family: var(--font-display); font-weight: 600; font-size: 22px; letter-spacing: var(--ls-display); margin-bottom: 10px; line-height: 1.15; }
.feat p { position: relative; font-size: 15px; line-height: 1.55; color: var(--mute); }

@media (max-width: 1000px) { .why__grid { grid-template-columns: 1fr; } }
@media (max-width: 640px) { .why__feats { grid-template-columns: 1fr; } .feat { padding: 26px; gap: 28px; } }
</style>
