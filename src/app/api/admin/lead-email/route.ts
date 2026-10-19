import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

export async function POST(request: Request) {
    if (!genAI) {
        return NextResponse.json({ error: 'GEMINI_API_KEY not configured.' }, { status: 500 });
    }

    try {
        const { businessName, industry, summary, focusAreas, url } = await request.json();

        if (!businessName) {
            return NextResponse.json({ error: 'Business data is required.' }, { status: 400 });
        }

        const issuesList = (focusAreas || [])
            .filter((a: any) => a.priority === 'critical' || a.priority === 'high')
            .map((a: any) => `- ${a.area}: ${a.issue}`)
            .join('\n');

        const prompt = `
You are a senior sales copywriter for Number1 Studios — a premium digital agency that offers:
1. AI-powered business services (automated marketing, competitor analysis, lead generation, customer support — starting at €299/month)
2. Custom website design & development (full builds from scratch)
3. Website makeovers (redesigning existing sites for better conversion)

Write a compelling, personalized outreach email to the business owner of "${businessName}" (${industry || 'unknown industry'}).

Context from our AI analysis of their website (${url || 'their site'}):
${summary || 'Their digital presence has significant room for improvement.'}

Key issues we found:
${issuesList || '- Multiple areas need attention across their digital presence.'}

Email requirements:
- Subject line that creates curiosity (not spammy)
- Professional but warm tone — like a helpful consultant, not a pushy salesperson
- Reference SPECIFIC issues from the analysis to show we've done our homework
- Present Number1's AI services and website solutions as the fix
- Include a clear call-to-action to book a free 30-minute consultation
- Keep it under 250 words
- Sign off as the Number1 Studios team

Respond with a JSON object (no markdown fences):
{
    "subject": "The email subject line",
    "body": "The full email body with proper line breaks (use \\n for new lines)"
}
`;

        const MODELS = ['gemini-2.5-flash', 'gemini-1.5-flash'];
        let jsonResponse: any = null;

        for (const modelName of MODELS) {
            try {
                const model = genAI.getGenerativeModel({ model: modelName });
                const result = await model.generateContent({
                    contents: [{ role: 'user', parts: [{ text: prompt }] }],
                    generationConfig: { responseMimeType: 'application/json' },
                });

                const text = result.response.text();
                try {
                    jsonResponse = JSON.parse(text);
                } catch {
                    const start = text.indexOf('{');
                    const end = text.lastIndexOf('}');
                    if (start !== -1 && end > start) {
                        jsonResponse = JSON.parse(text.substring(start, end + 1));
                    } else {
                        throw new Error('Could not parse email response.');
                    }
                }
                break;
            } catch (err: any) {
                const is429 = err?.message?.includes('429') || err?.status === 429;
                if (is429 && MODELS.indexOf(modelName) < MODELS.length - 1) {
                    await new Promise(r => setTimeout(r, 3000));
                    continue;
                }
                throw err;
            }
        }

        return NextResponse.json(jsonResponse);
    } catch (error: any) {
        console.error('[lead-email] Error:', error);
        return NextResponse.json({ error: error.message || 'Failed to generate email.' }, { status: 500 });
    }
}
