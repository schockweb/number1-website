import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// POST /api/book-call — Public endpoint for clients to book a sales call
// Auto-creates a Lead if the email doesn't exist, then creates a Booking.
export async function POST(req: NextRequest) {
    try {
        const { name, email, date, topic, company } = await req.json();

        if (!name?.trim() || !email?.trim() || !date) {
            return NextResponse.json(
                { error: 'name, email, and date are required' },
                { status: 400 }
            );
        }

        const cleanEmail = email.trim().toLowerCase();
        const cleanName = name.trim();

        // Find or create lead
        let lead = await prisma.lead.findFirst({ where: { email: cleanEmail } });

        if (!lead) {
            lead = await prisma.lead.create({
                data: {
                    name: cleanName,
                    email: cleanEmail,
                    company: company?.trim() || null,
                    source: 'website',
                    status: 'new',
                    priority: 'normal',
                },
            });
        }

        // Create the booking
        const booking = await prisma.booking.create({
            data: {
                leadId: lead.id,
                name: cleanName,
                email: cleanEmail,
                date: new Date(date),
                duration: 30,
                topic: topic?.trim() || null,
                status: 'confirmed',
            },
        });

        return NextResponse.json({
            success: true,
            bookingId: booking.id,
            message: 'Your call has been booked! We\'ll send a confirmation to your email.',
        });
    } catch (err) {
        console.error('[book-call] Error:', err);
        return NextResponse.json({ error: 'Failed to book call' }, { status: 500 });
    }
}
