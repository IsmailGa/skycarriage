<script setup lang="ts">
// Brand mark (supplied artwork) in champagne gold, with a stacked wordmark. No tile, so it sits cleanly on both themes.
import { LOGO_PATHS, LOGO_VIEWBOX } from '~/data/logo-paths'

const uid = useId()
const [vx = 0, vy = 0, vw = 1, vh = 1] = LOGO_VIEWBOX.split(' ').map(Number)
</script>

<template>
  <span class="logo">
    <svg class="logo__mark" :viewBox="LOGO_VIEWBOX" width="56" height="28" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient :id="`${uid}-g`" :x1="vx" :y1="vy + vh" :x2="vx + vw" :y2="vy" gradientUnits="userSpaceOnUse">
          <stop offset="0" stop-color="#b88f45" /><stop offset=".5" stop-color="#e2c27e" /><stop offset="1" stop-color="#fbeec9" />
        </linearGradient>
      </defs>
      <g :fill="`url(#${uid}-g)`">
        <path v-for="(d, i) in LOGO_PATHS" :key="i" :d="d" :class="`logo__b${i + 1}`" />
      </g>
    </svg>
    <span class="logo__word">
      <b>SKYCARRIAGE</b>
      <span><i /> GLOBAL LOGISTICS <i /></span>
    </span>
  </span>
</template>

<style scoped>
.logo { display: inline-flex; align-items: center; gap: 12px; color: var(--fg); }
.logo__mark { flex: none; overflow: visible; filter: drop-shadow(0 4px 12px rgb(207 170 99 / 0.35)); }
.logo__b1, .logo__b2, .logo__b3 { transition: transform 0.6s var(--ease); transform-box: fill-box; }
.logo:hover .logo__b1 { transform: translate(16px, -10px); }
.logo:hover .logo__b2 { transform: translate(8px, -5px); }
.logo__word { display: grid; gap: 5px; line-height: 1; white-space: nowrap; }
.logo__word b { font-family: var(--font-display); font-weight: 600; font-size: 19px; letter-spacing: 0.1em; }
.logo__word span { display: flex; align-items: center; gap: 6px; font-family: var(--font-body); font-weight: 500; font-size: 8.5px; letter-spacing: 0.32em; color: var(--accent-text); }
.logo__word i { flex: 1; min-width: 6px; height: 1px; background: currentColor; opacity: 0.55; }
@media (max-width: 360px) { .logo__word b { font-size: 16px; } .logo__word span { font-size: 7.5px; } }
@media (prefers-reduced-motion: reduce) { .logo:hover .logo__b1, .logo:hover .logo__b2 { transform: none; } }
</style>
