import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
    _req: NextRequest,
    { params }: { params: Promise<{ token: string }> }
) {
    const { token } = await params;
    try {
        const client = await prisma.client.findUnique({
            where: { dashboardToken: token },
            include: {
                onboarding: true,
                reports: {
                    orderBy: { createdAt: 'desc' },
                    take: 20,
                },
                subscriptions: {
                    orderBy: { createdAt: 'desc' },
                    take: 1,
                },
            },
        });

        if (!client) {
            return NextResponse.json({ error: 'Not found' }, { status: 404 });
        }

        // Fetch agent rules for this client
        const agentRules = await prisma.agentRule.findMany({
            where: { clientId: client.id },
            orderBy: { agentTierId: 'asc' },
        });

        return NextResponse.json({
            ...client,
            agentRules,
            subscription: client.subscriptions[0] || null,
        });
    } catch (err) {
        console.error('[dashboard/token] Error:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
