<script setup lang="ts">
import { useTemplateRef, nextTick, onBeforeMount } from 'vue'
import { storeToRefs } from 'pinia'

import { useTextsStore } from './stores/texts.ts'
import { useSettingsStore } from './stores/settings.ts'

import MainHeader from './components/MainHeader.vue'
import ViewText from './components/ViewText.vue'

const texts = useTextsStore()
const { text1, text2, isProcessing } = storeToRefs(texts)

const settings = useSettingsStore()
const { currentMode } = storeToRefs(settings)
const { setInitialTheme } = settings

const text1Edit = useTemplateRef('text-1-edit')
const text2Edit = useTemplateRef('text-2-edit')

const text1View = useTemplateRef('text-1-view')
const text2View = useTemplateRef('text-2-view')

async function goToViewMode(): Promise<void> {
  currentMode.value = 'view'

  await nextTick()

  if (text1View.value && text2View.value) {
    text1View.value.$el.scrollTop = 0
    text2View.value.$el.scrollTop = 0
  }
}

async function goToEditMode(event: MouseEvent): Promise<void> {
  if (!text1View.value || !text2View.value || !text1Edit.value || !text2Edit.value) return

  const x = event.clientX
  const y = event.clientY

  const text1ScrollTop = text1View.value.$el.scrollTop
  const text2ScrollTop = text2View.value.$el.scrollTop

  currentMode.value = 'edit'

  await nextTick()

  const elementFromPoint = document.elementFromPoint(x, y)

  if (elementFromPoint?.tagName === 'TEXTAREA') {
    const textarea = elementFromPoint as HTMLTextAreaElement
    textarea.focus()
  }

  await nextTick()

  text1Edit.value.scrollTop = text1ScrollTop
  text2Edit.value.scrollTop = text2ScrollTop
}

onBeforeMount(setInitialTheme)
</script>

<template>
  <MainHeader :go-to-view-mode />

  <div v-show="currentMode === 'edit'" class="edit-container">
    <textarea
      v-model="text1.plain"
      placeholder="Вставьте первый текст"
      ref="text-1-edit"
      :disabled="isProcessing"
    ></textarea>

    <textarea
      v-model="text2.plain"
      placeholder="Вставьте второй текст"
      ref="text-2-edit"
      :disabled="isProcessing"
    ></textarea>
  </div>

  <div v-show="currentMode === 'view'" class="view-container">
    <ViewText
      v-show="currentMode === 'view'"
      ref="text-1-view"
      :tokens="text1.tokenized"
      :go-to-edit-mode
    />

    <ViewText
      v-show="currentMode === 'view'"
      ref="text-2-view"
      :tokens="text2.tokenized"
      :go-to-edit-mode
    />
  </div>
</template>

<style scoped lang="scss">
.edit-container,
.view-container {
  padding: var(--text-container-spacing);
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--text-container-spacing);
}

textarea {
  height: calc(100dvh - var(--header-height) - calc(var(--text-container-spacing) * 2));
  border: 1px solid var(--text-border-color);
  padding: var(--text-container-spacing);
  background-color: var(--text-background-color);
  color: var(--text-color);
  resize: none;
  line-height: 1.6;
  white-space: pre-line;
  scrollbar-width: thin;
  scrollbar-color: var(--scrollbar-thumb-color) var(--scrollbar-track-color);

  &:disabled {
    opacity: 50%;
  }

  &:focus {
    outline: 1px solid var(--text-outline-color);
  }

  @media (width < 570px) {
    font-size: 0.85rem;
  }

  &::placeholder {
    color: var(--text-placeholder-color);
  }
}
</style>
