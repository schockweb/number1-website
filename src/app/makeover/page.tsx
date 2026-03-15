"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useUserStore } from '@/lib/store/useUserStore';
import BookCallModal from '@/components/BookCallModal';

interface Pin {
    id: string;
    x: number;
    y: number;
    text: string;
}

const ANALYSIS_STEPS = [
    "Scanning visual hierarchy...",
    "Extracting typographic scale...",
    "Mapping color palettes...",
    "Evaluating structural flow...",
    "Synthesizing recommendations..."
];

// Palette order: [background, navBg, accent, textColor, ctaColor]
const COLOUR_PALETTES: Record<string, { name: string; colors: string[] }> = {
    original: { name: 'Original', colors: [] },
    dark: { name: 'Dark Mode', colors: ['#0a0a0a', '#111111', '#16213e', '#e2e8f0', '#22d3ee'] },
    corporate: { name: 'Corporate Blue', colors: ['#f8fafc', '#1e3a5f', '#2563eb', '#111111', '#2563eb'] },
    warm: { name: 'Warm Earthy', colors: ['#faf7f2', '#3d1e00', '#d97706', '#111111', '#b45309'] },
    neon: { name: 'Vibrant Neon', colors: ['#0f0f0f', '#1a0a2e', '#7c3aed', '#f0f0f0', '#f43f5e'] },
};

const FALLBACK_RESULTS = {
    website_target: "B2B SaaS platform targeting enterprise teams and mid-market companies looking for productivity tooling.",
    colour_palette: {
        dominant: ['#050505', '#22d3ee', '#a855f7', '#ffffff', '#111111'],
        assessment: "High-contrast dark palette with neon accents. Strong visual identity but accent colours may need refinement for accessibility.",
    },
    layout_spacing: {
        type: "CSS Grid + Flexbox hybrid",
        assessment: "Clean section separation with generous vertical padding. Mobile breakpoints well-handled. Minor cramping in the product card grid.",
    },
    typography: {
        assessment: "Good density — headlines are impactful but body copy could use more line-height. Consider increasing base font size from 14px to 16px for readability.",
    },
    recommendations: [
        "Increase body text line-height to 1.7 for better readability.",
        "Add a visible focus ring on interactive elements for accessibility.",
        "Consolidate accent colours to a single primary + single secondary.",
        "Reduce hero section height on mobile to show content above the fold.",
    ],
};

export default function MakeoverPage() {
    const { settings } = useUserStore();
    const [step, setStep] = useState<'input' | 'analyzing' | 'preview'>('input');
    const [urlInput, setUrlInput] = useState('');
    const [iframeUrl, setIframeUrl] = useState('');
    const [loadingIndex, setLoadingIndex] = useState(0);
    const [progress, setProgress] = useState(0);
    const [aiResults, setAiResults] = useState<any>(null);
    const [hasError, setHasError] = useState(false);

    const [isCommentMode, setIsCommentMode] = useState(false);
    const [pins, setPins] = useState<Pin[]>([]);
    const [activePinId, setActivePinId] = useState<string | null>(null);
    const overlayRef = useRef<HTMLDivElement>(null);
    const [iframeScroll, setIframeScroll] = useState({ scrollY: 0, pageHeight: 0 });
    const mobileInputRef = useRef<HTMLInputElement>(null);
    const [showCommentsDropdown, setShowCommentsDropdown] = useState(false);
    const [showPinTip, setShowPinTip] = useState(true);

    const [selectedPalette, setSelectedPalette] = useState('original');
    const [recommendations, setRecommendations] = useState<{ id: string; text: string }[]>([]);
    const [expandedSection, setExpandedSection] = useState<string | null>('target');
    const [isProposalOpen, setIsProposalOpen] = useState(false);
    const [showBookCall, setShowBookCall] = useState(false);
    const [proposalSubmitted, setProposalSubmitted] = useState(false);
    const [showCommentGlow, setShowCommentGlow] = useState(false);
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const [showToast, setShowToast] = useState(false);
    const [toastMsg, setToastMsg] = useState('');

    const fireToast = (msg: string) => {
        setToastMsg(msg);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 4500);
    };

    const handleUrlSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!urlInput.trim()) return;

        let formattedUrl = urlInput.trim();
        if (!/^https?:\/\//i.test(formattedUrl)) {
            formattedUrl = 'https://' + formattedUrl;
        }

        setIframeUrl(formattedUrl);
        setStep('analyzing');
    };

    const handleDevSkip = () => {
        setUrlInput('http://localhost:3000/experiment/index.html');
        setIframeUrl('http://localhost:3000/experiment/index.html');
        setAiResults(FALLBACK_RESULTS);
        setStep('preview');
    };

    useEffect(() => {
        let isMounted = true;
        let progressInterval: NodeJS.Timeout;
        let textInterval: NodeJS.Timeout;

        if (step === 'analyzing') {
            const stepDuration = 1200; // 1.2s per step
            const totalDuration = stepDuration * ANALYSIS_STEPS.length;

            // 1. Progress bar animation (caps at 95% until API returns)
            const startTime = Date.now();
            progressInterval = setInterval(() => {
                const elapsed = Date.now() - startTime;
                const newProgress = Math.min((elapsed / totalDuration) * 95, 95);
                setProgress(newProgress);
            }, 50);

            // 2. Text update animation
            textInterval = setInterval(() => {
                setLoadingIndex((prev) => {
                    if (prev < ANALYSIS_STEPS.length - 1) return prev + 1;
                    clearInterval(textInterval);
                    return prev;
                });
            }, stepDuration);

            // 3. Fetch AI Analysis in parallel
            const fetchAnalysis = async () => {
                try {
                    const response = await fetch('/api/gemini-makeover', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ url: iframeUrl })
                    });

                    const data = await response.json();

                    if (!response.ok) {
                        throw new Error(data.error || "API failed");
                    }

                    if (isMounted) {
                        setAiResults(data);
                        setHasError(false);

                        // Wait for minimum animation time before finishing
                        const elapsed = Date.now() - startTime;
                        const remainingTime = Math.max(0, totalDuration - elapsed);

                        setTimeout(() => {
                            if (isMounted) {
                                setProgress(100);
                                setTimeout(() => setStep('preview'), 500);
                            }
                        }, remainingTime);
                    }
                } catch (error) {
                    console.error("AI Analysis error:", error);
                    if (isMounted) {
                        setHasError(true);
                        // We still use fallback to let them see the UI, but we flag the error
                        setAiResults(FALLBACK_RESULTS);
                        setTimeout(() => {
                            if (isMounted) {
                                setProgress(100);
                                setTimeout(() => setStep('preview'), 500);
                            }
                        }, 2000);
                    }
                }
            };

            fetchAnalysis();

            return () => {
                isMounted = false;
                clearInterval(progressInterval);
                clearInterval(textInterval);
            };
        }
    }, [step, iframeUrl]);

    useEffect(() => {
        if (step === 'preview') {
            setShowCommentGlow(true);
            const timer = setTimeout(() => setShowCommentGlow(false), 15000);
            return () => clearTimeout(timer);
        }
    }, [step]);

    // Listen for navigation + scroll events from the proxy iframe
    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            if (!event.data) return;

            if (event.data.type === 'MAKE_OVER_NAVIGATE' && event.data.url) {
                // Only update if the URL actually changed (avoids hydration loops)
                if (event.data.url !== iframeUrl) {
                    setUrlInput(event.data.url);
                    setIframeUrl(event.data.url);
                }
            }

            if (event.data.type === 'MAKE_OVER_SCROLL') {
                setIframeScroll({
                    scrollY: event.data.scrollY || 0,
                    pageHeight: event.data.pageHeight || 0,
                });
            }
        };
        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, []);

    const handleOverlayClick = (e: React.MouseEvent) => {
        if (!isCommentMode || !overlayRef.current) return;

        // Prevent adding a new pin if we just clicked on an existing one
        if ((e.target as HTMLElement).closest('.pin-element')) return;

        const rect = overlayRef.current.getBoundingClientRect();

        // X stays as a percentage of the overlay width (which matches iframe width)
        const x = ((e.clientX - rect.left) / rect.width) * 100;

        // e.clientY is relative to viewport. rect.top is where the overlay starts (also relative to viewport)
        const yPixelInViewport = e.clientY - rect.top;

        // Add the current iframe scroll amount to get the absolute Y position on the page
        const yAbsolute = yPixelInViewport + iframeScroll.scrollY;

        const newPin: Pin = {
            id: Date.now().toString(),
            x,
            y: yAbsolute, // absolute pixel Y on the full page
            text: ''
        };

        // On mobile, save scroll position of the stacked container so we can restore it
        // after React re-renders the sidebar with the notes textarea
        const isMobile = window.innerWidth < 1024;
        const scrollContainer = overlayRef.current.closest('.overflow-y-auto, [class*="overflow-y-auto"]');
        const savedScrollTop = scrollContainer?.scrollTop ?? 0;

        setPins([...pins, newPin]);
        setActivePinId(newPin.id);

        // On mobile: restore scroll + focus the floating inline input
        if (isMobile) {
            if (scrollContainer) {
                requestAnimationFrame(() => {
                    scrollContainer.scrollTop = savedScrollTop;
                });
            }
            // Focus the mobile inline input so keyboard pops up
            setTimeout(() => {
                mobileInputRef.current?.focus();
            }, 100);
        }
    };

    const updatePinText = (id: string, text: string) => {
        setPins(pins.map(p => p.id === id ? { ...p, text } : p));
    };

    const deletePin = (id: string) => {
        setPins(pins.filter(p => p.id !== id));
        if (activePinId === id) setActivePinId(null);
    };

    return (
        <div className="h-[100dvh] bg-background text-foreground font-sans relative overflow-hidden flex flex-col transition-colors duration-500">
            {/* Dynamic Background identical to home/account */}
            <div className="fixed inset-0 z-0 pointer-events-none hide-in-light">
                <div className="absolute top-0 right-1/4 w-[50rem] h-[50rem] bg-indigo-500/10 rounded-full blur-[120px] mix-blend-multiply dark:mix-blend-screen" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[40rem] h-[40rem] bg-emerald-500/10 rounded-full blur-[120px] mix-blend-multiply dark:mix-blend-screen animate-pulse" style={{ animationDuration: '10s' }} />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(0,0,0,0.05),transparent)] dark:bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(255,255,255,0.05),transparent)]" />
            </div>

            <header className="relative z-10 p-3 sm:p-4 lg:p-6 flex items-center justify-start lg:justify-between pointer-events-auto shrink-0 bg-background/80 backdrop-blur-md border-b border-card">
                <div className="flex items-center gap-4 sm:gap-6">
                    <Link href="/" className="font-syne font-bold text-xl tracking-tight text-white hover:opacity-70 transition-opacity">
                        Number<span style={{ opacity: 0.35 }}>1</span>
                    </Link>
                </div>
                {step === 'preview' && (
                    <div className="absolute lg:relative left-1/2 lg:left-auto top-1/2 lg:top-auto -translate-x-1/2 lg:translate-x-0 -translate-y-1/2 lg:translate-y-0 flex items-center gap-2">
                        <div className="flex items-center bg-card rounded-full p-0.5 sm:p-1 border border-card shadow-sm whitespace-nowrap">
                            <button
                                onClick={() => setIsCommentMode(false)}
                                className={`px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-full text-[9px] sm:text-xs font-bold uppercase tracking-widest transition-all ${!isCommentMode ? 'bg-foreground text-background shadow-md' : 'text-muted hover:text-foreground'}`}
                            >
                                Navigate
                            </button>
                            <button
                                onClick={() => { setIsCommentMode(true); setShowPinTip(true); setShowCommentGlow(false); }}
                                className={`px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-full text-[9px] sm:text-xs font-bold uppercase tracking-widest transition-all flex items-center gap-1.5 ${isCommentMode ? 'bg-orange-500 text-white shadow-md' : 'text-muted hover:text-foreground'} ${showCommentGlow && !isCommentMode ? 'bg-orange-500/20 text-orange-500 animate-pulse' : ''}`}
                            >
                                <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                <span>Comment</span>
                            </button>
                        </div>

                        {/* Comments dropdown button */}
                        {pins.length > 0 && (
                            <div className="relative">
                                <button
                                    onClick={() => setShowCommentsDropdown(!showCommentsDropdown)}
                                    className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 bg-card border border-card rounded-full text-[9px] sm:text-xs font-bold uppercase tracking-widest text-muted hover:text-foreground transition-colors shadow-sm"
                                >
                                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" /></svg>
                                    {pins.length}
                                </button>

                                {showCommentsDropdown && (
                                    <>
                                        <div className="fixed inset-0 z-[150]" onClick={() => setShowCommentsDropdown(false)} />
                                        <div className="absolute right-0 top-full mt-2 w-64 sm:w-72 bg-background border border-card rounded-xl shadow-2xl z-[200] overflow-hidden">
                                            <div className="p-3 border-b border-card">
                                                <span className="text-[9px] font-bold uppercase tracking-widest text-muted">All Comments ({pins.length})</span>
                                            </div>
                                            <div className="max-h-60 overflow-y-auto">
                                                {pins.map((pin, idx) => (
                                                    <button
                                                        key={pin.id}
                                                        onClick={() => { setActivePinId(pin.id); setIsCommentMode(true); setShowCommentsDropdown(false); }}
                                                        className={`w-full text-left px-3 py-2.5 flex items-center gap-3 hover:bg-card/50 transition-colors border-b border-card/50 last:border-0 ${activePinId === pin.id ? 'bg-orange-500/5' : ''}`}
                                                    >
                                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0 ${activePinId === pin.id ? 'bg-orange-500' : 'bg-indigo-500'}`}>
                                                            {idx + 1}
                                                        </div>
                                                        <span className="text-xs text-foreground/70 truncate">
                                                            {pin.text || 'No note added yet'}
                                                        </span>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </header>

            <main className="flex-1 relative z-10 flex overflow-hidden">
                <AnimatePresence mode="wait">
                    {step === 'input' && (
                        <motion.div
                            key="input"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="w-full h-full flex items-center justify-center p-6 overflow-y-auto"
                        >
                            <div className="max-w-xl w-full text-center py-10">
                                <div className="w-20 h-20 bg-indigo-500/10 text-indigo-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner border border-indigo-500/20">
                                    <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>
                                </div>
                                <h1 className="text-4xl md:text-5xl font-syne font-bold mb-4">Enter URL</h1>


                                <form onSubmit={handleUrlSubmit} className="relative w-full max-w-lg mx-auto group">
                                    <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-orange-500 to-indigo-500 rounded-3xl md:rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                                    <div className="relative flex flex-col md:flex-row items-stretch md:items-center bg-card border border-card rounded-3xl md:rounded-full p-2 shadow-xl gap-2 md:gap-0">
                                        <div className="flex items-center flex-1">
                                            <div className="pl-4 pr-2 text-muted">
                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                                            </div>
                                            <input
                                                type="text"
                                                value={urlInput}
                                                onChange={(e) => setUrlInput(e.target.value)}
                                                placeholder="e.g. yourwebsite.com"
                                                className="flex-1 bg-transparent border-none text-foreground placeholder-muted focus:ring-0 focus:outline-none px-2 text-lg font-medium"
                                                required
                                            />
                                        </div>
                                        <button
                                            type="submit"
                                            className="bg-indigo-500 text-white rounded-2xl md:rounded-full px-8 py-4 md:py-3 font-bold text-sm tracking-widest uppercase hover:bg-indigo-400 transition-colors shadow-md"
                                        >
                                            Analyze
                                        </button>
                                    </div>
                                </form>

                                {process.env.NODE_ENV === 'development' && (
                                    <button
                                        type="button"
                                        onClick={handleDevSkip}
                                        className="mt-8 mx-auto flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest text-muted hover:text-indigo-400 transition-colors"
                                    >
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                        Dev: Skip to Preview
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    )}

                    {step === 'analyzing' && (
                        <motion.div
                            key="analyzing"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.05 }}
                            className="w-full h-full flex flex-col items-center justify-center p-6"
                        >
                            <div className="w-32 h-32 relative mb-12">
                                <div className="absolute inset-0 border-t-2 border-r-2 border-indigo-500 rounded-full animate-spin"></div>
                                <div className="absolute inset-2 border-b-2 border-l-2 border-orange-500 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
                                <div className="absolute inset-0 flex items-center justify-center text-3xl font-syne font-bold text-foreground">
                                    {Math.round(progress)}%
                                </div>
                            </div>

                            <h2 className="text-2xl font-syne font-bold mb-4 h-8">
                                <AnimatePresence mode="wait">
                                    <motion.span
                                        key={loadingIndex}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="inline-block"
                                    >
                                        {ANALYSIS_STEPS[loadingIndex]}
                                    </motion.span>
                                </AnimatePresence>
                            </h2>
                            <p className="text-muted text-sm font-mono tracking-widest uppercase">Target: {iframeUrl}</p>

                            <div className="w-full max-w-md h-1.5 bg-card mt-10 rounded-full overflow-hidden border border-card shadow-inner">
                                <motion.div
                                    className="h-full bg-gradient-to-r from-indigo-500 to-orange-500"
                                    style={{ width: `${progress}%` }}
                                ></motion.div>
                            </div>
                        </motion.div>
                    )}

                    {step === 'preview' && (
                        <motion.div
                            key="preview"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex flex-col lg:flex-row flex-1 w-full h-full overflow-x-hidden overflow-y-auto lg:overflow-hidden overscroll-x-none"
                        >
                            {/* Main Preview Area */}
                            <div className="h-[75vh] lg:h-auto lg:flex-1 relative bg-neutral-900/5 dark:bg-black/50 border-b lg:border-b-0 lg:border-r border-card flex flex-col shrink-0">
                                {isCommentMode && showPinTip && (
                                    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 bg-orange-500 text-white pl-5 pr-2 py-2 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-widest shadow-xl animate-bounce whitespace-nowrap flex items-center gap-2">
                                        Tap to drop a pin
                                        <button onClick={(e) => { e.stopPropagation(); setShowPinTip(false); }} className="w-5 h-5 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors">
                                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                                        </button>
                                    </div>
                                )}

                                <div
                                    className="flex-1 relative overflow-hidden"
                                    ref={overlayRef}
                                >
                                    {/* The iframe */}
                                    <div className="absolute inset-0 z-0 bg-white">
                                        <iframe
                                            ref={iframeRef}
                                            src={`/api/proxy?url=${encodeURIComponent(iframeUrl)}`}
                                            className={`w-full h-full border-none ${isCommentMode ? 'pointer-events-none' : ''}`}
                                            title="Live Website Preview"
                                            sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
                                        />
                                    </div>

                                    {/* Interaction Overlay */}
                                    <div
                                        className={`absolute inset-0 z-10 transition-colors ${isCommentMode ? 'cursor-crosshair bg-black/5 hover:bg-black/10' : 'pointer-events-none'}`}
                                        onClick={handleOverlayClick}
                                    />

                                    {/* Pins rendered on top — positioned using absolute page coords minus current scroll */}
                                    {pins.map((pin, index) => {
                                        // Calculate visible Y position: absolute page Y minus current iframe scroll
                                        const visibleY = pin.y - iframeScroll.scrollY;

                                        // The overlay height is just the viewport height of the iframe container
                                        const overlayHeight = overlayRef.current?.getBoundingClientRect().height || window.innerHeight;

                                        // Hide pins that are scrolled out of view (adding a buffer of 30px)
                                        const isVisible = visibleY >= -30 && visibleY <= overlayHeight + 30;

                                        return (
                                            <div
                                                key={pin.id}
                                                className={`absolute z-20 translate-x-[-50%] translate-y-[-50%] pin-element group transition-opacity duration-75 ${isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                                                style={{ left: `${pin.x}%`, top: `${visibleY}px` }}
                                            >
                                                <div
                                                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-lg cursor-pointer transition-transform ${activePinId === pin.id ? 'bg-orange-500 scale-125 ring-4 ring-orange-500/30' : 'bg-indigo-500 hover:scale-110'}`}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setActivePinId(pin.id);
                                                        setIsCommentMode(true);
                                                    }}
                                                >
                                                    {index + 1}
                                                </div>

                                                {/* Tooltip hint when hovering an inactive pin */}
                                                {activePinId !== pin.id && !pin.text && (
                                                    <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 w-max px-2 py-1 bg-black/80 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                                        Click to add comment
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Mobile floating comment input — stays inside the preview frame */}
                                {activePinId && (
                                    <div className="absolute bottom-0 left-0 right-0 z-30 lg:hidden bg-background/95 backdrop-blur-md border-t border-card p-3 animate-in slide-in-from-bottom-4 duration-200">
                                        <div className="flex items-center gap-2">
                                            <div className="w-7 h-7 rounded-full bg-orange-500 flex items-center justify-center text-white font-bold text-[10px] shrink-0">
                                                {pins.findIndex(p => p.id === activePinId) + 1}
                                            </div>
                                            <input
                                                ref={mobileInputRef}
                                                type="text"
                                                className="flex-1 bg-transparent border border-card rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted/50 focus:outline-none focus:ring-1 focus:ring-orange-500/50"
                                                placeholder="Add your note..."
                                                value={pins.find(p => p.id === activePinId)?.text || ''}
                                                onChange={(e) => updatePinText(activePinId, e.target.value)}
                                                onKeyDown={(e) => { if (e.key === 'Enter') { setActivePinId(null); } }}
                                            />
                                            <button
                                                onClick={() => setActivePinId(null)}
                                                className="p-2 text-orange-500 hover:text-orange-400 transition-colors"
                                            >
                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Persistent Analysis Sidebar */}
                            <div className="w-full lg:w-96 shrink-0 bg-card border-t lg:border-t-0 lg:border-l border-card flex flex-col h-auto lg:h-full overflow-visible lg:overflow-hidden shadow-2xl relative z-30">
                                <div className="p-4 md:p-6 border-b border-card bg-foreground/[0.02]">
                                    <h3 className="font-syne font-bold text-lg md:text-xl mb-1 flex items-center gap-2 text-foreground">
                                        <svg className="w-5 h-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
                                        Number1 Diagnostics
                                    </h3>
                                    {hasError ? (
                                        <p className="text-[10px] text-red-500 font-bold uppercase tracking-tight">Analysis Failed. Showing Example Data.</p>
                                    ) : (
                                        <p className="text-[10px] text-muted truncate uppercase tracking-tight">Analysis for {new URL(iframeUrl).hostname}</p>
                                    )}
                                </div>

                                {isProposalOpen ? (
                                    <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-card custom-scrollbar flex flex-col bg-background/50 relative z-20">
                                        {proposalSubmitted ? (
                                            <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4 animate-in fade-in duration-500">
                                                <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mb-4 border border-green-500/20">
                                                    <svg className="w-10 h-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                                </div>
                                                <h3 className="font-syne font-bold text-2xl text-foreground">Proposal Requested</h3>
                                                <p className="text-muted text-sm px-4">We've received your AI diagnostics and design notes. Our agency director will reach out within 24 hours.</p>
                                                <button onClick={() => { setIsProposalOpen(false); setProposalSubmitted(false); }} className="mt-8 text-xs font-bold uppercase tracking-widest text-indigo-500 hover:text-indigo-400 pb-1 border-b border-indigo-500/30 transition-colors">
                                                    Back to Analysis
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                                                <div className="flex items-center gap-3 border-b border-card pb-4">
                                                    <button onClick={() => setIsProposalOpen(false)} className="text-muted hover:text-foreground transition-colors p-2 -ml-2 rounded-full hover:bg-card">
                                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                                                    </button>
                                                    <div>
                                                        <h4 className="text-sm font-bold uppercase tracking-widest text-foreground">Request Proposal</h4>
                                                        <p className="text-xs text-muted">Let's turn these insights into reality.</p>
                                                    </div>
                                                </div>

                                                <div className="space-y-5">
                                                    <div>
                                                        <label className="text-[10px] font-bold uppercase tracking-widest text-muted block mb-2">Full Name</label>
                                                        <input type="text" className="w-full bg-background border border-card rounded-md p-3.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-shadow" placeholder="Jane Doe" required />
                                                    </div>
                                                    <div>
                                                        <label className="text-[10px] font-bold uppercase tracking-widest text-muted block mb-2">Work Email</label>
                                                        <input type="email" className="w-full bg-background border border-card rounded-md p-3.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-shadow" placeholder="jane@company.com" required />
                                                    </div>
                                                    <div>
                                                        <label className="text-[10px] font-bold uppercase tracking-widest text-muted block mb-2">Target Budget</label>
                                                        <select className="w-full bg-background border border-card rounded-md p-3.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500/50 appearance-none cursor-pointer transition-shadow font-mono">
                                                            <option className="bg-background text-foreground">$5k - $10k</option>
                                                            <option className="bg-background text-foreground">$10k - $25k</option>
                                                            <option className="bg-background text-foreground">$25k+</option>
                                                        </select>
                                                    </div>

                                                    <div className="bg-indigo-500/5 p-4 rounded-xl border border-indigo-500/10 mt-6 text-xs text-foreground/80 leading-relaxed">
                                                        <p className="flex gap-2">
                                                            <svg className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                                            We'll attach your requested live preview pins and the generated Gemini Multimodal URL analysis directly to this brief.
                                                        </p>
                                                    </div>
                                                </div>

                                                <button onClick={() => setProposalSubmitted(true)} className="w-full py-4 mt-8 bg-foreground text-background rounded-xl font-bold text-sm tracking-widest uppercase hover:bg-indigo-600 hover:text-white transition-all shadow-md group">
                                                    <span className="flex items-center justify-center gap-2">
                                                        Submit Brief
                                                        <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                                                    </span>
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-thin scrollbar-thumb-card custom-scrollbar">

                                        {/* Comments Section */}
                                        {(pins.length > 0 || activePinId) && (
                                            <div className="space-y-4 mb-8">
                                                <h4 className="text-xs font-mono font-bold tracking-widest text-orange-500 uppercase">Your Client Notes</h4>

                                                {pins.length === 0 && (
                                                    <p className="text-xs text-muted italic">Click on the preview to drop a pin.</p>
                                                )}

                                                <AnimatePresence mode="wait">
                                                    {activePinId && (
                                                        <motion.div
                                                            key={`notes-${activePinId}`}
                                                            initial={{ opacity: 0, x: 20 }}
                                                            animate={{ opacity: 1, x: 0 }}
                                                            exit={{ opacity: 0, x: -20 }}
                                                            className="space-y-6"
                                                        >
                                                            <div className="flex items-center gap-3 border-b border-card pb-4">
                                                                <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white font-bold text-xs">
                                                                    {pins.findIndex(p => p.id === activePinId) + 1}
                                                                </div>
                                                                <div>
                                                                    <h4 className="text-sm font-bold uppercase tracking-widest text-foreground">Your Client Notes</h4>
                                                                    <p className="text-xs text-muted">Adding notes to selected pin.</p>
                                                                </div>
                                                            </div>

                                                            <textarea
                                                                className="w-full h-40 bg-background border border-card rounded-md p-4 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-orange-500/50 resize-none placeholder:text-muted/50"
                                                                placeholder="E.g. I hate this font. It looks like a high school project. Please use something more geometric..."
                                                                value={pins.find(p => p.id === activePinId)?.text || ''}
                                                                onChange={(e) => updatePinText(activePinId, e.target.value)}
                                                                autoFocus={typeof window !== 'undefined' && window.innerWidth >= 1024}
                                                            />

                                                            <button
                                                                onClick={() => setActivePinId(null)}
                                                                className="w-full border border-card hover:bg-card py-3 rounded text-xs font-bold uppercase tracking-widest transition-colors"
                                                            >
                                                                Save Note
                                                            </button>
                                                            <button
                                                                onClick={() => deletePin(activePinId)}
                                                                className="w-full text-red-500/70 hover:text-red-500 text-xs font-bold uppercase tracking-widest transition-colors text-center pb-4"
                                                            >
                                                                Remove Pin
                                                            </button>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        )}

                                        {/* AI Diagnostics Overview — New 5-Section Layout */}
                                        <AnimatePresence mode="wait">
                                            {!activePinId && (
                                                <motion.div
                                                    key="diagnostics"
                                                    initial={{ opacity: 0, x: -20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    exit={{ opacity: 0, x: 20 }}
                                                    className="space-y-3"
                                                >
                                                    {/* 1. Website Target */}
                                                    <div className="border border-card rounded-lg overflow-hidden">
                                                        <button onClick={() => setExpandedSection(expandedSection === 'target' ? null : 'target')} className="w-full flex items-center justify-between p-3 hover:bg-foreground/[0.02] transition-colors">
                                                            <div className="flex items-center gap-2">
                                                                <svg className="w-3.5 h-3.5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                                                <span className="text-[10px] font-bold uppercase tracking-widest">Target Audience</span>
                                                            </div>
                                                            <svg className={`w-3 h-3 text-muted transition-transform ${expandedSection === 'target' ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                                        </button>
                                                        {expandedSection === 'target' && (
                                                            <div className="px-3 pb-3">
                                                                <p className="text-xs text-muted leading-relaxed">{aiResults?.website_target || FALLBACK_RESULTS.website_target}</p>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* 2. Colour Palette */}
                                                    <div className="border border-card rounded-lg overflow-hidden">
                                                        <button onClick={() => setExpandedSection(expandedSection === 'palette' ? null : 'palette')} className="w-full flex items-center justify-between p-3 hover:bg-foreground/[0.02] transition-colors">
                                                            <div className="flex items-center gap-2">
                                                                <svg className="w-3.5 h-3.5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" /></svg>
                                                                <span className="text-[10px] font-bold uppercase tracking-widest">Colour Palette</span>
                                                            </div>
                                                            <svg className={`w-3 h-3 text-muted transition-transform ${expandedSection === 'palette' ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                                        </button>
                                                        {expandedSection === 'palette' && (
                                                            <div className="px-3 pb-3 space-y-3">
                                                                <div className="flex gap-1.5">
                                                                    {(aiResults?.colour_palette?.dominant || FALLBACK_RESULTS.colour_palette.dominant).map((c: string, i: number) => (
                                                                        <div key={i} className="flex-1 h-8 rounded-sm border border-white/10" style={{ background: c }} title={c} />
                                                                    ))}
                                                                </div>
                                                                <p className="text-xs text-muted leading-relaxed">{aiResults?.colour_palette?.assessment || FALLBACK_RESULTS.colour_palette.assessment}</p>
                                                                <div className="pt-1">
                                                                    <label className="text-[9px] font-bold uppercase tracking-widest text-muted block mb-1.5">Preview Theme</label>
                                                                    <select
                                                                        value={selectedPalette}
                                                                        onChange={(e) => {
                                                                            setSelectedPalette(e.target.value);
                                                                            const palette = COLOUR_PALETTES[e.target.value];
                                                                            if (iframeRef.current?.contentWindow) {
                                                                                iframeRef.current.contentWindow.postMessage({
                                                                                    type: 'MAKE_OVER_THEME',
                                                                                    palette: palette.colors,
                                                                                    key: e.target.value,
                                                                                }, '*');
                                                                            }
                                                                        }}
                                                                        className="w-full bg-background border border-card rounded-md p-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-indigo-500/50 appearance-none cursor-pointer font-mono"
                                                                    >
                                                                        {Object.entries(COLOUR_PALETTES).map(([key, p]) => (
                                                                            <option key={key} value={key} className="bg-background text-foreground">{p.name}</option>
                                                                        ))}
                                                                    </select>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* 3. Layout & Spacing */}
                                                    <div className="border border-card rounded-lg overflow-hidden">
                                                        <button onClick={() => setExpandedSection(expandedSection === 'layout' ? null : 'layout')} className="w-full flex items-center justify-between p-3 hover:bg-foreground/[0.02] transition-colors">
                                                            <div className="flex items-center gap-2">
                                                                <svg className="w-3.5 h-3.5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" /></svg>
                                                                <span className="text-[10px] font-bold uppercase tracking-widest">Layout & Spacing</span>
                                                            </div>
                                                            <svg className={`w-3 h-3 text-muted transition-transform ${expandedSection === 'layout' ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                                        </button>
                                                        {expandedSection === 'layout' && (
                                                            <div className="px-3 pb-3 space-y-2">
                                                                <span className="inline-block text-[9px] font-mono font-bold px-2 py-0.5 bg-indigo-500/10 text-indigo-500 rounded">{aiResults?.layout_spacing?.type || FALLBACK_RESULTS.layout_spacing.type}</span>
                                                                <p className="text-xs text-muted leading-relaxed">{aiResults?.layout_spacing?.assessment || FALLBACK_RESULTS.layout_spacing.assessment}</p>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* 4. Typography */}
                                                    <div className="border border-card rounded-lg overflow-hidden">
                                                        <button onClick={() => setExpandedSection(expandedSection === 'typo' ? null : 'typo')} className="w-full flex items-center justify-between p-3 hover:bg-foreground/[0.02] transition-colors">
                                                            <div className="flex items-center gap-2">
                                                                <svg className="w-3.5 h-3.5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h8m-8 6h16" /></svg>
                                                                <span className="text-[10px] font-bold uppercase tracking-widest">Typography</span>
                                                            </div>
                                                            <svg className={`w-3 h-3 text-muted transition-transform ${expandedSection === 'typo' ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                                        </button>
                                                        {expandedSection === 'typo' && (
                                                            <div className="px-3 pb-3">
                                                                <p className="text-xs text-muted leading-relaxed">{aiResults?.typography?.assessment || FALLBACK_RESULTS.typography.assessment}</p>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* 5. Recommendations */}
                                                    <div className="border border-card rounded-lg overflow-hidden">
                                                        <button onClick={() => setExpandedSection(expandedSection === 'recs' ? null : 'recs')} className="w-full flex items-center justify-between p-3 hover:bg-foreground/[0.02] transition-colors">
                                                            <div className="flex items-center gap-2">
                                                                <svg className="w-3.5 h-3.5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
                                                                <span className="text-[10px] font-bold uppercase tracking-widest">Recommendations</span>
                                                            </div>
                                                            <svg className={`w-3 h-3 text-muted transition-transform ${expandedSection === 'recs' ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                                        </button>
                                                        {expandedSection === 'recs' && (
                                                            <div className="px-3 pb-3 space-y-2">
                                                                {(recommendations.length > 0 ? recommendations : (aiResults?.recommendations || FALLBACK_RESULTS.recommendations).map((r: string, i: number) => ({ id: `rec-${i}`, text: r }))).map((rec: any) => (
                                                                    <div key={rec.id} className="flex items-start gap-2 group">
                                                                        <textarea
                                                                            className="flex-1 bg-transparent border border-card rounded p-2 text-xs leading-relaxed text-foreground/80 resize-none focus:outline-none focus:ring-1 focus:ring-indigo-500/30 min-h-[36px]"
                                                                            rows={2}
                                                                            value={rec.text}
                                                                            onChange={(e) => {
                                                                                const updated = (recommendations.length > 0 ? recommendations : (aiResults?.recommendations || FALLBACK_RESULTS.recommendations).map((r: string, i: number) => ({ id: `rec-${i}`, text: r }))).map((r: any) =>
                                                                                    r.id === rec.id ? { ...r, text: e.target.value } : r
                                                                                );
                                                                                setRecommendations(updated);
                                                                            }}
                                                                        />
                                                                        <button
                                                                            onClick={() => {
                                                                                const updated = (recommendations.length > 0 ? recommendations : (aiResults?.recommendations || FALLBACK_RESULTS.recommendations).map((r: string, i: number) => ({ id: `rec-${i}`, text: r }))).filter((r: any) => r.id !== rec.id);
                                                                                setRecommendations(updated);
                                                                            }}
                                                                            className="opacity-0 group-hover:opacity-100 p-1 text-red-500/50 hover:text-red-500 transition-all mt-1"
                                                                        >
                                                                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                                                        </button>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>

                                        <div className="pt-4 pb-2">
                                            <button onClick={() => {
                                                fireToast('Your report request has been received — we will email you shortly.');
                                                // Save to Build Requests dashboard
                                                const summary = [
                                                    `TYPE: Website Makeover`,
                                                    ``,
                                                    `WEBSITE URL\n${iframeUrl || urlInput || '—'}`,
                                                    ``,
                                                    `AI RECOMMENDATIONS\n${aiResults?.recommendations?.map((r: string) => `• ${r}`).join('\n') || '—'}`,
                                                    ``,
                                                    `COLOUR PREFERENCE\n${selectedPalette}`,
                                                    ``,
                                                    `CLIENT ANNOTATIONS (PINS)\n${pins.length > 0 ? pins.map(p => `• ${p.text}`).join('\n') : 'No annotations added'}`,
                                                ].join('\n');
                                                fetch('/api/build-requests', {
                                                    method: 'POST',
                                                    headers: { 'Content-Type': 'application/json' },
                                                    body: JSON.stringify({
                                                        type: 'makeover',
                                                        websiteUrl: iframeUrl || urlInput || null,
                                                        summary,
                                                        priority: 'normal',
                                                    }),
                                                }).catch(console.error);
                                            }} className="w-full py-3 bg-foreground text-background rounded-lg font-bold text-[10px] tracking-widest uppercase hover:opacity-90 transition-opacity shadow-md">
                                                Get Report
                                            </button>
                                            <p className="text-center text-[9px] text-muted mt-2">A detailed report will be sent to your email shortly.</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>

        {/* ── Toast Notification ── */}
        <AnimatePresence>
            {showToast && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-foreground text-background px-5 py-3.5 rounded-full shadow-2xl text-sm font-semibold"
                >
                    <svg className="w-4 h-4 text-emerald-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    {toastMsg}
                </motion.div>
            )}
        </AnimatePresence>

        {/* Speak to Sales floating button */}
        <button
            onClick={() => setShowBookCall(true)}
            style={{
                position: 'fixed', bottom: 24, right: 24, zIndex: 50,
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '12px 20px', borderRadius: 999,
                background: 'linear-gradient(135deg, #F97316, #FBBF24)',
                border: 'none', color: '#000', fontSize: 13, fontWeight: 800,
                cursor: 'pointer', boxShadow: '0 8px 30px rgba(249,115,22,0.3)',
                transition: 'transform 0.2s',
            }}
        >
            📞 Speak to Sales
        </button>

        <BookCallModal isOpen={showBookCall} onClose={() => setShowBookCall(false)} source="makeover" />

    </div>
    );
}
