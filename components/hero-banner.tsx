import Image from "next/image";

export function HeroBanner() {
  return (
    <section className="relative flex min-h-90 items-center overflow-hidden rounded-3xl bg-neutral-900 sm:min-h-105 lg:min-h-120 lg:rounded-4xl">
      <Image
        src="/hero-image.png"
        alt="Modern hillside home surrounded by tropical greenery"
        fill
        priority
        sizes="100vw"
        className="object-cover object-center"
      />

      {/* Light dark scrim — just enough contrast for the copy, photo stays visible */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/65 via-black/45 to-black/30 md:hidden" />
      <div className="absolute inset-0 hidden bg-gradient-to-r from-black/60 via-black/30 to-black/5 md:block" />

      <div className="relative w-full px-6 py-12 sm:px-10 sm:py-14 lg:px-14">
        <div className="max-w-xl">
          <span
            className="inline-flex items-center rounded-full border border-white/40 bg-white/15 px-5 py-2 text-sm text-white backdrop-blur-sm sm:text-base"
            style={{ fontFamily: "Chantilly Serial" }}
          >
            KaaAfrika Life
          </span>

          <h1 className="mt-6 text-4xl font-extrabold leading-[1.05] tracking-tight text-white text-balance sm:text-5xl lg:text-6xl">
            Search. List.
            <br />
            <span className="text-[#FFD100]">Move In.</span>
          </h1>

          <p className="mt-5 max-w-68 text-base leading-snug text-white/90 sm:max-w-76 sm:text-lg lg:max-w-84 lg:text-xl">
            Property &amp; Lodging Made Simple, Honest &amp; African.
          </p>
        </div>
      </div>
    </section>
  );
}
