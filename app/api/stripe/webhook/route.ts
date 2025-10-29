import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";         // ensure Node runtime (not Edge)
export const dynamic = "force-dynamic";  // allow reading raw body

// Function to get Stripe instance with lazy loading
async function getStripe() {
  try {
    // Dynamic import to avoid throwing at import time if the package isn't used
    const StripeModule = await import("stripe");
    return StripeModule.default;
  } catch (e) {
    return null;
  }
}

export async function POST(req: NextRequest) {
  // If Stripe isn't configured, acknowledge and exit (prevents build/runtime crashes)
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const secretKey = process.env.STRIPE_SECRET_KEY;
  
  const Stripe = await getStripe();

  if (!Stripe || !webhookSecret || !secretKey) {
    // Still return 200 so Stripe retries later when you're ready.
    return NextResponse.json({ ok: true, skipped: true }, { status: 200 });
  }

  const stripe = new Stripe(secretKey, { apiVersion: "2024-06-20" });

  const sig = req.headers.get("stripe-signature") || "";
  const raw = await req.text(); // raw body for signature check

  let event;
  try {
    event = await stripe.webhooks.constructEventAsync(raw, sig, webhookSecret);
  } catch (err: any) {
    // Signature mismatch or bad payload
    return NextResponse.json({ error: err.message }, { status: 400 });
  }

  // Handle the events you care about (safe defaults)
  switch (event.type) {
    case "checkout.session.completed":
    case "invoice.paid":
    case "customer.subscription.updated":
    case "customer.subscription.deleted":
      // TODO: update your entitlements here
      console.log(`✅ Received Stripe event: ${event.type}`);
      break;
    default:
      // ignore other events for now
      console.log(`ℹ️  Received unhandled Stripe event: ${event.type}`);
      break;
  }

  return NextResponse.json({ received: true }, { status: 200 });
}

