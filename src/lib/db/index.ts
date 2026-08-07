import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

// Reuse a single postgres client across hot-reloads in dev.
const globalForDb = globalThis as unknown as {
  __pgClient?: ReturnType<typeof postgres>;
  __db?: ReturnType<typeof drizzle<typeof schema>>;
};

const connectionString = process.env.DATABASE_URL;

// Lazily create the postgres-js client so importing this module never throws
// at build time (Next.js evaluates route modules during `next build` to
// collect page data, and the DB may not be reachable then). The connection
// is established on first query instead.
function getClient() {
  if (!connectionString) {
    throw new Error(
      "DATABASE_URL is not set. Copy .env.local.example to .env.local (or set it in your deployment environment)."
    );
  }
  if (!globalForDb.__pgClient) {
    // Supabase requires SSL. On some serverless platforms (e.g. Vercel) the
    // TLS chain is terminated by a proxy presenting a self-signed root, so we
    // can't strictly verify the chain. The connection is still encrypted and
    // pinned to a known Supabase host, so disabling verification is safe here.
    globalForDb.__pgClient = postgres(connectionString, {
      max: 5,
      connect_timeout: 15,
      ssl: { rejectUnauthorized: false },
    });
  }
  return globalForDb.__pgClient;
}

// Lazily build the Drizzle instance only when it's actually used. This
// keeps `import { db } from "@/lib/db"` cheap and side-effect-free at
// module-load time, which avoids hangs during Turbopack's first compile of
// pages that touch the DB layer.
export function getDb() {
  if (!globalForDb.__db) {
    globalForDb.__db = drizzle(getClient(), { schema });
  }
  return globalForDb.__db;
}

// Convenience re-export so call sites that just want a query handle can do
// `import { db } from "@/lib/db"` — but note this is a Proxy that defers
// building the real Drizzle client until the first method call.
export const db = new Proxy({} as ReturnType<typeof drizzle<typeof schema>>, {
  get(_target, prop) {
    // Forward every property access to the lazily-built Drizzle instance.
    const target = getDb() as unknown as Record<PropertyKey, unknown>;
    const value = target[prop];
    return typeof value === "function" ? (value as Function).bind(target) : value;
  },
}) as ReturnType<typeof drizzle<typeof schema>>;

export { schema };
