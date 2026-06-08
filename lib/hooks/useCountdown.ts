"use client";

import { useEffect, useState } from "react";

export function useCountdown(lastFetchedAt: number, intervalMs: number): number {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNow(Date.now());
    }, 250);

    return () => window.clearInterval(timer);
  }, []);

  if (!lastFetchedAt) {
    return Math.ceil(intervalMs / 1000);
  }

  const elapsed = now - lastFetchedAt;
  const remaining = Math.max(0, intervalMs - elapsed);
  return Math.ceil(remaining / 1000);
}
