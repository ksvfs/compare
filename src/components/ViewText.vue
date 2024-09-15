<script setup lang="ts">
import type { Token } from "../types/types.ts";

defineProps<{
  tokens: Token[];
  goToEditMode: (event: MouseEvent) => void;
  changeBrightness: (core: string, event: MouseEvent) => void;
}>();
</script>

<template>
  <div class="view" @click="goToEditMode">
    <span v-for="token in tokens">
      <span
        :class="{ highlight: token.highlight, bright: token.bright }"
        @mouseenter="changeBrightness(token.core, $event)"
        @mouseleave="changeBrightness(token.core, $event)"
        >{{ token.chunk }}</span
      >
      <br v-if="token.endOfLine" />
    </span>
  </div>
</template>

<style scoped lang="scss">
.view {
  height: calc(
    100dvh - var(--header-height) - calc(var(--text-container-spacing) * 2)
  );
  overflow-y: auto;
  border: 1px solid #000000;
  padding: var(--text-container-spacing);
  word-break: break-word;
}

.highlight {
  background-color: #b9f8db;
}

.bright {
  background-color: #42b883;
}
</style>
