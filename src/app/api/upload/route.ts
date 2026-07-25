import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getSessionUser } from "@/lib/auth";

const BUCKET = "product-screenshots";

// POST /api/upload  — requires auth. Body: { filename, contentType }.
// Returns a signed upload URL + the eventual public URL.
export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { filename?: string; contentType?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body.filename || !body.contentType) {
    return NextResponse.json(
      { error: "filename and contentType are required." },
      { status: 400 }
    );
  }

  // Use the SERVICE ROLE key so we can sign uploads server-side.
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );

  const ext = (body.filename.split(".").pop() || "png").toLowerCase();
  const path = `${user.id}/${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 8)}.${ext}`;

  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUploadUrl(path);

  if (error || !data) {
    console.error("createSignedUploadUrl failed:", error);
    return NextResponse.json(
      { error: "Could not prepare upload." },
      { status: 500 }
    );
  }

  const { data: publicData } = supabase.storage.from(BUCKET).getPublicUrl(path);

  return NextResponse.json({
    uploadUrl: data.signedUrl,
    path: data.path,
    publicUrl: publicData.publicUrl,
    token: data.token,
  });
}
