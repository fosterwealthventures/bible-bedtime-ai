"use client";
import { createContext, useContext, useState } from "react";

type Lang = "en" | "es";
type Age = "all" | "2-4" | "5-8" | "9-12";

const UIContext = createContext<{
  lang: Lang;
  setLang: (lang: Lang) => void;
  age: Age;
  setAge: (age: Age) => void;
} | null>(null);

export function UIProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Lang>("en");
  const [age, setAge] = useState<Age>("all");
  return (
    <UIContext.Provider value={{ lang, setLang, age, setAge }}>
      {children}
    </UIContext.Provider>
  );
}

export function useUI() {
  const context = useContext(UIContext);
  if (!context) throw new Error("useUI must be used within UIProvider");
  return context;
}