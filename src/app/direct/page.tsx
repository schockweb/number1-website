"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

const REQUIREMENTS = [
    { id: 'purpose', label: '1. Primary Purpose', info: 'What is the main goal of the site? (e.g. to sell products, capture leads, or showcase a portfolio).', keywords: ['purpose', 'goal', 'objective', 'sell', 'showcase', 'blog', 'portfolio', 'ecommerce', 'store'] },
    { id: 'budget', label: '2. Time & Budget', info: 'What is your timeline for launch, and what is your expected budget range?', keywords: ['budget', 'timeline', 'week', 'month', 'asap', 'cost', '$', 'money', 'time'] },
    { id: 'audience', label: '3. Target Audience', info: 'Who are your primary users or customers? Mention their demographics or interests.', keywords: ['audience', 'demographic', 'users', 'customers', 'clients', 'people'] },
    { id: 'features', label: '4. Core Features', info: 'Any specific technical needs? (e.g. user accounts, booking system, payment gateway).', keywords: ['features', 'functionality', 'ecommerce', 'booking', 'portal', 'login', 'integrations', 'system'] },
    { id: 'pages', label: '5. Core Pages', info: 'List the main pages you think you need (e.g. Home, About Us, Services, Contact).', keywords: ['pages', 'about', 'contact', 'services', 'home', 'shop', 'gallery'] },
    { id: 'aesthetic', label: '6. Aesthetic & Vibe', info: 'Describe the visual style. Is it minimalist, dark, colorful, corporate, or brutalist?', keywords: ['aesthetic', 'vibe', 'minimal', 'dark', 'bold', 'colorful', 'style', 'atmosphere', 'feel', 'look'] },
];

export default function DirectRequirementsPage() {
    const [text, setText] = useState('');

    const checkRequirement = (keywords: string[]) => {
        const lowerText = text.toLowerCase();
        return keywords.some(kw => lowerText.includes(kw));
    };

    return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 md:p-12 relative overflow-hidden font-sans">
            <Link href="/" className="absolute top-8 left-8 font-extrabold text-xl tracking-tighter hover:opacity-70 transition-opacity z-50 hidden md:block">
                Number1
            </Link>

            <div className="absolute top-8 right-8 flex gap-4 z-50">
                <Link
                    href="/building"
                    className="px-4 md:px-6 py-2 border border-neutral-700 text-neutral-400 rounded-full hover:text-white hover:border-white transition-all text-[10px] md:text-xs tracking-widest uppercase"
                >
                    Builder
                </Link>
                <Link
                    href="/canvas?step=0"
                    className="px-4 md:px-6 py-2 border border-neutral-700 text-neutral-400 rounded-full hover:text-white hover:border-white transition-all text-[10px] md:text-xs tracking-widest uppercase"
                >
                    Canvas
                </Link>
            </div>

            <div className="w-full max-w-7xl 2xl:max-w-[96rem] flex flex-col lg:flex-row gap-12 lg:gap-24 items-center justify-center z-10">
                {/* Left: Textbox */}
                <div className="w-full lg:w-1/2 flex flex-col items-center">
                    <h1 className="text-4xl md:text-5xl font-syne font-bold mb-4 text-center tracking-tighter">Direct Requirements</h1>
                    <p className="text-neutral-400 mb-8 text-center text-xs md:text-sm uppercase tracking-widest font-mono">Dump your exact specifications below.</p>
                    <textarea
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="e.g. We need an e-commerce site for our new brand, targeting Gen Z. We have our logo and brand guidelines ready. We need a Home page, About, Shop, and Contact. We already bought our domain name..."
                        className="w-full h-[400px] bg-neutral-900/50 border border-neutral-700 rounded-3xl p-6 md:p-8 text-xl text-white placeholder:text-neutral-600 focus:outline-none focus:border-white focus:bg-neutral-900 transition-colors backdrop-blur-sm resize-none"
                    />

                    <motion.button
                        initial={{ opacity: 0 }}
                        animate={{ opacity: text.trim().length > 10 ? 1 : 0 }}
                        className="mt-8 px-10 py-4 bg-white text-black rounded-full font-bold hover:scale-105 transition-transform tracking-wider text-sm shadow-[0_0_40px_rgba(255,255,255,0.2)]"
                        onClick={() => alert("Requirements Captured!")}
                    >
                        SUBMIT SPECS
                    </motion.button>
                </div>

                {/* Right: Checklist */}
                <div className="w-full lg:w-1/3 flex flex-col gap-6">
                    <div className="text-center lg:text-left">
                        <h2 className="text-xl font-bold uppercase tracking-widest text-neutral-300 font-syne border-b border-neutral-800 pb-4 inline-block lg:block">Essentials Checklist</h2>
                    </div>
                    <div className="flex flex-col gap-4">
                        {REQUIREMENTS.map((req, idx) => {
                            const isMet = checkRequirement(req.keywords);

                            return (
                                <motion.div
                                    key={req.id}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    className={`flex items-center gap-5 p-4 md:p-5 rounded-2xl border transition-all duration-500 ${isMet ? 'bg-green-500/10 border-green-500/30 shadow-[0_0_30px_rgba(34,197,94,0.1)]' : 'bg-red-500/5 border-red-500/20'}`}
                                >
                                    <motion.div
                                        animate={{
                                            backgroundColor: isMet ? '#4ade80' : '#ef4444',
                                            scale: isMet ? [1, 1.3, 1] : 1
                                        }}
                                        transition={{ duration: 0.5 }}
                                        className="w-4 h-4 rounded-full flex-shrink-0 shadow-[0_0_15px_rgba(0,0,0,0.5)] border border-black/50"
                                        style={{ boxShadow: isMet ? '0 0 20px rgba(74, 222, 128, 0.6)' : '0 0 15px rgba(239, 68, 68, 0.4)' }}
                                    />
                                    <div className="flex items-center gap-2 relative">
                                        <span className={`font-medium tracking-wide transition-colors duration-500 ${isMet ? 'text-green-400' : 'text-red-400'}`}>
                                            {req.label}
                                        </span>
                                        <div className="relative group flex items-center">
                                            <button type="button" className={`w-5 h-5 rounded-full flex items-center justify-center border text-xs font-serif italic cursor-help transition-colors ${isMet ? 'border-green-500/40 text-green-500/60 hover:text-green-400 hover:border-green-400' : 'border-red-500/40 text-red-500/60 hover:text-red-400 hover:border-red-400'}`}>
                                                i
                                            </button>
                                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-3 bg-neutral-900 border border-neutral-700 rounded-xl text-neutral-300 text-xs shadow-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                                                {req.info}
                                                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-neutral-700" />
                                                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-neutral-900 -mt-[1px]" />
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Background elements */}
            <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-neutral-900 rounded-full blur-[120px] opacity-50 pointer-events-none z-0" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-neutral-950 rounded-full blur-[150px] pointer-events-none z-0" />
        </div>
    );
}
