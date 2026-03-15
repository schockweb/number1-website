import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';
import path from 'path';

export const maxDuration = 120;

const resend = new Resend(process.env.RESEND_API_KEY);
const genAI = process.env.GEMINI_API_KEY
    ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
    : null;

// ── Shared instructions store (same file the admin API reads/writes) ──────────
const DATA_FILE = path.join(process.cwd(), '.data', 'admin-instructions.json');

const DEFAULT_INSTRUCTIONS = `You are an expert competitive intelligence analyst. When given a competitor's name, produce a comprehensive report covering:

1. Brand Positioning – How they likely present their value proposition, tone, and target market.
2. Key Offerings – Products, services, pricing tiers (if known), and unique selling points.
3. Website UX & Design – Typical strengths and weaknesses of their digital presence.
4. SEO & Content Strategy – Keywords, content types, and estimated traffic signals.
5. Social Proof – Testimonials, case studies, awards, and trust indicators.
6. Weaknesses & Gaps – Areas where we can differentiate and outperform.
7. Actionable Recommendations – 3–5 specific steps our team can take to win market share from this competitor.

Keep the tone professional but direct. Prioritise insights that are actionable within 30 days.`;

function getSavedInstructions(): string {
    try {
        if (fs.existsSync(DATA_FILE)) {
            const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
            if (data?.competitor?.trim()) return data.competitor.trim();
        }
    } catch { /* ignore */ }
    return DEFAULT_INSTRUCTIONS;
}


export async function POST(req: NextRequest) {
    try {
        if (!genAI) {
            return NextResponse.json(
                { error: 'Server configuration error: GEMINI_API_KEY is not set.' },
                { status: 500 }
            );
        }

        const body = await req.json();
        const { competitor, email, instructions } = body as {
            competitor: string;
            email: string;
            instructions?: string;
        };

        if (!competitor?.trim() || !email?.trim()) {
            return NextResponse.json(
                { error: 'Competitor name and email are required.' },
                { status: 400 }
            );
        }

        // ── Use saved admin instructions (from shared file store) ────────────
        // getSavedInstructions() reads the same file the /api/admin/instructions
        // endpoint writes to, so changes saved in the SaaS dashboard are always
        // picked up here — no localStorage cross-origin issue.
        const systemPrompt = getSavedInstructions();
        const userPrompt = `Please generate a detailed competitor analysis report for: "${competitor}". Use the provided instructions to structure your report. Be thorough and specific.`;

        // ── 1. Run Gemini analysis (with model fallback) ──────────────────────
        const MODELS_TO_TRY = ['gemini-2.5-flash', 'gemini-1.5-flash', 'gemini-1.5-pro'];
        let reportText = '';
        let lastError: unknown = null;

        for (const modelName of MODELS_TO_TRY) {
            try {
                console.log(`[competitor-report] Trying model: ${modelName}`);
                const model = genAI.getGenerativeModel({
                    model: modelName,
                    systemInstruction: systemPrompt,
                });
                const result = await model.generateContent(userPrompt);
                reportText = result.response.text();
                console.log(`[competitor-report] ${modelName} succeeded ✓`);
                break;
            } catch (modelErr: unknown) {
                const msg = modelErr instanceof Error ? modelErr.message : String(modelErr);
                const is429 = msg.includes('429') || msg.includes('quota');
                console.warn(`[competitor-report] ${modelName} failed (${is429 ? '429' : 'error'}): ${msg}`);
                lastError = modelErr;
                if (is429 && MODELS_TO_TRY.indexOf(modelName) < MODELS_TO_TRY.length - 1) {
                    await new Promise((r) => setTimeout(r, 2000));
                    continue;
                }
                throw modelErr;
            }
        }

        if (!reportText) {
            throw lastError || new Error('All Gemini models failed to generate a report.');
        }

        // ── 2. Convert markdown to clean HTML ────────────────────────────────
        const htmlBody = reportText
            .split('\n')
            .map((line: string) => {
                if (/^#{1,3}\s/.test(line)) {
                    const text = line.replace(/^#+\s/, '').replace(/\*\*/g, '');
                    return `<h2 style="color:#1a1a2e;font-size:17px;margin:24px 0 8px;font-family:'Segoe UI',sans-serif;font-weight:700;">${text}</h2>`;
                }
                if (/^\*\*(.+)\*\*$/.test(line)) {
                    return `<p style="margin:6px 0;font-family:'Segoe UI',sans-serif;"><strong>${line.replace(/\*\*/g, '')}</strong></p>`;
                }
                if (/^[-*•]\s/.test(line)) {
                    const text = line.replace(/^[-*•]\s/, '').replace(/\*\*/g, '<strong>').replace(/\*\*/g, '</strong>');
                    return `<li style="margin:5px 0;color:#374151;font-family:'Segoe UI',sans-serif;line-height:1.6;">${text}</li>`;
                }
                if (/^\d+\.\s/.test(line)) {
                    const text = line.replace(/\*\*/g, '').trim();
                    return `<li style="margin:5px 0;color:#374151;font-family:'Segoe UI',sans-serif;line-height:1.6;">${text}</li>`;
                }
                if (line.trim() === '') return '<br/>';
                return `<p style="margin:6px 0;color:#374151;line-height:1.7;font-family:'Segoe UI',sans-serif;">${line.replace(/\*\*/g, '')}</p>`;
            })
            .join('\n');

        const generatedDate = new Date().toLocaleDateString('en-GB', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
        });

        const htmlEmail = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f3f4f6;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:40px 16px;">
    <tr><td>
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:640px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
        <tr>
          <td style="background:linear-gradient(135deg,#4f46e5,#7c3aed);padding:36px 40px;">
            <div style="display:inline-block;background:rgba(255,255,255,0.15);border-radius:8px;padding:6px 14px;margin-bottom:16px;">
              <span style="color:rgba(255,255,255,0.9);font-size:11px;font-family:'Segoe UI',sans-serif;letter-spacing:2px;text-transform:uppercase;">Number1 Employee</span>
            </div>
            <h1 style="margin:0;color:#ffffff;font-size:26px;font-weight:700;font-family:'Segoe UI',sans-serif;line-height:1.3;">Competitor Intelligence Report</h1>
            <p style="margin:10px 0 0;color:rgba(255,255,255,0.75);font-size:14px;font-family:'Segoe UI',sans-serif;">
              AI-generated analysis for <strong style="color:#fff;">${competitor}</strong>
            </p>
          </td>
        </tr>
        <tr>
          <td style="background:#f9fafb;padding:14px 40px;border-bottom:1px solid #e5e7eb;">
            <table width="100%"><tr>
              <td style="font-size:12px;color:#6b7280;font-family:'Segoe UI',sans-serif;">📅 ${generatedDate}</td>
              <td align="right" style="font-size:12px;color:#6b7280;font-family:'Segoe UI',sans-serif;">⚡ Powered by Gemini AI</td>
            </tr></table>
          </td>
        </tr>
        <tr>
          <td style="padding:32px 40px;">
            ${htmlBody}
          </td>
        </tr>
        <tr>
          <td style="background:#f9fafb;padding:24px 40px;border-top:1px solid #e5e7eb;text-align:center;">
            <p style="margin:0 0 6px;font-size:13px;color:#6b7280;font-family:'Segoe UI',sans-serif;">
              Generated by <strong>Number1 Employee AI</strong>
            </p>
            <p style="margin:0;font-size:11px;color:#9ca3af;font-family:'Segoe UI',sans-serif;">
              AI-generated insights are for strategic guidance. Always validate with live data.
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

        // ── 3. Send via Resend ────────────────────────────────────────────────
        const toEmail = process.env.REPORT_TO_EMAIL || email;
        const fromEmail = process.env.REPORT_FROM_EMAIL || 'onboarding@resend.dev';

        const { error: sendError } = await resend.emails.send({
            from: fromEmail,
            to: [toEmail],
            replyTo: email,
            subject: `🔍 Competitor Report: ${competitor}`,
            html: htmlEmail,
        });

        if (sendError) {
            console.error('[competitor-report] Resend error:', sendError);
            return NextResponse.json({ error: 'Report generated but failed to send email.' }, { status: 500 });
        }

        console.log(`[competitor-report] Report for "${competitor}" sent to ${toEmail} ✓`);
        return NextResponse.json({ success: true });

    } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Internal server error.';
        console.error('[competitor-report] Error:', err);
        return NextResponse.json({ error: msg }, { status: 500 });
    }
}
