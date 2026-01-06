export function Progress({ index, total }: { index: number; total: number }) {
  const pct = total <= 1 ? 0 : (index / (total - 1)) * 100;

  return (
    <div className="absolute top-5 left-0 right-0 flex items-center justify-center z-30">
      <div className="w-[min(720px,92vw)]">
        <div className="flex items-center justify-between text-[11px] text-slate-500 mb-2">
          <span className="uppercase tracking-widest">Wrapped</span>
          <span className="tabular-nums">
            {index + 1}/{total}
          </span>
        </div>

        <div className="h-2 rounded-full bg-white/70 border border-slate-200 shadow-sm overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-sky-500 via-cyan-500 to-indigo-500 transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    </div>
  );
}
