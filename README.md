# SKYCARRIAGE Logistics — landing website

Nuxt 4 · Vue 3 · TypeScript · Vite · GSAP (ScrollTrigger) · Lenis smooth scroll · @nuxtjs/i18n (EN / RU / UZ) · light & dark themes.
Design source: Figma file `2LsLXmrDwH3cU77EmrOD4H` (page "SKYCARRIAGE Logistics").

## Commands

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # production build (SSR, Node server in .output/)
npm run preview    # serve the production build
npx vue-tsc --noEmit   # type-check
```

Set the real domain before deploying (used for canonical URLs, Open Graph, sitemap, robots):

```bash
NUXT_PUBLIC_SITE_URL=https://your-domain.com
```

## Structure

| Path | What |
| --- | --- |
| `app/components/*` | One component per page section (Hero, Services, CinematicBand, HowItWorks, GroundOps, WhyUs, NetworkMap, Testimonials, Faq, Quote, Footer) |
| `app/plugins/motion.ts` | GSAP + ScrollTrigger + Lenis setup and the `v-reveal` scroll-reveal directive |
| `app/utils/motion.ts`, `app/composables/` | Reduced-motion / hover helpers, smooth `scrollToId`, play-video-in-view |
| `i18n/locales/{en,ru,uz}.ts` | **All copy.** `en.ts` defines the shape; `ru.ts`/`uz.ts` are type-checked against it. Routes: `/` (en), `/ru`, `/uz`. Avoid `@` and `|` in messages (vue-i18n syntax). Uzbek text should be proof-read by a native speaker. |
| `app/composables/useTheme.ts` | Theme (dark default) stored in the `sc_theme` cookie → server renders the right theme, no flash. Colours are semantic tokens in `assets/css/main.css`. |
| `app/components/CargoArt.vue` | Hand-built SVG cargo illustrations (parcels, ULD, pallet, aircraft, globe) |
| `app/data/site.ts` | **Business details (email, phone, name) — replace placeholders here** |
| `app/data/services.ts`, `app/data/network.ts` | Services, FAQ, airports, lanes |
| `app/pages/index.vue` | SEO: meta, Open Graph, Twitter, canonical, JSON-LD (Organization, WebSite, Service, FAQPage) |
| `server/api/quote.post.ts` | Quote-form endpoint (validation + honeypot). **Logs only — wire to email/CRM (see TODO)** |
| `scripts/optimize-media.mjs` | Re-creates `public/media/*` (resized WebP/JPG, compressed MP4/WebM) from the originals |
| `scripts/world-dots.mjs` | Regenerates the dot-matrix world map SVG |

## Motion & accessibility

- Every animation respects `prefers-reduced-motion` (Lenis off, reveals shown instantly, videos paused).
- Background videos only play while on screen. Content is fully rendered in the server HTML (no-JS / crawler safe).
- Keyboard: skip link, focus rings, accessible menu / accordion / carousel / form errors.

## Before launch

- Replace placeholder figures, reviews and contact details (stats, ratings, `app/data/site.ts`, testimonials).
- Confirm licences for the photos/video in `public/media` (they show third-party airline branding).
- Connect `server/api/quote.post.ts` to your email or CRM provider.
- Add real Privacy / Terms pages and link them in the footer.
