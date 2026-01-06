import type { WrappedData, WrappedCollectionItem } from "./types";

export type SlideKind = "hero" | "stat" | "list" | "duo" | "share";

export type SlidePair = { label: string; value: string };
export type KV = { label: string; value: string };
export type SideStat = { label: string; value: string };

export type SlideModel = {
  key: string;
  kind: SlideKind;
  kicker?: string;
  title: string;

  bigValue?: string;
  subtext?: string;
  sideStat?: SideStat;

  items?: WrappedCollectionItem[];

  left?: SlidePair;
  right?: SlidePair;

  avatarUrl?: string;
  profileName?: string;
  kv?: KV[];
};

function H(data: WrappedData, label: string) {
  return data.highlights.find((x) => x.label === label);
}

export function buildSlides(data: WrappedData): SlideModel[] {
  const name = data.profile.displayName;
  const avatarUrl = data.profile.avatarUrl;

  const badges2025 = H(data, "Badges in 2025")?.value ?? "—";
  const peakMonth = H(data, "Peak month")?.value ?? "—";
  const peakMonthSub = H(data, "Peak month")?.subtext ?? "";

  const activeDays = H(data, "Active days (2025)")?.value ?? "—";
  const longestStreak = H(data, "Longest streak (2025)")?.value ?? "—";

  const playerType = H(data, "Player type")?.value ?? "—";
  const playerVibe = H(data, "Player type")?.subtext ?? "Your 2025 playstyle, summarized.";

  const created = H(data, "Account created")?.value ?? "—";

  const first = data.timeline.find((t) => t.title === "First badge in 2025")?.meta ?? "No data found.";
  const last = data.timeline.find((t) => t.title === "Last badge in 2025")?.meta ?? "No data found.";

  const recent = (data.collections["recentBadges2025"] ?? []).slice(0, 10);

  return [
    {
      key: "intro",
      kind: "hero",
      kicker: "Your Roblox Wrapped",
      title: "2025",
      subtext: `Player: ${name}`,
      avatarUrl,
      profileName: name,
    },
    {
      key: "badges2025",
      kind: "stat",
      kicker: "Your year",
      title: "Badges earned in 2025",
      bigValue: badges2025,
      sideStat: {
        label: "Busiest month",
        value: peakMonthSub ? `${peakMonth} · ${peakMonthSub}` : peakMonth,
      },
      subtext: "Based on official badge award timestamps (within scan range).",
    },
    {
      key: "type",
      kind: "stat",
      kicker: "Vibe check",
      title: "Player type",
      bigValue: playerType,
      subtext: playerVibe,
    },
    {
      key: "streaks",
      kind: "stat",
      kicker: "Consistency",
      title: "Streaks",
      bigValue: longestStreak,
      subtext: `Active days: ${activeDays} · Best streak: ${longestStreak}`,
    },
    {
      key: "first-last",
      kind: "duo",
      kicker: "Timeline",
      title: "First & last badge (2025)",
      left: { label: "First", value: first },
      right: { label: "Last", value: last },
    },
    {
      key: "recent",
      kind: "list",
      kicker: "Highlights",
      title: "Recent badges (2025)",
      subtext: "Your latest badge moments we could see.",
      items: recent,
    },
    {
      key: "share",
      kind: "share",
      kicker: "Share card",
      title: "Screenshot this",
      avatarUrl,
      profileName: name,
      kv: [
        { label: "Badges (2025)", value: String(badges2025) },
        { label: "Busiest month", value: peakMonthSub ? `${peakMonth} (${peakMonthSub})` : peakMonth },
        { label: "Player type", value: String(playerType) },
        { label: "Active days", value: String(activeDays) },
        { label: "Longest streak", value: String(longestStreak) },
        { label: "Account created", value: String(created) },
      ],
    },
  ];
}
