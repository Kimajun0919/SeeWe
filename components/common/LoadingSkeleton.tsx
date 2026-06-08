import { clsx } from "clsx";

export function LoadingSkeleton({ className }: { className?: string }) {
  return <div className={clsx("animate-pulse rounded-2xl bg-white/10", className)} />;
}
