import { ref } from 'vue'
import { defineStore } from 'pinia'

import { useSettingsStore } from './settings.ts'

import { charactersToIgnore } from '../data/charactersToIgnore.ts'
import { stopWordsRussian } from '../data/stopWordsRussian.ts'
import { stopWordsEnglish } from '../data/stopWordsEnglish.ts'

import type { Token } from '../types/types.ts'

type Text = {
  plain: string
  tokenized: Token[]
}

export const useTextsStore = defineStore('texts', () => {
  const settings = useSettingsStore()

  const text1 = ref<Text>({
    plain: '',
    tokenized: [],
  })

  const text2 = ref<Text>({
    plain: '',
    tokenized: [],
  })

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
      if (settings.ignoreStopWords) {
        const isStopWord = stopWordsRussian.has(token.core) || stopWordsEnglish.has(token.core)
        if (isStopWord) continue
      }

      if (token.core.trim() && set.has(token.core)) {
        token.highlight = true
      }
    }

    return tokens
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

    for (const tokenizedText of [text1.value.tokenized, text2.value.tokenized]) {
      for (const token of tokenizedText) {
        if (token.core === core && token.highlight) {
          token.bright = isBright
        }
      }
    }
  }

  function compareTexts(): void {
    const [text1TokenizedParagraphs, text1UniqueCores] = tokenizeText(text1.value.plain)
    const [text2TokenizedParagraphs, text2UniqueCores] = tokenizeText(text2.value.plain)

    const text1HighlightedTokens = highlightTokens(text1TokenizedParagraphs, text2UniqueCores)
    const text2HighlightedTokens = highlightTokens(text2TokenizedParagraphs, text1UniqueCores)

    text1.value.tokenized = text1HighlightedTokens
    text2.value.tokenized = text2HighlightedTokens
  }

  return { text1, text2, compareTexts, changeTokenBrightness }
})
