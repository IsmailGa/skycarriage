<script setup lang="ts">
// Renders a heading split into lines (from i18n arrays) joined with <br>, so each language controls its own line breaks.
defineProps<{ lines: readonly string[] }>()
</script>

<template><template v-for="(l, i) in lines" :key="i">{{ l }}<br v-if="i < lines.length - 1" /></template></template>
