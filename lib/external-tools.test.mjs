// Decks and two-pagers open the external builder; the in-portal flow and the DI Master deck are switched off.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { EXTERNAL_TOOLS, externalLinkLabel, externalToolFor, inPortalDeckFlow, masterDeckAvailable } from './external-tools.ts'

test('deck and two-pager open the deck builder; other formats stay in the portal', () => {
  assert.equal(EXTERNAL_TOOLS.deck, 'https://un-deck-builder.vercel.app/')
  assert.equal(EXTERNAL_TOOLS.twoPager, 'https://un-deck-builder.vercel.app/')
  assert.equal(inPortalDeckFlow, false)
  assert.equal(masterDeckAvailable, false)
  assert.equal(externalToolFor('deck'), EXTERNAL_TOOLS.deck)
  assert.equal(externalToolFor('two-pager'), EXTERNAL_TOOLS.twoPager)
  for (const type of ['map', 'social-post', 'engagement-map', 'background', 'email-signature']) assert.equal(externalToolFor(type), null)
  assert.equal(externalLinkLabel('Create a deck'), 'Create a deck (opens the deck builder in a new tab)')
})
