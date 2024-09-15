<script setup lang="ts">
import { ref, nextTick, useTemplateRef } from 'vue'
import { storeToRefs } from 'pinia'
import { useTextsStore } from './stores/texts.ts'
import ViewText from './components/ViewText.vue'

const texts = useTextsStore()
const { text1, text2 } = storeToRefs(texts)
const { compareTexts } = texts

const currentMode = ref<'edit' | 'view'>('edit')

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
</script>

<template>
  <header>
    <button
      @click="
        () => {
          compareTexts()
          goToViewMode()
        }
      "
      :disabled="!text1.plain.trim() || !text2.plain.trim() || currentMode === 'view'"
    >
      Сравнить тексты
    </button>
  </header>

  <div v-show="currentMode === 'edit'" class="edit-container">
    <textarea
      v-model="text1.plain"
      placeholder="Вставьте первый текст"
      ref="text-1-edit"
    ></textarea>

    <textarea
      v-model="text2.plain"
      placeholder="Вставьте второй текст"
      ref="text-2-edit"
    ></textarea>
  </div>

  <div v-show="currentMode === 'view'" class="view-container">
    <ViewText
      v-show="currentMode === 'view'"
      ref="text-1-view"
      :tokens="text1.tokenized"
      :go-to-edit-mode="goToEditMode"
    />

    <ViewText
      v-show="currentMode === 'view'"
      ref="text-2-view"
      :tokens="text2.tokenized"
      :go-to-edit-mode="goToEditMode"
    />
  </div>
</template>

<style scoped lang="scss">
header {
  height: var(--header-height);
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  background-color: #1a1a1a;

  button {
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
}

.edit-container,
.view-container {
  padding: var(--text-container-spacing);
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--text-container-spacing);
}

textarea {
  height: calc(100dvh - var(--header-height) - calc(var(--text-container-spacing) * 2));
  border: 1px solid #000000;
  padding: var(--text-container-spacing);
  resize: none;
  white-space: pre-line;
}
</style>
