import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'

export default defineNuxtPlugin((nuxtApp) => {
  // v-reveal: fade/slide an element in once when it scrolls into view. Optional value: delay (s).
  nuxtApp.vueApp.directive('reveal', {
    getSSRProps: () => ({ 'data-reveal': '' }),
    mounted(el: HTMLElement, binding) {
      el.setAttribute('data-reveal', '')
      if (prefersReducedMotion()) return
      const v = binding.value
      const delay = typeof v === 'number' ? v : (v?.delay ?? 0)
      gsap.to(el, {
        opacity: 1, y: 0, duration: 1, delay, ease: 'power3.out',
        // once revealed, drop the marker + inline styles so hover transforms etc. work normally
        onComplete: () => { el.removeAttribute('data-reveal'); gsap.set(el, { clearProps: 'opacity,transform' }) },
        scrollTrigger: { trigger: el, start: 'top 92%', once: true },
      })
    },
  })

  if (import.meta.client) {
    gsap.registerPlugin(ScrollTrigger)
    if (!prefersReducedMotion()) {
      const lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 0.95 })
      setLenis(lenis)
      lenis.on('scroll', ScrollTrigger.update)
      gsap.ticker.add((t) => lenis.raf(t * 1000))
      gsap.ticker.lagSmoothing(0)
    }
    nuxtApp.hook('app:suspense:resolve', () => ScrollTrigger.refresh())
    window.addEventListener('load', () => ScrollTrigger.refresh())
  }
})
