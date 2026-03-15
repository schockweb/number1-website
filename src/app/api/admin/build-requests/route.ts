import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
    try {
        const requests = await prisma.buildRequest.findMany({ orderBy: { createdAt: 'desc' } });
        return NextResponse.json({ requests });
    } catch (err) {
        console.error('[admin/build-requests GET]', err);
        return NextResponse.json({ requests: [] });
    }
}

export async function PATCH(req: NextRequest) {
    try {
        const { id, status, notes, priority } = await req.json();
        if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
        const updated = await prisma.buildRequest.update({
            where: { id },
            data: { ...(status && { status }), ...(notes !== undefined && { notes }), ...(priority && { priority }) },
        });
        return NextResponse.json({ success: true, buildRequest: updated });
    } catch (err) {
        console.error('[admin/build-requests PATCH]', err);
        return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
    }
}
