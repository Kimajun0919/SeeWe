import { toNumber } from "@/lib/utils/number";

export type UnknownRecord = Record<string, unknown>;

export function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function toArray<T = unknown>(value: unknown): T[] {
  if (value === null || value === undefined) {
    return [];
  }

  return Array.isArray(value) ? (value as T[]) : [value as T];
}

export function collectRecords(root: unknown): UnknownRecord[] {
  const records: UnknownRecord[] = [];

  function visit(value: unknown) {
    if (Array.isArray(value)) {
      value.forEach(visit);
      return;
    }

    if (!isRecord(value)) {
      return;
    }

    records.push(value);
    Object.values(value).forEach(visit);
  }

  visit(root);
  return records;
}

export function collectValuesByKey(root: unknown, keyName: string): unknown[] {
  const values: unknown[] = [];

  function visit(value: unknown) {
    if (Array.isArray(value)) {
      value.forEach(visit);
      return;
    }

    if (!isRecord(value)) {
      return;
    }

    for (const [key, nestedValue] of Object.entries(value)) {
      if (key === keyName) {
        values.push(nestedValue);
      }
      visit(nestedValue);
    }
  }

  visit(root);
  return values;
}

export function flattenRecords(value: unknown): UnknownRecord[] {
  return collectRecords(value);
}

export function hasAnyKey(record: UnknownRecord, keys: string[]): boolean {
  return keys.some((key) => Object.prototype.hasOwnProperty.call(record, key));
}

export function firstRecordWithAnyKey(root: unknown, keys: string[]): UnknownRecord | undefined {
  return collectRecords(root).find((record) => hasAnyKey(record, keys));
}

export function pickValue(record: unknown, keys: string[]): unknown {
  if (!isRecord(record)) {
    return undefined;
  }

  for (const key of keys) {
    const value = record[key];
    if (value !== null && value !== undefined && value !== "") {
      return Array.isArray(value) ? value[0] : value;
    }
  }

  return undefined;
}

export function pickString(record: unknown, keys: string[], fallback = ""): string {
  const value = pickValue(record, keys);
  if (value === null || value === undefined || value === "") {
    return fallback;
  }

  return String(value).trim();
}

export function pickNumber(record: unknown, keys: string[]): number | null {
  return toNumber(pickValue(record, keys));
}

export function uniqueBy<T>(items: T[], getKey: (item: T) => string): T[] {
  const seen = new Set<string>();
  const unique: T[] = [];

  for (const item of items) {
    const key = getKey(item);
    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    unique.push(item);
  }

  return unique;
}

export function extractResult(root: unknown): { code?: string; message?: string } {
  const resultRecord = firstRecordWithAnyKey(root, ["CODE", "MESSAGE"]);
  if (!resultRecord) {
    return {};
  }

  return {
    code: pickString(resultRecord, ["CODE"]) || undefined,
    message: pickString(resultRecord, ["MESSAGE"]) || undefined,
  };
}
