import { chromium } from 'playwright';

export async function takeScreenshot(url: string, isMobile = false): Promise<string> {
    const browser = await chromium.launch({
        headless: true,
    });

    const context = await browser.newContext({
        viewport: isMobile ? { width: 375, height: 812 } : { width: 1440, height: 900 },
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        extraHTTPHeaders: {
            'Accept-Language': 'en-US,en;q=0.9',
        },
    });

    const page = await context.newPage();

    try {
        await page.goto(url, { waitUntil: 'networkidle', timeout: 20000 });

        // Give JS animations a moment to settle
        await page.waitForTimeout(2000);

        // Take full-page screenshot as buffer
        const screenshotBuffer = await page.screenshot({
            fullPage: true,
            type: 'jpeg',
            quality: 70,
        });

        await browser.close();

        return screenshotBuffer.toString('base64');

    } catch (error) {
        await browser.close();
        console.error('Playwright screenshot failed:', error);
        throw new Error('Failed to capture website screenshot.');
    }
}
