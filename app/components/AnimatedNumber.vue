<script setup lang="ts">
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

const props = withDefaults(
  defineProps<{ to: number; decimals?: number; prefix?: string; suffix?: string; duration?: number }>(),
  { decimals: 0, prefix: '', suffix: '', duration: 1.8 },
)
const fmt = useNumFmt()
const el = ref<HTMLElement>()
const shown = ref(props.to) // SSR + no-JS show the final value
const text = computed(() => props.prefix + fmt(shown.value, props.decimals) + props.suffix)

let trigger: ScrollTrigger | undefined
onMounted(() => {
  if (prefersReducedMotion() || !el.value) return
  shown.value = 0
  const state = { v: 0 }
  trigger = ScrollTrigger.create({
    trigger: el.value, start: 'top 95%', once: true,
    onEnter: () => gsap.to(state, { v: props.to, duration: props.duration, ease: 'power2.out', onUpdate: () => (shown.value = state.v) }),
  })
})
onBeforeUnmount(() => trigger?.kill())
</script>

<template><span ref="el" class="num">{{ text }}</span></template>
