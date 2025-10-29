"use client";
import Image from "next/image";
import Link from "next/link";

export default function WelcomeHero() {
  return (
    <section className="relative overflow-hidden bg-[#0C2657]">
      {/* starry gradient background */}
      <div className="absolute inset-0 bg-[radial-gradient(1200px_600px_at_80%_-10%,#243B7A_0%,transparent_60%),radial-gradient(1000px_500px_at_10%_10%,#1A2F66_0%,transparent_55%)] pointer-events-none" />

      <div className="mx-auto max-w-7xl px-6 md:px-10 pt-10 md:pt-16 pb-8 md:pb-14 grid md:grid-cols-2 items-center gap-10">
        {/* Left: text/CTAs */}
        <div className="relative z-10 text-white">
          <h1 className="text-4xl md:text-6xl font-extrabold leading-tight">
            Bible Bedtime <span className="text-amber-300">AI</span>
          </h1>
          <p className="mt-4 md:mt-6 text-lg md:text-xl text-blue-100 max-w-prose">
            Cozy, faith-filled stories with scripture, prayer, and gentle audio—personalized by AI for your child’s age and bedtime length.
          </p>

          {/* Quick controls / CTAs */}
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/bible-bedtime-stories"
              className="rounded-2xl px-5 py-3 font-semibold bg-amber-300 text-[#0C2657] shadow hover:translate-y-[1px] transition"
            >
              Create a bedtime story
            </Link>
            <Link
              href="/bible-bedtime-stories#how-it-works"
              className="rounded-2xl px-5 py-3 font-semibold border border-amber-300/60 text-amber-200 hover:bg-amber-300/10 transition"
            >
              See how it works
            </Link>
          </div>

          {/* Small reassurance row */}
          <div className="mt-4 flex items-center gap-4 text-blue-200 text-sm">
            <span>Age presets: 2–4 • 5–8 • 9–12</span>
            <span>Durations: 5–30+ min</span>
            <span>EN / ES</span>
          </div>
        </div>

        {/* Right: the poster image */}
        <div className="relative">
          <div className="relative z-10 mx-auto w-full max-w-[520px] md:max-w-[560px] aspect-[3/4] rounded-3xl shadow-2xl ring-1 ring-black/10 overflow-hidden">
            <Image
              src="/bible-bedtime-hero.png"
              alt="Bible Bedtime AI welcome artwork with kids, stars, and an open Bible"
              fill
              priority
              sizes="(max-width: 768px) 88vw, 520px"
              className="object-cover"
            />
          </div>

          {/* Soft cloud bed under the card */}
          <div className="absolute -bottom-6 -left-10 right-0 h-24 blur-2xl opacity-70 bg-[#32498D]" />
        </div>
      </div>
    </section>
  );
}
