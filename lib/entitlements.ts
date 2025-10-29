export type PlanCode = "FREE" | "BASIC" | "FAMILY" | "FAMILY_PLUS";

export function useEntitlements(plan: PlanCode | string | undefined) {
  const limits = {
    FREE:        { profiles: 1, generations: 5,   streams: 1, downloads: false },
    BASIC:       { profiles: 1, generations: 25,  streams: 1, downloads: false },
    FAMILY:      { profiles: 5, generations: 100, streams: 3, downloads: false },
    FAMILY_PLUS: { profiles:10, generations: 300, streams: 5, downloads: true  },
  } as const;
  const key = (plan || "FREE").toUpperCase() as keyof typeof limits;
  return limits[key] || limits.FREE;
}

