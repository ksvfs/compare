<script setup lang="ts">
import { useTextsStore } from '../stores/texts.ts'
import type { Token } from '../types/types.ts'

defineProps<{
  tokens: Token[]
  goToEditMode: (event: MouseEvent) => void
}>()

const { changeTokenBrightness } = useTextsStore()
</script>

<template>
  <div class="view" @click="goToEditMode">
    <span v-for="token in tokens">
      <span
        :class="{ highlight: token.highlight, bright: token.bright }"
        @mouseenter="changeTokenBrightness(token.core, $event)"
        @mouseleave="changeTokenBrightness(token.core, $event)"
        >{{ token.chunk }}</span
      >
      <br v-if="token.endOfLine" />
    </span>
  </div>
</template>

<style scoped lang="scss">
.view {
  height: calc(100dvh - var(--header-height) - calc(var(--text-container-spacing) * 2));
  overflow-y: auto;
  border: 1px solid var(--text-border-color);
  padding: var(--text-container-spacing);
  background-color: var(--text-background-color);
  color: var(--text-color);
  line-height: 1.6;
  word-break: break-word;
  white-space: pre-wrap;

  @media (width < 570px) {
    font-size: 0.9rem;
  }
}

.highlight {
  background-color: var(--highlight-color-pale);
}

.bright {
  background-color: var(--highlight-color-bright);
  color: var(--text-color-hover);
}
</style>
