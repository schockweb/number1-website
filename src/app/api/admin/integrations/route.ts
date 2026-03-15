import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const clientId = new URL(request.url).searchParams.get("clientId");
  if (!clientId) return NextResponse.json({ error: "clientId is required" }, { status: 400 });
  try {
    const integrations = await prisma.clientIntegration.findMany({ where: { clientId }, orderBy: { platformName: "asc" } });
    return NextResponse.json(integrations ?? []);
  } catch (err) { console.error("[admin/integrations GET]", err); return NextResponse.json([], { status: 200 }); }
}

export async function POST(request: NextRequest) {
  let body: { clientId?: string; platformName?: string; encryptedApiToken?: string };
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 }); }
  const { clientId, platformName, encryptedApiToken } = body;
  if (!clientId) return NextResponse.json({ error: "clientId is required" }, { status: 400 });
  if (!["google_ads", "shopify"].includes(platformName ?? "")) return NextResponse.json({ error: "platformName must be google_ads or shopify" }, { status: 400 });
  if (!encryptedApiToken) return NextResponse.json({ error: "encryptedApiToken is required" }, { status: 400 });
  try {
    const integration = await prisma.clientIntegration.upsert({
      where: { clientId_platformName: { clientId: clientId!, platformName: platformName! } },
      update: { encryptedApiToken, status: "connected" },
      create: { clientId: clientId!, platformName: platformName!, encryptedApiToken, status: "connected" },
    });
    return NextResponse.json(integration);
  } catch (err) { console.error("[admin/integrations POST]", err); return NextResponse.json({ error: "Database unavailable" }, { status: 503 }); }
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const clientId = searchParams.get("clientId");
  const platform = searchParams.get("platform");
  if (!clientId || !platform) return NextResponse.json({ error: "clientId and platform are required" }, { status: 400 });
  try {
    await prisma.clientIntegration.delete({ where: { clientId_platformName: { clientId, platformName: platform } } });
    return NextResponse.json({ success: true });
  } catch { return NextResponse.json({ error: "Integration not found" }, { status: 404 }); }
}
