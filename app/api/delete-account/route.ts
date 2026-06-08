import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

export async function POST() {
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

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  );

  // Cancel active Stripe subscription if any
  if (process.env.STRIPE_SECRET_KEY) {
    try {
      const { data: profile } = await supabaseAdmin
        .from("profiles")
        .select("stripe_customer_id")
        .eq("id", user.id)
        .maybeSingle();

      const customerId = (profile as { stripe_customer_id?: string } | null)?.stripe_customer_id;
      if (customerId) {
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
        const subscriptions = await stripe.subscriptions.list({
          customer: customerId,
          status: "active",
          limit: 10,
        });
        await Promise.all(subscriptions.data.map((sub) => stripe.subscriptions.cancel(sub.id)));
      }
    } catch { /* non-blocking — proceed with deletion regardless */ }
  }

  // Delete user data from all tables
  await Promise.all([
    supabaseAdmin.from("animals").delete().eq("user_id", user.id),
    supabaseAdmin.from("plans").delete().eq("user_id", user.id),
    supabaseAdmin.from("profiles").delete().eq("id", user.id),
  ]);

  // Delete auth user (must be last)
  await supabaseAdmin.auth.admin.deleteUser(user.id);

  return NextResponse.json({ success: true });
}
