"use client";

import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export function WebDesignCanvas() {
    return (
        <div className="min-h-screen bg-neutral-50 text-neutral-900 font-sans selection:bg-neutral-200 selection:text-neutral-900">
            {/* Header / Nav */}
            <header className="fixed top-0 left-0 w-full p-6 flex justify-between items-center z-50 mix-blend-difference text-white">
                <Link href="/" className="text-sm font-medium tracking-wide hover:opacity-70 transition-opacity">
                    ANTIGRAVITY
                </Link>
                <div className="text-xs font-mono opacity-50">
                    CANVAS — PHASE 02
                </div>
            </header>

            {/* Main Content */}
            <div className="container mx-auto px-6 pt-32 pb-24 max-w-5xl">

                {/* Intro Section */}
                <section className="mb-32 animate-in fade-in slide-in-from-bottom-8 duration-700">
                    <h1 className="text-6xl md:text-8xl font-syne font-bold tracking-tighter mb-8 leading-[0.9]">
                        The Canvas.
                    </h1>
                    <p className="text-xl md:text-2xl text-neutral-500 max-w-2xl leading-relaxed">
                        Before we build, we must define. A great website isn&apos;t just about code—it&apos;s about clarity.
                        Explore the pillars of digital presence.
                    </p>
                </section>

                {/* Topics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-24">

                    <Topic
                        number="01"
                        title="Purpose"
                        question="Why does this exist?"
                        desc="Is it to sell, to inform, to inspire, or to capture? A clear purpose dictates every design decision."
                    />

                    <Topic
                        number="02"
                        title="Audience"
                        question="Who are you speaking to?"
                        desc="Understand their needs, their language, and their pain points. Design for them, not just for yourself."
                    />

                    <Topic
                        number="03"
                        title="Emotion"
                        question="How should they feel?"
                        desc="Trust, excitement, calm, curiosity. The emotional response is the first and most lasting impression."
                    />

                    <Topic
                        number="04"
                        title="Function"
                        question="What must it do?"
                        desc="Beauty without function is merely decoration. Identify the key interactions and user flows."
                    />

                </div>

                {/* Call to Action */}
                <div className="mt-48 flex justify-end">
                    <Link href="/building" className="group flex items-center gap-4 text-2xl md:text-4xl font-bold tracking-tight hover:text-neutral-600 transition-colors">
                        <span>Enter The Studio</span>
                        <ArrowRight className="w-8 h-8 md:w-12 md:h-12 transition-transform group-hover:translate-x-2" />
                    </Link>
                </div>

            </div>

            {/* Background Decor */}
            <div className="fixed inset-0 pointer-events-none z-[-1] opacity-[0.03]"
                style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, black 1px, transparent 0)', backgroundSize: '40px 40px' }}>
            </div>
        </div>
    );
}

function Topic({ number, title, question, desc }: { number: string, title: string, question: string, desc: string }) {
    return (
        <div className="group">
            <div className="text-xs font-mono text-neutral-400 mb-4 border-b border-neutral-200 pb-2 flex justify-between">
                <span>{number}</span>
                <span>{"// "}{title.toUpperCase()}</span>
            </div>
            <h3 className="text-3xl font-medium mb-3 group-hover:text-neutral-600 transition-colors">{question}</h3>
            <p className="text-neutral-500 leading-relaxed max-w-sm">{desc}</p>
        </div>
    )
}
