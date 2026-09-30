<script setup lang="ts">
// Brand mark: a folded paper-plane (air + dispatch) on a blue gradient tile, with a stacked wordmark.
const uid = useId()
</script>

<template>
  <span class="logo">
    <svg class="logo__mark" viewBox="0 0 64 64" width="36" height="36" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient :id="`${uid}-g`" x1="0.1" y1="0" x2="0.9" y2="1"><stop offset="0" stop-color="#86a8ff" /><stop offset="1" stop-color="#2447db" /></linearGradient>
        <radialGradient :id="`${uid}-s`" cx="0.2" cy="0" r="1"><stop offset="0" stop-color="#fff" stop-opacity=".28" /><stop offset=".6" stop-color="#fff" stop-opacity="0" /></radialGradient>
      </defs>
      <rect width="64" height="64" rx="16" :fill="`url(#${uid}-g)`" />
      <rect width="64" height="64" rx="16" :fill="`url(#${uid}-s)`" />
      <g class="logo__plane">
        <path d="M52 12 12 31.5l18.5 7.5z" fill="#fff" />
        <path d="M52 12 30.5 39 41 52z" fill="#fff" fill-opacity=".72" />
        <path d="M30.5 39 41 52 28 47.5z" fill="#fff" fill-opacity=".38" />
      </g>
    </svg>
    <span class="logo__word">
      <b>SKYCARRIAGE</b>
      <span>LOGISTICS</span>
    </span>
  </span>
</template>

<style scoped>
.logo { display: inline-flex; align-items: center; gap: 11px; color: var(--fg); }
.logo__mark { flex: none; border-radius: 10px; box-shadow: 0 6px 22px rgb(79 123 255 / 0.4); transition: box-shadow 0.5s var(--ease); }
.logo__plane { transform-box: view-box; transform-origin: 32px 32px; transition: transform 0.7s var(--ease); }
.logo:hover .logo__plane { transform: translate(3px, -3px) scale(1.04); }
.logo:hover .logo__mark { box-shadow: 0 8px 30px rgb(79 123 255 / 0.65); }
.logo__word { display: grid; gap: 3px; line-height: 1; white-space: nowrap; }
.logo__word b { font-family: var(--font-display); font-weight: 600; font-size: 17px; letter-spacing: 0.14em; }
.logo__word span { font-family: var(--font-body); font-weight: 500; font-size: 9.5px; letter-spacing: 0.46em; color: var(--accent-text); opacity: 0.9; }
@media (max-width: 360px) { .logo__word b { font-size: 15px; } }
</style>
