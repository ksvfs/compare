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
const { currentMode, currentTheme, ignoreStopWords, lemmatize } = storeToRefs(settings)
const { toggleTheme } = settings

async function compareAndView() {
  await compareTexts()
  goToViewMode()
}
</script>

<template>
  <header>
    <div class="logo">
      <LogoIcon class="logo-icon" />
      <div class="logo-text">Сравнение текстов</div>
    </div>

    <div class="center-menu">
      <button
        class="compare-button"
        @click="compareAndView"
        :disabled="!text1.plain.trim() || !text2.plain.trim() || currentMode === 'view'"
      >
        Сравнить
      </button>

      <div class="checkbox-option">
        <label for="ignore-stop-words">Без стоп-слов</label>
        <input type="checkbox" id="ignore-stop-words" v-model="ignoreStopWords" />
      </div>

      <div class="checkbox-option">
        <label for="lemmatize">С лемматизацией</label>
        <input type="checkbox" id="lemmatize" v-model="lemmatize" />
      </div>
    </div>

    <button class="theme-toggle" @click="toggleTheme">
      <MoonIcon v-show="currentTheme === 'light'" />
      <SunIcon v-show="currentTheme === 'dark'" />
    </button>
  </header>
</template>

<style scoped lang="scss">
header {
  height: var(--header-height);
  padding-inline: 2rem;
  display: grid;
  grid-template-columns: 1fr max-content 1fr;
  background-color: var(--header-background-color);

  @media (width < 570px) {
    grid-template-columns: 1fr;
  }
}

.logo {
  display: flex;
  align-items: center;
  gap: 0.5rem;

  @media (width < 570px) {
    display: none;
  }

  &-icon {
    color: var(--accent-color);
  }

  &-text {
    font-weight: 700;
    color: var(--header-text-color);

    @media (width < 1200px) {
      display: none;
    }
  }
}

.center-menu {
  display: flex;
  align-items: center;
  gap: 1.5rem;

  @media (width < 570px) {
    padding: 1rem;
    flex-direction: column;
    gap: 0.5rem;
  }
}

.compare-button {
  border-radius: 0.5rem;
  padding: 0.4rem 0.7rem;
  background-color: var(--accent-color);
  color: var(--header-background-color);
  font-weight: 700;
  cursor: pointer;

  &:disabled {
    opacity: 60%;
    cursor: default;
  }
}

.checkbox-option {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--header-text-color);

  input[type='checkbox'] {
    height: 0.9rem;
    width: 0.9rem;
    margin-top: 0.1rem;
    accent-color: var(--accent-color);
  }
}

.theme-toggle {
  margin-left: auto;
  background-color: transparent;
  color: var(--header-text-color);
  cursor: pointer;

  @media (width < 570px) {
    display: none;
  }
}
</style>
