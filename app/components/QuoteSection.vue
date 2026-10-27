<script setup lang="ts">
import { site } from '~/data/site'

const { t } = useI18n()
const title = useMsgList('quote.title')
</script>

<template>
  <section id="quote" class="section section--white" aria-labelledby="quote-title">
    <div class="container">
      <div class="q">
        <div class="q__glow" aria-hidden="true" />
        <div id="contact" class="q__copy">
          <h2 id="quote-title" v-reveal="0.08" class="q__h"><BrLines :lines="title" /></h2>
          <p v-reveal="0.16" class="q__lead">{{ t('quote.lead') }}</p>
          <ul v-reveal="0.24" class="q__contact">
            <li><span><AppIcon name="phone" :size="18" /></span><a :href="`tel:${site.phoneHref}`">{{ site.phone }}</a></li>
            <li><span><AppIcon name="mail" :size="18" /></span><a :href="`mailto:${site.email}`">{{ site.email }}</a></li>
          </ul>
          <div class="q__scene" aria-hidden="true"><CargoArt model="parcels" decorative /></div>
        </div>

        <div v-reveal="0.1" class="q__card"><QuoteForm /></div>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* The CTA block stays dark in both themes (strong accent moment); the form card follows the theme. */
.q { position: relative; overflow: hidden; isolation: isolate; border-radius: clamp(28px, 3vw, 40px); background: linear-gradient(120deg, #14264a, #0a1220 70%); color: #fff; padding: clamp(28px, 5vw, 72px); display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 540px); gap: clamp(32px, 5vw, 64px); align-items: center; border: 1px solid var(--line); }
.q__glow { position: absolute; z-index: -1; left: -200px; top: -260px; width: 700px; height: 600px; border-radius: 50%; background: var(--blue); opacity: 0.4; filter: blur(130px); }
.q__copy { display: grid; gap: 24px; justify-items: start; position: relative; align-self: stretch; align-content: center; }
.q__copy .eyebrow { color: var(--blue-2); }
.q__h { font-family: var(--font-display); font-weight: 600; font-size: clamp(40px, 6vw, 72px); line-height: 1; letter-spacing: var(--ls-display); }
.q__lead { font-size: 18px; line-height: 1.55; color: #9aa0ac; max-width: 470px; }
.q__contact { display: grid; gap: 14px; padding-top: 8px; }
.q__contact li { display: flex; align-items: center; gap: 12px; font-weight: 500; flex-wrap: wrap; }
.q__contact span { width: 40px; height: 40px; border-radius: 50%; display: grid; place-items: center; color: var(--blue-2); background: rgb(255 255 255 / 0.08); }
.q__contact a:hover { text-decoration: underline; text-underline-offset: 4px; }
.q__scene { position: absolute; right: -40px; bottom: -60px; width: 300px; height: 300px; pointer-events: none; opacity: 0.95; }

.q__card { background: var(--surface); color: var(--fg); border-radius: var(--radius); padding: clamp(24px, 2.6vw, 36px); box-shadow: 0 30px 60px rgb(0 0 0 / 0.4); position: relative; z-index: 1; }
@media (max-width: 1240px) { .q__scene { display: none; } }
@media (max-width: 1000px) { .q { grid-template-columns: 1fr; } .q__card { max-width: 640px; } }
</style>
