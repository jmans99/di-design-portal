// Unit tests for the checks around Dot's AI reply. Run with `npm test`.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { MAX_MESSAGES, MAX_MESSAGE_LENGTH, parseAiResult, parseMessages } from './ai.ts'

test('parseMessages keeps a valid chat and trims it', () => {
  assert.deepEqual(parseMessages([{ role: 'user', content: '  hello  ' }]), [{ role: 'user', content: 'hello' }])
  const long = parseMessages([{ role: 'user', content: 'x'.repeat(5000) }])
  assert.equal(long[0].content.length, MAX_MESSAGE_LENGTH)
  const many = Array.from({ length: 40 }, (_, i) => ({ role: i % 2 ? 'user' : 'assistant', content: `m${i}` }))
  assert.equal(parseMessages(many).length, MAX_MESSAGES)
})

test('parseMessages rejects anything that is not a chat ending with the user', () => {
  for (const bad of [null, 'hi', [], [{ role: 'system', content: 'x' }], [{ role: 'user', content: '   ' }], [{ role: 'user' }], [{ role: 'assistant', content: 'x' }]]) {
    assert.equal(parseMessages(bad), null, JSON.stringify(bad))
  }
})

test('parseAiResult accepts the three actions', () => {
  assert.deepEqual(parseAiResult({ action: 'create', format: 'deck', query: null, reply: null, links: [] }), { action: 'create', format: 'deck' })
  assert.deepEqual(parseAiResult({ action: 'search', format: null, query: ' white DI logo ', reply: null, links: [] }), { action: 'search', query: 'white DI logo' })
  assert.deepEqual(parseAiResult({ action: 'answer', format: null, query: null, reply: 'Manrope.', links: ['typography', 'typography', 'nope'] }), {
    action: 'answer',
    reply: 'Manrope.',
    links: [{ label: 'Typography', href: '/typography' }],
  })
})

test('parseAiResult rejects incomplete or unknown results', () => {
  for (const bad of [null, {}, { action: 'create', format: 'poster' }, { action: 'search', query: ' ' }, { action: 'answer', reply: '' }, { action: 'delete' }]) {
    assert.equal(parseAiResult(bad), null, JSON.stringify(bad))
  }
})

test('parseAiResult never passes a link the model made up', () => {
  const result = parseAiResult({ action: 'answer', reply: 'ok', links: ['https://evil.example', 'logos', 'colors', 'typography', 'photo-awards'] })
  assert.deepEqual(result.links.map((l) => l.href), ['/logos', '/colors', '/typography'])
})
