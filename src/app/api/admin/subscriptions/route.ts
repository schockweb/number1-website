import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

const PLAN_CONFIG: Record<string, { priceChfCents: number; maxAgents: number }> = {
  STANDARD: { priceChfCents: 95000, maxAgents: 5 },
  PREMIUM:  { priceChfCents: 149900, maxAgents: 10 },
  BUSINESS: { priceChfCents: 350000, maxAgents: 15 },
};

export async function GET(request: NextRequest) {
  const clientId = new URL(request.url).searchParams.get("clientId");
  if (!clientId) return NextResponse.json({ error: "clientId is required" }, { status: 400 });
  try {
    const subscription = await prisma.subscription.findFirst({ where: { clientId, status: { not: "cancelled" } }, orderBy: { createdAt: "desc" } });
    if (!subscription) return NextResponse.json({ error: "No active subscription found" }, { status: 404 });
    const refundEligible = subscription.refundEligibleUntil && new Date() <= new Date(subscription.refundEligibleUntil);
    return NextResponse.json({ ...subscription, refundEligible, priceDisplay: `${(subscription.priceChfCents / 100).toLocaleString("de-CH")} CHF` });
  } catch (err) { console.error("[admin/subscriptions GET]", err); return NextResponse.json({ error: "Failed to fetch subscription" }, { status: 500 }); }
}

export async function PUT(request: NextRequest) {
  let body: { clientId?: string; planTier?: string };
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 }); }
  const { clientId, planTier } = body;
  if (!clientId) return NextResponse.json({ error: "clientId is required" }, { status: 400 });
  const tier = (planTier || "").toUpperCase();
  if (!PLAN_CONFIG[tier]) return NextResponse.json({ error: "planTier must be STANDARD, PREMIUM, or BUSINESS" }, { status: 400 });
  const plan = PLAN_CONFIG[tier];
  try {
    const current = await prisma.subscription.findFirst({ where: { clientId, status: "active" }, orderBy: { createdAt: "desc" } });
    if (!current) return NextResponse.json({ error: "No active subscription to update" }, { status: 404 });
    if (current.planTier === tier) return NextResponse.json({ error: "Client is already on this plan" }, { status: 400 });
    const isDowngrade = plan.maxAgents < current.maxAgents;
    const updated = await prisma.subscription.update({ where: { id: current.id }, data: { planTier: tier, priceChfCents: plan.priceChfCents, maxAgents: plan.maxAgents } });
    await prisma.client.update({ where: { id: clientId }, data: { planTier: tier } });
    if (isDowngrade) { await prisma.agentRule.updateMany({ where: { clientId, agentTierId: { gt: plan.maxAgents }, status: "active" }, data: { status: "archived" } }); }
    return NextResponse.json({ ...updated, action: isDowngrade ? "downgraded" : "upgraded", priceDisplay: `${(plan.priceChfCents / 100).toLocaleString("de-CH")} CHF` });
  } catch (err) { console.error("[admin/subscriptions PUT]", err); return NextResponse.json({ error: "Failed to update subscription" }, { status: 500 }); }
}

export async function POST(request: NextRequest) {
  let body: { clientId?: string; action?: string };
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 }); }
  const { clientId, action } = body;
  if (!clientId) return NextResponse.json({ error: "clientId is required" }, { status: 400 });
  if (action !== "cancel") return NextResponse.json({ error: 'action must be "cancel"' }, { status: 400 });
  try {
    const subscription = await prisma.subscription.findFirst({ where: { clientId, status: "active" }, orderBy: { createdAt: "desc" } });
    if (!subscription) return NextResponse.json({ error: "No active subscription to cancel" }, { status: 404 });
    const refundEligible = subscription.refundEligibleUntil && new Date() <= new Date(subscription.refundEligibleUntil);
    await prisma.subscription.update({ where: { id: subscription.id }, data: { status: "cancelled", cancelledAt: new Date() } });
    await prisma.client.update({ where: { id: clientId }, data: { status: "cancelled" } });
    await prisma.agentRule.updateMany({ where: { clientId, status: "active" }, data: { status: "archived" } });
    const refundAmountChf = refundEligible ? Math.round(subscription.priceChfCents * 0.9) / 100 : 0;
    return NextResponse.json({ message: "Subscription cancelled", refundEligible, refundAmountChf: refundEligible ? `${refundAmountChf.toLocaleString("de-CH")} CHF` : null });
  } catch (err) { console.error("[admin/subscriptions POST]", err); return NextResponse.json({ error: "Failed to cancel subscription" }, { status: 500 }); }
}
