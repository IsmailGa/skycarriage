<script setup lang="ts">
// Airport picker: free text + grouped suggestions. Built on Reka UI primitives (the layer shadcn-vue uses), styled with site tokens.
import { AutocompleteAnchor, AutocompleteContent, AutocompleteGroup, AutocompleteInput, AutocompleteItem, AutocompleteLabel, AutocompletePortal, AutocompleteRoot, AutocompleteViewport } from 'reka-ui'
import type { RouteGroup, RouteOption } from '~/composables/useRoutePicker'

const props = defineProps<{ groups: RouteGroup[]; placeholder?: string; invalid?: boolean; emptyText: string; clearLabel: string }>()
const emit = defineEmits<{ pick: [option: RouteOption] }>()
const model = defineModel<string>({ required: true })

const open = ref(false)
const input = ref<{ $el: HTMLInputElement } | null>(null)
const el = () => (input.value?.$el ?? null) as HTMLInputElement | null

// Filter on what was typed. If the field already holds a full option, show everything again so the user can switch easily.
const visible = computed(() => {
  const q = model.value.trim().toLowerCase()
  const exact = props.groups.some((g) => g.items.some((o) => o.label === model.value))
  if (!q || exact) return props.groups
  return props.groups
    .map((g) => ({ ...g, items: g.items.filter((o) => o.label.toLowerCase().includes(q)).slice(0, 8) }))
    .filter((g) => g.items.length)
})

function onPick(o: RouteOption) {
  model.value = o.label
  open.value = false
  emit('pick', o)
}
function clear() {
  model.value = ''
  el()?.focus()
  open.value = true
}
defineExpose({ focus: () => { el()?.focus(); open.value = true } })
</script>

<template>
  <AutocompleteRoot v-model="model" v-model:open="open" ignore-filter open-on-focus open-on-click>
    <AutocompleteAnchor class="ui-ac">
      <AutocompleteInput ref="input" class="ui-ac__in" :placeholder="placeholder" :aria-invalid="invalid || undefined" autocomplete="off" @focus="open = true" />
      <button v-if="model" type="button" class="ui-ac__x" :aria-label="clearLabel" tabindex="-1" @mousedown.prevent @click="clear"><AppIcon name="close" :size="15" :stroke="2.2" /></button>
      <AppIcon v-else name="plane" :size="16" :stroke="2" class="ui-ac__ic" />
    </AutocompleteAnchor>
    <AutocompletePortal>
      <AutocompleteContent class="ui-pop ui-ac__pop" data-lenis-prevent position="popper" :side-offset="8" :collision-padding="12" @open-auto-focus.prevent>
        <AutocompleteViewport class="ui-vp">
          <AutocompleteGroup v-for="g in visible" :key="g.label" class="ui-ac__grp">
            <AutocompleteLabel class="ui-ac__lbl">{{ g.label }}</AutocompleteLabel>
            <AutocompleteItem v-for="o in g.items" :key="o.code" :value="o.label" class="ui-item" @select="onPick(o)">
              <span class="ui-ac__code">{{ o.code }}</span>
              <span class="ui-ac__name"><b>{{ o.city }}</b><small>{{ o.country }}</small></span>
              <span v-if="o.meta" class="ui-ac__meta">{{ o.meta }}</span>
            </AutocompleteItem>
          </AutocompleteGroup>
          <p v-if="!visible.length" class="ui-ac__empty">{{ emptyText }}</p>
        </AutocompleteViewport>
      </AutocompleteContent>
    </AutocompletePortal>
  </AutocompleteRoot>
</template>

<style>
.ui-ac { position: relative; display: block; width: 100%; }
.ui-ac__in { width: 100%; min-width: 0; padding: 14px 42px 14px 15px; border-radius: 14px; background: var(--input-bg); border: 1px solid var(--input-line); font-weight: 500; font-size: 16px; color: var(--fg); transition: border-color 0.25s, box-shadow 0.25s, background 0.25s; }
.ui-ac__in::placeholder { color: var(--mute); opacity: 0.95; font-weight: 400; }
.ui-ac__in:focus { outline: none; background: var(--input-bg-focus); border-color: var(--blue); box-shadow: 0 0 0 4px rgb(207 170 99 / 0.18); }
.ui-ac__in[aria-invalid='true'] { border-color: var(--err); background: var(--err-bg); }
.ui-ac__ic { position: absolute; right: 14px; top: 50%; transform: translateY(-50%) rotate(45deg); color: var(--mute); pointer-events: none; }
.ui-ac__x { position: absolute; right: 8px; top: 50%; width: 30px; height: 30px; margin-top: -15px; border-radius: 50%; display: grid; place-items: center; color: var(--mute); transition: background 0.2s, color 0.2s; }
.ui-ac__x:hover { background: var(--chip-2); color: var(--fg); }

.ui-ac__pop { min-width: max(var(--reka-popper-anchor-width), 280px); max-height: min(380px, 60dvh, var(--reka-popper-available-height, 60dvh)); display: flex; flex-direction: column; overflow: hidden; }
/* the viewport is the scroll container; contain keeps wheel/touch from chaining to the page */
.ui-ac__pop .ui-vp { padding: 6px 6px 8px; flex: 1; min-height: 0; overflow-y: auto; overscroll-behavior: contain; scrollbar-width: thin; }
.ui-ac__lbl { display: block; padding: 10px 12px 6px; font-size: 11px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: var(--mute); }
.ui-ac__grp + .ui-ac__grp { margin-top: 4px; border-top: 1px solid var(--line); }
.ui-ac__pop .ui-item { justify-content: flex-start; gap: 12px; }
.ui-ac__code { flex: none; min-width: 44px; padding: 4px 8px; border-radius: 8px; font-size: 12px; font-weight: 600; letter-spacing: 0.06em; text-align: center; background: var(--accent-soft); color: var(--accent-text); }
.ui-ac__name { flex: 1; min-width: 0; display: grid; line-height: 1.25; }
.ui-ac__name b { font-weight: 600; font-size: 15px; color: var(--fg); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.ui-ac__name small { font-size: 12.5px; color: var(--mute); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.ui-ac__meta { flex: none; font-size: 12.5px; color: var(--mute); font-variant-numeric: tabular-nums; }
.ui-ac__empty { padding: 18px 12px; text-align: center; font-size: 14px; color: var(--mute); }
</style>
