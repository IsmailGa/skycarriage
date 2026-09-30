<script setup lang="ts">
// Hand-built vector illustrations (isometric cargo + flat aircraft/globe). Pure SVG + CSS: no WebGL, tiny, theme-aware.
import type { ArtKey } from '~/data/cargo'

const props = withDefaults(defineProps<{ model: ArtKey; decorative?: boolean }>(), { decorative: false })
const uid = useId().replace(/[^a-zA-Z0-9]/g, '')

// ── isometric helpers (2:1-ish projection). +x → right-down, +y → left-down, +z → up.
const C = Math.cos(Math.PI / 6), S = 0.5
type V3 = [number, number, number]
const P = ([x, y, z]: V3) => [(x - y) * C, (x + y) * S - z] as const
const pts = (...v: V3[]) => v.map((p) => P(p).map((n) => n.toFixed(1)).join(',')).join(' ')
/** Three visible faces of a box at (x,y,z) with size w × d × h. */
const box = (x: number, y: number, z: number, w: number, d: number, h: number) => ({
  top: pts([x, y, z + h], [x + w, y, z + h], [x + w, y + d, z + h], [x, y + d, z + h]),
  left: pts([x, y + d, z], [x + w, y + d, z], [x + w, y + d, z + h], [x, y + d, z + h]), // faces left-down (y max)
  right: pts([x + w, y, z], [x + w, y + d, z], [x + w, y + d, z + h], [x + w, y, z + h]), // faces right-down (x max)
})
const T = (o: V3) => { const [a, b] = P(o); return `${a.toFixed(1)} ${b.toFixed(1)}` }

// palette per material: [top, left, right]
const MAT = {
  kraft: ['#e3c291', '#cda46c', '#ad8550'],
  white: ['#ffffff', '#e8edf6', '#ccd5e4'],
  blue: ['#9bb4ff', '#5f86ff', '#3f63d6'],
  slate: ['#5b6785', '#434d68', '#333c54'],
  wood: ['#d9b27c', '#bf9560', '#a37a48'],
  woodDark: ['#c39a63', '#a87f4d', '#8c6840'],
} as const
type Mat = keyof typeof MAT

// ── parcels: a stack of five boxes
interface Parcel { x: number; y: number; z: number; w: number; d: number; h: number; m: Mat; label?: string; tape?: boolean }
const parcels: Parcel[] = [
  { x: 0, y: 0, z: 0, w: 116, d: 96, h: 74, m: 'kraft', label: 'PRIORITY', tape: true },
  { x: 24, y: 18, z: 74, w: 64, d: 54, h: 42, m: 'blue', label: 'EXPRESS', tape: true },
  { x: 124, y: 6, z: 0, w: 66, d: 84, h: 50, m: 'white', label: 'FRAGILE', tape: true },
  { x: 8, y: 104, z: 0, w: 66, d: 50, h: 38, m: 'kraft', tape: true },
  { x: 96, y: 98, z: 0, w: 46, d: 40, h: 26, m: 'slate' },
]
const parcelFaces = parcels.map((p, i) => {
  const b = box(p.x, p.y, p.z, p.w, p.d, p.h)
  // tape: a band across the top + down the left face
  const tx0 = p.x + p.w * 0.4, tx1 = p.x + p.w * 0.6
  const tapeTop = pts([tx0, p.y, p.z + p.h], [tx1, p.y, p.z + p.h], [tx1, p.y + p.d, p.z + p.h], [tx0, p.y + p.d, p.z + p.h])
  const tapeLeft = pts([tx0, p.y + p.d, p.z + p.h], [tx1, p.y + p.d, p.z + p.h], [tx1, p.y + p.d, p.z + p.h * 0.45], [tx0, p.y + p.d, p.z + p.h * 0.45])
  // shipping label on the right (x max) face; local text coords follow the face basis (u → -y, v → -z)
  const lab = p.label ? P([p.x + p.w, p.y + p.d * 0.78, p.z + p.h * 0.78]) : null
  return { ...p, ...b, tapeTop, tapeLeft, lab, delay: `${-i * 0.9}s` }
})

// ── ULD (LD3) container
const D = 130
const uldProfile: [number, number][] = [[22, 0], [128, 0], [150, 58], [150, 150], [0, 150], [0, 58]]
const uld = {
  top: pts([0, 0, 150], [150, 0, 150], [150, D, 150], [0, D, 150]),
  side: pts([150, 0, 58], [150, D, 58], [150, D, 150], [150, 0, 150]),
  chamfer: pts([128, 0, 0], [128, D, 0], [150, D, 58], [150, 0, 58]),
  front: uldProfile.map(([x, z]) => P([x, D, z]).map((n) => n.toFixed(1)).join(',')).join(' '),
  pleats: Array.from({ length: 13 }, (_, i) => { const x = 6 + i * 11.5; return `${T([x, D, 0])} L ${T([x, D, 150])}` }),
  base: box(-10, -8, -12, 170, D + 16, 12),
  origin: P([150, D, 136]), // top-left of the brand panel on the right face
}

// ── pallet with wrapped cargo
const pal = (() => {
  const L = 230, W = 180
  const bottom = [0, 77, 154].map((y) => box(0, y, 0, L, 26, 5))
  const stringers = [0, 77, 154].map((y) => box(0, y, 5, L, 26, 12))
  const slats = Array.from({ length: 6 }, (_, i) => box(i * 38 + 1, 0, 17, 30, W, 6))
  const cargo: { b: ReturnType<typeof box>; m: Mat }[] = [
    { b: box(6, 8, 23, 108, 164, 46), m: 'kraft' }, { b: box(118, 8, 23, 106, 164, 46), m: 'white' },
    { b: box(6, 8, 69, 108, 164, 42), m: 'white' }, { b: box(118, 8, 69, 106, 164, 42), m: 'kraft' },
    { b: box(6, 8, 111, 218, 164, 34), m: 'slate' },
  ]
  const film = box(-2, -2, 23, L + 4, W + 4, 126)
  // straps are thin bands over the top and down the front face (not solid walls)
  const zt = 23 + 126.5
  const straps = [58, 168].map((x) => ({
    top: pts([x, -2, zt], [x + 9, -2, zt], [x + 9, W + 2, zt], [x, W + 2, zt]),
    left: pts([x, W + 2, zt], [x + 9, W + 2, zt], [x + 9, W + 2, 23], [x, W + 2, 23]),
  }))
  return { bottom, stringers, slats, cargo, film, straps }
})()

// ── globe orbits
const orbits = [
  { rx: 150, ry: 52, rot: -24, dur: 14, icon: 0 },
  { rx: 140, ry: 44, rot: 32, dur: 18, icon: 1 },
]
const orbitPath = (rx: number, ry: number) => `M ${-rx} 0 A ${rx} ${ry} 0 1 1 ${rx} 0 A ${rx} ${ry} 0 1 1 ${-rx} 0`
</script>

<template>
  <svg :class="['art', `art--${model}`, { 'art--decor': decorative }]" viewBox="0 0 480 400" preserveAspectRatio="xMidYMid meet" role="img" aria-hidden="true" focusable="false">
    <defs>
      <linearGradient :id="`${uid}curtain`" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4f7bff" /><stop offset="1" stop-color="#2447db" /></linearGradient>
      <linearGradient :id="`${uid}hull`" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff" /><stop offset="0.6" stop-color="#eef2fa" /><stop offset="1" stop-color="#c9d3e6" /></linearGradient>
      <linearGradient :id="`${uid}wing`" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f4f7fc" /><stop offset="1" stop-color="#bcc8de" /></linearGradient>
      <radialGradient :id="`${uid}sphere`" cx="0.36" cy="0.3" r="0.85"><stop offset="0" stop-color="var(--art-sphere-a)" /><stop offset="1" stop-color="var(--art-sphere-b)" /></radialGradient>
      <radialGradient :id="`${uid}shade`" cx="0.35" cy="0.3" r="0.8"><stop offset="0.55" stop-color="#000" stop-opacity="0" /><stop offset="1" stop-color="#000" stop-opacity="0.45" /></radialGradient>
      <clipPath :id="`${uid}front`"><polygon :points="uld.front" /></clipPath>
      <clipPath :id="`${uid}globe`"><circle r="128" /></clipPath>
    </defs>

    <!-- soft backdrop rings -->
    <g class="art__rings" fill="none" stroke="var(--art-ring)" stroke-width="1">
      <circle cx="240" cy="210" r="120" /><circle cx="240" cy="210" r="170" /><circle cx="240" cy="210" r="220" />
    </g>

    <!-- ───────── parcels ───────── -->
    <g v-if="model === 'parcels'" key="parcels" class="art__in">
      <g transform="translate(222 208) scale(1.12)">
        <ellipse cx="14" cy="118" rx="190" ry="44" fill="var(--art-shadow)" />
        <g v-for="p in parcelFaces" :key="p.x + '-' + p.y + '-' + p.z" class="float" :style="{ animationDelay: p.delay }">
          <polygon :points="p.left" :fill="MAT[p.m][1]" /><polygon :points="p.right" :fill="MAT[p.m][2]" /><polygon :points="p.top" :fill="MAT[p.m][0]" />
          <template v-if="p.tape">
            <polygon :points="p.tapeTop" :fill="p.m === 'blue' ? '#dbe6ff' : p.m === 'slate' ? '#8c97b3' : '#f3e8cf'" opacity="0.95" />
            <polygon :points="p.tapeLeft" :fill="p.m === 'blue' ? '#c4d4ff' : '#e6d7b6'" opacity="0.95" />
          </template>
          <g v-if="p.lab" :transform="`matrix(${C} ${-S} 0 1 ${p.lab[0].toFixed(1)} ${p.lab[1].toFixed(1)})`">
            <rect width="44" height="26" rx="2" fill="#fff" /><rect width="44" height="8" rx="2" fill="#0a0b0d" />
            <text x="4" y="6.3" font-size="5.6" font-weight="700" fill="#fff" font-family="Inter, Arial, sans-serif">{{ p.label }}</text>
            <g fill="#111"><rect v-for="i in 12" :key="i" :x="3 + (i - 1) * 3.2" y="11" :width="i % 3 === 0 ? 2 : 1" height="11" /></g>
          </g>
        </g>
      </g>
      <!-- tiny plane crossing above -->
      <g class="art__flyby" transform="translate(0 0)"><g transform="rotate(90)"><path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z" fill="var(--art-accent)" transform="translate(-12 -12) scale(1.3)" /></g></g>
    </g>

    <!-- ───────── ULD container ───────── -->
    <g v-else-if="model === 'uld'" key="uld" class="art__in">
      <g transform="translate(236 228) scale(1.3)">
        <ellipse cx="0" cy="62" rx="170" ry="40" fill="var(--art-shadow)" />
        <g class="float">
          <polygon :points="uld.base.left" fill="#2b3142" /><polygon :points="uld.base.right" fill="#1f2433" /><polygon :points="uld.base.top" fill="#3a4258" />
          <polygon :points="uld.chamfer" fill="#7d8aa3" />
          <polygon :points="uld.side" fill="#9eabc1" />
          <polygon :points="uld.top" fill="#d2dbea" />
          <!-- curtain (front) -->
          <polygon :points="uld.front" :fill="`url(#${uid}curtain)`" />
          <g :clip-path="`url(#${uid}front)`" stroke="rgb(255 255 255 / 0.22)" stroke-width="3"><path v-for="(d, i) in uld.pleats" :key="i" :d="`M ${d}`" /></g>
          <polygon :points="uld.front" fill="none" stroke="#1b2232" stroke-opacity="0.5" stroke-width="1.5" stroke-linejoin="round" />
          <!-- brand panel on the side face -->
          <g :transform="`matrix(${C} ${-S} 0 1 ${uld.origin[0].toFixed(1)} ${(uld.origin[1] - 6).toFixed(1)})`">
            <rect x="8" y="0" width="108" height="52" rx="3" fill="#eef2fa" />
            <rect x="8" y="0" width="108" height="4" fill="#2a59e6" /><rect x="8" y="48" width="108" height="4" fill="#2a59e6" />
            <text x="16" y="23" font-size="13" font-weight="700" fill="#0a0b0d" font-family="Inter, Arial, sans-serif">SKYCARRIAGE</text>
            <text x="16" y="33" font-size="5.4" letter-spacing="2.4" font-weight="600" fill="#2a59e6" font-family="Inter, Arial, sans-serif">LOGISTICS</text>
            <text x="16" y="44" font-size="8" font-weight="700" fill="#0a0b0d" font-family="Inter, Arial, sans-serif">AKE 48213 SC</text>
          </g>
          <polyline :points="uld.side" fill="none" stroke="#1b2232" stroke-opacity="0.35" stroke-width="1.2" />
        </g>
      </g>
    </g>

    <!-- ───────── pallet ───────── -->
    <g v-else-if="model === 'pallet'" key="pallet" class="art__in">
      <g transform="translate(226 226) scale(1.02)">
        <ellipse cx="0" cy="92" rx="200" ry="46" fill="var(--art-shadow)" />
        <g class="float">
          <g v-for="(b, i) in pal.bottom" :key="'b' + i"><polygon :points="b.left" :fill="MAT.woodDark[1]" /><polygon :points="b.right" :fill="MAT.woodDark[2]" /></g>
          <g v-for="(b, i) in pal.stringers" :key="'s' + i"><polygon :points="b.left" :fill="MAT.woodDark[1]" /><polygon :points="b.right" :fill="MAT.woodDark[2]" /><polygon :points="b.top" :fill="MAT.woodDark[0]" /></g>
          <g v-for="(b, i) in pal.slats" :key="'t' + i"><polygon :points="b.left" :fill="MAT.wood[1]" /><polygon :points="b.right" :fill="MAT.wood[2]" /><polygon :points="b.top" :fill="MAT.wood[0]" /></g>
          <g v-for="(c, i) in pal.cargo" :key="'c' + i"><polygon :points="c.b.left" :fill="MAT[c.m][1]" /><polygon :points="c.b.right" :fill="MAT[c.m][2]" /><polygon :points="c.b.top" :fill="MAT[c.m][0]" /></g>
          <g v-for="(s, i) in pal.straps" :key="'r' + i"><polygon :points="s.left" fill="#2a59e6" /><polygon :points="s.top" fill="#4f7bff" /></g>
          <!-- stretch film -->
          <g fill="#fff" fill-opacity="0.13" stroke="#fff" stroke-opacity="0.55" stroke-width="1.4" stroke-linejoin="round"><polygon :points="pal.film.left" /><polygon :points="pal.film.right" /><polygon :points="pal.film.top" /></g>
          <path :d="`M ${T([20, 180, 40])} L ${T([50, 180, 120])}`" stroke="#fff" stroke-opacity="0.6" stroke-width="3" stroke-linecap="round" />
        </g>
      </g>
    </g>

    <!-- ───────── aircraft ───────── -->
    <g v-else-if="model === 'plane'" key="plane" class="art__in">
      <g class="art__clouds" fill="var(--art-cloud)">
        <g class="cloud c1"><ellipse cx="90" cy="110" rx="46" ry="14" /><ellipse cx="116" cy="102" rx="26" ry="14" /></g>
        <g class="cloud c2"><ellipse cx="380" cy="300" rx="52" ry="14" /><ellipse cx="350" cy="292" rx="26" ry="13" /></g>
        <g class="cloud c3"><ellipse cx="410" cy="120" rx="34" ry="10" /></g>
      </g>
      <!-- contrails -->
      <g class="art__trail" stroke="var(--art-trail)" stroke-width="3" stroke-linecap="round" fill="none"><path d="M40 196 H150" /><path d="M20 210 H120" opacity="0.6" /></g>
      <g class="float plane" transform="translate(240 200) rotate(-6)">
        <ellipse cx="6" cy="112" rx="104" ry="11" fill="var(--art-shadow)" />
        <!-- far wing -->
        <path d="M18 -10 L-48 -62 L-24 -66 L78 -16 Z" :fill="`url(#${uid}wing)`" opacity="0.85" />
        <!-- tail fin -->
        <path d="M-150 -14 L-178 -82 L-150 -82 L-100 -16 Z" fill="#3f6bff" />
        <path d="M-150 14 L-186 6 L-166 -2 L-116 8 Z" :fill="`url(#${uid}wing)`" opacity="0.9" />
        <!-- fuselage -->
        <path d="M-160 4 C-160 -20 -130 -30 -90 -30 L78 -30 C126 -30 152 -14 166 6 C150 26 124 38 78 38 L-92 38 C-130 38 -160 28 -160 4 Z" :fill="`url(#${uid}hull)`" />
        <path d="M-158 14 C-150 28 -126 36 -92 36 L78 36 C122 36 146 26 162 10 L150 6 C128 22 100 26 70 26 L-96 26 C-126 26 -146 22 -158 14 Z" fill="#dfe6f3" opacity="0.7" />
        <path d="M-150 2 H150" stroke="#3f6bff" stroke-width="3.2" stroke-linecap="round" />
        <!-- cockpit + windows -->
        <path d="M128 -12 L150 -2 L128 0 Z" fill="#1a2133" />
        <g fill="#1a2133"><rect v-for="i in 20" :key="i" :x="-118 + (i - 1) * 10.5" y="-14" width="5.2" height="7" rx="2.4" /></g>
        <!-- near wing + engine -->
        <path d="M14 24 L-74 122 L-40 126 L92 28 Z" :fill="`url(#${uid}wing)`" />
        <path d="M-74 122 L-40 126 L-46 136 L-82 130 Z" fill="#3f6bff" />
        <g><rect x="36" y="42" width="56" height="26" rx="13" fill="#e9eef8" /><rect x="84" y="42" width="10" height="26" rx="5" fill="#1a2133" /><rect x="36" y="42" width="56" height="26" rx="13" fill="none" stroke="#b8c4dc" /></g>
      </g>
    </g>

    <!-- ───────── globe / network ───────── -->
    <g v-else key="globe" class="art__in">
      <g transform="translate(240 206)">
        <ellipse cx="0" cy="168" rx="120" ry="14" fill="var(--art-shadow)" />
        <circle r="146" fill="var(--art-halo)" />
        <circle r="128" :fill="`url(#${uid}sphere)`" />
        <g :clip-path="`url(#${uid}globe)`">
          <!-- two copies of the dotted world map slide sideways → slowly "rotating" globe -->
          <g class="art__map">
            <image href="/media/world-dots.svg" x="-256" y="-96" width="512" height="196" preserveAspectRatio="none" class="art__dots" />
            <image href="/media/world-dots.svg" x="256" y="-96" width="512" height="196" preserveAspectRatio="none" class="art__dots" />
          </g>
          <circle r="128" :fill="`url(#${uid}shade)`" />
        </g>
        <circle r="128" fill="none" stroke="var(--art-ring-strong)" stroke-width="1.5" />
        <!-- orbiting aircraft -->
        <g v-for="(o, i) in orbits" :key="i" :transform="`rotate(${o.rot})`">
          <path :d="orbitPath(o.rx, o.ry)" fill="none" stroke="var(--art-orbit)" stroke-width="1.4" stroke-dasharray="4 6" />
          <g>
            <animateMotion :dur="`${o.dur}s`" repeatCount="indefinite" :path="orbitPath(o.rx, o.ry)" rotate="auto" />
            <g transform="rotate(45)"><path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z" fill="var(--art-accent)" transform="translate(-12 -12) scale(1.15)" /></g>
          </g>
        </g>
        <!-- hubs -->
        <g fill="#fff" stroke="var(--art-accent)" stroke-width="2.4"><circle cx="-34" cy="-46" r="5" /><circle cx="22" cy="-14" r="5" /><circle cx="64" cy="38" r="5" /><circle cx="-62" cy="22" r="5" /></g>
        <g class="art__pulse" fill="var(--art-accent)"><circle cx="-34" cy="-46" r="5" /><circle cx="22" cy="-14" r="5" /><circle cx="64" cy="38" r="5" /><circle cx="-62" cy="22" r="5" /></g>
        <path d="M-34 -46 Q -8 -74 22 -14 T 64 38" fill="none" stroke="var(--art-accent)" stroke-width="2" stroke-dasharray="5 5" class="art__route" />
        <path d="M-62 22 Q -44 -10 -34 -46" fill="none" stroke="var(--art-accent)" stroke-width="2" stroke-dasharray="5 5" class="art__route" />
      </g>
    </g>
  </svg>
</template>

<style scoped>
.art {
  --art-shadow: rgb(79 123 255 / 0.22); --art-ring: rgb(255 255 255 / 0.06); --art-ring-strong: rgb(255 255 255 / 0.25); --art-accent: #6f95ff;
  --art-cloud: rgb(255 255 255 / 0.07); --art-trail: rgb(255 255 255 / 0.3);
  --art-sphere-a: #2a3f8f; --art-sphere-b: #0b1433; --art-halo: rgb(79 123 255 / 0.12); --art-dots: 0.9; --art-orbit: rgb(168 192 255 / 0.55);
  width: 100%; height: 100%; overflow: visible; user-select: none;
}
[data-theme='light'] .art {
  --art-shadow: rgb(20 40 100 / 0.16); --art-ring: rgb(36 71 219 / 0.08); --art-ring-strong: rgb(36 71 219 / 0.3); --art-accent: #2f55e0;
  --art-cloud: rgb(255 255 255 / 0.85); --art-trail: rgb(79 123 255 / 0.4);
  --art-sphere-a: #ffffff; --art-sphere-b: #cbd8ff; --art-halo: rgb(79 123 255 / 0.1); --art-dots: 0.75; --art-orbit: rgb(47 85 224 / 0.5);
}
.art__in { animation: artIn 0.9s var(--ease) both; transform-box: fill-box; transform-origin: center; }
@keyframes artIn { from { opacity: 0; transform: translateY(18px) scale(0.94); } }
.float { animation: float 6s ease-in-out infinite; }
@keyframes float { 50% { transform: translateY(-7px); } }
.plane { animation: planeFloat 7s ease-in-out infinite; transform-box: fill-box; }
@keyframes planeFloat { 50% { transform: translate(240px, 192px) rotate(-3deg); } }
.art__clouds .cloud { animation: drift 16s linear infinite; }
.art__clouds .c2 { animation-duration: 22s; animation-direction: reverse; }
.art__clouds .c3 { animation-duration: 28s; }
@keyframes drift { from { transform: translateX(-30px); } to { transform: translateX(30px); } }
.art__trail path { stroke-dasharray: 22 14; animation: dash 1.6s linear infinite; }
@keyframes dash { to { stroke-dashoffset: -72; } }
.art__flyby { animation: fly 9s ease-in-out infinite; }
@keyframes fly { 0% { transform: translate(80px, 88px); opacity: 0; } 12% { opacity: 1; } 88% { opacity: 1; } 100% { transform: translate(410px, 50px); opacity: 0; } }
.art__dots { opacity: 0.9; }
[data-theme='light'] .art__dots { filter: brightness(0) opacity(0.32); opacity: 1; }
.art__map { animation: slide 38s linear infinite; }
@keyframes slide { to { transform: translateX(-512px); } }
.art__route { animation: dash 1.4s linear infinite; }
.art__pulse circle { transform-box: fill-box; transform-origin: center; animation: pulse 2.4s ease-out infinite; }
.art__pulse circle:nth-child(2) { animation-delay: 0.6s; } .art__pulse circle:nth-child(3) { animation-delay: 1.2s; } .art__pulse circle:nth-child(4) { animation-delay: 1.8s; }
@keyframes pulse { from { transform: scale(1); opacity: 0.55; } to { transform: scale(4); opacity: 0; } }
.art--decor { opacity: 0.95; }
@media (prefers-reduced-motion: reduce) { .art *, .art { animation: none !important; } }
</style>
