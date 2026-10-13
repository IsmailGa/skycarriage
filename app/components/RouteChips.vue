<script setup lang="ts">
import type { RouteOption } from '~/composables/useRoutePicker'

// Quick-pick suggestions shown under the fields once one end of the route is known.
defineProps<{ label: string; options: RouteOption[] }>()
defineEmits<{ pick: [option: RouteOption] }>()
</script>

<template>
  <Transition name="chips">
    <div v-if="options.length" class="rc" role="group" :aria-label="label">
      <p class="rc__l">{{ label }}</p>
      <div class="rc__row">
        <button v-for="o in options" :key="o.code" type="button" class="rc__chip" @click="$emit('pick', o)">
          <b>{{ o.code }}</b><span>{{ o.city }}</span>
        </button>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.rc { display: grid; gap: 8px; overflow: hidden; }
.rc__l { font-size: 12.5px; color: var(--mute); }
.rc__row { display: flex; flex-wrap: wrap; gap: 8px; }
.rc__chip { display: inline-flex; align-items: center; gap: 8px; padding: 7px 12px 7px 8px; border-radius: 999px; font-size: 13.5px; font-weight: 500; color: var(--fg); background: var(--chip); border: 1px solid var(--line); transition: background 0.25s, border-color 0.25s, transform 0.3s var(--ease); }
.rc__chip b { padding: 2px 7px; border-radius: 999px; font-size: 11px; font-weight: 600; letter-spacing: 0.06em; background: var(--accent-soft); color: var(--accent-text); }
.rc__chip:hover { background: var(--chip-2); border-color: rgb(207 170 99 / 0.5); transform: translateY(-1px); }
.rc__chip:active { transform: scale(0.97); }
.chips-enter-active, .chips-leave-active { transition: all 0.45s var(--ease); }
.chips-enter-from, .chips-leave-to { opacity: 0; transform: translateY(-6px); max-height: 0; }
.chips-enter-to { max-height: 120px; }
</style>
