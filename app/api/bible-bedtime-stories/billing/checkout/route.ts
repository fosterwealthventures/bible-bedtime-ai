import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

// Ensure these API routes never prerender and always use the Node runtime
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2024-06-20" as any });
  const { tier, userId } = await req.json(); // pass your signed-in user id

  const price =
    tier === "yearly" ? process.env.STRIPE_PRICE_YEARLY! : process.env.STRIPE_PRICE_MONTHLY!;

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price, quantity: 1 }],
    success_url: `${process.env.APP_URL}/bible-bedtime-stories?success=1`,
    cancel_url: `${process.env.APP_URL}/bible-bedtime-stories?canceled=1`,
    metadata: { userId },
  });

  return NextResponse.json({ url: session.url });
}