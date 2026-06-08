import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

// Raw body required for Stripe signature verification
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json(
      { error: "Stripe webhook non configuré" },
      { status: 503 },
    );
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  // Supabase admin client (bypasses RLS) for server-side writes
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  );

  const body = await request.text();
  const sig = request.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json(
      { error: "Missing stripe-signature" },
      { status: 400 },
    );
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET,
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Signature invalide";
    console.error("Webhook signature error:", msg);
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  // Cast through unknown to avoid Stripe union type constraints
  const obj = event.data.object as unknown as Record<string, unknown>;

  switch (event.type) {
    case "checkout.session.completed": {
      const metadata = obj["metadata"] as Record<string, string> | null;
      const userId = metadata?.["user_id"];
      const customerId = (obj["customer"] ?? null) as string | null;

      if (userId) {
        await supabaseAdmin
          .from("profiles")
          .update({
            is_subscribed: true,
            ...(customerId ? { stripe_customer_id: customerId } : {}),
          })
          .eq("id", userId);
      }
      break;
    }

    case "customer.subscription.deleted": {
      const customerId = (obj["customer"] ?? "") as string;
      if (customerId) {
        await supabaseAdmin
          .from("profiles")
          .update({ is_subscribed: false })
          .eq("stripe_customer_id", customerId);
      }
      break;
    }

    case "invoice.payment_failed": {
      const customerId = (obj["customer"] ?? "") as string;
      if (customerId) {
        await supabaseAdmin
          .from("profiles")
          .update({ is_subscribed: false })
          .eq("stripe_customer_id", customerId);
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}
