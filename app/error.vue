<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps<{ error: NuxtError }>()
const { t } = useI18n()
const is404 = computed(() => props.error.statusCode === 404)
useHead(() => ({ title: `${is404.value ? t('err.notFound') : t('err.generic')} — SKYCARRIAGE Logistics`, meta: [{ name: 'robots', content: 'noindex' }] }))
</script>

<template>
  <div class="err">
    <LogoMark />
    <p class="err__code">{{ error.statusCode }}</p>
    <h1>{{ is404 ? t('err.notFound') : t('err.generic') }}</h1>
    <p>{{ is404 ? t('err.notFoundText') : t('err.genericText') }}</p>
    <button class="btn btn--solid" @click="clearError({ redirect: '/' })">{{ t('err.home') }}</button>
  </div>
</template>

<style scoped>
.err { min-height: 100vh; display: grid; place-content: center; justify-items: center; gap: 20px; padding: 24px; text-align: center; color: var(--fg); background: radial-gradient(ellipse at 50% 0, color-mix(in srgb, var(--blue) 22%, var(--bg)), var(--bg) 65%); }
.err__code { font-family: var(--font-display); font-weight: 600; font-size: clamp(90px, 18vw, 180px); letter-spacing: -0.06em; line-height: 1; background: linear-gradient(90deg, #8fb0ff, #4f7bff); -webkit-background-clip: text; background-clip: text; color: transparent; }
h1 { font-family: var(--font-display); font-weight: 600; font-size: clamp(28px, 4vw, 40px); letter-spacing: var(--ls-display); }
p { color: var(--mute); }
</style>
