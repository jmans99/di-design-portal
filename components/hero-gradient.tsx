export function HeroGradient() {
  return (
    <video
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
