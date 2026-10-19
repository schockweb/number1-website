import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

export const maxDuration = 60;

export async function POST(request: Request) {
    if (!genAI) {
        return NextResponse.json({ error: 'GEMINI_API_KEY not configured.' }, { status: 500 });
    }

    try {
        const { query } = await request.json();
        if (!query?.trim()) {
            return NextResponse.json({ error: 'A search query is required.' }, { status: 400 });
        }

        const MODELS = ['gemini-2.5-flash', 'gemini-1.5-flash'];

        const prompt = `
You are a business research assistant. Search the internet for the business or company: "${query}"

Find real information about this business. Return a JSON object with this exact structure:

{
    "results": [
        {
            "name": "Exact business name",
            "url": "Their website URL (must be a real, valid URL)",
            "description": "1-2 sentence description of what the business does",
            "location": "City/Country if known, or 'Unknown'",
            "industry": "Industry/niche"
        }
    ],
    "suggested_queries": ["related search term 1", "related search term 2"]
}

Return up to 5 results. Only include businesses you can find real information about. The URLs MUST be real working websites. If you cannot find the business, return an empty results array.

Respond ONLY with raw JSON, no markdown code fences.
`;

        let jsonResponse: any = null;

        for (const modelName of MODELS) {
            try {
                const model = genAI.getGenerativeModel({
                    model: modelName,
                    tools: [{ googleSearch: {} } as any],
                });

                const result = await model.generateContent({
                    contents: [{ role: 'user', parts: [{ text: prompt }] }],
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
                        throw new Error('Could not parse response.');
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
        console.error('[business-search] Error:', error);
        return NextResponse.json(
            { error: error.message || 'Search failed.' },
            { status: 500 }
        );
    }
}
