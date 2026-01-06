"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { SlideModel } from "@/lib/wrapped/slides";
import { Slide } from "./Slide";
import { Progress } from "./Progress";
import { AudioToggle } from "./AudioToggle";


function RobloxBgMark() {
  return (
    <motion.div
      aria-hidden="true"
      className="absolute -right-24 top-10 pointer-events-none"
      initial={{ opacity: 0 }}
      animate={{ opacity: 0.14 }}
      transition={{ duration: 0.6 }}
    >
      <motion.svg
        width="520"
        height="520"
        viewBox="0 0 64 64"
        className="text-sky-600"
        animate={{ y: [0, -10, 0], rotate: [0, 2, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        style={{ filter: "blur(1px)" }}
      >
        <g transform="rotate(18 32 32)">
          <rect x="8" y="8" width="48" height="48" rx="10" fill="currentColor" />
          <rect x="25" y="25" width="14" height="14" rx="3" fill="white" />
        </g>
      </motion.svg>
      <div className="absolute inset-0 blur-3xl bg-sky-400/20 rounded-full" />
    </motion.div>
  );
}

export function WrappedDeck({ slides }: { slides: SlideModel[] }) {
  const [index, setIndex] = useState(0);
  const [dir, setDir] = useState<1 | -1>(1);

  const total = slides.length;

  const next = () => {
    setDir(1);
    setIndex((i) => Math.min(i + 1, total - 1));
  };

  const prev = () => {
    setDir(-1);
    setIndex((i) => Math.max(i - 1, 0));
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " ") next();
      if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [total]);

  const bg = useMemo(() => {
    return (
      <>
        <div className="absolute inset-0 bg-gradient-to-b from-sky-50 via-white to-slate-50" />
        <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full blur-3xl bg-sky-200/70" />
        <div className="absolute top-24 -right-24 h-96 w-96 rounded-full blur-3xl bg-indigo-200/60" />
        <div className="absolute -bottom-32 left-1/3 h-[28rem] w-[28rem] rounded-full blur-3xl bg-cyan-200/60" />
        <div className="absolute inset-0 opacity-[0.06] bg-[radial-gradient(circle_at_1px_1px,rgba(0,0,0,0.25)_1px,transparent_0)] [background-size:18px_18px]" />
        <RobloxBgMark />
      </>
    );
  }, []);

  return (
    <div className="relative h-screen w-screen overflow-hidden select-none">
      {bg}
      <Progress index={index} total={total} />

      {/* Tap zones */}
      <div className="absolute top-5 right-5 z-40">
      <AudioToggle />
      </div>
      <div
        className="absolute inset-0 z-10"
        onClick={(e) => {
          const x = (e as any).clientX ?? 0;
          if (x > window.innerWidth / 2) next();
          else prev();
        }}
      />

      <div className="absolute inset-0 z-20">
        <AnimatePresence mode="wait" initial={false} custom={dir}>
          <motion.div
            key={slides[index].key}
            custom={dir}
            initial={{ opacity: 0, x: dir * 70, filter: "blur(8px)" }}
            animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, x: dir * -70, filter: "blur(8px)" }}
            transition={{ duration: 0.38, ease: "easeOut" }}
            className="relative h-full w-full"
          >
            {/* Drag wrapper: swipe LEFT => next, swipe RIGHT => prev */}
            <motion.div
              className="h-full w-full"
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.18}
              style={{ touchAction: "pan-y" }}
              onDragEnd={(_, info) => {
                const offsetX = info.offset.x;   // negative = dragged left
                const velocityX = info.velocity.x;

                const SWIPE_OFFSET = 90;
                const SWIPE_VELOCITY = 420;

                // Swipe left -> NEXT
                if (offsetX < -SWIPE_OFFSET || (offsetX < 0 && Math.abs(velocityX) > SWIPE_VELOCITY)) {
                  next();
                  return;
                }

                // Swipe right -> PREV
                if (offsetX > SWIPE_OFFSET || (offsetX > 0 && Math.abs(velocityX) > SWIPE_VELOCITY)) {
                  prev();
                  return;
                }
              }}
            >
              <Slide slide={slides[index]} index={index} total={total} />
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
