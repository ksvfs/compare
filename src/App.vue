<script setup lang="ts">
import { ref, nextTick, useTemplateRef } from 'vue'

import ViewText from './components/ViewText.vue'

import charactersToIgnore from './data/charactersToIgnore.ts'

import type { Token, Data } from './types/types.ts'

const data = ref<Data>({
  text1: {
    plain: '',
    tokenized: [],
  },
  text2: {
    plain: '',
    tokenized: [],
  },
})

const currentMode = ref<'edit' | 'view'>('edit')

const text1Edit = useTemplateRef('text-1-edit')
const text2Edit = useTemplateRef('text-2-edit')

const text1View = useTemplateRef('text-1-view')
const text2View = useTemplateRef('text-2-view')

function getContentFromChunk(chunk: string): string {
  return chunk
    .toLowerCase()
    .split('')
    .filter((char) => !charactersToIgnore.has(char))
    .join('')
}

function tokenizeParagraph(paragraph: string): Token[] {
  const chunks = paragraph.split(/(\s+)/)

  const tokenizedParagraph = chunks.map((chunk, index, array) => ({
    chunk,
    core: getContentFromChunk(chunk),
    highlight: false,
    bright: false,
    endOfLine: index === array.length - 1,
  }))

  return tokenizedParagraph
}

function tokenizeText(text: string): [Token[][], Set<string>] {
  const paragraphs = text.split(/\r?\n/)
  const tokenizedParagraphs = paragraphs.map(tokenizeParagraph)
  const cores = tokenizedParagraphs.flatMap((paragraph) => paragraph.map((token) => token.core))
  const uniqueCores = new Set(cores)
  return [tokenizedParagraphs, uniqueCores]
}

function highlightTokens(tokenizedParagraphs: Token[][], set: Set<string>): Token[] {
  const tokens = tokenizedParagraphs.flat()

  for (const token of tokens) {
    if (token.core.trim() && set.has(token.core)) {
      token.highlight = true
    }
  }

  return tokens
}

function compareTexts(): void {
  const [text1TokenizedParagraphs, text1UniqueCores] = tokenizeText(data.value.text1.plain)
  const [text2TokenizedParagraphs, text2UniqueCores] = tokenizeText(data.value.text2.plain)

  const text1HighlightedTokens = highlightTokens(text1TokenizedParagraphs, text2UniqueCores)
  const text2HighlightedTokens = highlightTokens(text2TokenizedParagraphs, text1UniqueCores)

  data.value.text1.tokenized = text1HighlightedTokens
  data.value.text2.tokenized = text2HighlightedTokens

  goToViewMode()
}

function changeTokenBrightness(core: string, event: MouseEvent): void {
  if (!core.trim()) return

  let isBright: boolean

  if (event.type === 'mouseenter') {
    isBright = true
  } else if (event.type === 'mouseleave') {
    isBright = false
  } else {
    throw new Error('changeTokenBrightness поддерживает только события mouseenter и mouseleave')
  }

  for (const tokenizedText of [data.value.text1.tokenized, data.value.text2.tokenized]) {
    for (const token of tokenizedText) {
      if (token.core === core && token.highlight) {
        token.bright = isBright
      }
    }
  }
}

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
    ;(elementFromPoint as HTMLTextAreaElement).focus()
  }

  await nextTick()

  text1Edit.value.scrollTop = text1ScrollTop
  text2Edit.value.scrollTop = text2ScrollTop
}
</script>

<template>
  <header>
    <button
      @click="compareTexts"
      :disabled="!data.text1.plain.trim() || !data.text2.plain.trim() || currentMode === 'view'"
    >
      Сравнить тексты
    </button>
  </header>

  <div v-show="currentMode === 'edit'" class="edit-container">
    <textarea
      v-model="data.text1.plain"
      placeholder="Вставьте первый текст"
      ref="text-1-edit"
    ></textarea>

    <textarea
      v-model="data.text2.plain"
      placeholder="Вставьте второй текст"
      ref="text-2-edit"
    ></textarea>
  </div>

  <div v-show="currentMode === 'view'" class="view-container">
    <ViewText
      v-show="currentMode === 'view'"
      ref="text-1-view"
      :tokens="data.text1.tokenized"
      :go-to-edit-mode="goToEditMode"
      :change-brightness="changeTokenBrightness"
    />

    <ViewText
      v-show="currentMode === 'view'"
      ref="text-2-view"
      :tokens="data.text2.tokenized"
      :go-to-edit-mode="goToEditMode"
      :change-brightness="changeTokenBrightness"
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
