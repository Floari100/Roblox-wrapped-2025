"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

function RobloxMark() {
  return (
    <svg width="52" height="52" viewBox="0 0 64 64" aria-hidden="true">
      <g transform="rotate(18 32 32)">
        <rect x="10" y="10" width="44" height="44" rx="10" fill="currentColor" />
        <rect x="26" y="26" width="12" height="12" rx="3" fill="white" />
      </g>
    </svg>
  );
}

export default function Home() {
  const router = useRouter();
  const [username, setUsername] = useState("");

  const go = () => {
    const u = username.trim().replace(/^@/, "");
    if (!u) return;
    router.push(`/wrapped?username=${encodeURIComponent(u)}`);
  };

  return (
    <div className="min-h-screen text-slate-900 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-sky-50 via-white to-slate-50" />
      <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full blur-3xl bg-sky-200/70" />
      <div className="absolute top-24 -right-24 h-96 w-96 rounded-full blur-3xl bg-indigo-200/60" />
      <div className="absolute -bottom-32 left-1/3 h-[28rem] w-[28rem] rounded-full blur-3xl bg-cyan-200/60" />
      <div className="absolute inset-0 opacity-[0.06] bg-[radial-gradient(circle_at_1px_1px,rgba(0,0,0,0.25)_1px,transparent_0)] [background-size:18px_18px]" />

      <div className="relative min-h-screen flex items-center justify-center p-6">
        <div className="w-full max-w-2xl">
          <div className="flex items-center gap-4 mb-7">
            <div className="text-sky-600 drop-shadow-sm">
              <RobloxMark />
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-semibold leading-tight font-fun">
                Roblox Wrapped
              </div>
              <div className="text-slate-600 mt-1">
                Your 2025 badge story — in a clean, story-style deck.
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white/70 backdrop-blur-xl p-5 md:p-6 shadow-[0_20px_60px_rgba(2,6,23,0.12)]">
            <div className="text-sm uppercase tracking-widest text-slate-500">
              Roblox username
            </div>

            <div className="mt-4 flex flex-col md:flex-row gap-3">
              <input
                className="flex-1 rounded-2xl bg-white border border-slate-200 px-4 py-3 outline-none focus:border-sky-400 focus:ring-4 focus:ring-sky-200/60"
                placeholder="e.g. Builderman"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyDown={(e) => (e.key === "Enter" ? go() : null)}
              />

              <button
                className="rounded-2xl px-5 py-3 font-semibold text-white shadow-lg shadow-sky-300/40
                           bg-gradient-to-b from-sky-500 to-sky-600 hover:from-sky-400 hover:to-sky-600
                           active:scale-[0.99] transition"
                onClick={go}
              >
                Generate
              </button>
            </div>

            <div className="mt-4 text-sm text-slate-600 leading-relaxed">
              We use public badge award timestamps. We only count the days on which you earned badges/achievements.
            </div>
          </div>

          <div className="mt-6 text-xs text-slate-500">
            Tip: try <span className="font-semibold">Builderman</span> first to test.
          </div>
        </div>
      </div>
    </div>
  );
}
