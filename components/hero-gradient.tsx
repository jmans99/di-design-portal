'use client'

import { useEffect, useRef } from 'react'

export function HeroGradient() {
  const ref = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    if (ref.current) ref.current.playbackRate = 0.5
  }, [])

  return (
    <video
      ref={ref}
      autoPlay
      muted
      loop
      playsInline
      className="absolute inset-0 h-full w-full object-cover"
      style={{ opacity: 0.7 }}
    >
      <source src="/hero.mp4" type="video/mp4" />
    </video>
  )
}
