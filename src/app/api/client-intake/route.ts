import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import prisma from '@/lib/prisma';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
    try {
        const data = await req.json();
        const {
            companyName, industry, website, description,
            clientType, targetMarket, geography, painPoints,
            brandPersonality, communicationStyle, brandValues, avoidWords,
            competitors, advantage,
            crmTool, crmOther, inventoryTool, inventoryOther,
            emailMarketing, emailMarketingOther, ecommercePlatform, ecommerceOther,
            communicationTools, bookingTool,
            dataStorage, hasDocuments, documentTypes,
            aiCanAccess, monthlySalesVolume, staffCount, existingAutomations,
            primaryGoal, automationPriority, biggestChallenge,
            contactName, contactEmail, contactPhone,
        } = data;

        if (!companyName || !contactEmail) {
            return NextResponse.json({ error: 'Company name and email are required.' }, { status: 400 });
        }

        const crmDisplay = crmTool === 'Other' ? crmOther || 'Other' : crmTool;
        const inventoryDisplay = inventoryTool === 'Other' ? inventoryOther || 'Other' : inventoryTool;
        const emailDisplay = emailMarketing === 'Other' ? emailMarketingOther || 'Other' : emailMarketing;
        const ecommerceDisplay = ecommercePlatform === 'Other' ? ecommerceOther || 'Other' : ecommercePlatform;

        // ── 1. Save to database ───────────────────────────────────────────────
        let client = await prisma.client.findUnique({ where: { email: contactEmail } });

        if (!client) {
            client = await prisma.client.create({
                data: {
                    name: contactName,
                    email: contactEmail,
                    companyName,
                    onboardingStatus: 'onboarded',
                },
            });
        }

        // Upsert the onboarding profile
        await prisma.clientOnboarding.upsert({
            where: { clientId: client.id },
            create: {
                clientId: client.id,
                industry, website, description,
                clientType, targetMarket, geography, painPoints,
                brandPersonality, communicationStyle, brandValues, avoidWords,
                competitors, advantage,
                crmTool: crmDisplay, inventoryTool: inventoryDisplay,
                emailMarketing: emailDisplay, ecommercePlatform: ecommerceDisplay,
                communicationTools: Array.isArray(communicationTools) ? communicationTools.join(', ') : communicationTools,
                bookingTool,
                dataStorage: Array.isArray(dataStorage) ? dataStorage.join(', ') : dataStorage,
                hasDocuments,
                documentTypes: Array.isArray(documentTypes) ? documentTypes.join(', ') : documentTypes,
                aiCanAccess: Array.isArray(aiCanAccess) ? aiCanAccess.join(', ') : aiCanAccess,
                monthlySalesVolume, staffCount, existingAutomations,
                primaryGoal,
                automationPriority: Array.isArray(automationPriority) ? automationPriority.join(', ') : automationPriority,
                biggestChallenge, contactPhone,
            },
            update: {
                industry, website, description,
                clientType, targetMarket, geography, painPoints,
                brandPersonality, communicationStyle, brandValues, avoidWords,
                competitors, advantage,
                crmTool: crmDisplay, inventoryTool: inventoryDisplay,
                emailMarketing: emailDisplay, ecommercePlatform: ecommerceDisplay,
                communicationTools: Array.isArray(communicationTools) ? communicationTools.join(', ') : communicationTools,
                bookingTool,
                dataStorage: Array.isArray(dataStorage) ? dataStorage.join(', ') : dataStorage,
                hasDocuments,
                documentTypes: Array.isArray(documentTypes) ? documentTypes.join(', ') : documentTypes,
                aiCanAccess: Array.isArray(aiCanAccess) ? aiCanAccess.join(', ') : aiCanAccess,
                monthlySalesVolume, staffCount, existingAutomations,
                primaryGoal,
                automationPriority: Array.isArray(automationPriority) ? automationPriority.join(', ') : automationPriority,
                biggestChallenge, contactPhone,
            },
        });

        const dashboardUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/dashboard/${client.dashboardToken}`;

        // ── 2. Email YOU the brief ────────────────────────────────────────────
        const row = (label: string, value: string | undefined) =>
            value ? `<tr style="border-bottom:1px solid #f3f4f6;"><td style="padding:9px 16px;font-size:12px;font-weight:700;color:#6b7280;font-family:'Segoe UI',sans-serif;text-transform:uppercase;letter-spacing:0.05em;white-space:nowrap;vertical-align:top;width:180px;">${label}</td><td style="padding:9px 16px;font-size:13px;color:#111827;font-family:'Segoe UI',sans-serif;line-height:1.6;">${value}</td></tr>` : '';
        const section = (title: string, emoji: string, rows: string) =>
            rows.trim() ? `<tr><td colspan="2" style="padding:16px 20px 6px;background:#f9fafb;font-size:14px;font-weight:700;color:#1a1a2e;font-family:'Segoe UI',sans-serif;border-top:2px solid #e5e7eb;">${emoji}&nbsp;&nbsp;${title}</td></tr>${rows}` : '';

        const briefHtml = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f3f4f6;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:40px 16px;"><tr><td>
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:720px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
<tr><td style="background:linear-gradient(135deg,#4f46e5,#7c3aed);padding:32px 40px;">
  <div style="display:inline-block;background:rgba(255,255,255,0.15);border-radius:8px;padding:5px 14px;font-size:11px;font-family:'Segoe UI',sans-serif;color:rgba(255,255,255,0.9);letter-spacing:2px;text-transform:uppercase;margin-bottom:14px;">📋 New Client Brief</div>
  <h1 style="margin:0;color:#fff;font-size:24px;font-weight:700;font-family:'Segoe UI',sans-serif;">Client Onboarding Brief</h1>
  <p style="margin:8px 0 0;color:rgba(255,255,255,0.75);font-size:14px;font-family:'Segoe UI',sans-serif;">${contactName} · ${companyName} · <a href="mailto:${contactEmail}" style="color:#c4b5fd;">${contactEmail}</a></p>
</td></tr>
<tr><td style="background:#f9fafb;padding:10px 40px;border-bottom:1px solid #e5e7eb;">
  <table width="100%"><tr>
    <td style="font-size:12px;color:#6b7280;font-family:'Segoe UI',sans-serif;">📅 ${new Date().toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</td>
    <td align="right"><a href="${dashboardUrl}" style="font-size:12px;color:#4f46e5;font-family:'Segoe UI',sans-serif;">View Client Dashboard →</a></td>
  </tr></table>
</td></tr>
<tr><td style="padding:20px;">
<table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;">
  ${section('Business', '🏢', `${row('Company', companyName)}${row('Industry', industry)}${row('Website', website)}${row('Description', description)}`)}
  ${section('Audience', '🎯', `${row('Client Type', clientType)}${row('Ideal Customer', targetMarket)}${row('Geography', geography)}${row('Pain Points', painPoints)}`)}
  ${section('Brand Voice', '🎨', `${row('Personality', brandPersonality)}${row('Style', communicationStyle)}${row('Values', brandValues)}${row('Avoid', avoidWords)}`)}
  ${section('Competition', '⚔️', `${row('Competitors', competitors)}${row('Advantage', advantage)}`)}
  ${section('Tech Stack', '🔧', `${row('CRM', crmDisplay)}${row('Inventory', inventoryDisplay)}${row('Email Mktg', emailDisplay)}${row('E-Commerce', ecommerceDisplay)}${row('Comms', Array.isArray(communicationTools) ? communicationTools.join(', ') : communicationTools)}${row('Booking', bookingTool)}`)}
  ${section('Data & AI', '🧠', `${row('Data Storage', Array.isArray(dataStorage) ? dataStorage.join(', ') : dataStorage)}${row('Has Documents', hasDocuments)}${row('Doc Types', Array.isArray(documentTypes) ? documentTypes.join(', ') : documentTypes)}${row('AI Access', Array.isArray(aiCanAccess) ? aiCanAccess.join(', ') : aiCanAccess)}${row('Sales Volume', monthlySalesVolume)}${row('Staff Count', staffCount)}${row('Automations', existingAutomations)}`)}
  ${section('Goals', '🚀', `${row('Primary Goal', primaryGoal)}${row('Automate First', Array.isArray(automationPriority) ? automationPriority.join(', ') : automationPriority)}${row('Challenge', biggestChallenge)}`)}
  ${section('Contact', '📞', `${row('Name', contactName)}${row('Email', contactEmail)}${row('Phone', contactPhone)}`)}
</table>
</td></tr>
<tr><td style="background:#f9fafb;padding:16px 40px;border-top:1px solid #e5e7eb;text-align:center;">
  <a href="${dashboardUrl}" style="display:inline-block;padding:10px 24px;background:#4f46e5;color:#fff;border-radius:100px;font-size:13px;font-weight:700;font-family:'Segoe UI',sans-serif;text-decoration:none;">View Client Dashboard →</a>
</td></tr>
</table></td></tr></table></body></html>`;

        // ── 3. Email the CLIENT their magic link ──────────────────────────────
        const clientWelcomeHtml = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f3f4f6;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:40px 16px;"><tr><td>
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
<tr><td style="background:linear-gradient(135deg,#4f46e5,#7c3aed);padding:36px 40px;text-align:center;">
  <h1 style="margin:0;color:#fff;font-size:28px;font-weight:700;font-family:'Segoe UI',sans-serif;">Welcome to Number1 Employee</h1>
  <p style="margin:12px 0 0;color:rgba(255,255,255,0.75);font-size:15px;font-family:'Segoe UI',sans-serif;">We've received your brief for <strong style="color:#fff;">${companyName}</strong></p>
</td></tr>
<tr><td style="padding:36px 40px;text-align:center;">
  <p style="margin:0 0 24px;font-size:15px;color:#374151;font-family:'Segoe UI',sans-serif;line-height:1.7;">
    Hi ${contactName}, your onboarding brief has been submitted successfully. Our team is reviewing your details and will configure your AI setup within <strong>24–48 hours</strong>.
  </p>
  <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:12px;padding:20px;margin-bottom:28px;text-align:left;">
    <p style="margin:0 0 12px;font-size:11px;font-weight:700;color:#6b7280;font-family:'Segoe UI',sans-serif;letter-spacing:0.1em;text-transform:uppercase;">What happens next</p>
    ${['Our team reviews your full brief','Your AI is configured with your brand voice & goals','You receive a personalised demo link','Your AI goes live'].map((t, i) => `<div style="display:flex;align-items:flex-start;gap:12px;margin-bottom:10px;"><span style="min-width:24px;height:24px;background:#ede9fe;color:#7c3aed;border-radius:50%;font-size:11px;font-weight:700;font-family:'Segoe UI',sans-serif;display:inline-flex;align-items:center;justify-content:center;">${i + 1}</span><span style="font-size:13px;color:#374151;font-family:'Segoe UI',sans-serif;padding-top:4px;">${t}</span></div>`).join('')}
  </div>
  <a href="${dashboardUrl}" style="display:inline-block;padding:14px 32px;background:linear-gradient(135deg,#4f46e5,#7c3aed);color:#fff;border-radius:100px;font-size:14px;font-weight:700;font-family:'Segoe UI',sans-serif;text-decoration:none;letter-spacing:0.03em;">Access Your Dashboard →</a>
  <p style="margin:20px 0 0;font-size:11px;color:#9ca3af;font-family:'Segoe UI',sans-serif;">This link is unique to you. Bookmark it for easy access.</p>
</td></tr>
<tr><td style="background:#f9fafb;padding:16px 40px;border-top:1px solid #e5e7eb;text-align:center;">
  <p style="margin:0;font-size:12px;color:#9ca3af;font-family:'Segoe UI',sans-serif;">Number1 Employee · AI Services for Growing Businesses</p>
</td></tr>
</table></td></tr></table></body></html>`;

        const fromEmail = process.env.REPORT_FROM_EMAIL || 'onboarding@resend.dev';
        const toEmail = process.env.REPORT_TO_EMAIL || 'schockweb@gmail.com';

        // Send brief to admin only — client accesses dashboard by logging in
        await resend.emails.send({
            from: fromEmail,
            to: [toEmail],
            replyTo: contactEmail,
            subject: `📋 New Client Brief: ${companyName}`,
            html: briefHtml,
        });

        return NextResponse.json({ success: true, dashboardToken: client.dashboardToken });

    } catch (err) {
        console.error('[client-intake] Error:', err);
        return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
    }
}
