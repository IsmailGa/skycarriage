<script setup lang="ts">
// shadcn-style Select: Reka UI primitives (the layer shadcn-vue is built on) styled with the site's design tokens.
import { SelectContent, SelectItem, SelectItemIndicator, SelectItemText, SelectPortal, SelectRoot, SelectTrigger, SelectValue, SelectViewport, SelectIcon } from 'reka-ui'

defineProps<{ options: { value: string; label: string }[]; ariaLabel?: string; id?: string }>()
const model = defineModel<string>({ required: true })
</script>

<template>
  <SelectRoot v-model="model">
    <SelectTrigger :id="id" class="ui-trigger" :aria-label="ariaLabel">
      <SelectValue />
      <SelectIcon class="ui-chev"><AppIcon name="chevronDown" :size="18" :stroke="2" /></SelectIcon>
    </SelectTrigger>
    <SelectPortal>
      <SelectContent class="ui-pop" data-lenis-prevent position="popper" :side-offset="8" :collision-padding="12">
        <SelectViewport class="ui-vp">
          <SelectItem v-for="o in options" :key="o.value" :value="o.value" class="ui-item">
            <SelectItemText>{{ o.label }}</SelectItemText>
            <SelectItemIndicator class="ui-check"><AppIcon name="check" :size="16" :stroke="2.4" /></SelectItemIndicator>
          </SelectItem>
        </SelectViewport>
      </SelectContent>
    </SelectPortal>
  </SelectRoot>
</template>

<style>
.ui-trigger { width: 100%; min-width: 0; display: flex; align-items: center; justify-content: space-between; gap: 10px; padding: 15px 16px; border-radius: 14px; background: var(--input-bg); border: 1px solid var(--input-line); font-weight: 500; font-size: 16px; text-align: left; color: var(--fg); transition: border-color 0.25s, box-shadow 0.25s, background 0.25s; }
.ui-trigger:hover { background: var(--input-bg-focus); }
.ui-trigger:focus-visible, .ui-trigger[data-state='open'] { outline: none; background: var(--input-bg-focus); border-color: var(--blue); box-shadow: 0 0 0 4px rgb(207 170 99 / 0.18); }
.ui-chev { color: var(--mute); display: grid; transition: transform 0.35s var(--ease); flex: none; }
.ui-trigger[data-state='open'] .ui-chev { transform: rotate(180deg); }

.ui-pop { z-index: 400; min-width: var(--reka-select-trigger-width); max-height: min(320px, 60dvh, var(--reka-select-content-available-height, 60dvh)); overflow: hidden; border-radius: 16px; background: var(--surface); color: var(--fg); border: 1px solid var(--line-strong); box-shadow: 0 24px 60px rgb(0 0 0 / 0.35); transform-origin: var(--reka-select-content-transform-origin); }
/* animate only while open: an animation on the closed state would keep Reka's presence logic waiting and leave the popup mounted */
.ui-pop[data-state='open'] { animation: uiPop 0.22s var(--ease); }
.ui-vp { padding: 6px; overscroll-behavior: contain; }
.ui-item { position: relative; display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 11px 12px; border-radius: 11px; font-size: 15px; font-weight: 500; cursor: pointer; user-select: none; outline: none; color: var(--fg-2); transition: background 0.15s, color 0.15s; }
.ui-item[data-highlighted] { background: var(--chip-2); color: var(--fg); }
.ui-item[data-state='checked'] { color: var(--fg); }
.ui-check { color: var(--blue); display: grid; }
@keyframes uiPop { from { opacity: 0; transform: translateY(-6px) scale(0.97); } }
</style>
