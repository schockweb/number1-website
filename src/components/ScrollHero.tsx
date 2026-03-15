"use client";

import React, { useRef, useEffect, useState } from 'react';
import { motion, useScroll, useTransform, animate } from 'framer-motion';
import { ProductSection } from './ProductSection';
import { useUserStore } from '@/lib/store/useUserStore';
import Link from 'next/link';

export function ScrollHero() {
    const containerRef = useRef<HTMLDivElement>(null);
    const [mounted, setMounted] = useState(false);
    const { isAuthenticated, logout } = useUserStore();

    useEffect(() => {
        setMounted(true);
        let isProgrammaticScroll = false;

        const triggerScroll = () => {
            if (isProgrammaticScroll || window.scrollY >= 50) return;
            isProgrammaticScroll = true;

            animate(0, window.innerHeight, {
                duration: 3,
                ease: "easeInOut",
                onUpdate: (val) => {
                    window.scrollTo(0, val);
                },
                onComplete: () => {
                    isProgrammaticScroll = false;
                }
            });
        };

        const handleWheel = (e: WheelEvent) => {
            if (e.deltaY > 0) triggerScroll();
        };

        let touchStartY = 0;
        const handleTouchStart = (e: TouchEvent) => {
            touchStartY = e.touches[0].clientY;
        };

        const handleTouchMove = (e: TouchEvent) => {
            const touchEndY = e.touches[0].clientY;
            if (touchStartY - touchEndY > 20) triggerScroll();
        };

        window.addEventListener('wheel', handleWheel, { passive: true });
        window.addEventListener('touchstart', handleTouchStart, { passive: true });
        window.addEventListener('touchmove', handleTouchMove, { passive: true });

        return () => {
            window.removeEventListener('wheel', handleWheel);
            window.removeEventListener('touchstart', handleTouchStart);
            window.removeEventListener('touchmove', handleTouchMove);
        };
    }, []);

    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end start"],
    });

    // Transform ranges need calibration based on the desired scroll distance
    // mapping scroll 0 -> 1 to animation states

    // Make it start in the center then shrink to top left over the scroll duration
    const scale = useTransform(scrollYProgress, [0, 0.4], [1, 0.15]);
    const top = useTransform(scrollYProgress, [0, 0.4], ["50%", "3%"]);
    const left = useTransform(scrollYProgress, [0, 0.4], ["50%", "3%"]);
    const x = useTransform(scrollYProgress, [0, 0.4], ["-50%", "0%"]);
    const y = useTransform(scrollYProgress, [0, 0.4], ["-50%", "0%"]);

    // Opacity for the scroll indicator
    const opacity = useTransform(scrollYProgress, [0, 0.1], [1, 0]);

    // Products animation: flows in halfway through the header animation (at 0.2)
    const productsOpacity = useTransform(scrollYProgress, [0.2, 0.5], [0, 1]);
    const productsY = useTransform(scrollYProgress, [0.2, 0.5], [100, 0]);
    // const pointerEvents = useTransform(scrollYProgress, (v) => v > 0.2 ? 'auto' : 'none');

    return (
        <div ref={containerRef} className="h-[200vh] relative">
            <div className="sticky top-0 h-screen overflow-hidden">

                {/* Auth Navigation */}
                {mounted && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="absolute top-8 right-8 z-[60] flex items-center gap-6"
                    >
                        {isAuthenticated ? (
                            <Link href="/account" className="text-sm font-bold uppercase tracking-widest bg-white text-black px-6 py-3 border-2 border-black rounded-none hover:bg-black hover:text-white transition-all shadow-[4px_4px_0_0_#000] hover:translate-x-1 hover:translate-y-1 hover:shadow-none">
                                Account
                            </Link>
                        ) : (
                            <>
                                <Link href="/login" className="text-sm font-bold uppercase tracking-widest text-white hover:text-neutral-400 transition-colors hidden sm:block">
                                    Login
                                </Link>
                                <Link href="/signup" className="text-sm font-bold uppercase tracking-widest bg-white text-black px-6 py-3 border-2 border-black rounded-none hover:bg-black hover:text-white transition-all shadow-[4px_4px_0_0_#000] hover:translate-x-1 hover:translate-y-1 hover:shadow-none">
                                    Sign Up
                                </Link>
                            </>
                        )}
                    </motion.div>
                )}

                {/* Animated Brand Name */}
                <motion.div
                    style={{
                        top,
                        left,
                        x,
                        y,
                        scale,
                        position: 'absolute',
                        transformOrigin: 'top left'
                    }}
                    className="z-50 leading-none"
                >
                    <h1 className="font-extrabold tracking-tighter text-foreground whitespace-nowrap text-[15vw] md:text-[12vw] flex">
                        {"Number1".split("").map((char, index) => (
                            <motion.span
                                key={index}
                                initial={{
                                    opacity: 0,
                                    x: [-800, 600, -400, 700, -500, 300, -200][index] || 0,
                                    y: [-400, 500, -600, 300, -200, 400, 800][index] || 0,
                                    rotate: [-45, 30, -60, 45, -30, 60, -90][index] || 0
                                }}
                                animate={{ opacity: 1, x: 0, y: 0, rotate: 0 }}
                                transition={{
                                    duration: 1.2,
                                    type: "spring",
                                    bounce: 0.3,
                                    delay: index * 0.15 // Stagger effect
                                }}
                                className="inline-block"
                            >
                                {char}
                            </motion.span>
                        ))}
                    </h1>
                </motion.div>

                {/* Optional Scroll Indicator */}
                <motion.div
                    style={{ opacity }}
                    className="absolute bottom-10 left-1/2 -translate-x-1/2"
                >
                    <div className="animate-bounce text-neutral-400 text-sm">Scroll Down</div>
                </motion.div>

                {/* Product Section Flowing In */}
                <motion.div
                    style={{ opacity: productsOpacity, y: productsY }}
                    className="absolute inset-0 top-[15vh] z-40 flex items-center justify-center"
                >
                    <ProductSection />
                </motion.div>
            </div>
        </div>
    );
}
