'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { Check } from 'lucide-react'
import { getSite } from '@/lib/site'

type Chip = {
  top?: string
  bottom?: string
  left?: string
  right?: string
  amp: number // float amplitude in px
  dur: number // float cycle duration in s
  rot: number // float tilt in deg
}

// Chip positions and motion; the labels come from the site config, so each
// site only names features it has.
const CHIP_LAYOUT: Chip[] = [
  { top: '14%', left: '6%', amp: 7, dur: 4.2, rot: 1.6 },
  { top: '64%', left: '3%', amp: 5, dur: 5.0, rot: -1.3 },
  { top: '22%', right: '5%', amp: 8, dur: 4.6, rot: 1.1 },
  { bottom: '12%', right: '8%', amp: 6, dur: 5.4, rot: -1.7 },
]

const CHIPS = CHIP_LAYOUT.map((chip, i) => ({ ...chip, label: getSite().home.showcaseChips[i] }))

const EASE_OUT = [0.16, 1, 0.3, 1] as const

export function Showcase() {
  const reduce = useReducedMotion()

  return (
    <section className="mx-auto max-w-6xl px-6 py-24">
      <div className="mx-auto mb-12 max-w-2xl text-center">
        <h2 className="font-heading text-[clamp(1.9rem,3.4vw,2.6rem)] font-medium leading-[1.1] tracking-[-0.03em] text-foreground text-balance">
          Grab it, paste it, move on
        </h2>
        <p className="mt-4 text-[15px] leading-relaxed text-muted-foreground">
          The asset is ready the moment you need it, so the work keeps moving.
        </p>
      </div>

      <div className="relative">
        <div className="overflow-hidden rounded-[28px] shadow-stripe-lg">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/home/showcase.jpg"
            alt="A hand holding a phone showing the live GigaMaps connectivity map, a laptop in the background"
            className="aspect-[16/9] w-full object-cover"
          />
        </div>

        {CHIPS.map((chip, i) => {
          const enterDelay = 0.25 + i * 0.13
          return (
            <motion.div
              key={chip.label}
              aria-hidden
              className="absolute hidden sm:block"
              style={{ top: chip.top, bottom: chip.bottom, left: chip.left, right: chip.right }}
              initial={reduce ? false : { opacity: 0, y: 16, scale: 0.92 }}
              whileInView={reduce ? undefined : { opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.6, ease: EASE_OUT, delay: enterDelay }}
            >
              {/* Continuous organic float, desynced per chip */}
              <motion.div
                className="will-change-transform"
                animate={reduce ? undefined : { y: [0, -chip.amp, 0], rotate: [0, chip.rot, 0] }}
                transition={{
                  duration: chip.dur,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: enterDelay + 0.5 + i * 0.35,
                }}
              >
                <div className="flex items-center gap-2 rounded-full border border-border bg-card/95 px-3.5 py-2 shadow-stripe-md backdrop-blur">
                  <span className="relative flex h-4 w-4 items-center justify-center">
                    {/* one-time arrival ping */}
                    <motion.span
                      className="absolute inset-0 rounded-full bg-primary-500"
                      initial={{ scale: 1, opacity: 0 }}
                      whileInView={reduce ? undefined : { scale: [1, 2.4], opacity: [0.5, 0] }}
                      viewport={{ once: true, margin: '-60px' }}
                      transition={{ duration: 1, ease: 'easeOut', delay: enterDelay + 0.12 }}
                    />
                    <span className="relative flex h-4 w-4 items-center justify-center rounded-full bg-primary-600">
                      <Check className="h-2.5 w-2.5 text-white" strokeWidth={3} />
                    </span>
                  </span>
                  <span className="text-[13px] font-medium text-foreground">{chip.label}</span>
                </div>
              </motion.div>
            </motion.div>
          )
        })}
      </div>
    </section>
  )
}
