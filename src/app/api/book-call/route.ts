import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import prisma from '@/lib/prisma';

const resend = new Resend(process.env.RESEND_API_KEY);

// GET /api/book-call — Fetch bookings for a specific date to check availability
export async function GET(req: NextRequest) {
    try {
        const dateParam = req.nextUrl.searchParams.get('date'); // YYYY-MM-DD
        if (!dateParam) {
            return NextResponse.json({ error: 'date parameter is required (YYYY-MM-DD)' }, { status: 400 });
        }

        const start = new Date(`${dateParam}T00:00:00+02:00`);
        const end = new Date(`${dateParam}T23:59:59+02:00`);

        const bookings = await prisma.booking.findMany({
            where: {
                date: {
                    gte: start,
                    lte: end,
                },
                status: {
                    not: 'cancelled'
                }
            },
            select: {
                date: true,
            }
        });

        // Return the times in CAT (UTC+2)
        const takenSlots = bookings.map((b: any) => {
            const d = new Date(b.date);
            // Adjust to CAT (UTC+2) for the response string
            const catDate = new Date(d.getTime() + (2 * 60 * 60 * 1000));
            const hours = String(catDate.getUTCHours()).padStart(2, '0');
            const minutes = String(catDate.getUTCMinutes()).padStart(2, '0');
            return `${hours}:${minutes}`;
        });

        return NextResponse.json({ takenSlots });
    } catch (err) {
        console.error('[book-call] GET Error:', err);
        return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 });
    }
}

// POST /api/book-call — Public endpoint for clients to book a sales call
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

        // ── Send admin notification email ──
        try {
            const settingRow = await prisma.adminSetting.findUnique({
                where: { key: 'admin_availability' },
            });
            let adminEmail = '';

            if (settingRow?.value) {
                const parsed = JSON.parse(settingRow.value);
                adminEmail = parsed.adminNotifyEmail || '';
            }

            const notifyTarget = adminEmail || 'schockweb@gmail.com';

            if (notifyTarget) {
                const bookingDate = new Date(date);
                const catDate = new Date(bookingDate.getTime() + (2 * 60 * 60 * 1000));
                const dateStr = catDate.toLocaleDateString('en-GB', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                    timeZone: 'UTC',
                });
                const timeStr = `${String(catDate.getUTCHours()).padStart(2, '0')}:${String(catDate.getUTCMinutes()).padStart(2, '0')}`;

                const fromEmail = process.env.REPORT_FROM_EMAIL || 'onboarding@resend.dev';

                await resend.emails.send({
                    from: `Number1 Alerts <${fromEmail}>`,
                    to: notifyTarget,
                    subject: `📞 New Call Booked — ${cleanName}`,
                    html: `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background:#0d0b10;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:560px;margin:0 auto;padding:40px 24px;">
    
    <!-- Header -->
    <div style="text-align:center;margin-bottom:32px;">
      <div style="display:inline-block;background:linear-gradient(145deg,#c48b9a,#c4916a);color:#0d0b10;font-weight:800;font-size:18px;padding:10px 16px;border-radius:10px;letter-spacing:-0.02em;">N1</div>
      <div style="margin-top:12px;font-size:11px;color:#65596f;text-transform:uppercase;letter-spacing:0.1em;">Number1 · Booking Alert</div>
    </div>

    <!-- Main Card -->
    <div style="background:#14121a;border:1px solid #1f1c28;border-radius:16px;overflow:hidden;">
      
      <!-- Accent bar -->
      <div style="height:3px;background:linear-gradient(90deg,#c48b9a,#9b8ec4);"></div>
      
      <div style="padding:28px 24px;">
        <h1 style="margin:0 0 6px;font-size:20px;color:#f0edf4;font-weight:700;">New Call Booked</h1>
        <p style="margin:0 0 24px;font-size:14px;color:#65596f;">A client has just booked a consultation call.</p>

        <!-- Details -->
        <div style="background:#0d0b10;border:1px solid #1f1c28;border-radius:12px;padding:18px 20px;">
          <table style="width:100%;border-collapse:collapse;">
            <tr>
              <td style="padding:8px 0;font-size:12px;color:#65596f;text-transform:uppercase;letter-spacing:0.06em;width:100px;">Name</td>
              <td style="padding:8px 0;font-size:14px;color:#f0edf4;font-weight:600;">${cleanName}</td>
            </tr>
            <tr>
              <td style="padding:8px 0;font-size:12px;color:#65596f;text-transform:uppercase;letter-spacing:0.06em;">Email</td>
              <td style="padding:8px 0;font-size:14px;color:#f0edf4;">
                <a href="mailto:${cleanEmail}" style="color:#9b8ec4;text-decoration:none;">${cleanEmail}</a>
              </td>
            </tr>
            ${company ? `<tr>
              <td style="padding:8px 0;font-size:12px;color:#65596f;text-transform:uppercase;letter-spacing:0.06em;">Company</td>
              <td style="padding:8px 0;font-size:14px;color:#f0edf4;">${company.trim()}</td>
            </tr>` : ''}
            <tr>
              <td style="padding:8px 0;font-size:12px;color:#65596f;text-transform:uppercase;letter-spacing:0.06em;">Date</td>
              <td style="padding:8px 0;font-size:14px;color:#f0edf4;font-weight:600;">${dateStr}</td>
            </tr>
            <tr>
              <td style="padding:8px 0;font-size:12px;color:#65596f;text-transform:uppercase;letter-spacing:0.06em;">Time</td>
              <td style="padding:8px 0;font-size:14px;color:#7dd3a8;font-weight:700;">${timeStr} CAT</td>
            </tr>
            ${topic ? `<tr>
              <td style="padding:8px 0;font-size:12px;color:#65596f;text-transform:uppercase;letter-spacing:0.06em;">Topic</td>
              <td style="padding:8px 0;font-size:14px;color:#f0edf4;font-style:italic;">${topic.trim()}</td>
            </tr>` : ''}
          </table>
        </div>

        <!-- CTA -->
        <div style="margin-top:24px;text-align:center;">
          <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://number1.studio'}/admin/calendar" style="display:inline-block;padding:12px 28px;background:linear-gradient(145deg,#c48b9a,#c4916a);color:#0d0b10;font-weight:700;font-size:14px;border-radius:10px;text-decoration:none;">View in Calendar</a>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div style="text-align:center;margin-top:24px;font-size:11px;color:#65596f;">
      This is an automated alert from your Number1 admin dashboard.
    </div>
  </div>
</body>
</html>`,
                });

                console.log(`[book-call] Admin notification sent to ${notifyTarget}`);
            }
        } catch (emailErr) {
            // Don't fail the booking if the email fails
            console.error('[book-call] Admin email notification error:', emailErr);
        }

        return NextResponse.json({
            success: true,
            bookingId: booking.id,
            message: 'Your call has been booked!',
        });
    } catch (err) {
        console.error('[book-call] Error:', err);
        return NextResponse.json({ error: 'Failed to book call' }, { status: 500 });
    }
}
