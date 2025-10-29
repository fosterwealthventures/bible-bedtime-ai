"use client";
import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useUI } from "@/lib/ui-state";
import { usePathname } from "next/navigation";
import ParentalPanel from "@/components/ParentalPanel";
import { usePlan } from "@/lib/plan";

export default function SiteHeader() {
  const { lang, setLang, age, setAge } = useUI();
  const pathname = usePathname();
  const NavLink = ({ href, children }: { href: string; children: React.ReactNode }) => {
    const active = pathname === href;
    return (
      <Link
        href={href}
        className={`px-3 py-2 rounded-xl hover:bg-white/10 transition ${
          active ? "bg-white/20 text-brand-cloud" : "text-brand-cloud/80"
        }`}
      >
        {children}
      </Link>
    );
  };
  const { plan } = usePlan();
  return (
    <header className="w-full py-4 bg-brand-night text-brand-cloud">
      <div className="container flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <div className="relative h-9 w-9 sm:h-10 sm:w-10">
            {/* Put your logo file at public/logo.png */}
            <Image src="/logo.png" alt="Bible Bedtime AI logo" fill sizes="40px" className="object-contain" priority />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-lg font-semibold text-brand-sun drop-shadow">Bible Bedtime Stories</span>
            <span className="text-xs text-brand-cloud/80">by Foster Wealth Ventures</span>
          </div>
        </Link>
        <nav className="flex gap-1 items-center text-brand-cloud">
          <NavLink href="/">Home</NavLink>
          <NavLink href="/bible-bedtime-stories">Stories</NavLink>
          <NavLink href="/create">Create</NavLink>
          <NavLink href="/pricing">Pricing</NavLink>
        <span className="ml-2 rounded-full bg-white/15 px-2.5 py-1 text-xs">
          {plan.replace("_"," ")} Plan
        </span>
        <span className="mx-2 h-6 w-px bg-white/20" />
        <label className="text-sm text-brand-cloud/80">Age</label>
        <select value={age} onChange={e=>setAge(e.target.value as any)} className="border rounded-md px-2 py-1 bg-transparent border-white/30 text-brand-cloud" title="Age range">
          <option value="all">All</option>
          <option value="2-4">2–4</option>
          <option value="5-8">5–8</option>
          <option value="9-12">9–12</option>
        </select>
        <button onClick={()=>setLang(lang==="en"?"es":"en")} className="ml-2 text-sm rounded-full border px-3 py-1 border-white/30 hover:bg-white/10" title="Toggle EN/ES">
          {lang.toUpperCase()}
        </button>
        <span className="mx-2 h-6 w-px bg-white/20" />
        <ParentalPanel />
        </nav>
      </div>
    </header>
  );
}
