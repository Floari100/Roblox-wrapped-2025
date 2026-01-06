import type { WrappedData } from "@/lib/wrapped/types";

export async function loadRobloxWrapped(username: string): Promise<WrappedData> {
  const u = username.trim().replace(/^@/, "");
  if (!u) throw new Error("Provide a Roblox username");

  const res = await fetch(`/api/roblox/wrapped?username=${encodeURIComponent(u)}`);
  const j = await res.json().catch(() => ({}));

  if (!res.ok) throw new Error(j?.error ?? "Try again later.");
  return j as WrappedData;
}
