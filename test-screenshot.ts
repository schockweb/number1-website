import { takeScreenshot } from './src/lib/screenshot';

async function main() {
    try {
        console.log("Starting screenshot test...");
        const result = await takeScreenshot("https://linear.app");
        console.log("Screenshot length:", result.length);
    } catch (e) {
        console.error("FAILED:");
        console.error(e);
    }
}

main();
