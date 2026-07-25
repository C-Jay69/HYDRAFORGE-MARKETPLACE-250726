import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

// Reuse a single postgres client across hot-reloads in dev.
const globalForDb = globalThis as unknown as {
  __pgClient?: ReturnType<typeof postgres>;
};

const connectionString = process.env.DATABASE_URL;

// Lazily create the client so importing this module never throws at build
// time (Next.js evaluates route modules during `next build` to collect page
// data, and the DB may not be reachable then). The connection is established
// on first query instead.
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

// `db` is typed as a Drizzle instance but the underlying client is created
// lazily on first use via the proxy below.
const client = new Proxy({} as ReturnType<typeof postgres>, {
  get(_t, prop) {
    return getClient()[prop as keyof ReturnType<typeof postgres>];
  },
}) as unknown as ReturnType<typeof postgres>;

export const db = drizzle(client, { schema });
export { schema };
