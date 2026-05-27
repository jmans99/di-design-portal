import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Reveal } from '@/components/home/reveal'

export function ClosingCta() {
  return (
    <section className="mx-auto max-w-6xl px-6 pb-28 pt-4">
      <Reveal>
        <div className="relative overflow-hidden rounded-[28px] px-8 py-24 text-center">
          {/* Background photo, washed in Giga Blue */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/home/cta.jpg"
            alt=""
            aria-hidden
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(180deg, rgba(10,10,12,0.55) 0%, rgba(10,10,12,0.35) 45%, rgba(10,10,12,0.62) 100%)',
            }}
          />

          <div className="relative">
            <h2 className="font-heading mx-auto max-w-2xl text-[clamp(1.9rem,4vw,3rem)] font-semibold leading-[1.08] tracking-[-0.03em] text-white text-balance">
              What are you waiting for?
            </h2>
            <p className="mx-auto mt-4 max-w-md text-[15px] leading-relaxed text-white/85">
              Explore the resources at your fingertips, ready to use.
            </p>
            <Link
              href="/logos"
              className="group mt-8 inline-flex h-12 items-center gap-2 rounded-full bg-white px-7 text-[15px] font-semibold text-primary-700 shadow-stripe-md transition-smooth hover:bg-primary-50 active:scale-[0.98]"
            >
              Start exploring
              <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>
      </Reveal>
    </section>
  )
}
