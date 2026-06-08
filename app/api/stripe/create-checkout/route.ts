import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  // Debug — visible in `npm run dev` terminal output
  console.log("[stripe/create-checkout] STRIPE_SECRET_KEY:", process.env.STRIPE_SECRET_KEY ? `${process.env.STRIPE_SECRET_KEY.slice(0, 12)}…` : "MANQUANT");
  console.log("[stripe/create-checkout] STRIPE_PRICE_ID:", process.env.STRIPE_PRICE_ID ?? "MANQUANT");

  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_PRICE_ID) {
    return NextResponse.json(
      { error: "Stripe non configuré — ajoutez STRIPE_SECRET_KEY et STRIPE_PRICE_ID dans .env.local" },
      { status: 503 },
    );
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  // Get authenticated user from Supabase session cookie
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const origin = request.headers.get("origin") ?? "http://localhost:3000";

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [{ price: process.env.STRIPE_PRICE_ID, quantity: 1 }],
    metadata: { user_id: user.id },
    customer_email: user.email,
    success_url: `${origin}/dashboard?success=true`,
    cancel_url: `${origin}/dashboard`,
    locale: "fr",
  });

  return NextResponse.json({ url: session.url });
}
