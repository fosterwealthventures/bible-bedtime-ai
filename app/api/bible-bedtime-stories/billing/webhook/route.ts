import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
// import your db client here

// Ensure these API routes never prerender and always use the Node runtime
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2024-06-20" as any });
  const sig = req.headers.get("stripe-signature")!;
  const raw = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(raw, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err: any) {
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const metaUserId = session.metadata?.userId!;
    const priceId = (session as any).line_items?.data?.[0]?.price?.id || (session as any).display_items?.[0]?.plan?.id;

    const mapping: Record<string, string | undefined> = {
      [String(process.env.STRIPE_PRICE_BASIC_MONTHLY || "")]: "BASIC",
      [String(process.env.STRIPE_PRICE_BASIC_YEARLY || "")]: "BASIC",
      [String(process.env.STRIPE_PRICE_FAMILY_MONTHLY || "")]: "FAMILY",
      [String(process.env.STRIPE_PRICE_FAMILY_YEARLY || "")]: "FAMILY",
      [String(process.env.STRIPE_PRICE_FPLUS_MONTHLY || "")]: "FAMILY_PLUS",
      [String(process.env.STRIPE_PRICE_FPLUS_YEARLY || "")]: "FAMILY_PLUS",
      [String(process.env.STRIPE_PRICE_MONTHLY || "")]: "BASIC",
      [String(process.env.STRIPE_PRICE_YEARLY || "")]: "BASIC",
    };
    const plan = mapping[priceId] || "BASIC";
    const period_end = (session as any).current_period_end || (session as any).subscription?.current_period_end;
    // TODO: persist { plan, period_end } for metaUserId in your DB
  }

  return NextResponse.json({ received: true });
}
