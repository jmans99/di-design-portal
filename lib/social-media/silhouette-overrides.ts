// Override hand-curated per paesi mancanti o quirky in world-atlas (es. Kosovo,
// Western Sahara, territori contesi). Vuoto inizialmente: aggiungere solo quando
// la verifica visiva mostra che la pipeline d3-geo non produce un risultato accettabile.
//
// Formato: alpha2 (lowercase) -> stringa "d" SVG, gia' fittata alla viewbox 1000x730.

export const SILHOUETTE_OVERRIDES: Record<string, string> = {}
