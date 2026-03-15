import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/admin/bookings?month=2026-03
export async function GET(req: NextRequest) {
    const month = req.nextUrl.searchParams.get('month');

    let where = {};
    if (month) {
        const start = new Date(`${month}-01T00:00:00Z`);
        const end = new Date(start);
        end.setMonth(end.getMonth() + 1);
        where = { date: { gte: start, lt: end } };
    }

    const bookings = await prisma.booking.findMany({
        where,
        orderBy: { date: 'asc' },
        include: { lead: { select: { id: true, name: true, company: true, status: true } } },
    });

    return NextResponse.json({ bookings });
}

// POST /api/admin/bookings — create booking manually
export async function POST(req: NextRequest) {
    try {
        const { leadId, name, email, date, duration, topic, status, notes } = await req.json();
        if (!name?.trim() || !email?.trim() || !date) {
            return NextResponse.json({ error: 'name, email, and date are required' }, { status: 400 });
        }

        const booking = await prisma.booking.create({
            data: {
                leadId: leadId || null,
                name: name.trim(),
                email: email.trim().toLowerCase(),
                date: new Date(date),
                duration: duration || 30,
                topic: topic?.trim() || null,
                status: status || 'confirmed',
                notes: notes?.trim() || null,
            },
        });

        return NextResponse.json({ booking });
    } catch (err) {
        return NextResponse.json({ error: String(err) }, { status: 500 });
    }
}

// PATCH /api/admin/bookings — update booking
export async function PATCH(req: NextRequest) {
    try {
        const { id, status, notes, date, duration, topic } = await req.json();
        if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 });

        const data: Record<string, unknown> = {};
        if (status !== undefined) data.status = status;
        if (notes !== undefined) data.notes = notes;
        if (date !== undefined) data.date = new Date(date);
        if (duration !== undefined) data.duration = duration;
        if (topic !== undefined) data.topic = topic;

        const booking = await prisma.booking.update({ where: { id }, data });
        return NextResponse.json({ booking });
    } catch (err) {
        return NextResponse.json({ error: String(err) }, { status: 500 });
    }
}
