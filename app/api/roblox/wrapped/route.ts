import { NextResponse } from "next/server";
import { robloxFetch } from "@/lib/roblox/robloxFetch";

const YEAR_START = new Date("2025-01-01T00:00:00Z").getTime();
const YEAR_END = new Date("2026-01-01T00:00:00Z").getTime();

// In-memory cache (MVP): helps a lot against 429 on refresh
const memCache = new Map<string, { ts: number; data: any }>();
const CACHE_TTL_MS = 60_000; // 60s

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

type ResolveResp = {
  data: Array<{ requestedUsername: string; id: number; name: string; displayName: string }>;
};

type UserResp = {
  id: number;
  name: string;
  displayName: string;
  created: string;
  description: string;
};

type BadgeListResp = {
  data: Array<{
    id: number;
    name: string;
    description?: string;
    created?: string;
  }>;
  nextPageCursor: string | null;
  previousPageCursor: string | null;
};

type AwardedDatesResp = {
  data: Array<{
    badgeId: number;
    awardedDate: string; // ISO
  }>;
};

type ThumbResp = {
  data: Array<{
    targetId: number;
    state: string;
    imageUrl?: string;
  }>;
};

function safeUsername(raw: string) {
  return raw.trim().replace(/^@/, "");
}

function monthKey(ts: number) {
  const d = new Date(ts);
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

function dayKey(ts: number) {
  return new Date(ts).toISOString().slice(0, 10); // UTC YYYY-MM-DD
}

function fmtDate(ts: number) {
  return new Date(ts).toISOString().slice(0, 10);
}

function computeStreaks(daysSorted: string[]) {
  if (daysSorted.length === 0) return { activeDays: 0, longest: 0 };

  let longest = 1;
  let current = 1;

  for (let i = 1; i < daysSorted.length; i++) {
    const prev = Date.parse(daysSorted[i - 1] + "T00:00:00Z");
    const cur = Date.parse(daysSorted[i] + "T00:00:00Z");
    const diffDays = Math.round((cur - prev) / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      current++;
      if (current > longest) longest = current;
    } else {
      current = 1;
    }
  }

  return { activeDays: daysSorted.length, longest };
}

function pickPlayerType(args: {
  badges2025: number;
  activeDays: number;
  longestStreak: number;
  busiestMonthCount: number;
  activeMonths: number;
}) {
  const { badges2025, activeDays, longestStreak, busiestMonthCount, activeMonths } = args;
  const shareBusiest = badges2025 > 0 ? busiestMonthCount / badges2025 : 0;

  if (badges2025 >= 200 || longestStreak >= 21) {
    return { type: "Grinder", vibe: "High volume + consistency. You kept showing up." };
  }
  if (badges2025 >= 40 && shareBusiest >= 0.6) {
    return { type: "Sprinter", vibe: "One big push. Peak-month energy." };
  }
  if (activeMonths >= 9 && badges2025 >= 30) {
    return { type: "Explorer", vibe: "Steady across the year. Always discovering." };
  }
  if (activeDays >= 25 && badges2025 >= 60) {
    return { type: "Collector", vibe: "You stacked achievements like side quests." };
  }
  if (badges2025 >= 10) {
    return { type: "Casual", vibe: "Low pressure. You played when it felt right." };
  }
  return { type: "Newcomer", vibe: "Just getting started. Your next chapter is coming." };
}

async function getAvatarUrl(userId: number) {
  // Thumbnails can return state != Completed sometimes; retry a few times.
  const sizes = ["150x150", "180x180"];
  for (let attempt = 0; attempt < 3; attempt++) {
    for (const size of sizes) {
      const t = await robloxFetch<ThumbResp>({
        url: `https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${userId}&size=${size}&format=Png&isCircular=false`,
        retries: 4,
        minDelayMs: 250,
      });
      const entry = t.data?.[0];
      if (entry?.state === "Completed" && entry.imageUrl) return entry.imageUrl;
    }
    await sleep(160);
  }
  return null;
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const username = safeUsername(searchParams.get("username") ?? "");
    if (!username) return NextResponse.json({ error: "Missing username" }, { status: 400 });

    const cacheKey = `roblox_wrapped_2025_${username.toLowerCase()}`;
    const hit = memCache.get(cacheKey);
    if (hit && Date.now() - hit.ts < CACHE_TTL_MS) {
      return NextResponse.json(hit.data);
    }

    // 1) Username -> UserId
    const resolved = await robloxFetch<ResolveResp>({
      url: "https://users.roblox.com/v1/usernames/users",
      method: "POST",
      body: { usernames: [username], excludeBannedUsers: true },
      retries: 4,
      minDelayMs: 250,
    });

    const u0 = resolved.data?.[0];
    if (!u0?.id) return NextResponse.json({ error: "User not found" }, { status: 404 });
    const userId = u0.id;

    // 2) User profile
    const user = await robloxFetch<UserResp>({
      url: `https://users.roblox.com/v1/users/${userId}`,
      retries: 4,
      minDelayMs: 250,
    });

    // 3) Avatar
    const avatarUrl = await getAvatarUrl(userId);

    // 4) Badges list + awarded dates (paged)
    const MAX_PAGES = 8;
    const LIMIT = 100;

    let cursor: string | null = null;
    let pages = 0;

    const all: Array<{ id: number; name: string; awardedTs?: number }> = [];

    while (pages < MAX_PAGES) {
      pages++;

      await sleep(180);

      const list: BadgeListResp = await robloxFetch<BadgeListResp>({
        url:
          `https://badges.roblox.com/v1/users/${userId}/badges` +
          `?limit=${LIMIT}&sortOrder=Desc` +
          (cursor ? `&cursor=${encodeURIComponent(cursor)}` : ""),
        retries: 4,
        minDelayMs: 300,
      });

      const badgeIds: number[] = (list.data ?? []).map((b) => b.id);
      if (!badgeIds.length) break;

      await sleep(120);

      const awarded: AwardedDatesResp = await robloxFetch<AwardedDatesResp>({
        url:
          `https://badges.roblox.com/v1/users/${userId}/badges/awarded-dates` +
          `?badgeIds=${badgeIds.join(",")}`,
        retries: 4,
        minDelayMs: 300,
      });

      const awardedMap = new Map<number, number>();
      for (const a of awarded.data ?? []) {
        const ts = Date.parse(a.awardedDate);
        if (!Number.isNaN(ts)) awardedMap.set(a.badgeId, ts);
      }

      for (const b of list.data) {
        all.push({ id: b.id, name: b.name, awardedTs: awardedMap.get(b.id) });
      }

      const pageAwardedTs = (list.data ?? [])
        .map((b) => awardedMap.get(b.id))
        .filter((x): x is number => typeof x === "number")
        .sort((a, b) => a - b);

      const oldestInPage = pageAwardedTs[0];
      if (oldestInPage !== undefined && oldestInPage < YEAR_START) break;

      cursor = list.nextPageCursor ?? null;
      if (!cursor) break;
    }

    const withDates = all.filter((x) => typeof x.awardedTs === "number") as Array<{
      id: number;
      name: string;
      awardedTs: number;
    }>;

    const badges2025Arr = withDates.filter((x) => x.awardedTs >= YEAR_START && x.awardedTs < YEAR_END);
    const badges2025 = badges2025Arr.length;

    // Month stats
    const monthCounts = new Map<string, number>();
    for (const b of badges2025Arr) {
      const k = monthKey(b.awardedTs);
      monthCounts.set(k, (monthCounts.get(k) ?? 0) + 1);
    }
    const busiest = [...monthCounts.entries()].sort((a, b) => b[1] - a[1])[0] ?? null;
    const activeMonths = monthCounts.size;
    const busiestMonth = busiest?.[0] ?? "—";
    const busiestMonthCount = busiest?.[1] ?? 0;

    // First/last badge
    const sorted2025 = [...badges2025Arr].sort((a, b) => a.awardedTs - b.awardedTs);
    const first2025 = sorted2025[0] ?? null;
    const last2025 = sorted2025[sorted2025.length - 1] ?? null;

    // Streaks
    const activeDaysSet = new Set<string>();
    for (const b of badges2025Arr) activeDaysSet.add(dayKey(b.awardedTs));
    const activeDaysSorted = [...activeDaysSet].sort();
    const streak = computeStreaks(activeDaysSorted);

    // Player type
    const player = pickPlayerType({
      badges2025,
      activeDays: streak.activeDays,
      longestStreak: streak.longest,
      busiestMonthCount,
      activeMonths,
    });

    const payload = {
      provider: "roblox" as const,
      profile: {
        id: String(user.id),
        displayName: user.displayName || user.name,
        avatarUrl: avatarUrl ?? undefined,
      },
      highlights: [
        { label: "Badges in 2025", value: String(badges2025), subtext: "Based on badge award timestamps" },
        { label: "Active days (2025)", value: String(streak.activeDays), subtext: "Days you earned at least one badge" },
        { label: "Longest streak (2025)", value: `${streak.longest} days`, subtext: "Best consecutive-day run" },
        { label: "Player type", value: player.type, subtext: player.vibe },
        { label: "Peak month", value: busiestMonth, subtext: `${busiestMonthCount} badges` },
        { label: "Account created", value: user.created ? user.created.slice(0, 10) : "—", subtext: "Roblox account creation date" },
        {
          label: "Badges scanned",
          value: String(withDates.length),
          subtext: "MVP scans newest badges first",
        },
      ],
      timeline: [
        ...(first2025
          ? [
              {
                ts: Math.floor(first2025.awardedTs / 1000),
                title: "First badge in 2025",
                meta: `${first2025.name} (${fmtDate(first2025.awardedTs)})`,
              },
            ]
          : []),
        ...(last2025
          ? [
              {
                ts: Math.floor(last2025.awardedTs / 1000),
                title: "Last badge in 2025",
                meta: `${last2025.name} (${fmtDate(last2025.awardedTs)})`,
              },
            ]
          : []),
      ],
      collections: {
        recentBadges2025: [...badges2025Arr]
          .sort((a, b) => b.awardedTs - a.awardedTs)
          .slice(0, 12)
          .map((b) => ({
            title: b.name,
            value: fmtDate(b.awardedTs),
            meta: "Badge earned",
          })),
      },
    };

    memCache.set(cacheKey, { ts: Date.now(), data: payload });
    return NextResponse.json(payload);
  } catch {
    return NextResponse.json({ error: "Please try again later." }, { status: 500 });
  }
}
