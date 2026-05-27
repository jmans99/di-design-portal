'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

type Step = { id: string; label: string; desc: string; href: string }

const STEPS: Step[] = [
  {
    id: 'logos',
    label: 'Logos',
    desc: 'Every variant and lockup, from the master mark to the UNICEF and ITU partnership, in SVG, PNG, and JPEG.',
    href: '/logos',
  },
  {
    id: 'colors',
    label: 'Colors',
    desc: 'Giga Blue and the full tonal scale, plus connectivity status colors, with tokens and usage rules.',
    href: '/colors',
  },
  {
    id: 'typography',
    label: 'Typography',
    desc: 'Manrope for headings, Open Sans for body, with the complete type scale already set.',
    href: '/typography',
  },
  {
    id: 'illustrations',
    label: 'Illustrations',
    desc: 'Pictograms in fill and outline, Giga Blue or white, drawn to a single consistent system.',
    href: '/illustrations',
  },
]

export function WorkflowList() {
  const [active, setActive] = useState(STEPS[0].id)

  return (
    <section className="mx-auto max-w-6xl px-6 py-24">
      <div className="max-w-2xl">
        <h2 className="font-heading text-[clamp(1.9rem,3.4vw,2.6rem)] font-semibold leading-[1.1] tracking-[-0.03em] text-foreground text-balance">
          Everything on brand, in seconds
        </h2>
        <p className="mt-4 text-[15px] leading-relaxed text-muted-foreground">
          The same building blocks the Giga design team works from, documented and
          ready for you to use.
        </p>
      </div>

      <div className="mt-12 grid items-center gap-12 lg:grid-cols-2">
        {/* Interactive list */}
        <ul className="flex flex-col">
          {STEPS.map((step, i) => {
            const open = active === step.id
            return (
              <li key={step.id} className="border-b border-border last:border-b-0">
                <button
                  type="button"
                  onClick={() => setActive(step.id)}
                  aria-expanded={open}
                  className="group flex w-full items-center gap-4 py-5 text-left"
                >
                  <span
                    className={`font-heading text-sm tabular-nums transition-colors ${
                      open ? 'text-primary-600' : 'text-muted-foreground/60'
                    }`}
                  >
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span
                    className={`font-heading text-xl font-semibold transition-colors ${
                      open ? 'text-foreground' : 'text-muted-foreground group-hover:text-foreground'
                    }`}
                  >
                    {step.label}
                  </span>
                </button>
                <div
                  className="grid transition-[grid-template-rows] duration-500 ease-out-expo"
                  style={{ gridTemplateRows: open ? '1fr' : '0fr' }}
                >
                  <div className="overflow-hidden">
                    <div className="pb-6 pl-10 pr-4">
                      <p className="text-[14px] leading-relaxed text-muted-foreground">
                        {step.desc}
                      </p>
                      <Link
                        href={step.href}
                        className="group/link mt-3 inline-flex items-center gap-1.5 text-[13px] font-semibold text-primary-600 transition-colors hover:text-primary-700"
                      >
                        Open {step.label}
                        <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover/link:translate-x-0.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              </li>
            )
          })}
        </ul>

        {/* Photo */}
        <div className="overflow-hidden rounded-3xl shadow-stripe-lg lg:order-last">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/home/workflow.jpg"
            alt="A communications team working with Giga assets on their laptops"
            className="aspect-[4/3] w-full object-cover"
          />
        </div>
      </div>
    </section>
  )
}
