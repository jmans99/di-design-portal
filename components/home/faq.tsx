'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Plus, ArrowRight } from 'lucide-react'

type Item = { q: string; a: string }

const ITEMS: Item[] = [
  {
    q: 'Can I put the Giga logo on a dark background?',
    a: 'Use the white logo on Giga Blue or over imagery. Keep solid black backgrounds for Giga Maps only, everywhere else stays on brand without them.',
  },
  {
    q: 'Which fonts does Giga use?',
    a: 'Manrope for headings and Open Sans for body. The full type scale is set up for you on the Typography page.',
  },
  {
    q: 'Where do the brand colors come from?',
    a: 'Giga Blue (#277AFF) leads, with a complete tonal scale and the connectivity status colors. Tokens and usage rules live on the Colors page.',
  },
  {
    q: 'How do I install the AI Skills?',
    a: 'Each skill ships with a one-click install guide on the AI Skills page, so it works on your AI platform straight away.',
  },
  {
    q: 'Who can use these assets?',
    a: 'Authorized Giga, UNICEF, ITU, and partner teams. The goal is simple: zero off-brand assets in the wild.',
  },
]

export function Faq() {
  const [open, setOpen] = useState(0)

  return (
    <section className="mx-auto max-w-6xl px-6 py-24">
      <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.18em] text-primary-600">
            Good to know
          </p>
          <h2 className="font-heading text-[clamp(1.9rem,3.4vw,2.6rem)] font-medium leading-[1.1] tracking-[-0.03em] text-foreground text-balance">
            Brand questions, answered
          </h2>
          <p className="mt-4 max-w-sm text-[15px] leading-relaxed text-muted-foreground">
            The rules that keep everything consistent, in plain terms.
          </p>
          <Link
            href="/colors"
            className="group mt-6 inline-flex h-11 items-center gap-2 rounded-full bg-primary-600 px-6 text-[14px] font-semibold text-white shadow-stripe transition-smooth hover:bg-primary-700 active:scale-[0.98]"
          >
            Read the guidelines
            <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
          </Link>
        </div>

        <ul className="flex flex-col divide-y divide-border border-y border-border">
          {ITEMS.map((item, i) => {
            const isOpen = open === i
            return (
              <li key={item.q}>
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? -1 : i)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between gap-4 py-5 text-left"
                >
                  <span className="font-heading text-[17px] font-medium text-foreground">
                    {item.q}
                  </span>
                  <Plus
                    className={`h-5 w-5 shrink-0 text-primary-600 transition-transform duration-300 ${
                      isOpen ? 'rotate-45' : ''
                    }`}
                  />
                </button>
                <div
                  className="grid transition-[grid-template-rows] duration-500 ease-out-expo"
                  style={{ gridTemplateRows: isOpen ? '1fr' : '0fr' }}
                >
                  <div className="overflow-hidden">
                    <p className="max-w-prose pb-5 pr-8 text-[14px] leading-relaxed text-muted-foreground">
                      {item.a}
                    </p>
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
