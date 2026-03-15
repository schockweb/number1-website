"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useLanguageStore, LOCALE_LABELS, type Locale } from '@/lib/store/useLanguageStore';
import { motion, AnimatePresence } from 'framer-motion';

export function LanguagePicker() {
    const { locale, setLocale } = useLanguageStore();
    const [isOpen, setIsOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const current = LOCALE_LABELS[locale];

    return (
        <div ref={ref} className="relative w-full">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all border border-white/5 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white"
            >
                <span className="text-lg">{current.flag}</span>
                <span className="text-sm font-medium flex-1 text-left">{current.name}</span>
                <svg className={`w-4 h-4 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="absolute bottom-full mb-3 left-0 right-0 bg-[#0D0D0D] border border-white/10 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden z-[100] max-h-64 overflow-y-auto no-scrollbar backdrop-blur-xl"
                    >
                        <div className="p-2 space-y-1">
                            {(Object.keys(LOCALE_LABELS) as Locale[]).map((loc) => {
                                const info = LOCALE_LABELS[loc];
                                const isActive = loc === locale;
                                return (
                                    <button
                                        key={loc}
                                        onClick={() => {
                                            setLocale(loc);
                                            setIsOpen(false);
                                        }}
                                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${isActive
                                            ? 'bg-white/10 text-white font-semibold'
                                            : 'text-white/50 hover:bg-white/5 hover:text-white'
                                            }`}
                                    >
                                        <span className="text-base">{info.flag}</span>
                                        <span className="flex-1 text-left">{info.name}</span>
                                        {isActive && (
                                            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
