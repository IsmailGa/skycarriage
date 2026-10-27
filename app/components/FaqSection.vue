<script setup lang="ts">
const { t } = useI18n()
const { openQuote } = useQuote()
const title = useMsgList('faq.title')
const faqs = useMsgList('faq.items', ['q', 'a'] as const)
const open = ref<number | null>(0)
const toggle = (i: number) => (open.value = open.value === i ? null : i)
</script>

<template>
  <section id="faq" class="section section--light" aria-labelledby="faq-title">
    <div class="container faq">
      <div class="faq__head">
        <h2 id="faq-title" v-reveal="0.08" class="h2"><BrLines :lines="title" /></h2>
        <p v-reveal="0.16" class="lead">{{ t('faq.lead') }}</p>
        <a v-reveal="0.22" href="#quote" class="btn btn--solid btn--sm" @click.prevent="openQuote()">{{ t('faq.cta') }} <AppIcon name="arrow" :size="16" :stroke="2" /></a>
      </div>

      <div class="faq__list">
        <div v-for="(f, i) in faqs" :key="i" v-reveal="i * 0.05" class="faq__item" :class="{ open: open === i }">
          <h3>
            <button :id="`faq-q-${i}`" :aria-expanded="open === i" :aria-controls="`faq-a-${i}`" @click="toggle(i)">
              <span>{{ f.q }}</span>
              <i aria-hidden="true"><AppIcon name="chevronDown" :size="20" :stroke="2" /></i>
            </button>
          </h3>
          <div :id="`faq-a-${i}`" class="faq__a" role="region" :aria-labelledby="`faq-q-${i}`"><div><p>{{ f.a }}</p></div></div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.faq { display: grid; grid-template-columns: minmax(0, 0.8fr) minmax(0, 1.2fr); gap: clamp(32px, 6vw, 96px); align-items: start; }
.faq__head { display: grid; gap: 20px; justify-items: start; position: sticky; top: calc(var(--header-h) + 24px); }
.faq__item { border-bottom: 1px solid var(--line-strong); }
.faq__item:first-child { border-top: 1px solid var(--line-strong); }
.faq__item button { width: 100%; display: flex; justify-content: space-between; align-items: center; gap: 24px; padding: 26px 0; text-align: left; font-family: var(--font-display); font-weight: 600; font-size: clamp(18px, 1.8vw, 22px); letter-spacing: -0.025em; line-height: 1.25; transition: color 0.3s; }
.faq__item button:hover { color: var(--accent-text); }
.faq__item i { flex: none; width: 40px; height: 40px; border-radius: 50%; display: grid; place-items: center; background: var(--card); border: 1px solid var(--line); transition: transform 0.5s var(--ease), background 0.3s, color 0.3s; }
.faq__item.open i { transform: rotate(180deg); background: var(--blue); color: var(--on-accent); border-color: transparent; }
.faq__a { display: grid; grid-template-rows: 0fr; transition: grid-template-rows 0.55s var(--ease); }
.faq__a > div { overflow: hidden; }
.faq__a p { padding: 0 64px 28px 0; color: var(--mute); line-height: 1.6; font-size: 16px; }
.faq__item.open .faq__a { grid-template-rows: 1fr; }
@media (max-width: 900px) { .faq { grid-template-columns: 1fr; } .faq__head { position: static; } .faq__a p { padding-right: 0; } }
</style>

