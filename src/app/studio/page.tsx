import Link from "next/link";
import { getSessionUser } from "@/lib/auth";
import { listProducts } from "@/lib/products";
import { StudioSignIn } from "@/components/StudioSignIn";
import { StudioDashboard } from "@/components/StudioDashboard";

export const dynamic = "force-dynamic";

export default async function StudioPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const user = await getSessionUser();

  // Not signed in -> show the magic-link sign-in form.
  if (!user) {
    return (
      <div className="mx-auto flex max-w-md flex-col gap-6 px-4 py-20 sm:px-6">
        <div>
          <h1 className="text-2xl font-extrabold text-white">HYDRAFORGE Studio</h1>
          <p className="mt-1 text-sm text-slate-400">
            Sign in with your email to list your apps and demos for sale.
          </p>
        </div>

        {error && (
          <div className="rounded-lg border border-red-800/50 bg-red-950/40 px-4 py-3 text-sm text-red-300">
            Authentication failed. Please try again.
          </div>
        )}

        <StudioSignIn />
        <Link
          href="/"
          className="text-center text-sm text-slate-500 hover:text-cyan-400"
        >
          ← Back to marketplace
        </Link>
      </div>
    );
  }

  // Signed in -> load all of THIS owner's products (incl. drafts).
  const products = await listProducts({ includeDrafts: true, ownerId: user.id });

  return <StudioDashboard products={products} email={user.email} />;
}
