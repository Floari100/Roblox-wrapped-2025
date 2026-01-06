export type WrappedProfile = {
  id: string;
  displayName: string;
  avatarUrl?: string;
};

export type WrappedHighlight = {
  label: string;
  value: string;
  subtext?: string;
};

export type WrappedTimelineEvent = {
  ts: number; // unix seconds
  title: string;
  meta?: string;
};

export type WrappedCollectionItem = {
  title: string;
  value?: string;
  meta?: string;
};

export type WrappedData = {
  provider: "roblox" | "steam";
  profile: WrappedProfile;
  highlights: WrappedHighlight[];
  timeline: WrappedTimelineEvent[];
  collections: Record<string, WrappedCollectionItem[]>;
};
