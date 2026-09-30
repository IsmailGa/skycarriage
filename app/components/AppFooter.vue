<script setup lang="ts">
import { site } from '~/data/site'

const { t } = useI18n()
const year = new Date().getFullYear()
const ids = {
  Services: ['services', 'services', 'services', 'services', 'services', 'services'],
  Company: ['how-it-works', 'why-us', 'network', 'reviews', 'faq'],
  Support: ['quote', 'quote'],
} as const
const cols = [
  { key: 'colServices', ids: ids.Services },
  { key: 'colCompany', ids: ids.Company },
  { key: 'colSupport', ids: ids.Support },
] as const
const heading = (k: string) => t(`footer.${k}.h`)
const items = (k: string, n: number) => Array.from({ length: n }, (_, i) => t(`footer.${k}.items[${i}]`))
</script>

<template>
  <footer class="ft">
    <div class="container">
      <div class="ft__top">
        <div class="ft__brand">
          <LogoMark />
          <p>{{ t('footer.tagline') }}</p>
          <a :href="`mailto:${site.email}`" class="ft__mail">{{ site.email }}</a>
        </div>
        <nav class="ft__cols" :aria-label="t('a11y.footerNav')">
          <div v-for="c in cols" :key="c.key">
            <h2>{{ heading(c.key) }}</h2>
            <ul><li v-for="(label, i) in items(c.key, c.ids.length)" :key="i"><a :href="`#${c.ids[i]}`" @click.prevent="scrollToId(c.ids[i]!)">{{ label }}</a></li></ul>
          </div>
        </nav>
      </div>
      <div class="ft__bot">
        <p>{{ t('footer.rights', { year, name: site.name }) }}</p>
        <ul><li><a href="#">{{ t('footer.privacy') }}</a></li><li><a href="#">{{ t('footer.terms') }}</a></li><li><a href="#">{{ t('footer.cookies') }}</a></li></ul>
        <button class="ft__up" :aria-label="t('a11y.backToTop')" @click="scrollToId('top')"><AppIcon name="arrowUpRight" :size="18" :stroke="2" /></button>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.ft { background: var(--bg-alt); color: var(--fg); padding: clamp(56px, 7vw, 88px) 0 40px; border-top: 1px solid var(--line); }
.ft__top { display: flex; justify-content: space-between; gap: 48px; flex-wrap: wrap; padding-bottom: clamp(48px, 6vw, 72px); }
.ft__brand { display: grid; gap: 20px; max-width: 320px; justify-items: start; }
.ft__brand p { color: var(--mute); font-size: 15px; line-height: 1.55; }
.ft__mail { color: var(--accent-text); font-weight: 500; font-size: 15px; }
.ft__mail:hover { text-decoration: underline; text-underline-offset: 4px; }
.ft__cols { display: flex; gap: clamp(32px, 6vw, 80px); flex-wrap: wrap; }
.ft__cols h2 { font-size: 14px; font-weight: 600; margin-bottom: 18px; font-family: var(--font-body); }
.ft__cols ul { display: grid; gap: 14px; }
.ft__cols a { color: var(--mute); font-size: 15px; transition: color 0.2s; }
.ft__cols a:hover { color: var(--fg); }
.ft__bot { display: flex; justify-content: space-between; align-items: center; gap: 16px 28px; flex-wrap: wrap; padding-top: 28px; border-top: 1px solid var(--line); font-size: 14px; color: var(--mute); }
.ft__bot ul { display: flex; gap: 28px; flex-wrap: wrap; }
.ft__bot a:hover { color: var(--fg); }
.ft__up { width: 44px; height: 44px; border-radius: 50%; display: grid; place-items: center; background: var(--chip); color: var(--fg); transition: background 0.3s, transform 0.4s var(--ease), color 0.3s; }
.ft__up:hover { background: var(--blue); color: #fff; transform: translateY(-3px); }
</style>
