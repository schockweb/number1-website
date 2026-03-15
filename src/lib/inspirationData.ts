export type InspirationStyle = 'minimalist' | 'brutalist' | 'corporate' | 'creative' | 'dark' | 'luxury';

export interface InspirationItem {
    id: string;
    title: string;
    description: string;
    style: InspirationStyle;
    features: string[];
}

export const inspirationItems: InspirationItem[] = [
    {
        id: '1',
        title: 'Swiss Minimal',
        description: 'Clean lines, strong typography, negative space. Focus on content hierarchy.',
        style: 'minimalist',
        features: ['Grid Systems', 'San-serif Type', 'High Contrast'],
    },
    {
        id: '2',
        title: 'Neo-Brutalism',
        description: 'Raw, unpolished aesthetic with bold borders and high-contrast colors.',
        style: 'brutalist',
        features: ['Bold Strokes', 'System Fonts', 'Hard Shadows'],
    },
    {
        id: '3',
        title: 'Modern Corporate',
        description: 'Professional, trustworthy, and clean. Uses blues and grays with rounded corners.',
        style: 'corporate',
        features: ['Soft Shadows', 'Brand Colors', 'Clean Layouts'],
    },
    {
        id: '4',
        title: 'Ethereal Luxury',
        description: 'Sophisticated, dark mode, blurred gradients, and fine details.',
        style: 'luxury',
        features: ['Glassmorphism', 'Serif Headings', 'Golden Ratio'],
    },
    {
        id: '5',
        title: 'Interactive Creative',
        description: 'Playful, animated, and unconventional layouts that surprise the user.',
        style: 'creative',
        features: ['Micro-interactions', 'WebGL', 'Custom Cursors'],
    },
    {
        id: '6',
        title: 'Dark SaaS',
        description: 'High-tech, dark UI with glowing accents and dashboard visualization.',
        style: 'dark',
        features: ['Dark Mode', 'Glow Effects', 'Data Viz'],
    },
];
