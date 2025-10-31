// app/api/stripe/webhook/route.ts
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Minimal, safe webhook: builds even when Stripe isn’t configured
export async function POST(req: NextRequest): Promise<NextResponse> {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!secret || !key) {
    // Don’t crash builds/runs if keys are missing; Stripe will retry later.
    return NextResponse.json({ ok: true, skipped: true }, { status: 200 });
  }

  const { default: Stripe } = await import("stripe");
  const stripe = new Stripe(key, { apiVersion: "2024-06-20" });

  const sig = req.headers.get("stripe-signature") || "";
  const raw = await req.text(); // raw body required for signature verification

  try {
    const event = await stripe.webhooks.constructEventAsync(raw, sig, secret);

    switch (event.type) {
      case "checkout.session.completed":
      case "invoice.paid":
      case "customer.subscription.updated":
      case "customer.subscription.deleted":
        // TODO: update entitlements, etc.
        break;
      default:
        break;
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
