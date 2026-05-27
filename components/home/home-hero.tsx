'use client'

import Link from 'next/link'
import { motion, useReducedMotion, type Variants } from 'framer-motion'
import { ArrowRight, Sparkles } from 'lucide-react'

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.08 } },
}
const item: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } },
}

export function HomeHero() {
  const reduce = useReducedMotion()

  return (
    <section
      className="relative isolate flex min-h-[92vh] items-center overflow-hidden"
      style={{ width: '100vw', marginLeft: 'calc(-50vw + 50%)', marginTop: 'calc(-4.5rem - 1px)' }}
    >
      {/* Background: teaser video, with the photo as poster and reduced-motion fallback */}
      {reduce ? (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src="/home/hero.jpg"
          alt="Schoolchildren in uniform gathered around tablets in their connected classroom"
          className="absolute inset-0 -z-10 h-full w-full object-cover object-center"
        />
      ) : (
        <video
          className="absolute inset-0 -z-10 h-full w-full object-cover object-center"
          autoPlay
          loop
          muted
          playsInline
          poster="/home/hero.jpg"
          aria-label="Schoolchildren in uniform using tablets in their connected classroom"
        >
          <source src="/home/hero.mp4" type="video/mp4" />
        </video>
      )}

      {/* Neutral dark scrim for legibility (no color cast) */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10"
        style={{
          background:
            'linear-gradient(180deg, rgba(10,10,12,0.58) 0%, rgba(10,10,12,0.26) 40%, rgba(10,10,12,0.56) 100%)',
        }}
      />
      {/* Extra darken at the very top so the transparent header stays legible */}
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 -z-10 h-28"
        style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.42) 0%, rgba(0,0,0,0) 100%)' }}
      />
      <motion.div
        variants={container}
        initial={reduce ? false : 'hidden'}
        animate={reduce ? undefined : 'show'}
        className="relative mx-auto w-full max-w-6xl px-6 py-24 text-center"
      >
        <motion.h1
          variants={item}
          className="font-heading mx-auto max-w-4xl text-[clamp(2.6rem,6.4vw,4.75rem)] font-semibold leading-[1.02] tracking-[-0.04em] text-white text-balance"
        >
          Every Giga asset, in one place
        </motion.h1>

        <motion.p
          variants={item}
          className="mx-auto mt-6 max-w-xl text-[17px] leading-relaxed text-white/85"
        >
          Logos, colors, typography, illustrations, templates, and the AI skills the
          Giga team builds with. Correct by default, ready in a click.
        </motion.p>

        <motion.div variants={item} className="mt-9 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/logos"
            className="group inline-flex h-14 items-center gap-2 rounded-full bg-primary-600 px-10 text-base font-semibold text-white shadow-stripe-md transition-smooth hover:bg-primary-700 active:scale-[0.98]"
          >
            Start exploring
            <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
          </Link>
          <Link
            href="/materials/skills"
            className="glass group inline-flex h-14 items-center gap-2 rounded-full px-9 text-base font-semibold text-white transition-smooth hover:bg-white/[0.14] active:scale-[0.98]"
          >
            <Sparkles className="h-4 w-4" />
            Explore AI Skills
          </Link>
        </motion.div>
      </motion.div>
    </section>
  )
}
