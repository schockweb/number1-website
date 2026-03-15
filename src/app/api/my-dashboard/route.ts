import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';

/**
 * GET /api/my-dashboard
 * Returns the signed-in user's Client record (by email match).
 * Used by the homepage hero to decide which button to show.
 */
export async function GET() {
    const session = await auth();
    if (!session?.user?.email) {
        return NextResponse.json({ signedIn: false }, { status: 401 });
    }

    try {
        const client = await prisma.client.findUnique({
            where: { email: session.user.email },
            select: {
                dashboardToken: true,
                onboardingStatus: true,
                onboarding: { select: { clientId: true } },
            },
        });

        if (!client) {
            // Signed in but no brief submitted yet
            return NextResponse.json({ signedIn: true, hasBrief: false });
        }

        return NextResponse.json({
            signedIn: true,
            hasBrief: !!client.onboarding,
            token: client.dashboardToken,
            status: client.onboardingStatus,
        });
    } catch (err) {
        console.error('[my-dashboard]', err);
        return NextResponse.json({ signedIn: true, hasBrief: false });
    }
}
