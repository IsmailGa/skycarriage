import type { Ref } from 'vue'

/** Plays a muted background video only while it is on screen (saves CPU/GPU/battery); stays paused for reduced-motion users. */
export function usePlayInView(video: Ref<HTMLVideoElement | undefined>, margin = '120px') {
  let io: IntersectionObserver | undefined
  onMounted(() => {
    const el = video.value
    if (!el) return
    if (prefersReducedMotion()) { el.pause(); el.removeAttribute('autoplay'); return }
    io = new IntersectionObserver(
      ([e]) => { if (e?.isIntersecting) el.play().catch(() => {}); else el.pause() },
      { rootMargin: margin },
    )
    io.observe(el)
  })
  onBeforeUnmount(() => io?.disconnect())
}
