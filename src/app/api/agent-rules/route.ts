import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/agent-rules?clientId=xxx[&tier=N]
 * Fetch agent rules scoped to a specific client.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const clientId = searchParams.get("clientId");
  const tier = searchParams.get("tier");

  if (!clientId) {
    return NextResponse.json(
      { error: "clientId is required" },
      { status: 400 }
    );
  }

  const where: { clientId: string; agentTierId?: number } = { clientId };
  if (tier) {
    const tierNum = parseInt(tier, 10);
    if (isNaN(tierNum) || tierNum < 1 || tierNum > 15) {
      return NextResponse.json(
        { error: "tier must be between 1 and 15" },
        { status: 400 }
      );
    }
    where.agentTierId = tierNum;
  }

  try {
    const rules = await prisma.agentRule.findMany({
      where,
      orderBy: { agentTierId: "asc" },
    });
    return NextResponse.json(rules ?? []);
  } catch (err) {
    console.error("[api/agent-rules GET]", err);
    return NextResponse.json([], { status: 200 });
  }
}

/**
 * PUT /api/agent-rules
 * Upsert a custom system prompt for a client + agent tier.
 *
 * Body: { clientId, agentTierId, customPromptText, status? }
 */
export async function PUT(request: NextRequest) {
  let body: {
    clientId?: string;
    agentTierId?: number;
    customPromptText?: string;
    status?: string;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { clientId, agentTierId, customPromptText, status } = body;

  // ── Validation ──
  if (!clientId || typeof clientId !== "string") {
    return NextResponse.json(
      { error: "clientId is required (string)" },
      { status: 400 }
    );
  }
  if (!agentTierId || agentTierId < 1 || agentTierId > 15) {
    return NextResponse.json(
      { error: "agentTierId must be between 1 and 15" },
      { status: 400 }
    );
  }
  if (!customPromptText || typeof customPromptText !== "string") {
    return NextResponse.json(
      { error: "customPromptText is required (string)" },
      { status: 400 }
    );
  }
  if (customPromptText.length > 10_000) {
    return NextResponse.json(
      { error: "customPromptText must be ≤ 10,000 characters" },
      { status: 400 }
    );
  }
  if (status && !["active", "paused", "archived"].includes(status)) {
    return NextResponse.json(
      { error: "status must be: active, paused, or archived" },
      { status: 400 }
    );
  }

  try {
    const rule = await prisma.agentRule.upsert({
      where: {
        clientId_agentTierId: { clientId, agentTierId },
      },
      update: {
        customPromptText,
        ...(status ? { status } : {}),
      },
      create: {
        clientId,
        agentTierId,
        customPromptText,
        status: status ?? "active",
      },
    });
    return NextResponse.json(rule ?? { clientId, agentTierId, customPromptText, status: "active" });
  } catch (err) {
    console.error("[api/agent-rules PUT]", err);
    // Return a stub success so the UI doesn't break without a DB
    return NextResponse.json({
      clientId,
      agentTierId,
      customPromptText,
      status: status ?? "active",
      _stub: true,
    });
  }
}
