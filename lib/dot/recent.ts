'use client'

import { useSyncExternalStore } from 'react'

/** One item started from Dot, shown under Recent in the side panel. */
export type RecentItem = {
  /** "Deck · Master deck". */
  label: string
  /** Where the item opens: the tool with the brief, or the finished conversation. */
  href: string
  /** Format colour, for the small square in the side panel. */
  color: string
}

const STORAGE_KEY = 'di-portal:dot-recent'
const CHANGE_EVENT = 'dot-recent-change'
const MAX_ITEMS = 3

const EMPTY: RecentItem[] = []

function readRaw(): string | null {
  try {
    return window.localStorage.getItem(STORAGE_KEY)
  } catch {
    return null
  }
}

function parse(raw: string | null): RecentItem[] {
  try {
    const items: unknown = raw ? JSON.parse(raw) : []
    if (!Array.isArray(items)) return EMPTY
    return items
      .filter((i): i is RecentItem => typeof i?.label === 'string' && typeof i?.href === 'string' && typeof i?.color === 'string')
      .slice(0, MAX_ITEMS)
  } catch {
    return EMPTY
  }
}

/** Recent items, newest first. Empty when storage is unavailable or holds something unexpected. */
export function readRecent(): RecentItem[] {
  return parse(readRaw())
}

/** Adds an item at the top (an existing item with the same link moves up) and keeps the last three. */
export function addRecent(item: RecentItem) {
  const items = [item, ...readRecent().filter((i) => i.href !== item.href)].slice(0, MAX_ITEMS)
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  } catch {
    // Storage blocked (private window, quota): Recent just stays as it was.
  }
  window.dispatchEvent(new Event(CHANGE_EVENT))
}

function subscribe(onChange: () => void) {
  window.addEventListener(CHANGE_EVENT, onChange)
  window.addEventListener('storage', onChange)
  return () => {
    window.removeEventListener(CHANGE_EVENT, onChange)
    window.removeEventListener('storage', onChange)
  }
}

// useSyncExternalStore needs the same array back while storage is unchanged.
let cachedRaw: string | null = null
let cachedItems: RecentItem[] = EMPTY
function getSnapshot(): RecentItem[] {
  const raw = readRaw()
  if (raw !== cachedRaw) {
    cachedRaw = raw
    cachedItems = parse(raw)
  }
  return cachedItems
}

/** Recent items, kept in sync with this tab and other tabs. Empty on the server. */
export function useRecent(): RecentItem[] {
  return useSyncExternalStore(subscribe, getSnapshot, () => EMPTY)
}
