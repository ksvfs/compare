<script setup lang="ts">
import { storeToRefs } from 'pinia'

import { useTextsStore } from '../stores/texts.ts'
import { useSettingsStore } from '../stores/settings.ts'

import LogoIcon from '../icons/LogoIcon.vue'
import SunIcon from '../icons/SunIcon.vue'
import MoonIcon from '../icons/MoonIcon.vue'

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
    <div class="logo">
      <LogoIcon class="logo-icon" />
      <div class="logo-text">Сравнение текстов</div>
    </div>

    <div>
      <button
        class="compare-button"
        @click="compareAndView"
        :disabled="!text1.plain.trim() || !text2.plain.trim() || currentMode === 'view'"
      >
        Сравнить
      </button>
    </div>

    <div>
      <label for="ignore-stop-words">Без стоп-слов</label>
      <input type="checkbox" id="ignore-stop-words" v-model="ignoreStopWords" />
    </div>

    <button class="theme-switch">
      <MoonIcon />
    </button>
  </header>
</template>

<style scoped lang="scss">
header {
  height: var(--header-height);
  padding-inline: 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #1a1a1a;
}

.logo {
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &-icon {
    color: #42b883;
  }

  &-text {
    font-weight: 700;
    color: #ffffff;
  }
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

.theme-switch {
  background-color: transparent;
  color: #ffffff;
  cursor: pointer;
}
</style>
