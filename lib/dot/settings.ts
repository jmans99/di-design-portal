/**
 * Switches for Dot's box (docs/design/dot-home.md). Turn a flag on to bring
 * the feature back; the code behind it is kept.
 */

/**
 * The "Use DI knowledge" switch in Dot's box (home and reply bar). Shown for a
 * proof-of-concept demo: it only sets useKnowledge in the brief (on by
 * default) and changes nothing else yet. Set to false to hide it again.
 */
export const showKnowledgeToggle = true

/**
 * Locks the "Use DI knowledge" switch: shown off, greyed out and not clickable.
 * While true, every place that reads useKnowledge gets false (see
 * resolveUseKnowledge), also when an old link carries knowledge on. Set to
 * false to make the switch work again; nothing else needs to change.
 */
export const knowledgeToggleDisabled = true

/** The value of useKnowledge to use: always off while the switch is disabled, else what was asked for. */
export const resolveUseKnowledge = (requested: boolean) => (knowledgeToggleDisabled ? false : requested)

/**
 * The deck demo, for testing only (docs/design/dot-home.md, "Deck demo
 * (testing)"). Shows "Create a deck (for testing purposes)" in the + More menu
 * and turns on /?demo=deck: Dot asks a few questions and shows a made-up deck
 * outline. Nothing real is made; the deck builder is still the external tool.
 * Set to false to hide the menu item and send /?demo=deck to the normal home.
 */
export const showDeckDemo = true
