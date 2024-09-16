import { ref, watch } from 'vue'
import { defineStore } from 'pinia'

import { useTextsStore } from './texts.ts'

export const useSettingsStore = defineStore('settings', () => {
  const texts = useTextsStore()

  const currentMode = ref<'edit' | 'view'>('edit')
  const currentTheme = ref<'light' | 'dark'>('light')
  const ignoreStopWords = ref(false)
  const lemmatize = ref(false)

  watch([ignoreStopWords, lemmatize], () => {
    if (currentMode.value === 'view') {
      texts.compareTexts()
    }
  })

  function setInitialTheme() {
    const localTheme = localStorage.getItem('theme')

    const isValidTheme = localTheme === 'light' || localTheme === 'dark'

    if (isValidTheme) {
      currentTheme.value = localTheme
    } else {
      localStorage.setItem('theme', currentTheme.value)
    }

    document.body.classList.add(currentTheme.value)
  }

  function toggleTheme() {
    const containsLight = document.body.classList.contains('light')
    const containsDark = document.body.classList.contains('dark')

    if (!containsDark && !containsLight) {
      throw new Error('У body нет класса темы')
    }

    if (containsDark && containsLight) {
      throw new Error('У body два класса темы одновременно')
    }

    const oldTheme = containsLight ? 'light' : 'dark'
    const newTheme = containsLight ? 'dark' : 'light'

    document.body.classList.replace(oldTheme, newTheme)
    currentTheme.value = newTheme
    localStorage.setItem('theme', newTheme)
  }

  return { currentMode, currentTheme, ignoreStopWords, lemmatize, setInitialTheme, toggleTheme }
})
