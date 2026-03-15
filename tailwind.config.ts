import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                background: "var(--background)",
                foreground: "var(--foreground)",
            },
            fontFamily: {
                sans: ["var(--font-sans)"],
                mono: ["var(--font-mono)"],
                syne: ["Syne", "sans-serif"],
            },
            boxShadow: {
                // We'll define these as utilities in CSS or here
                // But since I used specific custom properties, let's just make sure 
                // they are available. Actually, the CSS class .depth-soft uses var(--shadow-soft) directly,
                // so I don't strictly need to add them here unless I want "shadow-soft" class from Tailwind.
                // My code uses `depth-soft` custom class, so I can skip adding it to theme if I keep the CSS class.
            },
        },
    },
    plugins: [],
};
export default config;
