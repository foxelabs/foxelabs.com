// Minimal fixed-window rate limiter for the API routes.
//
// State is per serverless instance, so this is best-effort — a warm lambda
// enforces the cap, a cold start resets it. That still stops the cheap abuse
// (a scripted POST loop hammering one instance) without adding a KV dependency.

interface Window {
  count: number;
  resetAt: number;
}

const windows = new Map<string, Window>();

/**
 * True when `key` (usually the client IP) is within its allowance of
 * `limit` requests per `windowMs`. False = reject the request.
 */
export function allowRequest(key: string, limit = 5, windowMs = 60_000): boolean {
  const now = Date.now();

  // Opportunistic cleanup so the map can't grow unbounded on a long-lived instance.
  if (windows.size > 1000) {
    for (const [k, w] of windows) if (w.resetAt <= now) windows.delete(k);
  }

  const w = windows.get(key);
  if (!w || w.resetAt <= now) {
    windows.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  w.count += 1;
  return w.count <= limit;
}
