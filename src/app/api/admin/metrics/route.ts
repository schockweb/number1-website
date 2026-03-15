import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const clientId = new URL(request.url).searchParams.get("clientId");
  if (!clientId) return NextResponse.json({ error: "clientId is required" }, { status: 400 });

  try {
    const totalTasks = await prisma.taskLog.count({ where: { clientId } });
    const logs = await prisma.taskLog.findMany({ where: { clientId }, select: { status: true, revenueImpact: true, accuracyScore: true, agentTierId: true } });

    let totalRevenue = 0, sumAccuracy = 0;
    const tasksByTier: Record<number, number> = {};
    for (const log of logs) {
      if (log.revenueImpact) totalRevenue += log.revenueImpact;
      if (log.accuracyScore !== null) sumAccuracy += log.accuracyScore;
      tasksByTier[log.agentTierId] = (tasksByTier[log.agentTierId] || 0) + 1;
    }
    const avgAccuracy = logs.length > 0 ? sumAccuracy / logs.length : 0;
    const rulesConfigured = await prisma.agentRule.count({ where: { clientId, status: "active" } });

    return NextResponse.json({
      totalTasks, tasksByTier,
      totalRevenue: totalRevenue > 0 ? `$${(totalRevenue / 1000000).toFixed(1)}M` : "$0.0M",
      avgAccuracy: avgAccuracy > 0 ? `${avgAccuracy.toFixed(1)}%` : "0.0%",
      activeAgents: rulesConfigured,
    });
  } catch (err) {
    console.error("[admin/metrics GET]", err);
    return NextResponse.json({ totalTasks: 0, totalRevenue: "$0.0M", avgAccuracy: "0.0%", activeAgents: 0, tasksByTier: {} });
  }
}
