import { Suspense } from "react";
import ClientBiblePage from "./ClientBiblePage";

export default function Page() {
  return (
    <div className="page-container">
      <Suspense fallback={<div className="p-6 text-sm opacity-70">Loading…</div>}>
        <ClientBiblePage />
      </Suspense>
    </div>
  );
}
