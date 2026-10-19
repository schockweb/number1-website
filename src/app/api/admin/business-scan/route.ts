import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { takeScreenshot } from '@/lib/screenshot';

const apiKey = process.env.GEMINI_API_KEY;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

export const maxDuration = 120;

export async function POST(request: Request) {
    if (!genAI) {
        return NextResponse.json(
            { error: 'Server configuration error: GEMINI_API_KEY is not set.' },
            { status: 500 }
        );
    }

    try {
        const { url } = await request.json();

        if (!url?.trim()) {
            return NextResponse.json({ error: 'A URL is required.' }, { status: 400 });
        }

        // 1. Screenshot the website
        let screenshotBase64 = null;
        try {
            console.log(`[business-scan] Taking screenshot for ${url}...`);
            screenshotBase64 = await takeScreenshot(url);
            console.log('[business-scan] Screenshot captured.');
        } catch (err) {
            console.error('[business-scan] Screenshot failed:', err);
            return NextResponse.json(
                { error: 'Failed to capture the website. Please check the URL and try again.' },
                { status: 502 }
            );
        }

        // 2. Send to Gemini for business analysis
        const MODELS = ['gemini-2.5-flash', 'gemini-1.5-flash'];

        const prompt = `
You are a senior digital business consultant analyzing the attached full-page screenshot of: ${url}

Perform a thorough business and digital presence audit. Evaluate the website as if you were advising the business owner on where to invest their time and money to grow. Be specific, actionable, and direct.

Respond ONLY with a raw JSON object (no markdown, no code fences) using this exact structure:

{
    "business_name": "Detected or inferred business name",
    "industry": "Detected or inferred industry/niche",
    "overall_score": <number 1-100>,
    "executive_summary": "2-3 sentence high-level verdict on the business's digital presence and biggest opportunities.",
    "focus_areas": [
        {
            "area": "Area name (e.g. Brand Identity, Lead Generation, SEO, User Experience, Content Strategy, Mobile Experience, Trust & Credibility, Conversion Optimization)",
            "score": <number 1-100>,
            "priority": "critical | high | medium | low",
            "current_state": "What the business is currently doing in this area.",
            "issue": "The specific problem or gap.",
            "recommendation": "Detailed, actionable recommendation for improvement.",
            "impact": "What fixing this would do for revenue/growth."
        }
    ],
    "quick_wins": [
        "Specific easy-to-implement improvement 1",
        "Specific easy-to-implement improvement 2",
        "Specific easy-to-implement improvement 3"
    ],
    "competitive_edge": "What this business does well that they should double down on.",
    "growth_roadmap": [
        { "phase": "Week 1-2", "action": "Immediate quick wins to implement" },
        { "phase": "Month 1", "action": "Core improvements to build" },
        { "phase": "Month 2-3", "action": "Growth initiatives to launch" }
    ]
}

Provide at least 5 focus areas covering different aspects of the business. Be honest but constructive. Prioritize based on revenue impact.
`;

        const imagePart = {
            inlineData: { data: screenshotBase64, mimeType: 'image/jpeg' },
        };

        let jsonResponse: any = null;

        for (const modelName of MODELS) {
            try {
                console.log(`[business-scan] Trying ${modelName}...`);
                const model = genAI.getGenerativeModel({ model: modelName });
                const result = await model.generateContent({
                    contents: [{ role: 'user', parts: [{ text: prompt }, imagePart] }],
                    generationConfig: { responseMimeType: 'application/json' },
                });

                const responseText = result.response.text();
                try {
                    jsonResponse = JSON.parse(responseText);
                } catch {
                    const start = responseText.indexOf('{');
                    const end = responseText.lastIndexOf('}');
                    if (start !== -1 && end > start) {
                        jsonResponse = JSON.parse(responseText.substring(start, end + 1));
                    } else {
                        throw new Error('Could not extract JSON from response.');
                    }
                }

                console.log(`[business-scan] ${modelName}: Success!`);
                break;
            } catch (err: any) {
                const is429 = err?.message?.includes('429') || err?.status === 429;
                console.warn(`[business-scan] ${modelName} failed:`, err?.message);
                if (is429 && MODELS.indexOf(modelName) < MODELS.length - 1) {
                    await new Promise(r => setTimeout(r, 3000));
                    continue;
                }
                throw err;
            }
        }

        return NextResponse.json(jsonResponse);
    } catch (error: any) {
        console.error('[business-scan] Error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to analyze the business.' },
            { status: 500 }
        );
    }
}
