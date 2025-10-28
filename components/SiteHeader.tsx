"use client";
import React from "react";
import Link from "next/link";
import { useUI } from "@/lib/ui-state";
import { usePathname } from "next/navigation";

export default function SiteHeader() {
  const { lang, setLang, age, setAge } = useUI();
  const pathname = usePathname();
  const NavLink = ({ href, children }: { href: string; children: React.ReactNode }) => {
    const active = pathname === href;
    return (
      <Link
        href={href}
        className={`px-3 py-2 rounded-xl hover:bg-brand-plum transition ${
          active ? "bg-brand-plum text-white" : "text-gray-700"
        }`}
      >
        {children}
      </Link>
    );
  };
  return (
    <header className="w-full py-4">
      <div className="container flex items-center justify-between">
        <Link href="/" className="flex flex-col">
          <span className="text-lg font-semibold text-brand-plum">Bible Bedtime Stories</span>
          <span className="text-xs text-muted-foreground">by Foster Wealth Ventures</span>
        </Link>
        <nav className="flex gap-1 items-center">
          <NavLink href="/">Home</NavLink>
          <NavLink href="/bible-bedtime-stories">Stories</NavLink>
          <NavLink href="/create">Create</NavLink>
          <NavLink href="/pricing">Pricing</NavLink>
        <span className="mx-2 h-6 w-px bg-purple-200" />
        <label className="text-sm text-gray-600">Age</label>
        <select value={age} onChange={e=>setAge(e.target.value as any)} className="border rounded-md px-2 py-1" title="Age range">
          <option value="all">All</option>
          <option value="2-4">2–4</option>
          <option value="5-8">5–8</option>
          <option value="9-12">9–12</option>
        </select>
        <button onClick={()=>setLang(lang==="en"?"es":"en")} className="ml-2 text-sm rounded-full border px-3 py-1 hover:bg-brand-plum" title="Toggle EN/ES">
          {lang.toUpperCase()}
        </button>
        </nav>
      </div>
    </header>
  );
}