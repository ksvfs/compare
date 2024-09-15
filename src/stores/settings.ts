import { ref, watch } from 'vue'
import { defineStore } from 'pinia'

import { useTextsStore } from './texts.ts'

export const useSettingsStore = defineStore('settings', () => {
  const texts = useTextsStore()

  const ignoreStopWords = ref(false)
  const currentMode = ref<'edit' | 'view'>('edit')

  watch(ignoreStopWords, () => {
    if (currentMode.value === 'view') {
      texts.compareTexts()
    }
  })

  return { currentMode, ignoreStopWords }
})
