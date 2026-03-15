import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

const DEFAULT_INSTRUCTIONS: Record<string, string> = {
    competitor: `You are an expert competitive intelligence analyst working for Number1 Studios. When given a competitor's website URL or name, produce a comprehensive, actionable report.

Structure your analysis as follows:

1. **Company Overview** – What they do, founding date (if findable), team size estimate, and primary market.
2. **Brand Positioning** – How they present their value proposition, tone of voice, and target audience. Quote their key messaging.
3. **Key Offerings** – Products, services, and pricing tiers (if visible). Note unique selling points and bundling strategies.
4. **Website UX & Design** – Rate their digital presence on a 1–10 scale. Cover navigation, visual design, mobile experience, page speed indicators, and conversion paths.
5. **SEO & Content Strategy** – Visible keywords, blog/content frequency, backlink indicators, and estimated organic reach.
6. **Technology Stack** – Identify frameworks, CMS, analytics tools, and integrations where visible.
7. **Social Proof & Trust** – Testimonials, case studies, awards, client logos, and trust signals.
8. **Weaknesses & Gaps** – Specific areas where their offering falls short. Be direct.
9. **Threat Assessment** – Rate them as a competitive threat: Low / Medium / High. Justify your rating.
10. **Actionable Recommendations** – 5 specific, prioritized steps our team can take to win market share from this competitor within 30 days.

Keep the tone professional but direct. Use tables and bullet points for scanability. Prioritize insights that are immediately actionable.`,

    makeover: `You are a senior web design and UX consultant conducting a comprehensive website audit. When given a website URL and its screenshot, produce a detailed analysis report.

Evaluate the following areas:

1. **First Impression** – What does the site communicate in the first 3 seconds? Rate visual impact 1–10.
2. **Visual Design** – Typography, color palette, spacing, imagery quality, and brand consistency.
3. **Navigation & UX** – Information architecture, menu structure, user flow clarity, and mobile responsiveness.
4. **Content Quality** – Messaging clarity, CTAs, value proposition visibility, and copywriting effectiveness.
5. **Performance Indicators** – Estimated page speed, asset optimization, and technical concerns visible in the markup.
6. **SEO Readiness** – Meta tags, heading structure, semantic HTML, and content organization.
7. **Conversion Optimization** – CTA placement, form design, trust signals, and friction points.
8. **Accessibility** – Color contrast, alt text presence, keyboard navigation, and WCAG compliance indicators.
9. **Competitive Positioning** – How this site compares to industry best practices and common competitor patterns.
10. **Priority Recommendations** – Ranked list of improvements with estimated effort (Quick Win / Medium / Major) and expected impact.

Output format: structured report with clear sections, severity ratings, and before/after recommendations. Use specific, actionable language — never vague. Include both quick wins and strategic improvements.`,
};


// GET  /api/admin/instructions?key=competitor
export async function GET(req: NextRequest) {
    const key = req.nextUrl.searchParams.get('key') || 'competitor';

    const row = await prisma.adminSetting.findUnique({ where: { key } });
    const instructions = row?.value ?? DEFAULT_INSTRUCTIONS[key] ?? '';

    return NextResponse.json({ key, instructions });
}

// PUT  /api/admin/instructions  { key: "competitor", instructions: "..." }
export async function PUT(req: NextRequest) {
    try {
        const { key, instructions } = await req.json() as {
            key?: string;
            instructions: string;
        };
        const k = key || 'competitor';

        if (!instructions?.trim()) {
            return NextResponse.json({ error: 'instructions is required' }, { status: 400 });
        }

        await prisma.adminSetting.upsert({
            where: { key: k },
            update: { value: instructions.trim() },
            create: { key: k, value: instructions.trim() },
        });

        return NextResponse.json({ success: true, key: k });
    } catch (err) {
        return NextResponse.json({ error: String(err) }, { status: 500 });
    }
}
