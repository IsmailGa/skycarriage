<script setup lang="ts">
const { t } = useI18n()
const { toggle } = useTheme()
</script>

<template>
  <!-- Both icons are rendered; CSS shows the right one from [data-theme], so SSR and hydration always match. -->
  <button class="tt" type="button" :aria-label="t('a11y.theme')" :title="t('a11y.theme')" @click="toggle">
    <AppIcon class="tt__sun" name="sun" :size="19" />
    <AppIcon class="tt__moon" name="moon" :size="19" />
  </button>
</template>

<style scoped>
.tt { position: relative; width: 42px; height: 42px; border-radius: 50%; display: grid; place-items: center; color: var(--fg); background: var(--chip); border: 1px solid var(--line); transition: background 0.3s, transform 0.4s var(--ease); }
.tt:hover { background: var(--chip-2); transform: rotate(18deg); }
.tt svg { grid-area: 1 / 1; transition: opacity 0.35s, transform 0.5s var(--ease); }
.tt__sun { opacity: 0; transform: scale(0.4) rotate(-90deg); }
[data-theme='light'] .tt__sun { opacity: 1; transform: none; }
[data-theme='light'] .tt__moon { opacity: 0; transform: scale(0.4) rotate(90deg); }
</style>
