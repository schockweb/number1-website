"use client";

import React, { useState, useEffect, useRef, useMemo } from 'react';
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
    "Connecting to target server...",
    "Capturing full-page DOM structure & visual snapshot...",
    "Auditing CSS grid hierarchy & mobile breakpoints...",
    "Extracting color palettes & typographic contrast ratios...",
    "Scanning for 2010 legacy design flaws & conversion friction...",
    "Synthesizing Number1.Studio re-engineering blueprint...",
    "Generating brand collateral & AI Employee integration specs..."
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
    const [step, setStep] = useState<'input' | 'analyzing' | 'options' | 'preview'>('input');
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
    const [previewMode, setPreviewMode] = useState<'walkthrough' | 'custom_pins'>('walkthrough');
    const [walkthroughIndex, setWalkthroughIndex] = useState(0);

    const walkthroughItems = useMemo(() => {
        const items: { title: string; issue: string; suggestion: string }[] = [];

        if (aiResults?.number1_studio_reengineering?.proposed_makeover) {
            aiResults.number1_studio_reengineering.proposed_makeover.forEach((item: string, i: number) => {
                items.push({
                    title: `NUMBER1.STUDIO BLUEPRINT #${i + 1}`,
                    issue: aiResults.number1_studio_reengineering.legacy_flaws?.[i] || '2010 Legacy design flaw & conversion friction detected.',
                    suggestion: item,
                });
            });
        }

        if (aiResults?.design_and_ux) {
            aiResults.design_and_ux.forEach((d: any) => {
                items.push({
                    title: d.category || 'DESIGN DIAGNOSTIC',
                    issue: d.issue || 'Sub-optimal visual hierarchy.',
                    suggestion: d.suggestion || 'Re-engineer into modern brutalist structure.',
                });
            });
        }

        if (items.length === 0) {
            items.push(
                {
                    title: "LAYOUT & SPACING",
                    issue: "Cramped 2010 grid structure.",
                    suggestion: "Overhaul into responsive brutalist architecture."
                },
                {
                    title: "TYPOGRAPHY SCALE",
                    issue: "Unoptimized font hierarchy.",
                    suggestion: "Upgrade to bold monospace & high-contrast typography."
                },
                {
                    title: "AI WORKFORCE INTEGRATION",
                    issue: "No automated lead intake.",
                    suggestion: "Connect Number1.Studio AI Employee opportunity radar."
                }
            );
        }

        return items;
    }, [aiResults]);
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
        setStep('options');
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
                                setTimeout(() => setStep('options'), 400);
                            }
                        }, remainingTime);
                    }
                } catch (error) {
                    console.error("AI Analysis error:", error);
                    if (isMounted) {
                        setHasError(true);
                        setAiResults(FALLBACK_RESULTS);
                        setTimeout(() => {
                            if (isMounted) {
                                setProgress(100);
                                setTimeout(() => setStep('options'), 400);
                            }
                        }, 1000);
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
        <div className="h-[100dvh] bg-white text-black font-sans relative overflow-hidden flex flex-col transition-colors duration-500">
            {/* Ambient Overlay */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-0 right-1/4 w-[50rem] h-[50rem] bg-indigo-500/5 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[40rem] h-[40rem] bg-orange-500/5 rounded-full blur-[120px]" />
            </div>

            <header className="relative z-10 p-3 sm:p-4 lg:p-6 flex items-center justify-start lg:justify-between pointer-events-auto shrink-0 bg-white/90 backdrop-blur-md border-b border-gray-200">
                <div className="flex items-center gap-4 sm:gap-6">
                    <Link href="/" className="font-syne font-bold text-xl tracking-tight text-black hover:opacity-70 transition-opacity">
                        Number<span style={{ opacity: 0.35 }}>1</span>.Studio
                    </Link>
                </div>
                {step === 'preview' && (
                    <div className="flex items-center gap-3 font-mono">
                        <div className="flex items-center bg-gray-100 border border-gray-300 p-1 shadow-sm rounded">
                            <button
                                onClick={() => {
                                    setPreviewMode('walkthrough');
                                    setIsCommentMode(false);
                                }}
                                className={`px-3 py-1.5 font-extrabold text-[10px] uppercase tracking-widest transition-all rounded ${previewMode === 'walkthrough' ? 'bg-black text-white' : 'text-black hover:text-black font-bold'}`}
                            >
                                [ AI WALKTHROUGH ]
                            </button>
                            <button
                                onClick={() => {
                                    setPreviewMode('custom_pins');
                                    setIsCommentMode(true);
                                    setShowPinTip(true);
                                }}
                                className={`px-3 py-1.5 font-extrabold text-[10px] uppercase tracking-widest transition-all rounded ${previewMode === 'custom_pins' ? 'bg-orange-600 text-white' : 'text-black hover:text-black font-bold'}`}
                            >
                                [ PLACE MY OWN COMMENTS ]
                            </button>
                        </div>

                        {/* Comments dropdown button */}
                        {pins.length > 0 && (
                            <div className="relative">
                                <button
                                    onClick={() => setShowCommentsDropdown(!showCommentsDropdown)}
                                    className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 bg-gray-100 border border-gray-300 rounded-full text-[9px] sm:text-xs font-bold uppercase tracking-widest text-black hover:bg-gray-200 transition-colors shadow-sm"
                                >
                                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" /></svg>
                                    {pins.length}
                                </button>

                                {showCommentsDropdown && (
                                    <>
                                        <div className="fixed inset-0 z-[150]" onClick={() => setShowCommentsDropdown(false)} />
                                        <div className="absolute right-0 top-full mt-2 w-64 sm:w-72 bg-white border border-gray-200 rounded-xl shadow-2xl z-[200] overflow-hidden">
                                            <div className="p-3 border-b border-gray-200 bg-gray-50">
                                                <span className="text-[9px] font-bold uppercase tracking-widest text-black">All Comments ({pins.length})</span>
                                            </div>
                                            <div className="max-h-60 overflow-y-auto">
                                                {pins.map((pin, idx) => (
                                                    <button
                                                        key={pin.id}
                                                        onClick={() => { setActivePinId(pin.id); setIsCommentMode(true); setShowCommentsDropdown(false); }}
                                                        className={`w-full text-left px-3 py-2.5 flex items-center gap-3 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0 ${activePinId === pin.id ? 'bg-orange-50' : ''}`}
                                                    >
                                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0 ${activePinId === pin.id ? 'bg-orange-600' : 'bg-indigo-600'}`}>
                                                            {idx + 1}
                                                        </div>
                                                        <span className="text-xs text-black font-semibold truncate">
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
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -16 }}
                            className="w-full h-full flex flex-col items-center justify-center p-6 overflow-y-auto bg-white"
                        >
                            <div className="max-w-3xl w-full text-center py-8">
                                <span className="text-xs font-mono font-bold text-indigo-600 tracking-widest uppercase mb-4 inline-block">
                                    // AI WEBSITE MAKEOVER ENGINE
                                </span>
                                <h1 className="text-3xl md:text-5xl font-syne font-extrabold text-black tracking-tight mb-8 uppercase">
                                    TRANSFORM YOUR LEGACY WEBSITE
                                </h1>

                                <form onSubmit={handleUrlSubmit} className="relative w-full max-w-2xl mx-auto group">
                                    {/* Subtle Soft Aura */}
                                    <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500/20 via-orange-500/20 to-indigo-500/20 rounded-lg blur opacity-50 group-hover:opacity-100 transition duration-500"></div>

                                    <div className="relative flex flex-col sm:flex-row items-stretch bg-white border border-gray-300 p-2 gap-2 shadow-xl rounded-lg">
                                        <div className="flex items-center flex-1 px-3">
                                            <span className="text-xs font-mono font-bold text-black/60 mr-2 uppercase tracking-wider hidden sm:inline">HTTPS://</span>
                                            <input
                                                type="text"
                                                value={urlInput}
                                                onChange={(e) => setUrlInput(e.target.value)}
                                                placeholder="yourwebsite.com"
                                                className="w-full bg-transparent border-none text-black placeholder-black/40 focus:outline-none text-base font-mono font-bold py-2"
                                                required
                                            />
                                        </div>
                                        <button
                                            type="submit"
                                            className="bg-black text-white px-6 py-3.5 font-mono font-extrabold text-xs tracking-widest uppercase hover:bg-neutral-800 transition-all border border-black shrink-0 rounded"
                                        >
                                            [ ANALYZE WEBSITE ]
                                        </button>
                                    </div>
                                </form>

                                {process.env.NODE_ENV === 'development' && (
                                    <button
                                        type="button"
                                        onClick={handleDevSkip}
                                        className="mt-8 mx-auto flex items-center justify-center gap-2 text-xs font-mono font-bold uppercase tracking-widest text-black/60 hover:text-indigo-600 transition-colors"
                                    >
                                        [ DEV: SKIP TO PREVIEW ]
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    )}

                    {step === 'analyzing' && (
                        <motion.div
                            key="analyzing"
                            initial={{ opacity: 0, scale: 0.97 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.03 }}
                            className="w-full h-full flex flex-col items-center justify-center p-6 font-mono relative overflow-y-auto bg-white"
                        >
                            <div className="max-w-2xl w-full bg-white border border-gray-300 p-6 shadow-2xl relative rounded-xl">
                                {/* Header HUD Status */}
                                <div className="flex items-center justify-between border-b border-gray-200 pb-4 mb-6">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2.5 h-2.5 rounded-full bg-orange-500 animate-ping" />
                                        <span className="text-xs font-bold text-orange-600 tracking-widest uppercase">
                                            // REAL-TIME RADAR SCANNER ACTIVE
                                        </span>
                                    </div>
                                    <span className="text-xs text-black font-bold tracking-wider">
                                        [ {Math.round(progress)}% COMPLETE ]
                                    </span>
                                </div>

                                {/* Target Metadata Bar */}
                                <div className="bg-slate-50 border border-gray-200 p-3 mb-6 flex flex-wrap items-center justify-between gap-2 text-xs rounded">
                                    <div className="truncate max-w-md">
                                        <span className="text-black/60 font-bold mr-2">TARGET:</span>
                                        <span className="text-black font-extrabold">{iframeUrl}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-[10px] text-black font-bold">
                                        <span>PROTOCOL: HTTPS</span>
                                        <span>STATUS: AUDITING</span>
                                    </div>
                                </div>

                                {/* Radar Grid Sweep & Active Status */}
                                <div className="relative h-44 bg-slate-50 border border-gray-200 overflow-hidden mb-6 flex items-center justify-center rounded-lg">
                                    {/* Grid background lines */}
                                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#0000000a_1px,transparent_1px),linear-gradient(to_bottom,#0000000a_1px,transparent_1px)] bg-[size:20px_20px]" />

                                    {/* Sweeping laser line */}
                                    <motion.div
                                        className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-orange-500 to-transparent shadow-[0_0_15px_#F97316]"
                                        animate={{ top: ['0%', '100%', '0%'] }}
                                        transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                                    />

                                    {/* Center HUD Circle */}
                                    <div className="relative z-10 w-24 h-24 border border-gray-300 rounded-full flex flex-col items-center justify-center bg-white shadow-md">
                                        <span className="text-2xl font-extrabold text-black font-syne">{Math.round(progress)}%</span>
                                        <span className="text-[9px] text-orange-600 font-bold uppercase tracking-widest mt-1">SCANNING</span>
                                    </div>
                                </div>

                                {/* Current Diagnostic Task Title */}
                                <div className="mb-6 text-center">
                                    <div className="text-[10px] font-bold text-indigo-600 tracking-widest uppercase mb-1">// CURRENT DIAGNOSTIC TASK</div>
                                    <h2 className="text-sm md:text-base font-bold text-black tracking-tight h-7 font-syne uppercase">
                                        <AnimatePresence mode="wait">
                                            <motion.span
                                                key={loadingIndex}
                                                initial={{ opacity: 0, y: 6 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -6 }}
                                                className="inline-block text-black font-extrabold"
                                            >
                                                {ANALYSIS_STEPS[loadingIndex]}
                                            </motion.span>
                                        </AnimatePresence>
                                    </h2>
                                </div>

                                {/* Live Diagnostic Terminal Stream Log */}
                                <div className="bg-slate-100 border border-gray-200 p-3 h-32 overflow-y-auto text-[11px] space-y-1.5 font-mono text-black font-semibold shadow-inner rounded-lg">
                                    {ANALYSIS_STEPS.slice(0, loadingIndex + 1).map((stepText, idx) => (
                                        <div key={idx} className="flex items-start gap-2">
                                            <span className="text-emerald-600 font-bold">&gt;</span>
                                            <span className="text-black/60 font-bold">[{ (idx * 0.7 + 0.2).toFixed(1) }s]</span>
                                            <span className={idx === loadingIndex ? "text-orange-600 font-bold" : "text-black"}>
                                                {stepText}
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                {/* Progress Bar */}
                                <div className="w-full h-1.5 bg-gray-200 mt-6 overflow-hidden rounded-full">
                                    <motion.div
                                        className="h-full bg-gradient-to-r from-indigo-500 via-orange-500 to-indigo-500"
                                        style={{ width: `${progress}%` }}
                                    />
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {step === 'options' && (
                        <motion.div
                            key="options"
                            initial={{ opacity: 0, scale: 0.96 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.04 }}
                            className="w-full h-full flex flex-col items-center justify-center p-6 font-mono overflow-y-auto bg-white"
                        >
                            <div className="max-w-2xl w-full bg-white border border-gray-300 p-8 shadow-2xl relative text-center rounded-xl">
                                <span className="text-xs font-bold text-emerald-600 tracking-widest uppercase mb-3 inline-block">
                                    // SCAN COMPLETE // CHOOSE REVIEW MODE
                                </span>
                                <h2 className="text-2xl md:text-4xl font-syne font-extrabold text-black uppercase tracking-tight mb-8">
                                    HOW WOULD YOU LIKE TO REVIEW RESULTS?
                                </h2>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-left">
                                    {/* Option 1: AI Walkthrough */}
                                    <div
                                        onClick={() => {
                                            setPreviewMode('walkthrough');
                                            setIsCommentMode(false);
                                            setStep('preview');
                                        }}
                                        className="border border-gray-200 bg-slate-50 hover:bg-slate-100 hover:border-gray-400 p-6 cursor-pointer transition-all flex flex-col justify-between group rounded-lg"
                                    >
                                        <div className="mb-6">
                                            <div className="text-[10px] font-bold text-indigo-600 tracking-widest mb-3">// OPTION 01</div>
                                            <h3 className="text-base font-bold text-black uppercase font-syne group-hover:text-indigo-600 transition-colors">
                                                GUIDED AI WALKTHROUGH
                                            </h3>
                                        </div>
                                        <button
                                            type="button"
                                            className="w-full bg-black text-white py-3 font-mono font-extrabold text-xs tracking-widest uppercase hover:bg-neutral-800 transition-all border border-black cursor-pointer rounded"
                                        >
                                            [ START AI WALKTHROUGH ]
                                        </button>
                                    </div>

                                    {/* Option 2: Custom Comments */}
                                    <div
                                        onClick={() => {
                                            setPreviewMode('custom_pins');
                                            setIsCommentMode(true);
                                            setShowPinTip(true);
                                            setStep('preview');
                                        }}
                                        className="border border-gray-200 bg-slate-50 hover:bg-slate-100 hover:border-gray-400 p-6 cursor-pointer transition-all flex flex-col justify-between group rounded-lg"
                                    >
                                        <div className="mb-6">
                                            <div className="text-[10px] font-bold text-orange-600 tracking-widest mb-3">// OPTION 02</div>
                                            <h3 className="text-base font-bold text-black uppercase font-syne group-hover:text-orange-600 transition-colors">
                                                PLACE MY OWN COMMENTS
                                            </h3>
                                        </div>
                                        <button
                                            type="button"
                                            className="w-full bg-orange-600 text-white py-3 font-mono font-extrabold text-xs tracking-widest uppercase hover:bg-orange-500 transition-all border border-orange-600 cursor-pointer rounded"
                                        >
                                            [ PLACE MY OWN COMMENTS ]
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {step === 'preview' && (
                        <motion.div
                            key="preview"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex flex-col lg:flex-row flex-1 w-full h-full overflow-x-hidden overflow-y-auto lg:overflow-hidden overscroll-x-none bg-white"
                        >
                            {/* Main Preview Area */}
                            <div className="h-[75vh] lg:h-auto lg:flex-1 relative bg-slate-50 border-b lg:border-b-0 lg:border-r border-gray-200 flex flex-col shrink-0">
                                {/* Interactive AI Walkthrough Banner with <- and -> arrows */}
                                {previewMode === 'walkthrough' && walkthroughItems.length > 0 && (
                                    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 w-[92%] max-w-2xl bg-white border border-gray-300 p-4 shadow-2xl rounded-xl font-mono text-black">
                                        <div className="flex items-center justify-between border-b border-gray-200 pb-2 mb-3">
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
                                                <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">
                                                    // AI DIAGNOSTIC FINDING {walkthroughIndex + 1} OF {walkthroughItems.length}
                                                </span>
                                            </div>

                                            {/* Navigation Arrows <- and -> */}
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => setWalkthroughIndex((prev) => (prev > 0 ? prev - 1 : walkthroughItems.length - 1))}
                                                    className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-[#0F172A] font-extrabold text-xs tracking-widest transition-colors border border-gray-300 cursor-pointer rounded"
                                                    title="Previous AI Comment"
                                                >
                                                    [ &lt;- PREV ]
                                                </button>
                                                <button
                                                    onClick={() => setWalkthroughIndex((prev) => (prev < walkthroughItems.length - 1 ? prev + 1 : 0))}
                                                    className="px-2.5 py-1 bg-[#0F172A] text-white font-extrabold text-xs tracking-widest transition-colors border border-[#0F172A] cursor-pointer rounded"
                                                    title="Next AI Comment"
                                                >
                                                    [ NEXT -&gt; ]
                                                </button>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <div className="text-xs font-bold text-[#0F172A] uppercase tracking-tight font-syne">
                                                {walkthroughItems[walkthroughIndex].title}
                                            </div>
                                            <div className="text-[11px] text-red-600 leading-relaxed font-semibold">
                                                <span className="text-red-700 font-bold">CRITIQUE:</span> {walkthroughItems[walkthroughIndex].issue}
                                            </div>
                                            <div className="text-[11px] text-emerald-900 leading-relaxed bg-emerald-50 p-2.5 border border-emerald-200 rounded-lg">
                                                <span className="text-emerald-700 font-bold">NUMBER1.STUDIO PROPOSAL:</span> {walkthroughItems[walkthroughIndex].suggestion}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {previewMode === 'custom_pins' && isCommentMode && showPinTip && (
                                    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 bg-orange-500 text-white pl-5 pr-2 py-2 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-widest shadow-xl animate-bounce whitespace-nowrap flex items-center gap-2">
                                        Tap anywhere on website to drop a pin
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
                            <div className="w-full lg:w-96 shrink-0 bg-background border-t lg:border-t-0 lg:border-l border-card flex flex-col h-auto lg:h-full overflow-visible lg:overflow-hidden shadow-2xl relative z-30">
                                <div className="p-4 md:p-6 border-b border-card bg-foreground/[0.01]">
                                    <h3 className="font-syne font-bold text-lg md:text-xl mb-1 flex items-center gap-2 text-foreground">
                                        <svg className="w-5 h-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
                                        Optimization Audit
                                    </h3>
                                    <div className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                        <p className="text-[10px] text-blue-300 font-bold uppercase tracking-widest">Live Analysis Active</p>
                                    </div>
                                </div>

                                {isProposalOpen ? (
                                    <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-card custom-scrollbar flex flex-col bg-background relative z-20">
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
                                                <div className="flex items-center justify-between mb-4">
                                                    <h4 className="text-[10px] font-mono font-bold tracking-widest text-indigo-300 uppercase">Annotations</h4>
                                                    <span className="px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 text-[10px] font-bold">{pins.length} pins</span>
                                                </div>

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
                                                                    <h4 className="text-sm font-bold uppercase tracking-widest text-indigo-300">Edit Note</h4>
                                                                    <p className="text-xs text-blue-200/60">Adding context to selected pin.</p>
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
                                                    className="space-y-4"
                                                >
                                                    {/* Number1.Studio Re-engineering Pointers */}
                                                    {aiResults?.number1_studio_reengineering && (
                                                        <div className="bg-black/80 border border-orange-500/30 rounded-2xl p-5 shadow-2xl">
                                                            <div className="flex items-center gap-2 mb-3">
                                                                <div className="w-2.5 h-2.5 rounded-full bg-orange-500 animate-pulse" />
                                                                <span className="text-[10px] font-mono font-extrabold uppercase tracking-widest text-orange-400">
                                                                    NUMBER1.STUDIO RE-ENGINEERING PLAN
                                                                </span>
                                                            </div>

                                                            {aiResults.executive_summary && (
                                                                <p className="text-xs text-white/80 font-mono leading-relaxed mb-4 pb-3 border-b border-white/10">
                                                                    {aiResults.executive_summary}
                                                                </p>
                                                            )}

                                                            {aiResults.number1_studio_reengineering.legacy_flaws?.length > 0 && (
                                                                <div className="mb-4">
                                                                    <div className="text-[9px] font-mono font-bold text-red-400 uppercase mb-1.5">// LEGACY 2010 DESIGN FLAWS DETECTED</div>
                                                                    <ul className="space-y-1 text-xs font-mono text-white/60">
                                                                        {aiResults.number1_studio_reengineering.legacy_flaws.map((flaw: string, idx: number) => (
                                                                            <li key={idx} className="flex items-start gap-1.5">
                                                                                <span className="text-red-400 font-bold">x</span>
                                                                                <span>{flaw}</span>
                                                                            </li>
                                                                        ))}
                                                                    </ul>
                                                                </div>
                                                            )}

                                                            {aiResults.number1_studio_reengineering.proposed_makeover?.length > 0 && (
                                                                <div>
                                                                    <div className="text-[9px] font-mono font-bold text-emerald-400 uppercase mb-1.5">// WHAT NUMBER1.STUDIO WILL CHANGE</div>
                                                                    <ul className="space-y-1.5 text-xs font-mono text-white/90">
                                                                        {aiResults.number1_studio_reengineering.proposed_makeover.map((item: string, idx: number) => (
                                                                            <li key={idx} className="flex items-start gap-1.5 bg-white/5 p-2 rounded border border-white/5">
                                                                                <span className="text-emerald-400 font-bold">✓</span>
                                                                                <span>{item}</span>
                                                                            </li>
                                                                        ))}
                                                                    </ul>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}

                                                    {/* 1. Context & Goal */}
                                                    <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-5">
                                                        <div className="flex items-center gap-2 mb-3">
                                                            <div className="w-6 h-6 rounded-lg bg-indigo-500/15 flex items-center justify-center">
                                                                <svg className="w-3.5 h-3.5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                                            </div>
                                                            <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-300">Conversion Context</span>
                                                        </div>
                                                        <p className="text-xs text-blue-200/80 leading-relaxed">
                                                            {aiResults?.website_target || FALLBACK_RESULTS.website_target}
                                                        </p>
                                                    </div>

                                                    {/* 2. Visual Identity */}
                                                    <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-5">
                                                        <div className="flex items-center gap-2 mb-4">
                                                            <div className="w-6 h-6 rounded-lg bg-blue-500/15 flex items-center justify-center">
                                                                <svg className="w-3.5 h-3.5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" /></svg>
                                                            </div>
                                                            <span className="text-[10px] font-bold uppercase tracking-widest text-blue-300">Visual Identity</span>
                                                        </div>
                                                        
                                                        <div className="flex gap-1.5 mb-4 px-1">
                                                            {(aiResults?.colour_palette?.dominant || FALLBACK_RESULTS.colour_palette.dominant).map((c: string, i: number) => (
                                                                <div key={i} className="flex-1 h-6 rounded-md border border-white/10 shadow-sm" style={{ background: c }} title={c} />
                                                            ))}
                                                        </div>
                                                        <p className="text-[11px] text-blue-100/70 leading-relaxed mb-4">
                                                            {aiResults?.colour_palette?.assessment || FALLBACK_RESULTS.colour_palette.assessment}
                                                        </p>

                                                        <div className="pt-2 border-t border-white/[0.06]">
                                                            <label className="text-[9px] font-bold uppercase tracking-widest text-indigo-300/60 block mb-2">Test New Aesthetic</label>
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
                                                                className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500/50 appearance-none cursor-pointer font-mono"
                                                            >
                                                                {Object.entries(COLOUR_PALETTES).map(([key, p]) => (
                                                                    <option key={key} value={key} className="bg-[#0F111A] text-white">{p.name}</option>
                                                                ))}
                                                            </select>
                                                        </div>
                                                    </div>

                                                    {/* 3. Design Structure */}
                                                    <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-5">
                                                        <div className="flex items-center gap-2 mb-3">
                                                            <div className="w-6 h-6 rounded-lg bg-emerald-500/15 flex items-center justify-center">
                                                                <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6z" /></svg>
                                                            </div>
                                                            <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-300">Design Structure</span>
                                                        </div>
                                                        <div className="space-y-3">
                                                            <div>
                                                                <div className="text-[9px] font-bold text-white/40 uppercase mb-1">Layout Type</div>
                                                                <span className="inline-block text-[10px] font-mono font-bold px-2 py-0.5 bg-emerald-500/10 text-emerald-300 rounded">
                                                                    {aiResults?.layout_spacing?.type || FALLBACK_RESULTS.layout_spacing.type}
                                                                </span>
                                                            </div>
                                                            <p className="text-xs text-blue-200/80 leading-relaxed">
                                                                {aiResults?.layout_spacing?.assessment || FALLBACK_RESULTS.layout_spacing.assessment}
                                                            </p>
                                                            <div className="pt-2 border-t border-white/[0.06]">
                                                                <div className="text-[9px] font-bold text-white/40 uppercase mb-1">Typography Audit</div>
                                                                <p className="text-xs text-blue-200/80 leading-relaxed">
                                                                    {aiResults?.typography?.assessment || FALLBACK_RESULTS.typography.assessment}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* 4. Action Plan */}
                                                    <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-5">
                                                        <div className="flex items-center gap-2 mb-4">
                                                            <div className="w-6 h-6 rounded-lg bg-orange-500/15 flex items-center justify-center">
                                                                <svg className="w-3.5 h-3.5 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
                                                            </div>
                                                            <span className="text-[10px] font-bold uppercase tracking-widest text-orange-300">Action Plan</span>
                                                        </div>
                                                        <div className="space-y-2">
                                                            {(recommendations.length > 0 ? recommendations : (aiResults?.recommendations || FALLBACK_RESULTS.recommendations).map((r: string, i: number) => ({ id: `rec-${i}`, text: r }))).map((rec: any) => (
                                                                <div key={rec.id} className="flex items-start gap-2 group bg-white/5 rounded-xl p-2 border border-white/5">
                                                                    <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-orange-500 shrink-0" />
                                                                    <textarea
                                                                        className="flex-1 bg-transparent border-none p-0 text-xs leading-relaxed text-white focus:outline-none min-h-[40px] resize-none"
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
                                                                        className="opacity-0 group-hover:opacity-100 p-1 text-white/30 hover:text-red-400 transition-all"
                                                                    >
                                                                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                                                    </button>
                                                                </div>
                                                            ))}
                                                        </div>
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



    </div>
    );
}
