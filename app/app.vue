<script setup lang="ts">
import { site } from '~/data/site'

const { t, locale } = useI18n()
const { theme } = useTheme()
// hreflang alternates, canonical, og:locale and <html lang/dir> from @nuxtjs/i18n
const i18nHead = useLocaleHead({ dir: true, seo: true })

useHead(() => ({
  htmlAttrs: { ...i18nHead.value.htmlAttrs, 'data-theme': theme.value },
  link: [...(i18nHead.value.link ?? []), { rel: 'preload', as: 'image', href: '/media/hero-poster.webp', type: 'image/webp', fetchpriority: 'high' }],
  meta: [...(i18nHead.value.meta ?? []), { name: 'theme-color', content: theme.value === 'dark' ? '#0a1220' : '#ffffff' }],
}))
</script>

<template>
  <NuxtRouteAnnouncer />
  <a href="#main" class="skip-link">{{ t('a11y.skip') }}</a>
  <AppHeader />
  <WinterAtmosphere v-if="site.winter" />
  <main id="main">
    <NuxtPage :page-key="locale" />
  </main>
  <AppFooter />
  <QuoteDialog />
</template>
