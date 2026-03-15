import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

const DEFAULT_INSTRUCTIONS: Record<string, string> = {
    competitor: `You are an expert competitive intelligence analyst. When given a competitor's website URL or name, produce a comprehensive report covering:

1. **Brand Positioning** – How they present their value proposition, tone, and target market.
2. **Key Offerings** – Products, services, pricing tiers (if visible), and unique selling points.
3. **Website UX & Design** – Strengths and weaknesses of their digital presence.
4. **SEO & Content Strategy** – Keywords, content types, and estimated traffic signals.
5. **Social Proof** – Testimonials, case studies, awards, and trust indicators.
6. **Weaknesses & Gaps** – Areas where we can differentiate and outperform.
7. **Actionable Recommendations** – 3–5 specific steps our team can take to win market share from this competitor.

Keep the tone professional but direct. Prioritise insights that are actionable within 30 days.`,
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
