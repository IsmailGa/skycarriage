<script setup lang="ts">
// One quote form for the whole page: every "Get a quote" button opens it in place instead of scrolling to the bottom.
import { DialogClose, DialogContent, DialogDescription, DialogOverlay, DialogPortal, DialogRoot } from 'reka-ui'

const { t } = useI18n()
const { open } = useQuote()

// pause smooth scroll behind the dialog
watch(open, (v) => {
  const l = getLenis()
  v ? l?.stop() : l?.start()
})
onBeforeUnmount(() => getLenis()?.start())
</script>

<template>
  <DialogRoot v-model:open="open">
    <DialogPortal>
      <DialogOverlay class="qd__overlay" />
      <DialogContent class="qd" data-lenis-prevent>
        <DialogDescription class="sr-only">{{ t('quote.lead') }}</DialogDescription>
        <DialogClose class="qd__x" :aria-label="t('a11y.closeDialog')"><AppIcon name="close" :size="20" :stroke="2" /></DialogClose>
        <QuoteForm dialog />
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>

<style>
.qd__overlay { position: fixed; inset: 0; z-index: 300; background: rgb(5 10 20 / 0.66); backdrop-filter: blur(6px); }
.qd__overlay[data-state='open'] { animation: qdFade 0.3s var(--ease); }
.qd { position: fixed; z-index: 310; left: 50%; top: 50%; translate: -50% -50%; width: min(600px, 100% - 24px); max-height: calc(100dvh - 24px); overflow-y: auto; overscroll-behavior: contain; padding: clamp(22px, 3vw, 36px); border-radius: var(--radius); background: var(--surface); color: var(--fg); border: 1px solid var(--line-strong); box-shadow: 0 40px 90px rgb(0 0 0 / 0.55); }
.qd[data-state='open'] { animation: qdIn 0.4s var(--ease); }
.qd:focus { outline: none; }
.qd__x { position: absolute; right: 14px; top: 14px; z-index: 2; width: 38px; height: 38px; display: grid; place-items: center; border-radius: 50%; color: var(--mute); transition: color 0.25s, background 0.25s; }
.qd__x:hover { color: var(--fg); background: var(--chip); }
.qd .q__top { padding-right: 44px; }
@keyframes qdFade { from { opacity: 0; } }
@keyframes qdIn { from { opacity: 0; transform: translateY(18px) scale(0.98); } }
/* phones: the form slides up as a bottom sheet */
@media (max-width: 640px) {
  .qd { left: 0; right: 0; top: auto; bottom: 0; translate: none; width: 100%; max-height: 92dvh; border-radius: 24px 24px 0 0; border-bottom: 0; }
  .qd[data-state='open'] { animation: qdSheet 0.4s var(--ease); }
}
@keyframes qdSheet { from { transform: translateY(100%); } }
@media (prefers-reduced-motion: reduce) { .qd[data-state='open'], .qd__overlay[data-state='open'] { animation: none; } }
</style>
