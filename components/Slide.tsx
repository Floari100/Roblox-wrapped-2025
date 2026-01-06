import { motion } from "framer-motion";
import type { SlideModel } from "@/lib/wrapped/slides";
import { useEffect, useMemo, useState } from "react";

function CountUp({ value }: { value: string }) {
  const num = useMemo(() => {
    const m = value.match(/^\d+/);
    return m ? Number(m[0]) : null;
  }, [value]);

  const suffix = useMemo(() => (num === null ? "" : value.slice(String(num).length)), [num, value]);
  const [n, setN] = useState<number>(num ?? 0);

  useEffect(() => {
    if (num === null) return;
    setN(0);

    const durationMs = 650;
    const start = performance.now();

    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / durationMs);
      const eased = 1 - Math.pow(1 - p, 3);
      setN(Math.round(eased * num));
      if (p < 1) requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  }, [num]);

  if (num === null) return <>{value}</>;
  return (
    <>
      <span className="tabular-nums">{n}</span>
      {suffix}
    </>
  );
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  const s = parts.map(p => p[0]?.toUpperCase() ?? "").join("");
  return s || "R";
}

function Avatar({ url, name }: { url?: string; name: string }) {
  const [ok, setOk] = useState(true);

  if (!url || !ok) {
    return (
      <div className="w-16 h-16 rounded-2xl border border-slate-200 bg-white flex items-center justify-center font-fun font-semibold text-slate-800">
        {initials(name)}
      </div>
    );
  }

  return (
    <img
      src={url}
      alt="Avatar"
      className="w-16 h-16 rounded-2xl border border-slate-200 object-cover bg-white"
      onError={() => setOk(false)}
      loading="eager"
    />
  );
}

function BadgeCard({ title, value, meta }: { title: string; value?: string; meta?: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white/75 backdrop-blur-xl p-4 shadow-sm">
      <div className="text-sm font-semibold text-slate-800 line-clamp-2">{title}</div>
      <div className="mt-2 text-sm text-slate-600">{value ?? ""}</div>
      {meta && <div className="mt-1 text-xs text-slate-500">{meta}</div>}
    </div>
  );
}

function MiniCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white/75 backdrop-blur-xl p-5 shadow-sm">
      <div className="text-xs uppercase tracking-widest text-slate-500">{label}</div>
      <div className="mt-3 text-slate-800 font-semibold leading-snug">{value}</div>
    </div>
  );
}

export function Slide({ slide, index, total }: { slide: SlideModel; index: number; total: number }) {
  const profileName = slide.profileName ?? "Player";

  return (
    <div className="h-full w-full flex items-center justify-center px-6 relative z-20">
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="max-w-3xl w-full"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            {slide.kicker && (
              <div className="text-xs uppercase tracking-widest text-slate-500">{slide.kicker}</div>
            )}
            <div className="text-4xl md:text-6xl font-semibold leading-tight text-slate-900 mt-2 font-fun">
              {slide.title}
            </div>
          </div>

          <div className="hidden md:flex items-center gap-2 text-xs text-slate-500">
            <span className="inline-block h-2 w-2 rounded-full bg-sky-500" />
            <span className="tabular-nums">{index + 1}/{total}</span>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white/70 backdrop-blur-xl p-6 shadow-[0_20px_60px_rgba(2,6,23,0.10)]">
          {slide.kind === "hero" && (
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div>
                <div className="text-slate-700 text-lg">{slide.subtext}</div>
                <div className="mt-4 text-slate-600">Swipe or click to navigate. Only the days you earned Badges will be counted</div>
              </div>

              <div className="flex items-center gap-4">
                <div className="rounded-2xl bg-gradient-to-b from-sky-500 to-indigo-500 p-[2px] shadow-lg shadow-sky-300/30">
                  <div className="rounded-2xl bg-white p-1">
                    <Avatar url={slide.avatarUrl} name={profileName} />
                  </div>
                </div>

                <div className="rounded-2xl bg-gradient-to-b from-sky-500 to-indigo-500 p-[2px] shadow-lg shadow-sky-300/30">
                  <div className="rounded-2xl bg-white px-5 py-4">
                    <div className="text-xs uppercase tracking-widest text-slate-500">Mode</div>
                    <div className="mt-2 font-semibold text-slate-900">Badges • 2025 • Timeline</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {slide.kind === "stat" && (
            <>
              {slide.bigValue && (
                <div className="mt-1 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                  <motion.div
                    initial={{ scale: 0.98, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.35, ease: "easeOut" }}
                    className="text-6xl md:text-7xl font-bold text-slate-900 font-fun"
                  >
                    <CountUp value={slide.bigValue} />
                  </motion.div>

                  {slide.sideStat && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.25, delay: 0.05 }}
                      className="inline-flex items-center gap-2 rounded-2xl bg-sky-50 border border-sky-100 px-4 py-2"
                    >
                      <span className="inline-block h-2 w-2 rounded-full bg-sky-500" />
                      <div className="text-xs uppercase tracking-widest text-slate-500">
                        {slide.sideStat.label}
                      </div>
                      <div className="text-sm font-semibold text-slate-900">
                        {slide.sideStat.value}
                      </div>
                    </motion.div>
                  )}
                </div>
              )}

              {slide.subtext && (
                <div className="mt-3 text-base md:text-lg text-slate-600 leading-relaxed">
                  {slide.subtext}
                </div>
              )}
            </>
          )}

          {slide.kind === "duo" && (
            <div>
              <div className="text-slate-600 mb-5">Two endpoints of your 2025 storyline.</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.28 }}>
                  <MiniCard label={slide.left?.label ?? "First"} value={slide.left?.value ?? "—"} />
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.28, delay: 0.06 }}
                >
                  <MiniCard label={slide.right?.label ?? "Last"} value={slide.right?.value ?? "—"} />
                </motion.div>
              </div>
            </div>
          )}

          {slide.kind === "list" && (
            <>
              {slide.subtext && <div className="text-slate-600 mb-5">{slide.subtext}</div>}

              {slide.items?.length ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {slide.items.map((it, i) => (
                    <motion.div
                      key={`${slide.key}-${i}`}
                      initial={{ opacity: 0, y: 14 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.25, delay: i * 0.05 }}
                    >
                      <BadgeCard title={it.title} value={it.value} meta={it.meta} />
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-slate-600">No items available.</div>
              )}
            </>
          )}

          {slide.kind === "share" && (
            <div className="flex flex-col gap-5">
              <div className="text-slate-600">Screenshot this card and share it.</div>

              <div className="rounded-3xl bg-gradient-to-b from-sky-500 to-indigo-500 p-[2px] shadow-xl shadow-sky-300/30">
                <div className="rounded-3xl bg-white p-6">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <div className="text-xs uppercase tracking-widest text-slate-500">Roblox Wrapped</div>
                      <div className="mt-2 text-2xl font-semibold text-slate-900 font-fun">
                        {profileName} • 2025
                      </div>
                    </div>
                    <Avatar url={slide.avatarUrl} name={profileName} />
                  </div>

                  <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-3">
                    {(slide.kv ?? []).map((row, i) => (
                      <motion.div
                        key={`${row.label}-${i}`}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.22, delay: 0.04 * i }}
                        className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
                      >
                        <div className="text-xs uppercase tracking-widest text-slate-500">{row.label}</div>
                        <div className="mt-1 font-semibold text-slate-900">{row.value}</div>
                      </motion.div>
                    ))}
                  </div>

                  <div className="mt-5 text-xs text-slate-500">Screenshot • Roblox Wrapped 2025</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
