import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { takeScreenshot } from '@/lib/screenshot';

const apiKey = process.env.GEMINI_API_KEY;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

// Allow longer execution time for screenshot + AI processing
export const maxDuration = 120;

export async function POST(request: Request) {
    if (!genAI) {
        return NextResponse.json(
            { error: 'Server configuration error: GEMINI_API_KEY is not set.' },
            { status: 500 }
        );
    }

    try {
        const body = await request.json();
        const { url } = body;

        if (!url) {
            return NextResponse.json(
                { error: 'Invalid payload. MUST include a url to analyze.' },
                { status: 400 }
            );
        }

        // 1. Launch Headless Browser to Capture Real UI visually
        let screenshotBase64 = null;
        try {
            console.log(`Taking screenshot for ${url}...`);
            screenshotBase64 = await takeScreenshot(url);
            console.log("Screenshot captured successfully.");
        } catch (screenshotError) {
            console.error("Critical: Failed to generate screenshot for Multimodal AI.", screenshotError);
            return NextResponse.json(
                { error: 'Failed to capture target website visually. Cannot perform analysis.' },
                { status: 502 }
            );
        }

        // 2. Query Gemini Vision with model cascade fallback
        // Try flash first, then fallback models if we hit quota limits
        const MODELS_TO_TRY = ['gemini-2.5-flash', 'gemini-1.5-flash'];

        const promptText = `
You are an expert, high-end web design AI agent analyzing the *attached full-page screenshot* of the target website: \${url}.

Analyze EVERY visual detail of the screenshot and provide a constructive, sophisticated critique. Do NOT make up information—only critique what is visible in the provided image.
You must capture design weaknesses, UX/Conversion friction, and weak copywriting so our agency can present a fixed version. Maintain a "Silent Luxury" and highly professional agency tone.

You must respond strictly with a raw JSON object containing the exact structure below. Do NOT wrap it in markdown block quotes (\`\`\`json).

{
    "executive_summary": "A 2-3 sentence executive summary of the primary issues holding the site back from looking premium and converting well.",
    "design_and_ux": [
        {
            "category": "Typography",
            "score": <number 50-95>,
            "current_state": "Brief description of what they currently use (e.g. Too many serif fonts).",
            "issue": "Specific critique.",
            "suggestion": "Specific high-end recommendation."
        },
        {
            "category": "Color Palette",
            "score": <number 50-95>,
            "current_state": "Brief description.",
            "issue": "Specific critique.",
            "suggestion": "Specific high-end recommendation."
        },
        {
            "category": "Layout & Spacing",
            "score": <number 50-95>,
            "current_state": "Brief description.",
            "issue": "Specific critique.",
            "suggestion": "Specific high-end recommendation."
        },
        {
            "category": "Call to Actions (UX)",
            "score": <number 50-95>,
            "current_state": "Brief description of their CTAs.",
            "issue": "Specific critique on conversion friction.",
            "suggestion": "Specific high-end recommendation."
        }
    ],
    "content_audit": [
        {
            "section": "Hero Banner",
            "current_copy": "What it currently says or likely says.",
            "issue": "Why it's weak or generic.",
            "suggested_copy": "A powerful, high-converting rewrite."
        },
        {
            "section": "Value Proposition / Services",
            "current_copy": "What it currently says.",
            "issue": "Why it's weak or generic.",
            "suggested_copy": "A powerful rewrite."
        },
        {
            "section": "Navigation Header",
            "current_copy": "Current links.",
            "issue": "Why it's confusing or standard.",
            "suggested_copy": "Suggested structural changes."
        }
    ]
}
`;

        const imagePart = {
            inlineData: {
                data: screenshotBase64,
                mimeType: "image/jpeg"
            }
        };

        let lastError: any = null;
        let jsonResponse: any = null;

        for (const modelName of MODELS_TO_TRY) {
            try {
                console.log(`Trying model: ${modelName}...`);
                const model = genAI.getGenerativeModel({ model: modelName });
                const result = await model.generateContent({
                    contents: [{ role: 'user', parts: [{ text: promptText }, imagePart] }],
                    generationConfig: {
                        responseMimeType: "application/json",
                    },
                });

                const responseText = result.response.text();

                try {
                    jsonResponse = JSON.parse(responseText);
                } catch (parseError) {
                    console.log(`${modelName}: Direct JSON parse failed, extracting...`);
                    const startIndex = responseText.indexOf('{');
                    const endIndex = responseText.lastIndexOf('}');
                    if (startIndex !== -1 && endIndex !== -1 && endIndex > startIndex) {
                        jsonResponse = JSON.parse(responseText.substring(startIndex, endIndex + 1));
                    } else {
                        throw new Error("Could not extract valid JSON from Gemini response.");
                    }
                }

                console.log(`${modelName}: Success!`);
                break; // Got a successful response, stop trying other models

            } catch (modelError: any) {
                const is429 = modelError?.message?.includes('429') || modelError?.status === 429;
                console.warn(`${modelName} failed (${is429 ? '429 rate limit' : 'error'}):`, modelError?.message);
                lastError = modelError;

                if (is429 && MODELS_TO_TRY.indexOf(modelName) < MODELS_TO_TRY.length - 1) {
                    console.log('Waiting 3s before trying next model...');
                    await new Promise(resolve => setTimeout(resolve, 3000));
                    continue; // Try next model
                }
                throw modelError; // Last model also failed or non-429 error
            }
        }

        return NextResponse.json(jsonResponse);


    } catch (error: any) {
        console.error('Error processing Makeover AI:', error);
        return NextResponse.json(
            { error: error.message || 'An unexpected error occurred processing the Makeover Request.' },
            { status: 500 }
        );
    }
}
