export function normalizeWeights<T extends { weight: number }>(items: T[]): T[] {
  const positiveTotal = items.reduce((sum, item) => sum + Math.max(0, item.weight), 0);

  if (positiveTotal <= 0) {
    const fallbackWeight = items.length > 0 ? 1 / items.length : 0;
    return items.map((item) => ({ ...item, weight: fallbackWeight }));
  }

  return items.map((item) => ({
    ...item,
    weight: Math.max(0, item.weight) / positiveTotal,
  }));
}
