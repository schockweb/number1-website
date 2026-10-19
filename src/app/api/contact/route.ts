import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const NOTIFY_EMAIL = 'schockweb@gmail.com';

export async function POST(req: NextRequest) {
  try {
    const { name, email, message } = await req.json();

    if (!name?.trim() || !email?.trim() || !message?.trim()) {
      return NextResponse.json(
        { error: 'Name, email, and message are required.' },
        { status: 400 }
      );
    }

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanMessage = message.trim();

    // Send email notification directly via Resend (no database persistence)
    try {
      const fromEmail = process.env.REPORT_FROM_EMAIL || 'onboarding@resend.dev';
      await resend.emails.send({
        from: `Number1 Alerts <${fromEmail}>`,
        to: NOTIFY_EMAIL,
        subject: `📩 New Contact Inquiry from ${cleanName}`,
        html: `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background:#0d0b10;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:560px;margin:0 auto;padding:40px 24px;">
    
    <div style="text-align:center;margin-bottom:24px;">
      <div style="display:inline-block;background:#F97316;color:#000;font-weight:800;font-size:16px;padding:8px 14px;letter-spacing:0.05em;">NUMBER1.STUDIO</div>
      <div style="margin-top:10px;font-size:11px;color:#888;text-transform:uppercase;letter-spacing:0.1em;">New Website Contact Inquiry</div>
    </div>

    <div style="background:#14121a;border:1px solid #222;padding:28px 24px;border-radius:8px;">
      <h2 style="margin:0 0 16px;font-size:18px;color:#fff;">New Contact Message Received</h2>
      
      <table style="width:100%;border-collapse:collapse;margin-bottom:20px;">
        <tr>
          <td style="padding:6px 0;font-size:12px;color:#888;width:90px;">NAME:</td>
          <td style="padding:6px 0;font-size:14px;color:#fff;font-weight:600;">${cleanName}</td>
        </tr>
        <tr>
          <td style="padding:6px 0;font-size:12px;color:#888;">EMAIL:</td>
          <td style="padding:6px 0;font-size:14px;color:#F97316;">
            <a href="mailto:${cleanEmail}" style="color:#F97316;text-decoration:none;">${cleanEmail}</a>
          </td>
        </tr>
      </table>

      <div style="background:#07070A;border:1px solid #333;padding:16px;font-family:monospace;font-size:13px;color:#ddd;line-height:1.6;white-space:pre-wrap;">
        ${cleanMessage}
      </div>
    </div>
    
  </div>
</body>
</html>`,
      });
      console.log(`[contact-api] Notification email sent to ${NOTIFY_EMAIL}`);
    } catch (emailErr) {
      console.error('[contact-api] Failed to send email via Resend:', emailErr);
    }

    return NextResponse.json({
      success: true,
      message: 'Contact message sent successfully.',
    });
  } catch (err) {
    console.error('[contact-api] Error processing contact form:', err);
    return NextResponse.json(
      { error: 'An unexpected error occurred while sending your message.' },
      { status: 500 }
    );
  }
}
