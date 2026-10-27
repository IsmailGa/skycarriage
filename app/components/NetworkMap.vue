<script setup lang="ts">
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { airports, arcPath, cityOf, lanes, mapNodes, MAP_H, MAP_W, project } from '~/data/network'

const { t } = useI18n()
const title = useMsgList('network.title')
const popular = lanes.filter((l) => l.popular)
const arcs = lanes.map((l, i) => ({ ...l, id: `${l.from}-${l.to}`, d: arcPath(l.from, l.to), dur: 5 + (i % 4) }))
const nodes = mapNodes.map((code) => {
  const a = airports[code]!
  const [x, y] = project(a.lon, a.lat)
  const [lx, ly] = a.label ?? [9, -9]
  return { code, x, y, lx, ly }
})

const active = ref<string | null>(null) // lane id being highlighted
const hoverNode = ref<string | null>(null)
const isLit = (id: string) => !active.value || active.value === id
const nodeLit = (code: string) => (active.value ? active.value.split('-').includes(code) : true)

const root = ref<HTMLElement>()
let ctx: gsap.Context | undefined
onMounted(() => {
  if (prefersReducedMotion()) return
  ctx = gsap.context(() => {
    const paths = gsap.utils.toArray<SVGPathElement>('.arc')
    paths.forEach((p) => { const len = p.getTotalLength(); p.style.strokeDasharray = `${len}`; p.style.strokeDashoffset = `${len}` })
    ScrollTrigger.create({
      trigger: root.value!, start: 'top 70%', once: true,
      onEnter: () => {
        gsap.to(paths, { strokeDashoffset: 0, duration: 2.2, ease: 'power2.inOut', stagger: 0.1, onComplete: () => paths.forEach((p) => (p.style.strokeDasharray = 'none')) })
        gsap.from('.node', { scale: 0, transformOrigin: 'center', duration: 0.7, ease: 'back.out(2)', stagger: 0.08 })
        gsap.from('.mover', { opacity: 0, duration: 0.6, delay: 2, stagger: 0.1, clearProps: 'opacity' })
      },
    })
  }, root.value)
})
onBeforeUnmount(() => ctx?.revert())
</script>

<template>
  <section id="network" class="section section--light" aria-labelledby="net-title">
    <div class="container">
      <div class="sec-head">
        <div class="sec-head__l">
          <h2 id="net-title" v-reveal="0.08" class="h2"><BrLines :lines="title" /></h2>
        </div>
        <p v-reveal="0.16" class="lead">{{ t('network.lead') }}</p>
      </div>

      <div class="net">
        <div ref="root" v-reveal class="net__map" role="img" :aria-label="t('network.mapLabel')">
          <img class="net__dots" src="/media/world-dots.svg" :width="MAP_W" :height="MAP_H" alt="" loading="lazy" decoding="async" />
          <svg :viewBox="`0 0 ${MAP_W} ${MAP_H}`" preserveAspectRatio="xMidYMid meet" class="net__svg" aria-hidden="true">
            <defs>
              <linearGradient id="arcg" x1="0" x2="1"><stop offset="0" stop-color="#cfaa63" /><stop offset="1" stop-color="#ecd7a6" /></linearGradient>
            </defs>
            <g fill="none" stroke-linecap="round">
              <path v-for="a in arcs" :id="`p-${a.id}`" :key="a.id" class="arc" :d="a.d" stroke="url(#arcg)" :stroke-width="active === a.id ? 2.4 : 1.4" :opacity="isLit(a.id) ? 0.9 : 0.12" />
            </g>
            <g v-for="(a, i) in arcs" :key="'m' + a.id" class="mover" :opacity="isLit(a.id) ? 1 : 0">
              <circle r="3.2" fill="#fff"><animateMotion :dur="`${a.dur}s`" repeatCount="indefinite" :begin="`${i * 0.6}s`"><mpath :href="`#p-${a.id}`" /></animateMotion></circle>
            </g>
            <g v-for="n in nodes" :key="n.code" class="node" :opacity="nodeLit(n.code) ? 1 : 0.25" @pointerenter="hoverNode = n.code" @pointerleave="hoverNode = null">
              <circle :cx="n.x" :cy="n.y" r="11" fill="#cfaa63" opacity="0.25"><animate attributeName="r" values="8;14;8" dur="3.4s" repeatCount="indefinite" /><animate attributeName="opacity" values="0.35;0.05;0.35" dur="3.4s" repeatCount="indefinite" /></circle>
              <circle :cx="n.x" :cy="n.y" r="4" fill="#fff" stroke="#cfaa63" stroke-width="2" />
              <text :x="n.x + n.lx" :y="n.y + n.ly" class="lbl">{{ hoverNode === n.code ? cityOf(t(`airports.${n.code}`)) : n.code }}</text>
            </g>
          </svg>
        </div>

        <aside v-reveal="0.1" class="net__lanes" aria-labelledby="lanes-title">
          <h3 id="lanes-title">{{ t('network.lanesTitle') }}</h3>
          <p class="net__sub">{{ t('network.lanesSub') }}</p>
          <ul @pointerleave="active = null">
            <li v-for="l in popular" :key="`${l.from}-${l.to}`">
              <button
                :class="{ on: active === `${l.from}-${l.to}` }" :aria-pressed="active === `${l.from}-${l.to}`"
                @pointerenter="active = `${l.from}-${l.to}`" @focus="active = `${l.from}-${l.to}`" @blur="active = null"
                @click="active = active === `${l.from}-${l.to}` ? null : `${l.from}-${l.to}`"
              >
                <span><strong>{{ l.from }} <em>→</em> {{ l.to }}</strong><small>{{ t(`network.regions.${l.from}_${l.to}`) }}</small></span>
                <b>{{ t(`network.transit.${l.transit}`) }}</b>
              </button>
            </li>
          </ul>
        </aside>
      </div>
    </div>
  </section>
</template>

<style scoped>
.net { display: grid; grid-template-columns: minmax(0, 1fr) 380px; gap: 16px; align-items: stretch; }
/* the map panel stays navy in both themes: it reads as a "screen" and keeps the glowing routes legible */
.net__map { position: relative; border-radius: var(--radius); overflow: hidden; background: radial-gradient(ellipse 70% 60% at 50% 45%, #1c3260 0%, #0a1220 75%); min-height: 420px; display: grid; place-items: center; padding: clamp(12px, 3vw, 32px) clamp(8px, 2vw, 24px) clamp(56px, 7vw, 72px); border: 1px solid var(--line); }
.net__dots, .net__svg { grid-area: 1 / 1; width: 100%; height: auto; }
.net__dots { opacity: 0.4; }
.lbl { font-family: var(--font-body); font-size: 11px; font-weight: 600; letter-spacing: 0.06em; fill: rgb(255 255 255 / 0.85); paint-order: stroke; stroke: rgb(7 8 11 / 0.7); stroke-width: 3px; pointer-events: none; }
.node { cursor: pointer; transition: opacity 0.4s; }
.arc { transition: opacity 0.4s, stroke-width 0.3s; }
.net__live { position: absolute; left: 20px; bottom: 20px; display: inline-flex; align-items: center; gap: 10px; padding: 10px 16px; border-radius: 999px; font-size: 13px; font-weight: 500; color: rgb(255 255 255 / 0.85); background: rgb(255 255 255 / 0.08); border: 1px solid rgb(255 255 255 / 0.1); backdrop-filter: blur(10px); }
.net__live i { width: 8px; height: 8px; border-radius: 50%; background: var(--green); animation: pulse 1.8s infinite; flex: none; }
@keyframes pulse { 50% { opacity: 0.35; } }

.net__lanes { padding: 32px 32px 20px; border-radius: var(--radius); background: var(--card); border: 1px solid var(--line); display: flex; flex-direction: column; }
.net__lanes h3 { font-family: var(--font-display); font-weight: 600; font-size: 22px; letter-spacing: var(--ls-display); }
.net__sub { font-size: 14px; color: var(--mute); margin-bottom: 16px; }
.net__lanes ul { display: grid; }
.net__lanes li + li { border-top: 1px solid var(--line); }
.net__lanes button { display: flex; justify-content: space-between; align-items: center; gap: 12px; padding: 14px 10px; margin-inline: -10px; width: calc(100% + 20px); border-radius: 14px; text-align: left; transition: background 0.3s; }
.net__lanes button:hover, .net__lanes button.on { background: var(--chip); }
.net__lanes span { display: grid; gap: 3px; }
.net__lanes strong { font-family: var(--font-display); font-weight: 600; font-size: 18px; letter-spacing: -0.02em; }
.net__lanes em { font-style: normal; color: var(--accent-text); }
.net__lanes small { font-size: 13px; color: var(--mute); }
.net__lanes b { padding: 6px 12px; border-radius: 999px; font-size: 13px; font-weight: 600; background: var(--chip-2); white-space: nowrap; transition: background 0.3s, color 0.3s; }
.net__lanes button.on b, .net__lanes button:hover b { background: var(--blue); color: var(--on-accent); }

@media (max-width: 1000px) { .net { grid-template-columns: 1fr; } }
@media (max-width: 560px) { .net__map { min-height: 260px; padding-bottom: 64px; } .lbl { font-size: 15px; } .net__lanes { padding: 24px 20px 12px; } .net__live { font-size: 12px; left: 12px; right: 12px; bottom: 12px; } }
</style>

