import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

const PLAN_CONFIG: Record<string, { priceChfCents: number; maxAgents: number }> = {
  STANDARD: { priceChfCents: 95000, maxAgents: 5 },
  PREMIUM:  { priceChfCents: 149900, maxAgents: 10 },
  BUSINESS: { priceChfCents: 350000, maxAgents: 15 },
};

const AGENT_NAMES: Record<number, string> = {
  1: "Revenue Optimizer", 2: "Cost Analyst", 3: "Talent Scout",
  4: "Compliance Monitor", 5: "Stock Analyzer", 6: "Ad Strategist",
  7: "Churn Predictor", 8: "Supply Chain Agent", 9: "Payroll Automator",
  10: "Sentiment Analyzer", 11: "Forecast Engine", 12: "Risk Assessor",
  13: "Report Generator", 14: "Onboarding Agent", 15: "Data Steward",
};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const clientId = searchParams.get("clientId");

  try {
    if (clientId) {
      const client = await prisma.client.findUnique({
        where: { id: clientId },
        include: {
          subscriptions: { orderBy: { createdAt: "desc" }, take: 1 },
          onboarding: true,
          reports: { orderBy: { createdAt: "desc" } },
        },
      });
      if (!client) return NextResponse.json({ error: "Client not found" }, { status: 404 });
      return NextResponse.json(client);
    }

    const clients = await prisma.client.findMany({
      include: {
        subscriptions: { orderBy: { createdAt: "desc" }, take: 1 },
        onboarding: { select: { industry: true, primaryGoal: true, brandPersonality: true } },
        reports: { select: { id: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ clients: clients ?? [] });
  } catch (err) {
    console.error("[admin/clients GET]", err);
    return NextResponse.json({ clients: [] }, { status: 200 });
  }
}

export async function POST(request: NextRequest) {
  let body: { name?: string; email?: string; companyName?: string; planTier?: string };
  try { body = await request.json(); }
  catch { return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 }); }

  const { name, email, companyName, planTier } = body;
  if (!name?.trim() || name.trim().length < 2)
    return NextResponse.json({ error: "name is required (min 2 characters)" }, { status: 400 });
  if (!email?.includes("@"))
    return NextResponse.json({ error: "A valid email address is required" }, { status: 400 });
  if (!companyName?.trim())
    return NextResponse.json({ error: "companyName is required" }, { status: 400 });

  const tier = (planTier || "STANDARD").toUpperCase();
  if (!PLAN_CONFIG[tier])
    return NextResponse.json({ error: "planTier must be STANDARD, PREMIUM, or BUSINESS" }, { status: 400 });

  const plan = PLAN_CONFIG[tier];
  const now = new Date();
  const periodEnd = new Date(now); periodEnd.setMonth(periodEnd.getMonth() + 1);
  const refundDeadline = new Date(now); refundDeadline.setDate(refundDeadline.getDate() + 7);

  try {
    const existing = await prisma.client.findUnique({ where: { email: email.toLowerCase().trim() } });
    if (existing) return NextResponse.json({ error: "A client with this email already exists" }, { status: 409 });

    const client = await prisma.client.create({
      data: {
        name: name.trim(), email: email.toLowerCase().trim(),
        companyName: companyName.trim(), planTier: tier, status: "active",
        subscriptions: { create: { planTier: tier, priceChfCents: plan.priceChfCents, maxAgents: plan.maxAgents, status: "active", currentPeriodStart: now, currentPeriodEnd: periodEnd, refundEligibleUntil: refundDeadline } },
      },
      include: { subscriptions: true },
    });

    const agentRulePromises = [];
    for (let tid = 1; tid <= plan.maxAgents; tid++) {
      agentRulePromises.push(prisma.agentRule.upsert({
        where: { clientId_agentTierId: { clientId: client.id, agentTierId: tid } },
        update: {},
        create: { clientId: client.id, agentTierId: tid, customPromptText: `You are the ${AGENT_NAMES[tid] || `Agent Tier ${tid}`}. Analyze data and provide actionable business recommendations.`, status: "active" },
      }));
    }
    await Promise.all(agentRulePromises);
    return NextResponse.json(client, { status: 201 });
  } catch (err) {
    console.error("[admin/clients POST]", err);
    return NextResponse.json({ error: "Failed to create client. Please try again." }, { status: 500 });
  }
}
