import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function GET() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        },
      },
    },
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("regenerations_count, regenerations_reset_date")
    .eq("id", user.id)
    .maybeSingle();

  const p = profile as { regenerations_count: number; regenerations_reset_date: string | null } | null;
  const count = p?.regenerations_count ?? 0;
  const resetDate = p?.regenerations_reset_date ?? null;

  const now = new Date();
  const resetD = resetDate ? new Date(resetDate + "T00:00:00") : null;
  const isSameMonth = !!(resetD && resetD.getFullYear() === now.getFullYear() && resetD.getMonth() === now.getMonth());

  const used = isSameMonth ? count : 0;
  const remaining = Math.max(0, 4 - used);

  const nm = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const nextResetDate = `${nm.getFullYear()}-${String(nm.getMonth() + 1).padStart(2, "0")}-01`;

  return NextResponse.json({ remaining, resetDate: nextResetDate });
}
