import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { type, clientName, clientEmail, companyName, websiteUrl, summary, priority } = body;

        if (!type || !summary) {
            return NextResponse.json({ error: 'type and summary are required.' }, { status: 400 });
        }

        const buildRequest = await prisma.buildRequest.create({
            data: {
                type,
                clientName: clientName || null,
                clientEmail: clientEmail || null,
                companyName: companyName || null,
                websiteUrl: websiteUrl || null,
                summary,
                priority: priority || 'normal',
                status: 'new',
            },
        });

        return NextResponse.json({ success: true, id: buildRequest.id });
    } catch (err) {
        console.error('[/api/build-requests POST]', err);
        return NextResponse.json({ error: 'Failed to save build request.' }, { status: 500 });
    }
}

export async function GET() {
    try {
        const requests = await prisma.buildRequest.findMany({
            orderBy: { createdAt: 'desc' },
        });
        return NextResponse.json({ requests });
    } catch (err) {
        console.error('[/api/build-requests GET]', err);
        return NextResponse.json({ error: 'Failed to fetch build requests.' }, { status: 500 });
    }
}

export async function PATCH(req: NextRequest) {
    try {
        const { id, status, notes, priority } = await req.json();
        if (!id) return NextResponse.json({ error: 'id is required.' }, { status: 400 });

        const updated = await prisma.buildRequest.update({
            where: { id },
            data: {
                ...(status && { status }),
                ...(notes !== undefined && { notes }),
                ...(priority && { priority }),
            },
        });
        return NextResponse.json({ success: true, buildRequest: updated });
    } catch (err) {
        console.error('[/api/build-requests PATCH]', err);
        return NextResponse.json({ error: 'Failed to update build request.' }, { status: 500 });
    }
}
