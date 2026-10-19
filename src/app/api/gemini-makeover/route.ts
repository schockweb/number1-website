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

        // 2. Query Gemini Vision trained as Number1.Studio Senior Design Architect
        const MODELS_TO_TRY = ['gemini-2.5-flash', 'gemini-1.5-flash'];

        const promptText = `
You are the Lead Web Design Architect & Brand Strategist at Number1.Studio (https://number1.studio).
Analyze the attached full-page screenshot of the target website: ${url}.

Number1.Studio specializes in two core high-value services:
1. Primary Focus: Deploying an AI Employee / Opportunity Radar to streamline operational workflows and eliminate repetitive admin tasks.
2. Secondary Services: Re-designing 2010-era legacy websites into sleek, high-converting digital platforms and crafting complete brand suites (virtual business cards, email signatures, letterheads, and modern logo architecture).

Examine every visual component in the screenshot and deliver a crisp, sharp diagnostic critique. Point out outdated 2010-era design flaws, visual clutter, weak typography, poor color contrast, and friction in conversion. Then provide specific, high-impact pointers on exactly what Number1.Studio will re-engineer and build for this client.

You must respond strictly with a raw JSON object containing the exact structure below. Do NOT wrap it in markdown block quotes (\`\`\`json).

{
    "executive_summary": "A 2-3 sentence high-impact summary of the target site's current limitations and how Number1.Studio will transform it.",
    "number1_studio_reengineering": {
        "legacy_flaws": [
            "Specific 2010-era design flaw or visual clutter item found on the site.",
            "Another specific structural or visual issue."
        ],
        "proposed_makeover": [
            "What Number1.Studio will redesign: High-contrast brutalist visual hierarchy, modern typography scale, and speed optimization.",
            "What Number1.Studio will build: Integrated corporate brand suite (virtual cards, letterheads, email signatures, modern logo).",
            "What Number1.Studio will deploy: Autonomous AI Employee integration to capture lead opportunities in real time."
        ]
    },
    "design_and_ux": [
        {
            "category": "Typography & Font Scale",
            "score": 62,
            "current_state": "Critique of current font choices and readability.",
            "issue": "Specific typography weakness.",
            "suggestion": "Number1.Studio bold typographic recommendation."
        },
        {
            "category": "Color Palette & Contrast",
            "score": 58,
            "current_state": "Current color palette description.",
            "issue": "Color contrast or brand cohesion issue.",
            "suggestion": "Number1.Studio modern dark-mode / sleek color palette proposal."
        },
        {
            "category": "Layout Grid & Spacing",
            "score": 65,
            "current_state": "Current layout structure description.",
            "issue": "Cramped grid or poor vertical rhythm issue.",
            "suggestion": "Number1.Studio responsive brutalist grid overhaul."
        },
        {
            "category": "Call to Actions (UX)",
            "score": 55,
            "current_state": "Description of current CTAs.",
            "issue": "High conversion friction or weak button prominence.",
            "suggestion": "Number1.Studio high-converting CTA structure."
        }
    ],
    "content_audit": [
        {
            "section": "Hero Banner",
            "current_copy": "What it currently says.",
            "issue": "Why it lacks authority.",
            "suggested_copy": "Number1.Studio high-impact copy rewrite."
        },
        {
            "section": "Primary Service Offering",
            "current_copy": "Current value proposition.",
            "issue": "Why it doesn't stand out.",
            "suggested_copy": "Number1.Studio clear value proposition rewrite."
        }
    ],
    "recommendations": [
        "Re-engineer legacy 2010 visual layout into high-speed brutalist architecture.",
        "Craft full Number1.Studio brand identity collateral (virtual cards, letterheads, email signatures).",
        "Integrate Number1.Studio AI Employee opportunity radar to handle customer inquiries 24/7.",
        "Optimize typography hierarchy and mobile breakpoint response."
    ]
}
`;

        const imagePart = {
            inlineData: {
                data: screenshotBase64,
                mimeType: "image/jpeg"
            }
        };

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
                } catch {
                    const startIndex = responseText.indexOf('{');
                    const endIndex = responseText.lastIndexOf('}');
                    if (startIndex !== -1 && endIndex !== -1 && endIndex > startIndex) {
                        jsonResponse = JSON.parse(responseText.substring(startIndex, endIndex + 1));
                    } else {
                        throw new Error("Could not extract valid JSON from Gemini response.");
                    }
                }

                console.log(`${modelName}: Success!`);
                break;

            } catch (modelError: any) {
                console.warn(`${modelName} failed:`, modelError.message || modelError);
            }
        }

        if (!jsonResponse) {
            return NextResponse.json(
                { error: 'Failed to parse AI design analysis from model response.' },
                { status: 500 }
            );
        }

        return NextResponse.json(jsonResponse);

    } catch (err: any) {
        console.error('[gemini-makeover] Route error:', err);
        return NextResponse.json(
            { error: err.message || 'An unexpected error occurred during website analysis.' },
            { status: 500 }
        );
    }
}
