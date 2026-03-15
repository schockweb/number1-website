
"use client";

import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { useLanguageStore } from '@/lib/store/useLanguageStore';
import { useTranslation } from '@/lib/useTranslation';
import { convertAndFormatPrice } from '@/lib/priceUtils';

export function ProductSection() {
    const cardRef = useRef<HTMLDivElement>(null);
    const { currency } = useLanguageStore();
    const { t } = useTranslation();

    return (
        <section className="py-24 w-full min-h-[50vh] flex flex-col items-center justify-center">
            <div className="container mx-auto px-4 flex flex-col items-center">
                <div style={{ perspective: "1000px" }}>
                    <motion.div
                        ref={cardRef}
                        initial={{ scale: 0.5, opacity: 0, y: 300, rotateX: 20 }}
                        whileInView={{ scale: 1, opacity: 1, y: 0, rotateX: 0 }}
                        animate={{ y: [0, -20, 0] }}
                        transition={{
                            default: {
                                duration: 1.2,
                                type: "spring",
                                bounce: 0.5
                            },
                            y: {
                                duration: 6,
                                repeat: Infinity,
                                ease: "easeInOut"
                            }
                        }}
                        viewport={{ once: true, margin: "-100px" }}
                        style={{
                            transformStyle: "preserve-3d",
                        }}
                        className="relative w-[500px] h-[650px] bg-black rounded-none shadow-2xl cursor-pointer group border-2 border-black"
                    >
                        {/* Thickness Layers (Left Side) - Simulated */}
                        <div
                            className="absolute top-0 bottom-0 -left-[20px] w-[20px] bg-neutral-900 origin-right transform rotate-y-90 rounded-none border-l border-neutral-800"
                            style={{ transform: "rotateY(-90deg) translateZ(0.5px)" }}
                        />
                        {/* Thickness Layers (Back Side) - Simulated */}
                        <div
                            className="absolute inset-0 bg-neutral-900 rounded-none transform -translate-z-[20px] border border-neutral-800"
                            style={{ transform: "translateZ(-20px)" }}
                        />

                        <div
                            style={{ transform: "translateZ(50px)" }}
                            className="absolute inset-0 p-8 flex flex-col justify-between text-white"
                        >
                            <div className="space-y-6">
                                <span className="inline-block px-3 py-1 bg-white/10 backdrop-blur-md rounded-none text-xs font-mono border border-white/20">
                                    {t('card.newService') || 'NEW SERVICE'}
                                </span>

                                <div className="space-y-2">
                                    <h3
                                        className="text-5xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-white via-neutral-200 to-neutral-500 animate-gradient-x"
                                        style={{ backgroundSize: "200% 200%" }}
                                    >
                                        {t('card.webDesign') || 'WEB DESIGN'}
                                    </h3>
                                    <motion.div
                                        initial={{ width: 0 }}
                                        whileInView={{ width: "100%" }}
                                        transition={{ delay: 0.5, duration: 0.8 }}
                                        className="h-1 bg-white rounded-none"
                                    />
                                </div>

                                <p className="text-neutral-300 leading-relaxed">
                                    {t('card.webDesignDescShort') || 'In a digital-first world, your website is your ambassador. Exceptional design isn\'t just about aesthetics—it\'s about trust, credibility, and converting visitors into loyal clients.'}
                                </p>
                            </div>

                            <div className="flex justify-between items-end">
                                <div>
                                    <p className="text-neutral-500 text-xs uppercase tracking-widest mb-1">{t('card.startingFrom')}</p>
                                    <p className="text-2xl font-mono">{convertAndFormatPrice(2499, currency)}</p>
                                </div>
                                <button className="bg-white text-black px-6 py-2 rounded-none font-medium text-sm hover:bg-neutral-200 transition-colors">
                                    Start Building
                                </button>
                            </div>
                        </div>

                        {/* Background Effect */}
                        <div className="absolute inset-0 bg-gradient-to-br from-neutral-800 to-black rounded-none -z-10" />

                        {/* Glossy Overlay */}
                        <div
                            className="absolute inset-0 rounded-none bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                            style={{ transform: "translateZ(60px)" }}
                        />
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
