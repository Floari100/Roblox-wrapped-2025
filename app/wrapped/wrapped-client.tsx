"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

import type { WrappedData } from "@/lib/wrapped/types";
import { buildSlides, type SlideModel } from "@/lib/wrapped/slides";
import { WrappedDeck } from "@/components/WrappedDeck";
import { loadRobloxWrapped } from "@/lib/providers/robloxProvider";

function SoftBg() {
  return (
    <>
      <div className="absolute inset-0 bg-gradient-to-b from-sky-50 via-white to-slate-50" />
      <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full blur-3xl bg-sky-200/70" />
      <div className="absolute top-24 -right-24 h-96 w-96 rounded-full blur-3xl bg-indigo-200/60" />
      <div className="absolute -bottom-32 left-1/3 h-[28rem] w-[28rem] rounded-full blur-3xl bg-cyan-200/60" />
      <div className="absolute inset-0 opacity-[0.06] bg-[radial-gradient(circle_at_1px_1px,rgba(0,0,0,0.25)_1px,transparent_0)] [background-size:18px_18px]" />
    </>
  );
}

export default function WrappedClient() {
  const searchParams = useSearchParams();
  const username = searchParams.get("username") ?? "";

  const [data, setData] = useState<WrappedData | null>(null);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        setHasError(false);
        const d = await loadRobloxWrapped(username);
        setData(d);
      } catch {
        setHasError(true);
      }
    })();
  }, [username]);

  const slides: SlideModel[] = useMemo(() => (data ? buildSlides(data) : []), [data]);

  if (hasError) {
    return (
      <div className="relative min-h-screen overflow-hidden">
        <SoftBg />
        <div className="relative min-h-screen flex items-center justify-center p-6">
          <div className="rounded-3xl border border-slate-200 bg-white/70 backdrop-blur-xl p-6 shadow-[0_20px_60px_rgba(2,6,23,0.10)] max-w-md w-full">
            <div className="text-xl font-semibold text-slate-900">Oops.</div>
            <div className="mt-2 text-slate-600">Please try again later.</div>
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="relative min-h-screen overflow-hidden">
        <SoftBg />
        <div className="relative min-h-screen flex items-center justify-center">
          <div className="rounded-3xl border border-slate-200 bg-white/70 backdrop-blur-xl px-6 py-4 shadow-sm text-slate-700">
            Loading…
          </div>
        </div>
      </div>
    );
  }

  return <WrappedDeck slides={slides} />;
}
