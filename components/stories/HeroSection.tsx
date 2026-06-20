import Image from 'next/image'

interface Props {
  imageUrl: string
  alt: string
}

export default function HeroSection({ imageUrl, alt }: Props) {
  return (
    <section className="relative w-full h-[90vh] min-h-[520px] overflow-hidden">
      <Image
        src={imageUrl}
        alt={alt}
        fill
        className="object-cover"
        priority
        sizes="100vw"
      />
      {/* Subtle gradient at bottom for scroll hint */}
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-surface/60 to-transparent" />

      {/* Scroll caret */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5">
          <path d="M6 9l6 6 6-6"/>
        </svg>
      </div>
    </section>
  )
}
