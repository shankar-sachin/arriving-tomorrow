export const STAGES = [
  { label: "Order placed", at: 0 },
  { label: "Packed with love", at: 8_000 },
  { label: "Shipped", at: 20_000 },
  { label: "Out for delivery", at: 40_000 },
  { label: "Arriving tomorrow", at: 60_000 },
] as const;

export const NEVER = { label: "Delivered", at: Infinity } as const;

export const EXCUSES = [
  "Driver stopped to admire a particularly good sunset.",
  "Package is finding itself on a gap year in Goa.",
  "Rerouted via the scenic route (Saturn).",
  "Courier got distracted by a very good dog.",
  "Truck is stuck behind a parade that never ends.",
  "Your parcel joined a book club. It meets on delivery days.",
  "Weather delay: it was slightly too nice outside.",
  "Package is at the depot, trying on its own contents.",
  "Out for delivery. Deeply, philosophically out.",
  "Driver took a wrong turn at Albuquerque.",
  "Awaiting customs clearance from the Kingdom of Nope.",
  "Package spotted at a café, journaling about its journey.",
];

export interface TrackingState {
  stage: number;
  progress: number;
  excuse: string;
  eta: Date;
}

/**
 * Pure function of elapsed time. Progress approaches 100% but never gets there:
 * linear to 90% through the stages, then an asymptotic crawl toward 99.99…%.
 */
export function trackingState(placedAt: number, now: number): TrackingState {
  const elapsed = Math.max(0, now - placedAt);
  let stage = 0;
  STAGES.forEach((s, i) => {
    if (elapsed >= s.at) stage = i;
  });
  const last = STAGES[STAGES.length - 1].at;
  const progress =
    elapsed < last ? (elapsed / last) * 0.9 : 0.9 + 0.0999 * (1 - Math.exp(-(elapsed - last) / 600_000));
  const eta = new Date(now);
  eta.setDate(eta.getDate() + 1);
  return {
    stage,
    progress: Math.min(progress, 0.9999),
    excuse: EXCUSES[Math.floor(elapsed / 7_000) % EXCUSES.length],
    eta,
  };
}
