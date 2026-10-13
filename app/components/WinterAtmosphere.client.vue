<script setup lang="ts">
// TEMPORARY seasonal decoration: snowfall + a frosty glow along the top edge.
// Turn it off with `winter: false` in app/data/site.ts (nothing else needs to change).
const { theme } = useTheme()
const cv = ref<HTMLCanvasElement>()

interface Flake { x: number; y: number; r: number; vy: number; sway: number; phase: number; a: number }
let flakes: Flake[] = []
let raf = 0, last = 0, w = 0, h = 0, dpr = 1
let ctx: CanvasRenderingContext2D | null = null

function seed() {
  const count = Math.round(Math.min(160, Math.max(45, (w * h) / 12000)))
  flakes = Array.from({ length: count }, () => spawn(true))
}
function spawn(anywhere = false): Flake {
  const depth = Math.random() // 0 = far, 1 = near
  return {
    x: Math.random() * w, y: anywhere ? Math.random() * h : -10,
    r: 0.9 + depth * 2.8, vy: 22 + depth * 60, sway: 8 + Math.random() * 22, phase: Math.random() * Math.PI * 2,
    a: 0.35 + depth * 0.5,
  }
}
function resize() {
  if (!cv.value) return
  dpr = Math.min(window.devicePixelRatio || 1, 1.5)
  w = window.innerWidth; h = window.innerHeight
  cv.value.width = w * dpr; cv.value.height = h * dpr
  ctx = cv.value.getContext('2d')
  ctx?.setTransform(dpr, 0, 0, dpr, 0, 0)
  seed()
}
function frame(t: number) {
  raf = requestAnimationFrame(frame)
  if (!ctx) return
  const dt = Math.min(0.05, (t - (last || t)) / 1000); last = t
  ctx.clearRect(0, 0, w, h)
  const light = theme.value === 'light'
  for (const f of flakes) {
    f.y += f.vy * dt
    f.phase += dt * 0.9
    f.x += Math.sin(f.phase) * f.sway * dt
    if (f.y > h + 10) Object.assign(f, spawn())
    if (f.x < -10) f.x = w + 10; else if (f.x > w + 10) f.x = -10
    ctx.beginPath()
    ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2)
    // white on dark; icy blue with a soft edge on light so flakes stay visible on white
    ctx.fillStyle = light ? `rgba(140, 175, 245, ${f.a})` : `rgba(255, 255, 255, ${f.a})`
    ctx.fill()
    if (light && f.r > 2) { ctx.strokeStyle = `rgba(255,255,255,${f.a})`; ctx.lineWidth = 0.8; ctx.stroke() }
  }
}
const onVis = () => { cancelAnimationFrame(raf); if (!document.hidden) { last = 0; raf = requestAnimationFrame(frame) } }

onMounted(() => {
  if (prefersReducedMotion()) return // static frost only
  resize()
  raf = requestAnimationFrame(frame)
  window.addEventListener('resize', resize)
  document.addEventListener('visibilitychange', onVis)
})
onBeforeUnmount(() => {
  cancelAnimationFrame(raf)
  window.removeEventListener('resize', resize)
  document.removeEventListener('visibilitychange', onVis)
})
</script>

<template>
  <div class="win" aria-hidden="true">
    <div class="win__frost" />
    <canvas ref="cv" class="win__snow" />
  </div>
</template>

<style scoped>
.win { position: fixed; inset: 0; z-index: 90; pointer-events: none; }
.win__snow { position: absolute; inset: 0; width: 100%; height: 100%; }
.win__frost { position: absolute; inset: 0 0 auto; height: 160px; background: linear-gradient(to bottom, rgb(168 200 255 / 0.18), transparent); }
[data-theme='light'] .win__frost { background: linear-gradient(to bottom, rgb(150 190 255 / 0.28), transparent); }
</style>
