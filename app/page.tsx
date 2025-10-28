import { Suspense } from "react";
import ClientHome from "./ClientHome";

export default function Page() {
  return (
    <Suspense fallback={<div className="p-6 text-sm opacity-70">Loading…</div>}>
      <ClientHome />
    </Suspense>
  );
}