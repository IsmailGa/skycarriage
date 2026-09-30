<script setup lang="ts">
const { t } = useI18n()
// Order mirrors the on-page section order.
const links = computed(() => [
  { id: 'services', label: t('nav.services') },
  { id: 'how-it-works', label: t('nav.how') },
  { id: 'why-us', label: t('nav.why') },
  { id: 'network', label: t('nav.network') },
  { id: 'faq', label: t('nav.faq') },
])
const scrolled = ref(false)
const open = ref(false)
const active = ref('')

function go(id: string) {
  open.value = false
  nextTick(() => scrollToId(id))
}

watch(open, (v) => {
  document.documentElement.style.overflow = v ? 'hidden' : ''
  const l = getLenis()
  v ? l?.stop() : l?.start()
})

let io: IntersectionObserver | undefined
const onScroll = () => (scrolled.value = window.scrollY > 24)
const onKey = (e: KeyboardEvent) => e.key === 'Escape' && (open.value = false)
const onResize = () => window.innerWidth > 1140 && (open.value = false)

onMounted(() => {
  onScroll()
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('keydown', onKey)
  window.addEventListener('resize', onResize)
  io = new IntersectionObserver(
    (entries) => entries.forEach((e) => e.isIntersecting && (active.value = e.target.id)),
    { rootMargin: '-45% 0px -50% 0px' },
  )
  ;['services', 'how-it-works', 'why-us', 'network', 'faq'].forEach((id) => { const s = document.getElementById(id); s && io!.observe(s) })
})
onBeforeUnmount(() => {
  window.removeEventListener('scroll', onScroll)
  window.removeEventListener('keydown', onKey)
  window.removeEventListener('resize', onResize)
  io?.disconnect()
  document.documentElement.style.overflow = ''
})
</script>

<template>
  <header class="hdr" :class="{ 'hdr--scrolled': scrolled, 'hdr--open': open }">
    <div class="container hdr__in">
      <a href="#top" class="hdr__logo" :aria-label="t('a11y.home')" @click.prevent="go('top')"><LogoMark /></a>

      <nav class="hdr__nav" :aria-label="t('a11y.primaryNav')">
        <a v-for="l in links" :key="l.id" :href="`#${l.id}`" :class="{ on: active === l.id }" @click.prevent="go(l.id)">{{ l.label }}</a>
      </nav>

      <div class="hdr__actions">
        <LangSwitcher class="hdr__lang" />
        <ThemeToggle />
        <a href="#quote" class="btn btn--solid btn--sm hdr__cta" @click.prevent="go('quote')">{{ t('nav.quote') }}</a>
        <button class="hdr__burger" :aria-expanded="open" aria-controls="mobile-menu" :aria-label="open ? t('a11y.closeMenu') : t('a11y.openMenu')" @click="open = !open">
          <AppIcon :name="open ? 'close' : 'menu'" :size="22" />
        </button>
      </div>
    </div>

    <div id="mobile-menu" class="menu" :inert="!open" :aria-hidden="!open">
      <nav class="menu__nav" :aria-label="t('a11y.mobileNav')">
        <a v-for="(l, i) in links" :key="l.id" :href="`#${l.id}`" :style="{ '--i': i }" @click.prevent="go(l.id)">
          {{ l.label }} <AppIcon name="arrowUpRight" :size="22" />
        </a>
      </nav>
      <div class="menu__foot">
        <div class="menu__tools"><LangSwitcher inline @pick="open = false" /><ThemeToggle /></div>
        <a href="#quote" class="btn btn--blue menu__cta" @click.prevent="go('quote')">{{ t('nav.menuCta') }} <AppIcon name="arrow" :size="18" :stroke="2" /></a>
      </div>
    </div>
  </header>
</template>

<style scoped>
.hdr { position: fixed; inset: 0 0 auto; z-index: 100; transition: background 0.4s, backdrop-filter 0.4s, border-color 0.4s; border-bottom: 1px solid transparent; }
.hdr--scrolled, .hdr--open { background: var(--hdr-bg); backdrop-filter: blur(18px) saturate(1.4); border-color: var(--line); }
/* backdrop-filter would make the header the containing block of the fixed mobile menu, so drop it while open */
.hdr--open { background: var(--bg); backdrop-filter: none; }
.hdr__in { height: var(--header-h); display: flex; align-items: center; justify-content: space-between; gap: 20px; }
.hdr__logo { position: relative; z-index: 2; flex: none; }
.hdr__nav { display: flex; flex: 1; justify-content: center; gap: clamp(14px, 1.8vw, 30px); min-width: 0; }
.hdr__nav a, .hdr__nav a::after { content: ''; position: absolute; left: 0; right: 0; bottom: -6px; height: 2px; border-radius: 2px; background: var(--blue); transform: scaleX(0); transition: transform 0.4s var(--ease); }
.hdr__nav a:hover, .hdr__nav a.on { color: var(--fg); }
.hdr__nav a.on::after { transform: scaleX(1); }
.hdr__actions { display: flex; align-items: center; gap: 12px; position: relative; z-index: 2; }
.hdr__burger { display: none; width: 44px; height: 44px; border-radius: 50%; place-items: center; color: var(--fg); background: var(--chip); }

.menu { position: fixed; inset: 0; padding: calc(var(--header-h) + 24px) var(--gutter) 32px; background: var(--bg); display: none; flex-direction: column; justify-content: space-between; gap: 32px; opacity: 0; visibility: hidden; transition: opacity 0.35s, visibility 0.35s; overflow-y: auto; }
.menu__nav { display: grid; }
.menu__nav a { display: flex; justify-content: space-between; align-items: center; padding: 18px 0; border-bottom: 1px solid var(--line); font-family: var(--font-display); font-size: 30px; font-weight: 600; letter-spacing: var(--ls-display); color: var(--fg); opacity: 0; transform: translateY(16px); transition: opacity 0.5s var(--ease), transform 0.5s var(--ease); transition-delay: calc(var(--i) * 0.06s + 0.1s); }
.menu__foot { display: grid; gap: 16px; }
.menu__tools { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.menu__cta { width: 100%; padding-block: 18px; }
.hdr--open .menu { opacity: 1; visibility: visible; }
.hdr--open .menu__nav a { opacity: 1; transform: none; }

@media (max-width: 1140px) {
  .hdr__nav, .hdr__cta, .hdr__lang, .hdr__actions > :deep(.tt) { display: none; }
  .hdr__burger { display: grid; }
  .menu { display: flex; }
}
</style>
