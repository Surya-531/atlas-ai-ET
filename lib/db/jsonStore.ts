import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function filePath(collection: string) {
  return path.join(DATA_DIR, `${collection}.json`);
}

/**
 * Minimal file-backed collection store.
 *
 * This exists so the demo runs with zero external services. It implements
 * the same shape a Supabase/Postgres repository would (read, write, list,
 * upsert) — see /lib/db/README.md for how to swap this for the real
 * `supabase-js` client without touching any calling code.
 */
export function readCollection<T>(collection: string, fallback: T[] = []): T[] {
  const fp = filePath(collection);
  if (!fs.existsSync(fp)) {
    writeCollection(collection, fallback);
    return fallback;
  }
  try {
    const raw = fs.readFileSync(fp, "utf-8");
    return JSON.parse(raw) as T[];
  } catch {
    return fallback;
  }
}

export function writeCollection<T>(collection: string, data: T[]): void {
  fs.writeFileSync(filePath(collection), JSON.stringify(data, null, 2), "utf-8");
}

export function resetCollection(collection: string): void {
  const fp = filePath(collection);
  if (fs.existsSync(fp)) fs.unlinkSync(fp);
}

export function collectionExists(collection: string): boolean {
  return fs.existsSync(filePath(collection));
}
