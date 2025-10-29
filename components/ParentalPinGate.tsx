"use client";
import { useEffect, useState } from "react";
import { useParental } from "@/context/ParentalSettingsProvider";

async function sha256Hex(msg: string) {
  const data = new TextEncoder().encode(msg);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2,"0")).join("");
}

export default function ParentalPinGate({ onUnlock }: { onUnlock: () => void }) {
  const { settings, setSettings } = useParental();
  const [pin, setPin] = useState("");
  const [mode, setMode] = useState<"set" | "enter">("enter");
  const [error, setError] = useState("");

  useEffect(() => {
    setMode(settings.pinHash ? "enter" : "set");
  }, [settings.pinHash]);

  const onSubmit = async () => {
    setError("");
    if (mode === "set") {
      if (pin.length < 4) { setError("PIN must be at least 4 digits"); return; }
      const h = (await sha256Hex(pin)).slice(0, 32);
      setSettings({ ...settings, pinHash: h });
      onUnlock();
      return;
    }
    const h = (await sha256Hex(pin)).slice(0, 32);
    if (settings.pinHash && h === settings.pinHash) onUnlock();
    else setError("Incorrect PIN");
  };

  return (
    <div className="fixed inset-0 z-[70] grid place-items-center bg-black/60">
      <div className="w-full max-w-sm rounded-2xl bg-[#0C2657] p-6 text-white ring-1 ring-white/10 shadow-2xl">
        <h3 className="text-xl font-extrabold">
          {mode === "set" ? "Set Parental PIN" : "Enter Parental PIN"}
        </h3>
        <p className="mt-1 text-blue-200 text-sm">
          {mode === "set"
            ? "Create a PIN to protect parental settings."
            : "Only parents/guardians should proceed."}
        </p>

        <input
          type="password"
          inputMode="numeric"
          pattern="[0-9]*"
          placeholder="••••"
          value={pin}
          onChange={(e)=>setPin(e.target.value)}
          className="mt-4 w-full rounded-xl bg-[#122C66] px-3 py-3 ring-1 ring-white/10 focus:outline-none"
        />
        {error && <p className="mt-2 text-amber-300">{error}</p>}

        <div className="mt-4 flex gap-2">
          <button onClick={onSubmit}
            className="rounded-xl bg-amber-300 px-4 py-2 font-semibold text-[#0C2657]">
            {mode === "set" ? "Save PIN" : "Unlock"}
          </button>
        </div>
      </div>
    </div>
  );
}

