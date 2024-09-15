<script setup lang="ts">
import { storeToRefs } from 'pinia'

import { useTextsStore } from '../stores/texts.ts'
import { useSettingsStore } from '../stores/settings.ts'

const { goToViewMode } = defineProps<{
  goToViewMode: () => void
}>()

const texts = useTextsStore()
const { text1, text2 } = storeToRefs(texts)
const { compareTexts } = texts

const settings = useSettingsStore()
const { currentMode, ignoreStopWords } = storeToRefs(settings)

function compareAndView() {
  compareTexts()
  goToViewMode()
}
</script>

<template>
  <header>
    <button
      class="compare-button"
      @click="compareAndView"
      :disabled="!text1.plain.trim() || !text2.plain.trim() || currentMode === 'view'"
    >
      Сравнить тексты
    </button>

    <div>
      <label for="ignore-stop-words">Без стоп-слов</label>
      <input type="checkbox" id="ignore-stop-words" v-model="ignoreStopWords" />
    </div>
  </header>
</template>

<style scoped lang="scss">
header {
  height: var(--header-height);
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  background-color: #1a1a1a;
}

.compare-button {
  border-radius: 0.5rem;
  padding: 0.4rem 0.7rem;
  background-color: #42b883;
  color: #213547;
  font-weight: 700;
  cursor: pointer;

  &:disabled {
    opacity: 0.5;
  }
}
</style>
