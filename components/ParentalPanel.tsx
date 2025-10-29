"use client";
import { useId, useState } from "react";
import { useParental } from "@/context/ParentalSettingsProvider";
import type { ChildProfile } from "@/types/parental";
import ParentalPinGate from "@/components/ParentalPinGate";
import { usePlan } from "@/lib/plan";
import { useEntitlements } from "@/lib/entitlements";

function uid() { return Math.random().toString(36).slice(2, 10); }

export default function ParentalPanel() {
  const { settings, setSettings, activeChild, setActiveChildId } = useParental();
  const { plan } = usePlan();
  const ent = useEntitlements(plan);
  const [open, setOpen] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const [tab, setTab] = useState<"profiles"|"content"|"playback"|"bedtime"|"tabs"|"privacy">("profiles");

  const onOpen = () => setOpen(true);
  const onClose = () => { setOpen(false); setUnlocked(false); };

  const addChild = () => {
    const child: ChildProfile = { id: uid(), name: "Child", age: "5-8", lang: "en", defaultMinutes: 10 };
    setSettings({ ...settings, children: [...settings.children, child], activeChildId: child.id });
  };
  const removeChild = (id: string) => {
    const rest = settings.children.filter(c => c.id !== id);
    setSettings({ ...settings, children: rest, activeChildId: rest[0]?.id });
  };
  const updateChild = (id: string, patch: Partial<ChildProfile>) => {
    setSettings({ ...settings, children: settings.children.map(c => c.id === id ? { ...c, ...patch } : c) });
  };

  const body = (
    <div className="fixed inset-0 z-[60] grid place-items-center bg-black/60">
      <div className="w-[min(100%,960px)] rounded-3xl bg-[#0C2657] text-white ring-1 ring-white/10 shadow-2xl overflow-hidden">
        <header className="flex items-center justify-between p-5">
          <div>
            <h3 className="text-2xl font-extrabold">Parental Controls</h3>
            <p className="text-blue-200 text-sm">Manage profiles, content, and playback rules.</p>
          </div>
          <button onClick={onClose} className="rounded-xl bg-[#122C66] px-3 py-2">✕</button>
        </header>

        <div className="px-5 pb-5">
          <div className="flex flex-wrap gap-2 mb-4">
            {(["profiles","content","playback","bedtime","tabs","privacy"] as const).map(k => (
              <button key={k} onClick={()=>setTab(k)}
                className={`rounded-xl px-3 py-2 text-sm font-semibold ${
                  tab===k ? "bg-amber-300 text-[#0C2657]" : "bg-[#122C66] text-amber-100"
                }`}>
                {{ profiles:"Profiles", content:"Content", playback:"Playback", bedtime:"Bedtime", tabs:"Player Tabs", privacy:"Privacy" }[k]}
              </button>
            ))}
          </div>

          {tab==="profiles" && (
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl bg-[#0B1E4A] p-4 ring-1 ring-white/10">
                <h4 className="font-bold mb-2">Children</h4>
                <div className="space-y-3">
                  {settings.children.map(c => (
                    <div key={c.id} className="rounded-xl bg-[#122C66] p-3 ring-1 ring-white/10">
                      <div className="flex items-center gap-2">
                        <input value={c.name} onChange={e=>updateChild(c.id, { name: e.target.value })}
                          className="flex-1 rounded-lg bg-[#0B1E4A] px-2 py-2 ring-1 ring-white/10" />
                        <button onClick={()=>setActiveChildId(c.id)}
                          className={`rounded-lg px-3 py-2 text-sm ${c.id===settings.activeChildId ? "bg-amber-300 text-[#0C2657]" : "bg-[#0B1E4A]"}`}>{c.id===settings.activeChildId ? "Active" : "Set Active"}</button>
                        <button onClick={()=>removeChild(c.id)} className="rounded-lg bg-[#0B1E4A] px-3 py-2 text-sm">Delete</button>
                      </div>
                      <div className="mt-2 grid grid-cols-3 gap-2">
                        <select value={c.age} onChange={e=>updateChild(c.id, { age: e.target.value as any })} className="rounded-lg bg-[#0B1E4A] px-2 py-2 ring-1 ring-white/10">
                          {["2-4","5-8","9-12"].map(a=> <option key={a} value={a}>{a}</option>)}
                        </select>
                        <select value={c.lang} onChange={e=>updateChild(c.id, { lang: e.target.value as any })} className="rounded-lg bg-[#0B1E4A] px-2 py-2 ring-1 ring-white/10">
                          {["en","es"].map(l=> <option key={l} value={l}>{l.toUpperCase()}</option>)}
                        </select>
                        <select value={c.defaultMinutes} onChange={e=>updateChild(c.id, { defaultMinutes: Number(e.target.value) as any })} className="rounded-lg bg-[#0B1E4A] px-2 py-2 ring-1 ring-white/10">
                          {[5,10,15,20,30].map(m=> <option key={m} value={m}>{m} min</option>)}
                        </select>
                      </div>
                    </div>
                  ))}
                  <button onClick={addChild} disabled={settings.children.length >= ent.profiles} className="rounded-xl bg-amber-300 px-4 py-2 font-semibold text-[#0C2657] disabled:opacity-50 disabled:cursor-not-allowed">+ Add Child</button>
                  {settings.children.length >= ent.profiles && (
                    <p className="text-xs text-amber-200">Profile limit reached for your plan.</p>
                  )}
                </div>
              </div>

              <div className="rounded-2xl bg-[#0B1E4A] p-4 ring-1 ring-white/10">
                <h4 className="font-bold mb-2">Active Profile</h4>
                {activeChild ? (
                  <ul className="text-blue-100 space-y-1">
                    <li><strong>Name:</strong> {activeChild.name}</li>
                    <li><strong>Age:</strong> {activeChild.age}</li>
                    <li><strong>Language:</strong> {activeChild.lang.toUpperCase()}</li>
                    <li><strong>Default Duration:</strong> {activeChild.defaultMinutes} min</li>
                  </ul>
                ) : <p className="text-blue-200">No active child selected.</p>}
                <div className="mt-4">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" checked={settings.lockLanguage} onChange={e=>setSettings({ ...settings, lockLanguage: e.target.checked })} />
                    Lock language to child profile
                  </label>
                </div>
              </div>
            </div>
          )}

          {tab==="content" && (
            <div className="rounded-2xl bg-[#0B1E4A] p-4 ring-1 ring-white/10 space-y-3">
              <label className="flex items-center gap-2"><input type="checkbox" checked={settings.restrictByAge} onChange={e=>setSettings({ ...settings, restrictByAge: e.target.checked })}/>Hide stories outside child’s age group</label>
              <div>
                <p className="text-sm text-blue-200 mb-1">Blocked stories (comma-separated slugs):</p>
                <input value={settings.hiddenStorySlugs.join(",")} onChange={e=>setSettings({ ...settings, hiddenStorySlugs: e.target.value.split(",").map(s=>s.trim()).filter(Boolean) })} placeholder="david-goliath, queen-esther" className="w-full rounded-lg bg-[#122C66] px-3 py-2 ring-1 ring-white/10" />
              </div>
            </div>
          )}

          {tab==="playback" && (
            <div className="rounded-2xl bg-[#0B1E4A] p-4 ring-1 ring-white/10 grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-1">Max duration (cap)</label>
                <select value={String(settings.maxMinutes ?? "")} onChange={e=>setSettings({ ...settings, maxMinutes: e.target.value ? Number(e.target.value) as any : undefined })} className="w-full rounded-lg bg-[#122C66] px-3 py-2 ring-1 ring-white/10">
                  <option value="">No cap</option>
                  {[5,10,15,20,30].map(m => <option key={m} value={m}>{m} min</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm mb-1">Enforce sleep timer</label>
                <select value={String(settings.enforceSleepTimer ?? "")} onChange={e=>setSettings({ ...settings, enforceSleepTimer: e.target.value ? Number(e.target.value) as any : undefined })} className="w-full rounded-lg bg-[#122C66] px-3 py-2 ring-1 ring-white/10">
                  <option value="">No</option>
                  {[5,10,15,20,30].map(m => <option key={m} value={m}>{m} min</option>)}
                </select>
              </div>
              <label className="flex items-center gap-2"><input type="checkbox" checked={settings.disableDownloads} onChange={e=>setSettings({ ...settings, disableDownloads: e.target.checked })}/>Disable audio downloads</label>
              <label className="flex items-center gap-2"><input type="checkbox" checked={settings.disableAutoplayNext} onChange={e=>setSettings({ ...settings, disableAutoplayNext: e.target.checked })}/>Disable autoplay next</label>
            </div>
          )}

          {tab==="bedtime" && (
            <div className="rounded-2xl bg-[#0B1E4A] p-4 ring-1 ring-white/10 grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-1">Block playback from</label>
                <input type="time" value={settings.bedtimeFrom ?? ""} onChange={e=>setSettings({ ...settings, bedtimeFrom: e.target.value || undefined })} className="w-full rounded-lg bg-[#122C66] px-3 py-2 ring-1 ring-white/10" />
              </div>
              <div>
                <label className="block text-sm mb-1">to</label>
                <input type="time" value={settings.bedtimeTo ?? ""} onChange={e=>setSettings({ ...settings, bedtimeTo: e.target.value || undefined })} className="w-full rounded-lg bg-[#122C66] px-3 py-2 ring-1 ring-white/10" />
              </div>
            </div>
          )}

          {tab==="tabs" && (
            <div className="rounded-2xl bg-[#0B1E4A] p-4 ring-1 ring-white/10 grid grid-cols-1 md:grid-cols-3 gap-3">
              <label className="flex items-center gap-2"><input type="checkbox" checked={settings.showScripture} onChange={e=>setSettings({ ...settings, showScripture: e.target.checked })}/>Show Scripture tab</label>
              <label className="flex items-center gap-2"><input type="checkbox" checked={settings.showPrayer} onChange={e=>setSettings({ ...settings, showPrayer: e.target.checked })}/>Show Prayer tab</label>
              <label className="flex items-center gap-2"><input type="checkbox" checked={settings.showDiscussion} onChange={e=>setSettings({ ...settings, showDiscussion: e.target.checked })}/>Show Discussion tab</label>
            </div>
          )}

          {tab==="privacy" && (
            <div className="rounded-2xl bg-[#0B1E4A] p-4 ring-1 ring-white/10">
              <label className="flex items-center gap-2"><input type="checkbox" checked={settings.analyticsEnabled} onChange={e=>setSettings({ ...settings, analyticsEnabled: e.target.checked })}/>Enable anonymous usage analytics</label>
              <p className="text-sm text-blue-2 00 mt-2">Local only by default. We can route this to Firebase when you’re ready.</p>
            </div>
          )}
        </div>
      </div>
      {!unlocked && <ParentalPinGate onUnlock={()=>setUnlocked(true)} />}
    </div>
  );

  return (
    <>
      <button onClick={onOpen} className="rounded-xl bg-[#122C66] px-3 py-2 text-amber-100 ring-1 ring-white/10 hover:bg-[#183672]">🛡️ Parents</button>
      {open && body}
    </>
  );
}
