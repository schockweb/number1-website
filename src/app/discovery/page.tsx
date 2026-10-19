"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

const QUIZ_QUESTIONS = [
    {
        title: "What is the number one objective of this website?",
        icon: "M13 10V3L4 14h7v7l9-11h-7z"
    },
    {
        title: "What is the biggest thing preventing your current digital presence from achieving that goal?",
        icon: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
    },
    {
        title: "Who is your ideal customer?",
        icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
    },
    {
        title: "Who are your top 3–5 competitors and how will you be different?",
        icon: "M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
    },
    {
        title: "Who is responsible for writing copy and providing imagery or video?",
        icon: "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
    },
    {
        title: "Do you have existing hosting and domain access, or do you need a new setup?",
        icon: "M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01"
    },
    {
        title: "If your brand were a person, how would they act?",
        icon: "M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
    },
    {
        title: "Which websites do you admire and why?",
        icon: "M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
    },
    {
        title: "When is your absolute must-have launch date?",
        icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
    },
    {
        title: "What is the budget allocated for this build?",
        icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
    }
];

export default function DiscoveryPage() {
    const [currentStep, setCurrentStep] = useState(0);
    const [answers, setAnswers] = useState<Record<number, string>>({});
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleNext = () => {
        if (currentStep < QUIZ_QUESTIONS.length - 1) {
            setCurrentStep(prev => prev + 1);
        } else {
            setIsSubmitted(true);
        }
    };

    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep(prev => prev - 1);
        }
    };

    if (isSubmitted) {
        return (
            <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 text-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="max-w-2xl"
                >
                    <div className="w-20 h-20 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-8 border border-emerald-500/20">
                        <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-syne font-bold mb-6">Discovery Complete</h1>
                    <p className="text-white/60 text-lg mb-12">
                        Your project architecture has been mapped. We are now ready to begin the building stage.
                    </p>
                    <Link
                        href="/canvas"
                        className="px-12 py-5 bg-white text-black rounded-full font-bold text-sm tracking-widest uppercase hover:bg-neutral-200 transition-all shadow-[0_0_40px_rgba(255,255,255,0.2)] hover:scale-105"
                    >
                        Explore the Playground →
                    </Link>
                </motion.div>
            </div>
        );
    }

    const question = QUIZ_QUESTIONS[currentStep];
    const progress = ((currentStep + 1) / QUIZ_QUESTIONS.length) * 100;

    return (
        <div className="min-h-screen bg-black text-white relative overflow-hidden flex flex-col">
            {/* Ambient Background */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-[-10%] right-[-10%] w-[50rem] h-[50rem] bg-orange-500/[0.03] rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[40rem] h-[40rem] bg-indigo-500/[0.03] rounded-full blur-[120px]" />
            </div>

            {/* Header */}
            <nav className="relative z-50 flex items-center justify-between px-8 md:px-16 py-8">
                <Link href="/" className="text-xl font-bold tracking-tighter font-syne text-white cursor-pointer">
                    Number<span className="opacity-50">1</span>.Studio
                </Link>
                <div className="flex flex-col items-end">
                    <span className="text-[10px] font-mono tracking-widest text-white/40 uppercase mb-2">Progress</span>
                    <div className="w-32 h-1 bg-white/10 rounded-full overflow-hidden">
                        <motion.div
                            className="h-full bg-orange-500"
                            animate={{ width: `${progress}%` }}
                        />
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="flex-1 relative z-10 flex flex-col items-center justify-center px-6 pb-24">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentStep}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                        className="w-full max-w-4xl flex flex-col items-center text-center"
                    >
                        <div className="w-16 h-16 md:w-20 md:h-20 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center text-orange-400 mb-8">
                            <svg className="w-8 h-8 md:w-10 md:h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={question.icon} />
                            </svg>
                        </div>

                        <h1 className="text-3xl md:text-5xl lg:text-6xl font-syne font-bold text-white mb-16 leading-tight max-w-3xl">
                            {question.title}
                        </h1>

                        <div className="w-full relative">
                            <textarea
                                value={answers[currentStep] || ''}
                                onChange={(e) => setAnswers({ ...answers, [currentStep]: e.target.value })}
                                placeholder=""
                                className="w-full bg-transparent border-b border-white/20 py-6 text-2xl md:text-4xl text-center focus:outline-none focus:border-orange-500 transition-colors placeholder:text-white/10 resize-none overflow-hidden min-h-[120px]"
                                rows={1}
                                autoFocus
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleNext();
                                    }
                                }}
                            />
                        </div>

                        <div className="flex items-center gap-6 mt-16">
                            <button
                                onClick={handleBack}
                                className={`px-8 py-3 text-sm font-mono tracking-widest uppercase text-white/40 hover:text-white transition-colors ${currentStep === 0 ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
                            >
                                Back
                            </button>
                            <button
                                onClick={handleNext}
                                className="px-12 py-4 bg-white text-black rounded-full font-bold text-sm tracking-widest uppercase hover:bg-neutral-200 transition-all shadow-lg hover:scale-105"
                            >
                                {currentStep === QUIZ_QUESTIONS.length - 1 ? 'Finish' : 'Next'}
                            </button>
                        </div>
                    </motion.div>
                </AnimatePresence>
            </main>

            {/* Bottom Credits */}
            <div className="absolute bottom-12 left-0 right-0 flex justify-center pointer-events-none">
                <span className="text-[10px] font-mono tracking-widest text-white/20 uppercase">
                    Number1 Project Discovery Stage
                </span>
            </div>
        </div>
    );
}
