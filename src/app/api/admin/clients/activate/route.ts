import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PATCH(req: NextRequest) {
    try {
        const { clientId, status } = await req.json();
        if (!clientId || !status) return NextResponse.json({ error: 'clientId and status required' }, { status: 400 });
        const allowed = ['pending', 'onboarded', 'active', 'paused'];
        if (!allowed.includes(status)) return NextResponse.json({ error: `status must be one of: ${allowed.join(', ')}` }, { status: 400 });
        const client = await prisma.client.update({ where: { id: clientId }, data: { onboardingStatus: status } });
        return NextResponse.json({ success: true, client });
    } catch (err) {
        console.error('[admin/clients/activate]', err);
        return NextResponse.json({ error: 'Failed to update client status' }, { status: 500 });
    }
}
