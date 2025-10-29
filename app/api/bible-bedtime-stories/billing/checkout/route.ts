import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

// Ensure these API routes never prerender and always use the Node runtime
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2024-06-20" as any });
  const { plan, interval, userId } = await req.json();

  const map: Record<string, string | undefined> = {
    BASIC_monthly: process.env.STRIPE_PRICE_BASIC_MONTHLY,
    BASIC_yearly: process.env.STRIPE_PRICE_BASIC_YEARLY,
    FAMILY_monthly: process.env.STRIPE_PRICE_FAMILY_MONTHLY,
    FAMILY_yearly: process.env.STRIPE_PRICE_FAMILY_YEARLY,
    FAMILY_PLUS_monthly: process.env.STRIPE_PRICE_FPLUS_MONTHLY,
    FAMILY_PLUS_yearly: process.env.STRIPE_PRICE_FPLUS_YEARLY,
  };

  const key = `${String(plan || "BASIC").toUpperCase()}_${interval === "yearly" ? "yearly" : "monthly"}`;
  const price = map[key] || (interval === "yearly" ? process.env.STRIPE_PRICE_YEARLY : process.env.STRIPE_PRICE_MONTHLY);
  if (!price) return NextResponse.json({ error: "Price not configured" }, { status: 400 });

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price, quantity: 1 }],
    success_url: `${process.env.APP_URL}/pricing?success=1`,
    cancel_url: `${process.env.APP_URL}/pricing?canceled=1`,
    metadata: { userId, plan: String(plan || "BASIC").toUpperCase(), interval },
  });

  return NextResponse.json({ url: session.url });
}
