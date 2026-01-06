"use client";

import { useEffect, useRef, useState } from "react";

type AudioState = "playing" | "muted" | "off";

function isAutoplayError(err: unknown) {
  return err instanceof Error || typeof err === "object";
}

export function AudioToggle() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [state, setState] = useState<AudioState>("off");

  const ensureAudio = () => {
    if (!audioRef.current) {
      const a = new Audio("/audio/ambient.mp3");
      a.loop = true;
      a.volume = 0.18; // subtle
      audioRef.current = a;
    }
    return audioRef.current;
  };

  // Attempt autoplay on load (may be blocked)
  useEffect(() => {
    const a = ensureAudio();

    const saved = (localStorage.getItem("wrapped_audio_state") as AudioState) || "playing";

    // If user previously set muted, keep muted but still try to start playback silently
    if (saved === "muted") {
      a.muted = true;
      a.play()
        .then(() => setState("muted"))
        .catch(() => setState("muted")); // keep UI muted even if blocked
      return;
    }

    // Default: try to play with sound
    a.muted = false;
    a.play()
      .then(() => setState("playing"))
      .catch((err) => {
        // Autoplay blocked -> we keep state off.
        // As soon as user swipes/clicks, they can unmute/play using the button.
        if (isAutoplayError(err)) setState("off");
      });
  }, []);

  useEffect(() => {
    localStorage.setItem("wrapped_audio_state", state);
  }, [state]);

  const setMuted = (mute: boolean) => {
    const a = ensureAudio();
    a.muted = mute;
  };

  const playIfNeeded = async () => {
    const a = ensureAudio();
    if (a.paused) {
      try {
        await a.play();
      } catch {
        // still blocked -> user needs another interaction; no error shown
      }
    }
  };

  const toggle = async () => {
    const a = ensureAudio();

    if (state === "playing") {
      // Mute (keep playing)
      setMuted(true);
      setState("muted");
      return;
    }

    if (state === "muted") {
      // Unmute
      setMuted(false);
      await playIfNeeded();
      setState("playing");
      return;
    }

    // state === "off" -> try to start playing (unmuted)
    setMuted(false);
    await playIfNeeded();

    // If it started, set playing; if not, keep off but button remains usable
    if (!a.paused) setState("playing");
  };

  const label =
    state === "playing" ? "Mute" : state === "muted" ? "Unmute" : "Play music";

  return (
    <button
      onClick={toggle}
      className="rounded-2xl px-3 py-2 text-xs font-semibold
                 border border-slate-200 bg-white/70 backdrop-blur-xl shadow-sm
                 text-slate-700 hover:bg-white"
      aria-label={label}
    >
      {label}
    </button>
  );
}
