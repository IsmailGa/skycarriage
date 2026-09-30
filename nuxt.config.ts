const SITE_URL = process.env.NUXT_PUBLIC_SITE_URL || 'https://skycarriage.example'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: false },
  typescript: { strict: true },
  modules: ['@nuxtjs/i18n', '@nuxt/fonts', '@nuxtjs/sitemap', '@nuxtjs/robots'],
  css: ['lenis/dist/lenis.css', '~/assets/css/main.css'],

  site: { url: SITE_URL, name: 'SKYCARRIAGE Logistics', defaultLocale: 'en' },
  runtimeConfig: { public: { siteUrl: SITE_URL } },

  // English (default, no prefix) · Русский (/ru) · Oʻzbekcha (/uz). hreflang + canonical are emitted via useLocaleHead in app.vue.
  i18n: {
    baseUrl: SITE_URL,
    defaultLocale: 'en',
    strategy: 'prefix_except_default',
    locales: [
      { code: 'en', language: 'en-US', name: 'English', file: 'en.ts' },
      { code: 'ru', language: 'ru-RU', name: 'Русский', file: 'ru.ts' },
      { code: 'uz', language: 'uz-UZ', name: 'Oʻzbekcha', file: 'uz.ts' },
    ],
    detectBrowserLanguage: { useCookie: true, cookieKey: 'sc_lang', redirectOn: 'root', fallbackLocale: 'en' },
  },

  fonts: {
    families: [
      { name: 'Geist', weights: [500, 600], styles: ['normal'] },
      { name: 'Inter', weights: [400, 500, 600], styles: ['normal'] },
    ],
  },

  app: {
    head: {
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' },
        { name: 'color-scheme', content: 'dark light' },
        { name: 'format-detection', content: 'telephone=no' },
      ],
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
        { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' },
      ],
      // Adds `.js` before first paint so scroll-reveal styles never hide content for no-JS visitors / crawlers.
      script: [{ innerHTML: "document.documentElement.classList.add('js')", tagPosition: 'head' }],
    },
  },

  robots: { allow: ['/'] },

  routeRules: {
    '/media/**': { headers: { 'cache-control': 'public, max-age=31536000, immutable' } },
    '/_nuxt/**': { headers: { 'cache-control': 'public, max-age=31536000, immutable' } },
  },
  nitro: { compressPublicAssets: true },
})
