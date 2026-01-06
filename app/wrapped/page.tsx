import { Suspense } from "react";
import  WrappedClient from "./wrapped-client";

export const dynamic = "force-dynamic"; // prevents static prerender

function LoadingScreen() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-sky-50 via-white to-slate-50" />
      <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full blur-3xl bg-sky-200/70" />
      <div className="absolute top-24 -right-24 h-96 w-96 rounded-full blur-3xl bg-indigo-200/60" />
      <div className="absolute -bottom-32 left-1/3 h-[28rem] w-[28rem] rounded-full blur-3xl bg-cyan-200/60" />
      <div className="absolute inset-0 opacity-[0.06] bg-[radial-gradient(circle_at_1px_1px,rgba(0,0,0,0.25)_1px,transparent_0)] [background-size:18px_18px]" />

      <div className="relative min-h-screen flex items-center justify-center">
        <div className="rounded-3xl border border-slate-200 bg-white/70 backdrop-blur-xl px-6 py-4 shadow-sm text-slate-700">
          Loading…
        </div>
      </div>
    </div>
  );
}

export default function WrappedPage() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <WrappedClient />
    </Suspense>
  );
}
