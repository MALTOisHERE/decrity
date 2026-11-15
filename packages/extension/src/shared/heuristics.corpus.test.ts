/**
 * Runs runHeuristicScan() against the documented prompt-injection corpus
 * (test-fixtures/injection-corpus.json, shared with ml-service's parallel
 * Python test). Each entry is either an attack example that must not score
 * as 'clean', or a "hard negative", legitimate text resembling an attack
 * that must stay 'clean'.
 */
import { describe, it, expect } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { runHeuristicScan } from './heuristics'

interface CorpusItem {
  text: string
  expect: 'catch' | 'clean'
}

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const corpusPath = path.resolve(__dirname, '../../../../test-fixtures/injection-corpus.json')
const corpus: { categories: Record<string, CorpusItem[]> } = JSON.parse(
  fs.readFileSync(corpusPath, 'utf8')
)

describe('runHeuristicScan against the documented injection corpus', () => {
  for (const [category, items] of Object.entries(corpus.categories)) {
    describe(category, () => {
      for (const item of items) {
        const label = item.text.length > 60 ? `${item.text.slice(0, 60)}...` : item.text
        it(`${item.expect === 'catch' ? 'flags' : 'leaves clean'}: "${label}"`, () => {
          const result = runHeuristicScan(item.text)
          if (item.expect === 'catch') {
            expect(result.verdict).not.toBe('clean')
          } else {
            expect(result.verdict).toBe('clean')
          }
        })
      }
    })
  }
})
