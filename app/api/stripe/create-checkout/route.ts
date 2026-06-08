import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  console.log("[stripe/create-checkout] STRIPE_SECRET_KEY:", process.env.STRIPE_SECRET_KEY ? `${process.env.STRIPE_SECRET_KEY.slice(0, 12)}…` : "MANQUANT");
  console.log("[stripe/create-checkout] STRIPE_PRICE_ID:", process.env.STRIPE_PRICE_ID ?? "MANQUANT");

  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_PRICE_ID) {
    return NextResponse.json(
      { error: "Stripe non configuré — ajoutez STRIPE_SECRET_KEY et STRIPE_PRICE_ID dans .env.local" },
      { status: 503 },
    );
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

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

  const { data: { user }, error: authError } = await supabase.auth.getUser();

  console.log("[create-checkout] user:", user?.id ?? "null", "| authError:", authError?.message ?? "none");
  console.log("[create-checkout] email:", user?.email ?? "MANQUANT");

  if (!user) {
    return NextResponse.json({ error: "Non authentifié — reconnectez-vous." }, { status: 401 });
  }
  if (!user.email) {
    return NextResponse.json({ error: "Email introuvable sur ce compte — reconnectez-vous." }, { status: 400 });
  }

  // Look up existing stripe_customer_id to avoid attaching the wrong email
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  );
  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("stripe_customer_id")
    .eq("id", user.id)
    .maybeSingle();

  const existingCustomerId = (profile as { stripe_customer_id?: string } | null)?.stripe_customer_id;
  console.log("[create-checkout] stripe_customer_id en base:", existingCustomerId ?? "aucun");

  // If an existing customer ID is found, verify its email matches — reset if not
  let customerId: string | undefined = existingCustomerId ?? undefined;
  if (customerId) {
    const existing = await stripe.customers.retrieve(customerId);
    if (existing.deleted) {
      customerId = undefined;
    } else {
      const existingEmail = (existing as Stripe.Customer).email;
      console.log("[create-checkout] email du customer Stripe existant:", existingEmail);
      if (existingEmail !== user.email) {
        // Customer belongs to a different email — create a fresh one for this user
        console.log("[create-checkout] email mismatch → création d'un nouveau customer");
        customerId = undefined;
      }
    }
  }

  const origin = request.headers.get("origin") ?? "http://localhost:3000";

  console.log("[create-checkout] email envoyé à Stripe:", user.email);

  try {
    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: process.env.STRIPE_PRICE_ID, quantity: 1 }],
      metadata: { user_id: user.id },
      success_url: `${origin}/dashboard?success=true`,
      cancel_url: `${origin}/dashboard`,
      locale: "fr",
    };

    if (customerId) {
      sessionParams.customer = customerId;
    } else {
      sessionParams.customer_email = user.email;
    }

    const session = await stripe.checkout.sessions.create(sessionParams);

    console.log("[create-checkout] session créée:", session.id, "| url:", session.url?.slice(0, 60));
    return NextResponse.json({ url: session.url });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[create-checkout] Stripe error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
