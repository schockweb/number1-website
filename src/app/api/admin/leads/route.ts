import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/admin/leads?status=new&source=website
export async function GET(req: NextRequest) {
    const status = req.nextUrl.searchParams.get('status');
    const source = req.nextUrl.searchParams.get('source');

    const where: Record<string, string> = {};
    if (status && status !== 'all') where.status = status;
    if (source && source !== 'all') where.source = source;

    const leads = await prisma.lead.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        include: { bookings: { orderBy: { date: 'asc' }, take: 1 } },
    });

    return NextResponse.json({ leads });
}

// POST /api/admin/leads — create a lead manually
export async function POST(req: NextRequest) {
    try {
        const { name, email, company, source, status, priority, notes } = await req.json();
        if (!name?.trim() || !email?.trim()) {
            return NextResponse.json({ error: 'name and email are required' }, { status: 400 });
        }

        const lead = await prisma.lead.create({
            data: {
                name: name.trim(),
                email: email.trim().toLowerCase(),
                company: company?.trim() || null,
                source: source || 'manual',
                status: status || 'new',
                priority: priority || 'normal',
                notes: notes?.trim() || null,
            },
        });

        return NextResponse.json({ lead });
    } catch (err) {
        return NextResponse.json({ error: String(err) }, { status: 500 });
    }
}

// PATCH /api/admin/leads — update a lead
export async function PATCH(req: NextRequest) {
    try {
        const { id, status, priority, notes, name, email, company } = await req.json();
        if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 });

        const data: Record<string, unknown> = {};
        if (status !== undefined) data.status = status;
        if (priority !== undefined) data.priority = priority;
        if (notes !== undefined) data.notes = notes;
        if (name !== undefined) data.name = name;
        if (email !== undefined) data.email = email;
        if (company !== undefined) data.company = company;

        const lead = await prisma.lead.update({ where: { id }, data });
        return NextResponse.json({ lead });
    } catch (err) {
        return NextResponse.json({ error: String(err) }, { status: 500 });
    }
}
