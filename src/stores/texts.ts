import { ref } from 'vue'
import { defineStore } from 'pinia'

import { useSettingsStore } from './settings.ts'

import { charactersToIgnore } from '../data/charactersToIgnore.ts'
import { stopWordsRussian } from '../data/stopWordsRussian.ts'
import { stopWordsEnglish } from '../data/stopWordsEnglish.ts'

export type Token = {
  chunk: string
  core: string
  endOfLine: boolean
  highlight: boolean
  bright: boolean
}

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

  function getCoreFromChunk(chunk: string): string {
    return chunk
      .toLowerCase()
      .split('')
      .filter((char) => !charactersToIgnore.has(char))
      .join('')
  }

  function highlightTokens(tokens: Token[], set: Set<string>): Token[] {
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

  async function tokenizeTexts(
    text1: string,
    text2: string,
  ): Promise<[Token[], Set<string>, Token[], Set<string>]> {
    const text1Paragraphs = text1.split(/\r?\n/)
    const text2Paragraphs = text2.split(/\r?\n/)

    const text1ChunkedParagraphs = text1Paragraphs.map((paragraph) => paragraph.split(/(\s+)/))
    const text2ChunkedParagraphs = text2Paragraphs.map((paragraph) => paragraph.split(/(\s+)/))

    const text1PreprocessedParagraphs = text1ChunkedParagraphs.map((paragraph) => {
      return paragraph.map((chunk, index, array) => {
        return {
          chunk,
          core: getCoreFromChunk(chunk),
          endOfLine: index === array.length - 1,
        }
      })
    })

    const text2PreprocessedParagraphs = text2ChunkedParagraphs.map((paragraph) => {
      return paragraph.map((chunk, index, array) => {
        return {
          chunk,
          core: getCoreFromChunk(chunk),
          endOfLine: index === array.length - 1,
        }
      })
    })

    let text1HalfTokens = text1PreprocessedParagraphs.flat()
    let text2HalfTokens = text2PreprocessedParagraphs.flat()

    if (settings.lemmatize) {
      try {
        const response = await fetch('https://compare-server-pied.vercel.app/lemmatize', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ text1: text1HalfTokens, text2: text2HalfTokens }),
        })

        if (!response.ok) throw new Error()

        const data = await response.json()

        text1HalfTokens = data.text1
        text2HalfTokens = data.text2
      } catch {
        alert('Лемматизации не будет, сервер сломался')
      }
    }

    const text1Tokens = text1HalfTokens.map((halfToken) => ({
      ...halfToken,
      highlight: false,
      bright: false,
    }))

    const text2Tokens = text2HalfTokens.map((halfToken) => ({
      ...halfToken,
      highlight: false,
      bright: false,
    }))

    const text1UniqueCores = new Set(text1Tokens.map((token) => token.core))
    const text2UniqueCores = new Set(text2Tokens.map((token) => token.core))

    return [text1Tokens, text1UniqueCores, text2Tokens, text2UniqueCores]
  }

  async function compareTexts(): Promise<void> {
    const [text1Tokens, text1UniqueCores, text2Tokens, text2UniqueCores] = await tokenizeTexts(
      text1.value.plain,
      text2.value.plain,
    )

    const text1HighlightedTokens = highlightTokens(text1Tokens, text2UniqueCores)
    const text2HighlightedTokens = highlightTokens(text2Tokens, text1UniqueCores)

    text1.value.tokenized = text1HighlightedTokens
    text2.value.tokenized = text2HighlightedTokens
  }

  return { text1, text2, compareTexts, changeTokenBrightness }
})
