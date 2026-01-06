type RobloxFetchOpts = {
  url: string;
  method?: "GET" | "POST";
  body?: any;
  retries?: number;      // default 3
  minDelayMs?: number;   // default 250
};

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

export async function robloxFetch<T>({
  url,
  method = "GET",
  body,
  retries = 3,
  minDelayMs = 250,
}: RobloxFetchOpts): Promise<T> {
  let attempt = 0;

  while (true) {
    const res = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "wrapped-app/1.0",
      },
      body: body ? JSON.stringify(body) : undefined,
      cache: "no-store",
    });

    if (res.ok) return (await res.json()) as T;

    const text = await res.text().catch(() => "");

    if (res.status === 429 && attempt < retries) {
      const delay = Math.round(minDelayMs * Math.pow(2, attempt) + Math.random() * 200);
      attempt++;
      await sleep(delay);
      continue;
    }

    throw new Error(`Roblox API error ${res.status}: ${text.slice(0, 400)}`);
  }
}
