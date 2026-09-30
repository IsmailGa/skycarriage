<script setup lang="ts">
withDefaults(defineProps<{ inline?: boolean }>(), { inline: false })
const emit = defineEmits<{ pick: [] }>()

const { locale, locales, t } = useI18n()
const switchLocalePath = useSwitchLocalePath()
const items = computed(() => (locales.value as { code: string; name: string }[]).map((l) => ({ ...l, to: switchLocalePath(l.code as 'en') })))
const open = ref(false)
const root = ref<HTMLElement>()

const onDoc = (e: Event) => { if (!root.value?.contains(e.target as Node)) open.value = false }
const onKey = (e: KeyboardEvent) => e.key === 'Escape' && (open.value = false)
onMounted(() => { document.addEventListener('pointerdown', onDoc); document.addEventListener('keydown', onKey) })
onBeforeUnmount(() => { document.removeEventListener('pointerdown', onDoc); document.removeEventListener('keydown', onKey) })
function picked() { open.value = false; emit('pick') }
</script>

<template>
  <!-- inline = segmented buttons (mobile menu); default = compact dropdown (header) -->
  <div v-if="inline" class="ls-inline" role="group" :aria-label="t('a11y.language')">
    <NuxtLink v-for="l in items" :key="l.code" :to="l.to" :hreflang="l.code" :class="{ on: l.code === locale }" :lang="l.code" @click="picked">{{ l.code.toUpperCase() }}</NuxtLink>
  </div>

  <div v-else ref="root" class="ls">
    <button class="ls__btn" type="button" :aria-expanded="open" aria-haspopup="true" :aria-label="t('a11y.language')" @click="open = !open">
      <AppIcon name="globe" :size="17" /> <span>{{ locale.toUpperCase() }}</span> <AppIcon name="chevronDown" :size="14" :stroke="2.2" class="ls__chev" />
    </button>
    <ul v-show="open" class="ls__menu">
      <li v-for="l in items" :key="l.code">
        <NuxtLink :to="l.to" :hreflang="l.code" :lang="l.code" :class="{ on: l.code === locale }" @click="picked">
          <span>{{ l.name }}</span><b>{{ l.code.toUpperCase() }}</b>
        </NuxtLink>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.ls { position: relative; }
.ls__btn { height: 42px; padding: 0 14px 0 12px; border-radius: 999px; display: inline-flex; align-items: center; gap: 7px; font-size: 13px; font-weight: 600; letter-spacing: 0.04em; color: var(--fg); background: var(--chip); border: 1px solid var(--line); transition: background 0.3s; }
.ls__btn:hover { background: var(--chip-2); }
.ls__chev { transition: transform 0.4s var(--ease); }
.ls__btn[aria-expanded='true'] .ls__chev { transform: rotate(180deg); }
.ls__menu { position: absolute; right: 0; top: calc(100% + 10px); min-width: 180px; padding: 6px; border-radius: 16px; background: var(--surface); border: 1px solid var(--line); box-shadow: var(--shadow-card); z-index: 5; animation: pop 0.3s var(--ease); }
.ls__menu a { display: flex; justify-content: space-between; align-items: center; gap: 16px; padding: 11px 12px; border-radius: 11px; font-size: 14px; font-weight: 500; color: var(--fg-2); transition: background 0.2s, color 0.2s; }
.ls__menu a b { font-size: 11px; letter-spacing: 0.08em; color: var(--mute); }
.ls__menu a:hover { background: var(--chip); color: var(--fg); }
.ls__menu a.on { color: var(--fg); background: var(--accent-soft); }
@keyframes pop { from { opacity: 0; transform: translateY(-6px) scale(0.97); } }

.ls-inline { display: inline-flex; padding: 4px; border-radius: 999px; background: var(--chip); border: 1px solid var(--line); }
.ls-inline a { padding: 9px 18px; border-radius: 999px; font-size: 14px; font-weight: 600; letter-spacing: 0.05em; color: var(--mute); transition: all 0.3s var(--ease); }
.ls-inline a.on { background: var(--fg); color: var(--bg); }
</style>
