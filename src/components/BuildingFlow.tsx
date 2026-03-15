"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useUserStore } from '@/lib/store/useUserStore';

type StepData = {
    vision: string;
    aesthetic: string;
    features: string[];
    audience: string;
    voice: number; // Slider value 0-100
    timeline: string;
    additionalInfo: string;
};

const STEPS = [
    { id: 'spark', title: 'The Spark', description: '' },
    { id: 'atmosphere', title: 'The Atmosphere', description: 'Define the physical sensation of the site.' },
    { id: 'engine', title: 'The Engine', description: '' },
    { id: 'crowd', title: 'The Crowd', description: 'Who are we trying to mesmerize?' },
    { id: 'voice', title: 'The Voice', description: 'If your brand could speak, how would it sound?' },
    { id: 'horizon', title: 'The Horizon', description: 'When does the world see this?' },
    { id: 'details', title: 'Final Details', description: 'Anything you would like to tell us?' },
];

export function BuildingFlow() {
    const { activeProject, updateProjectDraft, completeProject, resetProject } = useUserStore();
    const [currentStep, setCurrentStep] = useState(activeProject.status === 'draft' ? activeProject.currentStep : 0);
    const [sparkProgress, setSparkProgress] = useState(0); // 0 to 1
    const [revealState, setRevealState] = useState<'idle' | 'burning' | 'exploding' | 'white'>('idle');
    const [isBuildStarted, setIsBuildStarted] = useState(activeProject.status === 'completed');

    const [formData, setFormData] = useState<StepData>({
        vision: activeProject.vision || '',
        aesthetic: activeProject.aesthetic || '',
        features: activeProject.features?.length ? activeProject.features : [],
        audience: activeProject.audience || '',
        voice: activeProject.voice || 50,
        timeline: activeProject.timeline || '',
        additionalInfo: activeProject.additionalInfo || '',
    });

    const canvasBtnRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const [isCanvasBtnOverlapping, setIsCanvasBtnOverlapping] = useState(false);

    useEffect(() => {
        const checkOverlap = () => {
            if (!canvasBtnRef.current || !contentRef.current) return;

            if (window.innerWidth >= 768) {
                setIsCanvasBtnOverlapping(false);
                return;
            }

            const btnRect = canvasBtnRef.current.getBoundingClientRect();
            const textNodes = contentRef.current.querySelectorAll('h1, p');
            let overlapping = false;

            textNodes.forEach(node => {
                const rect = node.getBoundingClientRect();
                if (!(btnRect.right < rect.left - 10 ||
                    btnRect.left > rect.right + 10 ||
                    btnRect.bottom < rect.top - 10 ||
                    btnRect.top > rect.bottom + 10)) {
                    overlapping = true;
                }
            });

            setIsCanvasBtnOverlapping(overlapping);
        };

        window.addEventListener('resize', checkOverlap);
        window.addEventListener('scroll', checkOverlap, { passive: true });

        const observer = new MutationObserver(checkOverlap);
        if (contentRef.current) {
            observer.observe(contentRef.current, { childList: true, subtree: true, characterData: true });
        }

        const timer = setTimeout(checkOverlap, 100);

        return () => {
            window.removeEventListener('resize', checkOverlap);
            window.removeEventListener('scroll', checkOverlap);
            observer.disconnect();
            clearTimeout(timer);
        };
    }, [currentStep, formData.vision]);


    const step = STEPS[currentStep];

    // Reveal Sequence Logic
    useEffect(() => {
        if (sparkProgress >= 1 && revealState === 'idle') {
            // Trigger animation
            setRevealState('burning');

            // Wait for "burn bright" then explode
            const timer1 = setTimeout(() => {
                setRevealState('exploding');
            }, 1500);

            // Wait for explosion to finish, then white
            const timer2 = setTimeout(() => {
                setRevealState('white');
            }, 3000); // 1.5s + 1.5s explosion

            return () => {
                clearTimeout(timer1);
                clearTimeout(timer2);
            };
        } else if (sparkProgress < 1 && revealState !== 'white') {
            // Reset if they delete text? checking...
            if (revealState === 'burning') setRevealState('idle');
        }
    }, [sparkProgress, revealState]);

    // Scroll to top when changing steps
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [currentStep]);

    const handleNext = () => {
        // Save progress to store
        updateProjectDraft({
            ...formData,
            currentStep: currentStep + 1,
        });

        if (currentStep < STEPS.length - 1) {
            setCurrentStep(prev => prev + 1);
        } else {
            // ── Submit build request to dashboard ──
            const user = useUserStore.getState().user;
            const summary = [
                `TYPE: New Website Build`,
                ``,
                `THE SPARK (Vision)\n${formData.vision || '—'}`,
                ``,
                `THE ATMOSPHERE (Aesthetic)\n${formData.aesthetic || '—'}`,
                ``,
                `THE ENGINE (Features)\n${formData.features?.join(', ') || '—'}`,
                ``,
                `THE CROWD (Audience)\n${formData.audience || '—'}`,
                ``,
                `THE VOICE (Brand Tone: ${formData.voice}/100)\n${formData.voice < 33 ? 'Corporate & Formal' : formData.voice < 66 ? 'Balanced & Professional' : 'Creative & Bold'}`,
                ``,
                `THE HORIZON (Timeline)\n${formData.timeline || '—'}`,
                ``,
                `FINAL DETAILS\n${formData.additionalInfo || '—'}`,
            ].join('\n');

            fetch('/api/build-requests', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'new_website',
                    clientName: user?.name || null,
                    clientEmail: user?.email || null,
                    summary,
                }),
            }).catch(console.error);

            completeProject();
            setIsBuildStarted(true);
        }
    };

    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep(prev => prev - 1);
        }
    };

    const handleChange = (field: keyof StepData, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleCancelBuild = () => {
        resetProject();
        setIsBuildStarted(false);
        setCurrentStep(0);
        setFormData({
            vision: '',
            aesthetic: '',
            features: [],
            audience: '',
            voice: 50,
            timeline: '',
            additionalInfo: '',
        });
    };

    if (isBuildStarted) {
        return <BuildProgressScreen formData={formData} onCancel={handleCancelBuild} />;
    }

    return (
        <div
            className={`min-h-[100dvh] md:min-h-screen flex flex-col items-center justify-start md:justify-center pt-32 pb-24 md:py-6 relative overflow-x-hidden overflow-y-auto md:overflow-hidden transition-colors duration-1000 ${revealState === 'white' ? 'bg-white' : 'bg-black'} ${currentStep === 1 ? 'px-0' : 'px-4 md:px-6'}`}
        >

            {/* Hidden Reveal Text - Only shows when White */}
            <AnimatePresence>
                {revealState === 'white' && (
                    <motion.div
                        className="absolute inset-0 flex items-center justify-center pointer-events-none z-0"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 1.5, delay: 0.5, ease: "easeOut" }}
                    >
                        <h1 className="text-[12vw] font-syne font-black text-white text-center leading-none select-none">
                            OUR NEW<br />BEGINNING
                        </h1>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* The Bulb / Light Effect */}
            {(revealState === 'idle' || revealState === 'burning' || revealState === 'exploding') && (
                <motion.div
                    className="absolute inset-0 flex items-center justify-center z-0 pointer-events-none"
                    initial={{ opacity: 0 }}
                    animate={{
                        opacity: revealState === 'exploding' ? 0 : 0.2,
                        scale: revealState === 'exploding' ? 4 : 1,
                        filter: `blur(30px)`
                    }}
                    transition={{ duration: revealState === 'exploding' ? 1.5 : 0.5, ease: "easeInOut" }}
                >
                    {/* Core Bulb */}
                    <div
                        className="w-64 h-64 rounded-full bg-orange-500/20 mix-blend-screen"
                        style={{
                            boxShadow: `0 0 100px 40px rgba(255, 100, 0, 0.4)`
                        }}
                    />
                </motion.div>
            )}


            {/* Hidden Reveal Text - Only shows when White */}
            <AnimatePresence>
                {revealState === 'white' && (
                    <motion.div
                        className="absolute inset-0 flex items-center justify-center pointer-events-none z-0"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 1.5, delay: 0.5, ease: "easeOut" }}
                    >
                        <h1 className="text-[12vw] font-syne font-black text-white text-center leading-none select-none">
                            OUR NEW<br />BEGINNING
                        </h1>
                    </motion.div>
                )}
            </AnimatePresence>


            {/* Top Right Controls (Canvas & Progress) */}
            <div
                ref={canvasBtnRef}
                className={`fixed top-8 right-8 md:absolute flex flex-col items-end gap-4 z-[70] mix-blend-difference transition-opacity duration-300 pointer-events-auto ${isCanvasBtnOverlapping ? 'opacity-0 md:opacity-100 pointer-events-none md:pointer-events-auto' : 'opacity-100'}`}
            >
                <Link
                    href={`/canvas?step=${currentStep}`}
                    className="text-sm font-mono uppercase tracking-widest text-white hover:opacity-70 transition-all duration-1000 border border-white rounded-full px-4 py-1"
                >
                    Canvas
                </Link>
                <div className="flex gap-2">
                    {STEPS.map((_, i) => (
                        <div
                            key={i}
                            className={`h-1 w-8 rounded-full transition-colors duration-300 ${i <= currentStep ? 'bg-white' : 'bg-neutral-800'}`}
                        />
                    ))}
                </div>
            </div>

            {/* Number1 Logo (Home) - Using mix-blend-mode for contrast */}
            <a href="/" className="absolute top-8 left-8 font-extrabold text-xl tracking-tighter text-white z-50 hover:opacity-70 transition-opacity mix-blend-difference">
                Number1
            </a>

            <div ref={contentRef} className={`w-full z-10 flex flex-col items-center text-center text-white mix-blend-difference ${step.id === 'atmosphere' ? 'max-w-full lg:max-w-7xl px-0 lg:px-4' : 'max-w-7xl px-4'}`}>
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentStep}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.05 }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                        className="w-full flex flex-col items-center"
                    >
                        <div className="px-4 flex flex-col items-center">
                            {step.id !== 'spark' && (
                                <h1 className="text-4xl md:text-6xl font-bold tracking-tighter mb-4 font-syne">{step.title}</h1>
                            )}
                            {step.description && (
                                <p className="text-xl text-white mb-12 max-w-xl">{step.description}</p>
                            )}
                            {!step.description && <div className="mb-12"></div>}
                        </div>

                        {/* Step Content */}
                        <div className="w-full flex justify-center min-h-[300px]">
                            {step.id === 'spark' && (
                                <SparkStep
                                    value={formData.vision}
                                    onChange={(val: string) => setFormData({ ...formData, vision: val })}
                                    onValid={handleNext}
                                    onProgress={setSparkProgress}
                                />
                            )}

                            {step.id === 'atmosphere' && (
                                <AtmosphereStep
                                    value={formData.aesthetic}
                                    onChange={(val: string) => setFormData({ ...formData, aesthetic: val })}
                                    onValid={handleNext}
                                />
                            )}

                            {step.id === 'engine' && (
                                <EngineStep
                                    values={formData.features}
                                    onChange={(val: string[]) => setFormData({ ...formData, features: val })}
                                    onValid={handleNext}
                                />
                            )}

                            {step.id === 'crowd' && (
                                <CrowdStep
                                    value={formData.audience}
                                    onChange={(val: string) => setFormData({ ...formData, audience: val })}
                                    onValid={handleNext}
                                />
                            )}

                            {step.id === 'voice' && (
                                <VoiceStep
                                    value={formData.voice}
                                    onChange={(val: number) => setFormData({ ...formData, voice: val })}
                                    onValid={handleNext}
                                />
                            )}

                            {step.id === 'horizon' && (
                                <HorizonStep
                                    value={formData.timeline}
                                    onChange={(val: string) => setFormData({ ...formData, timeline: val })}
                                    onValid={handleNext}
                                />
                            )}

                            {step.id === 'details' && (
                                <DetailsStep
                                    value={formData.additionalInfo}
                                    onChange={(val: string) => setFormData({ ...formData, additionalInfo: val })}
                                    onValid={handleNext}
                                />
                            )}

                            {/* Placeholder for other steps */}
                            {step.id !== 'spark' && step.id !== 'atmosphere' && step.id !== 'engine' && step.id !== 'crowd' && step.id !== 'voice' && step.id !== 'horizon' && step.id !== 'details' && (
                                <div className="text-white italic">Work in progress...</div>
                            )}
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>

            <div className="absolute bottom-8 left-8 text-xs text-white font-mono mix-blend-difference z-50">
                BUILDING STAGE [ALPHA]
            </div>

            {/* Navigation for non-auto steps */}
            {step.id !== 'spark' && (
                <div className="w-full max-w-7xl flex justify-center gap-4 z-50 mt-12 pb-12">
                    <button
                        onClick={handleBack}
                        disabled={currentStep === 0}
                        className={`px-8 py-4 text-sm font-mono uppercase tracking-widest text-white hover:text-white transition-colors bg-neutral-900/50 hover:bg-neutral-800 rounded-full border border-neutral-800 ${currentStep === 0 ? 'opacity-0 pointer-events-none' : ''}`}
                    >
                        Back
                    </button>
                    <button
                        onClick={handleNext}
                        className="px-12 py-4 bg-white text-black rounded-full font-bold text-sm tracking-widest uppercase hover:bg-neutral-200 transition-colors shadow-[0_0_30px_rgba(255,255,255,0.15)] hover:scale-105"
                    >
                        {currentStep === STEPS.length - 1 ? 'Finish' : 'Next'}
                    </button>
                </div>
            )}
        </div>
    );
}

// ------------------------------------------------------------------
// Step 1: The Spark (Input Judging)
// ------------------------------------------------------------------

function SparkStep({ value, onChange, onValid, onProgress }: { value: string, onChange: (v: string) => void, onValid: () => void, onProgress: (p: number) => void }) {
    const [status, setStatus] = useState<'neutral' | 'typing' | 'good' | 'bad'>('neutral');
    const [feedback, setFeedback] = useState("");
    const [activeHint, setActiveHint] = useState<string | null>(null);
    const [hintLevel, setHintLevel] = useState<1 | 2>(1); // 1 = Main Hint, 2 = Follow-up
    const [lastTypingTime, setLastTypingTime] = useState(Date.now());
    const [currentHintIndex, setCurrentHintIndex] = useState<number | null>(null);

    // Encouraging words state
    const [fallingWords, setFallingWords] = useState<{ id: number; text: string; positionIndex: number; delay: number }[]>([]);
    const [lastWordMilestone, setLastWordMilestone] = useState(0);

    const ENCOURAGING_WORDS = ["VESSEL", "ARCHITECT", "FOUNDATION", "DREAM", "PURE", "VISION", "BOLD", "MOMENTUM", "GRAVITY", "STRIKING", "LUCID", "FORM"];

    // hints data: Pairs of [Main Question, Follow-up]
    const hintPairs = [
        ["What is your specific industry or niche?", "And what makes you different in that space?"],
        ["What is the primary goal of the site?", "How will you measure that success?"],
        ["What is one must-have interactive element?", "Why is that feature crucial for your users?"],
        ["List three adjectives for the user experience.", "How should those feelings translate to colors?"],
        ["Who is your ideal customer?", "What is their biggest pain point?"],
        ["What problem are you solving for them?", "Why hasn't it been solved before?"]
    ];

    // Placeholder Typing Logic
    const [placeholder, setPlaceholder] = useState("");
    const [placeholderIndex, setPlaceholderIndex] = useState(0);
    const [isDeleting, setIsDeleting] = useState(false);
    const [typingSpeed, setTypingSpeed] = useState(100);

    const placeholderPhrases = [
        "We are a bold startup redefining...",
        "I need a portfolio that screams...",
        "The goal is to disrupt the industry by...",
        "Imagine a space where users can...",
        "We allow clients to..."
    ];

    useEffect(() => {
        const handleTyping = () => {
            const currentPhrase = placeholderPhrases[placeholderIndex];

            if (isDeleting) {
                setPlaceholder(prev => prev.substring(0, prev.length - 1));
                setTypingSpeed(40); // Fast deletion
            } else {
                setPlaceholder(prev => currentPhrase.substring(0, prev.length + 1));
                setTypingSpeed(75); // Quick typing
            }

            if (!isDeleting && placeholder === currentPhrase) {
                setTimeout(() => setIsDeleting(true), 2000); // Wait before deleting
            } else if (isDeleting && placeholder === "") {
                setIsDeleting(false);
                setPlaceholderIndex((prev) => (prev + 1) % placeholderPhrases.length);
            }
        };

        const timer = setTimeout(handleTyping, typingSpeed);
        return () => clearTimeout(timer);
    }, [placeholder, isDeleting, placeholderIndex, typingSpeed]);

    // Validation & Typing Logic
    useEffect(() => {
        setLastTypingTime(Date.now());

        // Calculate Progress (0 to 1 based on word count, capped at 25 words)
        const wordCount = value.trim().length === 0 ? 0 : value.trim().split(/\s+/).length;

        // Map word count to thresholds for the 4 hooks
        // Hook 1: 5 words (0.25)
        // Hook 2: 12 words (0.50)
        // Hook 3: 18 words (0.75)
        // Hook 4: 25 words (1.00)
        let progress = 0;
        if (wordCount > 24) progress = 1;
        else if (wordCount > 17) progress = 0.75;
        else if (wordCount > 11) progress = 0.5;
        else if (wordCount > 4) progress = 0.25;
        else progress = wordCount / 20; // gentle startup

        onProgress(progress);

        // If user types while Level 1 hint is active, switch to Level 2 (Follow-up)
        if (activeHint && hintLevel === 1 && currentHintIndex !== null) {
            setActiveHint(hintPairs[currentHintIndex][1]);
            setHintLevel(2);
        }

        // Hide hint 5 seconds after typing starts (or updates)
        const hideHintTimer = setTimeout(() => {
            setActiveHint(null);
            setHintLevel(1);
            setCurrentHintIndex(null);
        }, 5000);

        const validateTimer = setTimeout(() => {
            if (value.length === 0) {
                setStatus('neutral');
                setFeedback("");
            } else if (value.split(' ').length > 20) {
                // Strict validation: Require at least 20 words
                setStatus('good');
                setFeedback("Excellent detailed vision.");
            } else {
                setStatus('bad');
                setFeedback("We need more detail to build a masterpiece.");
            }
        }, 800);

        // Encouraging Words Check (Every 10 words)
        const newMilestone = Math.floor(wordCount / 10);
        if (newMilestone > lastWordMilestone && newMilestone > 0) {
            setLastWordMilestone(newMilestone);
            const randomWord = ENCOURAGING_WORDS[Math.floor(Math.random() * ENCOURAGING_WORDS.length)];
            const posIndex = (newMilestone - 1) % 4; // Cycles through 0, 1, 2, 3
            const newWord = {
                id: Date.now(),
                text: randomWord,
                positionIndex: posIndex,
                delay: 0
            };
            setFallingWords(prev => [...prev, newWord]);

            // Keep the word on screen for a while so it can be read
            setTimeout(() => {
                setFallingWords(prev => prev.filter(w => w.id !== newWord.id));
            }, 10000);
        }

        return () => {
            clearTimeout(hideHintTimer);
            clearTimeout(validateTimer);
        };
    }, [value, lastWordMilestone]);

    // Idle Logic (7 seconds)
    useEffect(() => {
        const checkIdle = setInterval(() => {
            if (Date.now() - lastTypingTime > 7000 && value.length > 0 && status !== 'good') {
                if (!activeHint) {
                    // Pick a random hint
                    const randomIndex = Math.floor(Math.random() * hintPairs.length);
                    setCurrentHintIndex(randomIndex);
                    setActiveHint(hintPairs[randomIndex][0]);
                    setHintLevel(1);
                }
            }
        }, 1000);

        return () => clearInterval(checkIdle);
    }, [lastTypingTime, value, status, activeHint]);

    // Auto-resize logic
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const adjustHeight = () => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    };

    // Adjust height on value change
    useEffect(() => {
        adjustHeight();
    }, [value, placeholder]);

    const sentenceStarters = [
        "We are building a platform that...",
        "Our target audience consists of...",
        "The core functionality we need is...",
        "Visually, the brand feels like...",
        "We need an e-commerce store for...",
        "This project is a redesign of...",
        "The most critical feature is...",
        "Users will come to the site to...",
        "We want to convey a sense of...",
        "Our main competitors are..."
    ];

    const handleStarterClick = (starter: string) => {
        const cleanStarter = starter.replace(/\.\.\.$/, '');
        const sep = value && !value.endsWith(' ') && !value.endsWith('\n') ? ' ' : '';
        const newValue = value + sep + cleanStarter;
        onChange(newValue);
        if (status !== 'typing') setStatus('typing');
    };

    return (
        <div className="w-full max-w-6xl flex flex-col-reverse lg:flex-row gap-8 lg:gap-12 pointer-events-auto items-stretch lg:items-start justify-center">
            {/* Left Column: Sentence Starters */}
            <div className="w-full lg:w-[35%] flex flex-col gap-4 border-t lg:border-t-0 lg:border-r border-neutral-800 pt-8 lg:pt-0 lg:pr-8 text-left max-h-full lg:max-h-[500px]">
                <h3 className="text-xl font-syne font-bold text-white mb-2 px-2">Sentence Starters</h3>
                <div className="flex flex-col gap-2 overflow-y-auto pr-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                    {sentenceStarters.map((starter, i) => (
                        <button
                            key={i}
                            onClick={() => handleStarterClick(starter)}
                            className="text-left py-3 px-4 rounded-xl border border-transparent bg-neutral-900/10 hover:bg-neutral-900/50 hover:border-neutral-800 transition-colors text-sm text-white hover:text-white group flex items-start gap-4"
                        >
                            <span className="text-orange-500/40 group-hover:text-orange-500 font-extrabold transition-colors mt-[1px] text-lg leading-none">+</span >
                            <span className="leading-relaxed">{starter}</span>
                        </button>
                    ))}
                </div>
            </div>



            {/* Right Column: Existing Main Content Area */}
            <div className="w-full lg:w-[65%] flex flex-col items-center relative lg:pl-4">
                <h1 className="text-4xl md:text-6xl font-bold tracking-tighter mb-4 font-syne text-white mix-blend-difference">The Spark</h1>
                <p className="hidden md:block text-white/70 text-lg mb-12 text-center max-w-lg mix-blend-difference">
                    Let your thoughts flow freely. Describe your vision, your goals, and exactly what we are building together.
                </p>

                {/* Encouraging Words Area */}
                <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden" style={{ top: '-100px', bottom: '-100px', left: '-200px', right: '-200px' }}>
                    <AnimatePresence>
                        {fallingWords.map((word) => {
                            // 0: top-left, 1: top-right, 2: bottom-left, 3: bottom-right
                            const posStyles = [
                                { top: '20%', left: '15%' },
                                { top: '20%', right: '15%' },
                                { bottom: '20%', left: '15%' },
                                { bottom: '20%', right: '15%' }
                            ][word.positionIndex];

                            return (
                                <motion.div
                                    key={word.id}
                                    style={{ ...posStyles, position: 'absolute' }}
                                    className="font-syne font-black text-4xl md:text-[80px] text-white/10 tracking-widest whitespace-nowrap blur-[1px] flex"
                                    initial="hidden"
                                    animate="visible"
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 1 }}
                                >
                                    {word.text.split('').map((char, index) => (
                                        <motion.span
                                            key={index}
                                            variants={{
                                                hidden: { opacity: 0, y: 10 },
                                                visible: { opacity: 1, y: 0 }
                                            }}
                                            transition={{ duration: 0.4, delay: index * 0.1 }}
                                        >
                                            {char}
                                        </motion.span>
                                    ))}
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </div>

                {/* Hint Display */}
                <AnimatePresence mode="wait">
                    {activeHint && (
                        <motion.div
                            key={activeHint}
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            className="mb-8 font-mono text-sm bg-neutral-900/80 backdrop-blur-sm px-6 py-3 rounded-lg border border-neutral-800 text-white"
                        >
                            <span className={`${hintLevel === 1 ? 'text-orange-500' : 'text-blue-400'} mr-2 font-bold`}>
                                {hintLevel === 1 ? 'TIP:' : 'DEEPER:'}
                            </span>
                            {activeHint}
                        </motion.div>
                    )}
                </AnimatePresence>

                <textarea
                    ref={textareaRef}
                    value={value}
                    onChange={(e) => {
                        onChange(e.target.value);
                        if (status !== 'typing') setStatus('typing');
                    }}
                    placeholder={placeholder}
                    className="w-full bg-transparent border-b border-neutral-500 text-3xl md:text-5xl text-center py-6 focus:outline-none focus:border-white resize-none placeholder:text-white font-normal leading-relaxed overflow-hidden caret-transparent"
                    rows={1}
                    autoFocus
                    style={{ height: 'auto', minHeight: '120px' }}
                />

                <motion.div
                    className={`mt - 6 text - sm font - mono tracking - widest ${status === 'good' ? 'text-green-400' :
                        status === 'bad' ? 'text-red-500' :
                            'text-white'
                        } `}
                >
                    {feedback}
                </motion.div>

                <AnimatePresence>
                    {status === 'good' && (
                        <motion.button
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            onClick={onValid}
                            className="mt-10 px-10 py-4 bg-white text-black rounded-full font-bold hover:scale-105 transition-transform tracking-wider text-sm pointer-events-auto shadow-[0_0_40px_rgba(255,255,255,0.4)] relative z-10"
                        >
                            CONTINUE
                        </motion.button>
                    )}

                    {/* Always visible 'Next' button to bypass validation */}
                    {status !== 'good' && (
                        <motion.button
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            onClick={onValid}
                            className="mt-10 px-8 py-3 bg-neutral-800 text-white rounded-full font-bold hover:text-white hover:bg-neutral-700 transition-colors tracking-wider text-sm pointer-events-auto relative z-10"
                        >
                            NEXT SKIP VALIDATION
                        </motion.button>
                    )}
                </AnimatePresence>

                <Link
                    href="/direct"
                    className="mt-6 px-6 py-2 border border-neutral-800 text-white rounded-full hover:text-white hover:border-white transition-all text-xs tracking-widest uppercase pointer-events-auto"
                >
                    You know what you want
                </Link>
            </div>
        </div>
    );
}

// ------------------------------------------------------------------
// Step 2: The Atmosphere (Aesthetic Selection)
// ------------------------------------------------------------------

function AtmosphereStep({ value, onChange, onValid }: { value: string, onChange: (v: string) => void, onValid: () => void }) {
    const [showExtraOptions, setShowExtraOptions] = useState(false);
    const [customAtmosphere, setCustomAtmosphere] = useState('');
    const [activeInfo, setActiveInfo] = useState<string | null>(null);

    const options = [
        {
            id: 'minimal',
            name: 'Soft & Airy',
            desc: 'Maximum breathing room. Pastel hints, clean typography.'
        },
        {
            id: 'minimal_2',
            name: 'Soft & Airy (Variant 2)',
            desc: 'Warm earthy tones, organic shapes, and fluid typography layout.'
        },
        {
            id: 'brutalist',
            name: 'Bold / High-Contrast',
            desc: 'Unapologetic layout. Heavy stark borders, massive fonts.'
        },
        {
            id: 'neon',
            name: 'Deep Dark Mode',
            desc: 'Sleek dark glassmorphism. Subtle glowing borders and deep purples.'
        },
        {
            id: 'corporate',
            name: 'Structured Corporate',
            desc: 'Maximum trust. Clean sensible grids, reassuring blue tones.'
        },
    ];

    return (
        <div className="w-full flex flex-col lg:flex-row gap-8 pointer-events-auto h-auto lg:h-[75vh] lg:min-h-[600px] text-left">
            {/* Left Column: Selection Tiles */}
            <div className="w-full lg:w-[32%] flex flex-col gap-4 lg:overflow-y-auto px-4 lg:px-2 pb-4 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden lg:max-h-full shrink-0">
                {options.map((opt) => (
                    <button
                        key={opt.id}
                        onClick={() => onChange(opt.id)}
                        className={`group relative text-left p-5 rounded-2xl border transition-all duration-300 flex-shrink-0 ${value === opt.id
                            ? 'border-orange-500 shadow-[0_0_30px_rgba(249,115,22,0.2)] bg-neutral-900/50 scale-[1.02] z-10'
                            : 'border-neutral-800 bg-neutral-950/20 hover:border-neutral-700 hover:bg-neutral-900/30'
                            }`}
                    >
                        <div className="flex justify-between items-start mb-2">
                            <h3 className="text-xl font-bold text-white">{opt.name}</h3>
                            <div
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setActiveInfo(activeInfo === opt.id ? null : opt.id);
                                }}
                                className="w-6 h-6 rounded-full border border-neutral-600 flex items-center justify-center text-neutral-400 hover:text-white hover:border-white transition-colors lg:hidden shrink-0 ml-2"
                            >
                                <span className="text-xs font-mono font-bold">i</span>
                            </div>
                        </div>

                        {/* Desktop Description */}
                        <p className="hidden lg:block text-white text-sm leading-relaxed">{opt.desc}</p>

                        {/* Mobile Description Tile */}
                        <AnimatePresence>
                            {activeInfo === opt.id && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0, marginTop: 0 }}
                                    animate={{ opacity: 1, height: 'auto', marginTop: 12 }}
                                    exit={{ opacity: 0, height: 0, marginTop: 0 }}
                                    className="lg:hidden overflow-hidden"
                                >
                                    <div className="bg-neutral-900/80 p-4 rounded-xl border border-neutral-800 shadow-inner">
                                        <p className="text-neutral-300 text-sm leading-relaxed">{opt.desc}</p>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Selection Ring */}
                        {value === opt.id && (
                            <motion.div
                                layoutId="selection-ring"
                                className="absolute inset-0 border-2 border-orange-500 rounded-2xl pointer-events-none"
                                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                            />
                        )}
                    </button>
                ))}

                <button
                    onClick={() => setShowExtraOptions(true)}
                    className="mt-6 w-full py-3 border border-dashed border-neutral-600 rounded-xl text-white hover:text-white hover:border-white hover:bg-neutral-900 transition-all text-sm font-bold tracking-widest uppercase shadow-sm shrink-0"
                >
                    Not seeing what you like?
                </button>

                <AnimatePresence>
                    {value && (
                        <motion.button
                            initial={{ opacity: 0, scale: 0.9, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: -10 }}
                            onClick={onValid}
                            className="mt-4 w-full py-4 bg-white text-black rounded-xl font-bold hover:bg-neutral-200 transition-colors tracking-wider text-sm shadow-[0_0_40px_rgba(255,255,255,0.2)] flex-shrink-0"
                        >
                            CONFIRM ATMOSPHERE
                        </motion.button>
                    )}
                </AnimatePresence>
            </div>

            {/* Right Column: Live Preview */}
            <div className="w-full lg:w-[68%] h-[75vh] lg:min-h-0 lg:h-full border-y lg:border border-neutral-800 rounded-none lg:rounded-2xl overflow-hidden relative bg-neutral-950/80 flex items-center justify-center shadow-2xl shrink-0 mb-8 lg:mb-0">
                <AnimatePresence mode="wait">
                    {value ? (
                        <motion.div
                            key={value}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                            className="w-full h-full"
                        >
                            <LivePreviewTemplate id={value} />
                        </motion.div>
                    ) : (
                        <motion.div
                            key="empty"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="text-white font-mono text-sm tracking-widest uppercase flex flex-col items-center gap-4"
                        >
                            <svg className="w-12 h-12 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            Select an aesthetic to preview
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Extra Options Modal */}
            <AnimatePresence>
                {showExtraOptions && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 md:p-8"
                    >
                        <motion.div
                            initial={{ scale: 0.95, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.95, y: 20 }}
                            className="bg-neutral-900 border border-neutral-700 rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl relative"
                        >
                            {/* Header */}
                            <div className="p-6 md:p-8 border-b border-neutral-800 flex justify-between items-center bg-neutral-900/50">
                                <h2 className="text-2xl font-bold text-white font-syne">More Atmospheres</h2>
                                <button onClick={() => setShowExtraOptions(false)} className="text-white hover:text-white bg-neutral-800 hover:bg-neutral-700 w-10 h-10 rounded-full flex items-center justify-center transition-colors">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                            </div>

                            {/* Body */}
                            <div className="p-6 md:p-8 overflow-y-auto flex flex-col gap-10 flex-grow [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                                <div>
                                    <h3 className="text-sm font-bold text-white tracking-widest uppercase mb-6">Select a predefined style</h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                        {[
                                            { id: 'vintage', name: 'Vintage/Retro', desc: 'Nostalgic color palettes, textured backgrounds, classic typography.' },
                                            { id: 'cyberpunk', name: 'Cyberpunk', desc: 'High-tech low-life aesthetics, neon grids, glitch effects.' },
                                            { id: 'glassmorphism', name: 'Glassmorphism', desc: 'Frosted glass effects, light borders, vibrant blurred backgrounds.' },
                                            { id: 'y2k', name: 'Y2K Aesthetic', desc: 'Metallic gradients, futuristic tech elements, bright early 2000s vibes.' },
                                            { id: 'bauhaus', name: 'Bauhaus', desc: 'Geometric shapes, primary colors, functional and stark design.' },
                                            { id: 'editorial', name: 'Editorial/Magazine', desc: 'Large high-quality serif typography, asymmetrical grids, lots of whitespace.' },
                                            { id: 'neumorphism', name: 'Neumorphism', desc: 'Soft extruded plastic look, low contrast shadowing.' },
                                            { id: 'claymorphism', name: 'Claymorphism', desc: 'Friendly, rounded shapes with soft inner shadows resembling clay.' },
                                            { id: 'isometric', name: 'Isometric 3D', desc: '3D projected elements built on a rigid grid system.' },
                                            { id: 'organic', name: 'Organic/Hand-drawn', desc: 'Wavy borders, natural earth tones, imperfect illustrations.' }
                                        ].map((opt) => (
                                            <button
                                                key={opt.id}
                                                onClick={() => {
                                                    onChange(opt.id);
                                                    setShowExtraOptions(false);
                                                }}
                                                className={`text-left p-4 rounded-xl border transition-all duration-200 flex-shrink-0 flex flex-col gap-2 ${value === opt.id
                                                    ? 'border-orange-500 bg-orange-500/10'
                                                    : 'border-neutral-800 bg-neutral-950/50 hover:border-neutral-700 hover:bg-neutral-800'
                                                    }`}
                                            >
                                                <span className="font-bold text-white">{opt.name}</span>
                                                <span className="text-xs text-white leading-relaxed">{opt.desc}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="border-t border-neutral-800 pt-10">
                                    <h3 className="text-sm font-bold text-white tracking-widest uppercase mb-4">Or define your own</h3>
                                    <div className="relative">
                                        <textarea
                                            value={customAtmosphere}
                                            onChange={(e) => setCustomAtmosphere(e.target.value)}
                                            placeholder="Describe your exact vision (e.g. 'A mix of 90s brutalism but with soft pastel colors...')"
                                            className="w-full bg-neutral-950 border border-neutral-700 rounded-xl p-4 text-white placeholder-neutral-600 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all min-h-[120px] resize-none"
                                        />
                                        {customAtmosphere.length > 0 && (
                                            <button
                                                onClick={() => {
                                                    onChange(`custom:${customAtmosphere}`);
                                                    setShowExtraOptions(false);
                                                }}
                                                className="absolute bottom-4 right-4 bg-orange-500 text-white px-6 py-2 rounded-lg text-sm font-bold hover:bg-orange-600 transition-colors shadow-lg"
                                            >
                                                Confirm Custom
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

function scrollPreview(id: string) {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
}

function LivePreviewTemplate({ id }: { id: string }) {
    const [activePage, setActivePage] = useState('home');

    // Reset page when switching templates
    useEffect(() => {
        setActivePage('home');
    }, [id]);

    switch (id) {
        case 'minimal':
            return (
                <div className="w-full h-full bg-stone-50 text-stone-900 flex flex-col select-none overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden scroll-smooth">
                    <header className="sticky top-0 z-50 bg-stone-50/90 backdrop-blur-sm px-6 md:px-10 py-6 flex flex-col md:flex-row justify-between items-center w-full gap-4 md:gap-0">
                        <div className="font-serif text-2xl tracking-tight">K I N</div>
                        <div className="flex gap-4 md:gap-8 text-[10px] md:text-xs font-medium text-stone-500 tracking-widest uppercase flex-wrap justify-center">
                            <button onClick={() => scrollPreview('min-col')} className="hover:text-stone-900 transition-colors">Collection</button>
                            <button onClick={() => scrollPreview('min-stu')} className="hover:text-stone-900 transition-colors">Studio</button>
                            <button onClick={() => scrollPreview('min-con')} className="hover:text-stone-900 transition-colors">Contact</button>
                        </div>
                    </header>
                    <main>
                        <section id="min-hero" className="px-6 md:px-10 py-12 md:py-16 min-h-[400px] md:min-h-[500px] flex flex-col items-center justify-center text-center">
                            <div className="w-24 h-32 md:w-32 md:h-40 bg-stone-200 mx-auto mb-8 rounded-sm shadow-sm" />
                            <h1 className="text-3xl md:text-4xl font-light mb-4 leading-tight font-serif italic">Subtle Details, <br />Profound Impact.</h1>
                            <p className="text-stone-500 text-xs md:text-sm leading-relaxed mb-8 max-w-xs mx-auto">A focused narrative where space breathes and elements wait to be discovered.</p>
                            <button className="px-8 py-3 bg-stone-900 text-white rounded-full text-xs tracking-widest uppercase hover:bg-stone-800 transition-colors">Enter</button>
                        </section>

                        <section id="min-col" className="px-6 md:px-10 py-16 md:py-24 bg-stone-100 flex flex-col items-center">
                            <h2 className="text-xl md:text-2xl font-serif italic mb-8 md:mb-12">The Collection</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 w-full max-w-lg">
                                <div className="aspect-[3/4] bg-stone-200 rounded-sm overflow-hidden relative flex items-center justify-center">
                                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIj48dGV4dCB4PSItMTAiIHk9IjIwIiBmaWxsPSIjZjdmN2Y3IiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZm9udC1zaXplPSI4IiB0cmFuc2Zvcm09InJvdGF0ZSgtNDUpIj5LSU4gU1RVRElPIE1JTklNQUwgQ09MTEVDVElPTjwvdGV4dD48L3N2Zz4=')] opacity-50"></div>
                                </div>
                                <div className="aspect-[3/4] bg-stone-300 rounded-sm mt-12 overflow-hidden relative flex items-center justify-center">
                                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIj48dGV4dCB4PSItMTAiIHk9IjIwIiBmaWxsPSIjZTZlNWU1IiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZm9udC1zaXplPSI4IiB0cmFuc2Zvcm09InJvdGF0ZSgtNDUpIj5TUEFDRSBCUkVBVEhFUyBTVUJUTEUgREVUQUlMUzwvdGV4dD48L3N2Zz4=')] opacity-50"></div>
                                </div>
                            </div>
                        </section>

                        <section id="min-stu" className="px-10 py-24 flex flex-col items-center text-center">
                            <h2 className="text-2xl font-serif italic mb-6">Our Studio</h2>
                            <p className="text-stone-500 text-sm leading-relaxed max-w-sm">We believe in reduction. Removing the unnecessary so the essential may speak.</p>
                        </section>

                        <section id="min-con" className="px-10 py-24 bg-stone-900 text-stone-100 flex flex-col items-center text-center">
                            <h2 className="text-3xl font-serif italic mb-8">Reach Out</h2>
                            <p className="text-stone-400 text-sm mb-12 max-w-sm">Whether you have a clear vision or a quiet idea, we're here to listen.</p>
                            <form className="w-full max-w-xs flex flex-col gap-6" onClick={(e) => e.preventDefault()}>
                                <input type="text" placeholder="Your Name" className="bg-transparent border-b border-stone-700 pb-2 text-sm focus:outline-none focus:border-stone-400 placeholder:text-stone-600 transition-colors" />
                                <input type="email" placeholder="Email Address" className="bg-transparent border-b border-stone-700 pb-2 text-sm focus:outline-none focus:border-stone-400 placeholder:text-stone-600 transition-colors" />
                                <button className="mt-4 px-8 py-3 bg-stone-100 text-stone-900 rounded-full text-xs tracking-widest uppercase hover:bg-white hover:scale-105 transition-all">Send Inquiry</button>
                            </form>
                        </section>
                    </main>
                    <footer className="bg-stone-900 text-[10px] text-stone-500 text-center tracking-widest uppercase pb-10">© 2026 Kin Studio</footer>
                </div>
            );
        case 'minimal_2':
            return (
                <div className="w-full h-full bg-[#FAF7F2] text-[#4A4238] flex flex-col overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden scroll-smooth relative font-serif">
                    <header className="absolute top-0 w-full z-50 px-6 md:px-8 py-6 md:py-8 flex flex-col md:flex-row justify-between items-center gap-4 md:gap-0 bg-gradient-to-b from-[#FAF7F2] to-transparent">
                        <div className="text-xl tracking-widest font-light text-[#8A7D6B]">LUMINA</div>
                        <div className="flex gap-6 text-[10px] uppercase tracking-[0.2em] font-sans text-[#A49A8A]">
                            <button onClick={() => scrollPreview('min2-work')} className="hover:text-[#4A4238] transition-colors">Work</button>
                            <button onClick={() => scrollPreview('min2-about')} className="hover:text-[#4A4238] transition-colors">About</button>
                        </div>
                    </header>
                    <main className="flex-grow">
                        <section className="min-h-[400px] md:min-h-[500px] flex flex-col items-center justify-center text-center px-6 relative overflow-hidden pt-20 md:pt-0">
                            <div className="absolute top-[-20%] right-[-10%] w-[300px] h-[300px] md:w-[500px] md:h-[500px] bg-[#E8D3C3] rounded-full blur-[100px] opacity-40 mix-blend-multiply" />
                            <div className="absolute bottom-[-10%] left-[-10%] w-[250px] h-[250px] md:w-[400px] md:h-[400px] bg-[#D1E0DD] rounded-full blur-[100px] opacity-40 mix-blend-multiply" />

                            <h1 className="text-4xl md:text-6xl font-light italic mb-6 md:mb-8 relative z-10 leading-[1.1] text-[#3E3831]">
                                Effortless grace<br />in digital form.
                            </h1>
                            <p className="font-sans text-[#8A7D6B] max-w-sm text-xs md:text-sm leading-relaxed mb-10 relative z-10">
                                Soft earthy palettes meeting fluid typography. Designed for spaces that require absolute modern tranquility.
                            </p>
                        </section>

                        <section id="min2-work" className="py-16 md:py-24 px-6 md:px-16 flex flex-col gap-12 md:gap-20 bg-white/50 backdrop-blur-md">
                            <div className="flex flex-col md:flex-row gap-8 md:gap-12 items-center">
                                <div className="w-full md:w-1/2 aspect-[4/5] bg-[#EBE4DC] rounded-t-full relative overflow-hidden flex items-center justify-center">
                                    <div className="w-3/4 h-[80%] border border-[#8A7D6B]/20 rounded-t-full absolute bottom-0" />
                                </div>
                                <div className="w-full md:w-1/2 text-center md:text-left">
                                    <h2 className="text-3xl italic mb-4">Organic Flow</h2>
                                    <p className="font-sans text-sm text-[#8A7D6B] leading-relaxed max-w-md">Embracing gentle curves and warm, natural hues to break the rigidity of traditional grid-based layouts.</p>
                                </div>
                            </div>
                        </section>

                        <section id="min2-about" className="py-32 px-8 text-center bg-[#FAF7F2]">
                            <h2 className="text-3xl italic mb-10 text-[#6B5E4E]">Sustainably Crafted</h2>
                            <div className="max-w-xl mx-auto flex gap-4 bg-white p-2 rounded-full shadow-[0_10px_30px_rgba(74,66,56,0.05)] border border-[#EBE4DC]">
                                <input type="email" placeholder="Join our quiet newsletter..." className="flex-grow bg-transparent px-6 font-sans text-sm focus:outline-none placeholder-[#A49A8A]" />
                                <button className="px-6 py-3 bg-[#4A4238] text-[#FAF7F2] rounded-full text-xs font-sans tracking-widest uppercase hover:bg-[#2A251D] transition-colors">Subscribe</button>
                            </div>
                        </section>
                    </main>
                </div>
            );
        case 'brutalist':
            return (
                <div className="w-full h-full bg-black text-white p-4 md:p-6 flex flex-col border-[8px] md:border-[12px] border-white font-syne uppercase select-none overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden scroll-smooth relative">
                    <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[80px] md:text-[150px] font-black opacity-[0.03] pointer-events-none mix-blend-difference z-0">RAW</div>
                    <header className="flex flex-col md:flex-row justify-between items-start md:items-end w-full border-b-[4px] md:border-b-[6px] border-white pb-4 mb-8 sticky top-0 bg-black/90 z-50 backdrop-blur-sm pt-4 gap-4 md:gap-0">
                        <div className="text-3xl md:text-5xl font-black tracking-tighter leading-none">NO<br />FS.</div>
                        <div className="flex gap-2 flex-wrap">
                            <button onClick={() => scrollPreview('bru-mani')} className="px-2 md:px-4 py-2 border-2 border-transparent hover:border-white transition-all text-[10px] md:text-sm font-black">MANI<br />FESTO</button>
                            <button onClick={() => scrollPreview('bru-work')} className="px-2 md:px-4 py-2 border-2 border-transparent hover:border-white transition-all text-[10px] md:text-sm font-black">WORK</button>
                            <button onClick={() => scrollPreview('bru-hit')} className="px-3 md:px-6 py-2 bg-white text-black font-black hover:bg-neutral-200 transition-colors text-[10px] md:text-sm">HIT<br />US</button>
                        </div>
                    </header>
                    <main className="flex-grow flex flex-col z-10">
                        <section id="bru-hero" className="min-h-[300px] md:min-h-[400px] flex flex-col justify-center mt-4">
                            <h1 className="text-5xl sm:text-7xl font-black leading-[0.85] mb-6">BREAK<br />THE<br />GRID</h1>
                            <div className="w-full h-[4px] md:h-[6px] bg-white mb-6" />
                            <p className="text-base md:text-lg font-bold max-w-sm">No soft corners. No subtle gradients. Brutal reality.</p>
                        </section>

                        <section id="bru-mani" className="py-16 md:py-24 border-t-[4px] md:border-t-[6px] border-white">
                            <h2 className="text-3xl md:text-5xl font-black mb-8 md:mb-12">MANIFESTO //</h2>
                            <p className="text-lg md:text-3xl font-bold leading-tight">Design is not decoration. It is communication. If it doesn't hurt a little, you're not trying hard enough.</p>
                        </section>

                        <section id="bru-work" className="py-24 border-t-[6px] border-white">
                            <h2 className="text-5xl font-black mb-12">WORK //</h2>
                            <div className="grid grid-cols-1 gap-12 w-full">
                                <div className="w-full aspect-video bg-neutral-900 border-4 border-dashed border-neutral-600 flex flex-col items-center justify-center relative overflow-hidden group">
                                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgdmlld0JveD0iMCAwIDQwIDQwIj48cGF0aCBkPSJNMCAwbDQwIDQwbS00MCAwaDQwbTAgMGwtNDAtNDBtMCAwaDQwdjQwSDB6IiBzdHJva2U9IiMzMzMiIHN0cm9rZS13aWR0aD0iMSIgZmlsbD0ibm9uZSIvPjwvc3ZnPg==')] opacity-20"></div>
                                    <span className="text-white font-black text-6xl md:text-8xl tracking-tighter opacity-10 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 group-hover:scale-110 transition-transform duration-500">PROJECT_A</span>
                                    <span className="text-white font-black text-2xl z-10 bg-black px-4 py-2 border-2 border-white">SYS_01_DESTRUCT</span>
                                </div>
                                <div className="w-full aspect-video bg-neutral-900 border-4 border-dashed border-neutral-600 flex flex-col items-center justify-center relative overflow-hidden group">
                                    <div className="absolute inset-0 bg-gradient-to-br from-transparent to-neutral-800 opacity-50"></div>
                                    <div className="w-32 h-32 border-[12px] border-neutral-700 rounded-full flex items-center justify-center group-hover:rotate-90 transition-transform duration-700">
                                        <div className="w-16 h-16 bg-neutral-500"></div>
                                    </div>
                                    <span className="text-white font-black text-2xl z-10 bg-black px-4 py-2 border-2 border-white absolute bottom-8 right-8">SYS_02_BUILD</span>
                                </div>
                            </div>
                        </section>

                        <section id="bru-hit" className="py-24 border-t-[6px] border-white bg-white text-black mt-12 -mx-6 px-6 relative overflow-hidden">
                            <div className="absolute -right-10 top-0 text-[150px] md:text-[200px] leading-none font-black text-white pointer-events-none select-none">!?</div>
                            <h2 className="text-5xl md:text-[5rem] leading-none font-black mb-12 tracking-tighter relative z-10 break-words">TRANSMIT<br />DATA</h2>

                            <form className="flex flex-col gap-8 relative z-10 max-w-md w-full" onClick={(e) => e.preventDefault()}>
                                <div className="flex flex-col">
                                    <label className="font-bold text-lg mb-2 flex justify-between">
                                        SUBJECT
                                        <span className="text-white font-normal">[REQ]</span>
                                    </label>
                                    <input type="text" className="bg-transparent border-b-4 border-black text-xl py-2 font-black focus:outline-none focus:border-neutral-500 transition-colors uppercase placeholder:text-white text-black w-full" placeholder="IDENTIFY YOURSELF" />
                                </div>
                                <div className="flex flex-col">
                                    <label className="font-bold text-lg mb-2 flex justify-between">
                                        PAYLOAD
                                        <span className="text-white font-normal">[TXT]</span>
                                    </label>
                                    <textarea className="bg-transparent border-4 border-black p-4 text-lg font-black min-h-[150px] focus:outline-none focus:bg-neutral-100 transition-colors resize-none uppercase placeholder:text-white text-black w-full" placeholder="ENTER DIRECTIVE"></textarea>
                                </div>
                                <button className="self-start text-lg md:text-xl font-black bg-black text-white px-8 py-4 hover:bg-neutral-800 hover:scale-105 transition-all w-full sm:w-auto mt-4">EXECUTE // SEND</button>
                            </form>
                        </section>
                    </main>
                </div>
            );
        case 'neon':
            return (
                <div className="w-full h-full bg-[#0A0B10] text-[#E2E8F0] flex flex-col overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden scroll-smooth relative font-sans">
                    {/* Background glows */}
                    <div className="fixed top-[-20%] right-[-10%] w-[400px] h-[400px] md:w-[600px] md:h-[600px] bg-[#3B82F6] rounded-full blur-[100px] md:blur-[150px] opacity-[0.08] pointer-events-none" />
                    <div className="fixed bottom-[-20%] left-[-10%] w-[300px] h-[300px] md:w-[500px] md:h-[500px] bg-[#8B5CF6] rounded-full blur-[80px] md:blur-[120px] opacity-[0.08] pointer-events-none" />

                    <header className="sticky top-0 w-full z-50 px-6 md:px-8 py-4 md:py-6 flex flex-col sm:flex-row justify-between items-center sm:items-center gap-4 sm:gap-0 bg-[#0A0B10]/80 backdrop-blur-xl border-b border-white/5">
                        <div className="flex items-center gap-3">
                            <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-gradient-to-br from-[#3B82F6] to-[#8B5CF6] flex items-center justify-center p-[1px]">
                                <div className="w-full h-full bg-[#0A0B10] rounded-[7px] flex items-center justify-center">
                                    <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-[#3B82F6] shadow-[0_0_10px_#3B82F6]" />
                                </div>
                            </div>
                            <span className="font-bold tracking-wide text-white text-sm md:text-base">Prism OS</span>
                        </div>
                        <div className="flex gap-4 md:gap-6 text-[10px] md:text-xs font-semibold text-[#94A3B8]">
                            <button onClick={() => scrollPreview('n2-feat')} className="hover:text-white transition-colors">Features</button>
                            <button onClick={() => scrollPreview('n2-sys')} className="hover:text-white transition-colors">Systems</button>
                        </div>
                    </header>

                    <main className="flex-grow pt-16 md:pt-24 px-6 md:px-8 pb-24 md:pb-32">
                        <section className="min-h-[350px] md:min-h-[400px] flex flex-col items-center justify-center text-center">
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-full border border-white/10 bg-white/[0.02] backdrop-blur-sm mb-6 md:mb-8 text-[10px] md:text-xs font-medium text-[#A78BFA]">
                                <span className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-[#A78BFA] animate-pulse" />
                                v2.4 Now Available
                            </div>
                            <h1 className="text-4xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-[#A78BFA] tracking-tight mb-4 md:mb-6">
                                Dark glassmorphism.<br className="hidden md:block" />Sleek precision.
                            </h1>
                            <p className="text-[#94A3B8] max-w-lg mx-auto leading-relaxed mb-8 md:mb-10 text-xs md:text-sm">
                                Elevate your interface with subtle translucent surfaces, ultra-thin borders, and deep, saturated glowing accents that feel incredibly premium.
                            </p>
                            <button className="px-6 py-3 md:px-8 md:py-4 rounded-xl bg-white text-black font-bold text-xs md:text-sm tracking-wide hover:scale-105 transition-transform shadow-[0_0_30px_rgba(255,255,255,0.15)]">
                                Initialize Interface
                            </button>
                        </section>

                        <section id="n2-feat" className="mt-32 w-full max-w-4xl mx-auto">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-8 backdrop-blur-md hover:bg-white/[0.04] hover:border-white/10 transition-all">
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#3B82F6]/20 to-[#8B5CF6]/20 flex items-center justify-center border border-white/10 mb-6">
                                        <svg className="w-6 h-6 text-[#60A5FA]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-2">Translucent Surfaces</h3>
                                    <p className="text-sm text-[#94A3B8] leading-relaxed">Multiple layers of frosted glass effects create depth without sacrificing contrast or readability.</p>
                                </div>
                                <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-8 backdrop-blur-md hover:bg-white/[0.04] hover:border-white/10 transition-all relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#8B5CF6] rounded-full blur-[80px] opacity-20" />
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#8B5CF6]/20 to-[#EC4899]/20 flex items-center justify-center border border-white/10 mb-6 relative z-10">
                                        <svg className="w-6 h-6 text-[#C084FC]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-2 relative z-10">Neon Typographic Accents</h3>
                                    <p className="text-sm text-[#94A3B8] leading-relaxed relative z-10">Subtle gradients applied to text headers provide a futuristic, highly polished aesthetic.</p>
                                </div>
                            </div>
                        </section>

                        <section id="n2-sys" className="mt-32 text-center flex flex-col items-center">
                            <h2 className="text-2xl font-bold text-white mb-8">Access Secure Terminal</h2>
                            <div className="w-full max-w-md bg-[#0F111A] border border-white/10 rounded-2xl p-2 flex items-center shadow-2xl shadow-black/50">
                                <input type="password" placeholder="Enter override key..." className="flex-grow bg-transparent px-4 py-3 text-sm focus:outline-none text-white placeholder-[#475569] font-mono tracking-widest" />
                                <button className="bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6] text-white px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-wider hover:opacity-90 transition-opacity whitespace-nowrap">
                                    Grant
                                </button>
                            </div>
                        </section>
                    </main>
                </div>
            );
        case 'corporate':
            return (
                <div className="w-full h-full bg-slate-50 text-slate-800 p-0 flex flex-col font-sans select-none overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden scroll-smooth relative">
                    <header className="bg-white/95 backdrop-blur shadow-sm px-4 md:px-8 py-3 md:py-5 flex flex-wrap justify-between items-center w-full z-50 sticky top-0 gap-3 md:gap-0">
                        <div className="flex items-center gap-2">
                            <div className="w-5 h-5 md:w-7 md:h-7 bg-blue-600 rounded-lg flex items-center justify-center">
                                <div className="w-2 h-2 md:w-3 md:h-3 bg-white rounded-sm" />
                            </div>
                            <span className="font-bold text-base md:text-xl tracking-tight text-slate-900">NexusTrust</span>
                        </div>
                        <div className="flex gap-3 md:gap-8 text-[10px] md:text-sm font-medium text-slate-600 order-last md:order-none w-full md:w-auto justify-center">
                            <button onClick={() => { setActivePage('home'); setTimeout(() => scrollPreview('corp-plat'), 100); }} className="hover:text-blue-600 transition-colors cursor-pointer">Platform</button>
                            <button onClick={() => { setActivePage('home'); setTimeout(() => scrollPreview('corp-sol'), 100); }} className="hover:text-blue-600 transition-colors cursor-pointer">Solutions</button>
                            <button onClick={() => { setActivePage('home'); setTimeout(() => scrollPreview('corp-pri'), 100); }} className="hover:text-blue-600 transition-colors cursor-pointer">Pricing</button>
                        </div>
                        <button onClick={() => setActivePage('sales')} className="px-3 md:px-5 py-2 md:py-2.5 bg-blue-600 text-white rounded-lg font-medium shadow-md shadow-blue-600/20 hover:bg-blue-700 transition-colors text-xs md:text-sm shrink-0">Book Demo</button>
                    </header>
                    <main className="flex-grow flex flex-col relative">
                        <div className="absolute right-0 top-0 w-[300px] h-[300px] md:w-[400px] md:h-[400px] bg-gradient-to-tr from-blue-100 to-indigo-50 rounded-full blur-3xl -z-10" />

                        <AnimatePresence mode="wait">
                            {activePage === 'home' ? (
                                <motion.div
                                    key="home"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <section id="corp-hero" className="px-6 md:px-12 py-16 md:py-24 min-h-[400px] md:min-h-[450px] flex flex-col justify-center">
                                        <div className="inline-block px-3 py-1 bg-blue-100 text-blue-700 font-semibold text-[10px] md:text-xs rounded-full mb-4 md:mb-6 w-max">NEW: Enterprise Scale</div>
                                        <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 mb-4 md:mb-6 tracking-tight max-w-lg leading-[1.15]">Secure logic for modern teams.</h1>
                                        <p className="text-sm md:text-lg text-slate-500 mb-8 md:mb-10 max-w-md leading-relaxed">Scalable, compliant, and deeply intuitive. Designed to maximize your operational efficiency gracefully.</p>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md">
                                            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-3 hover:shadow-md transition-shadow">
                                                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                                                </div>
                                                <div>
                                                    <div className="font-bold text-sm text-slate-900 mb-1">Analytics</div>
                                                    <div className="text-xs text-slate-500 leading-relaxed">Real-time data at infinite scale.</div>
                                                </div>
                                            </div>
                                            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-3 hover:shadow-md transition-shadow">
                                                <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                                                </div>
                                                <div>
                                                    <div className="font-bold text-sm text-slate-900 mb-1">Security</div>
                                                    <div className="text-xs text-slate-500 leading-relaxed">Bank-grade encryption by default.</div>
                                                </div>
                                            </div>
                                        </div>
                                    </section>

                                    <section id="corp-plat" className="px-8 md:px-12 py-24 bg-white border-y border-slate-200 text-center">
                                        <h2 className="text-3xl font-bold text-slate-900 mb-6 tracking-tight">One unified platform</h2>
                                        <p className="text-slate-500 max-w-2xl mx-auto mb-16 leading-relaxed text-sm md:text-base">Replace multiple disjointed tools with a single source of truth. NexusTrust seamlessly connects your operations.</p>
                                        <div className="w-full h-48 md:h-64 bg-slate-100 rounded-2xl border border-slate-200 shadow-inner flex items-center justify-center text-slate-400">Dashboard UI Mockup</div>
                                    </section>

                                    <section id="corp-sol" className="px-8 md:px-12 py-24 text-center">
                                        <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-12 tracking-tight">Trusted by Industry Leaders</h2>
                                        <div className="flex flex-wrap justify-center gap-8 md:gap-12 opacity-50 grayscale font-black text-xl md:text-2xl">
                                            <span>ACME Corp</span>
                                            <span>Globex</span>
                                            <span>Initech</span>
                                        </div>
                                    </section>

                                    <section id="corp-pri" className="px-8 md:px-12 py-24 bg-slate-900 text-white flex justify-center">
                                        <div className="max-w-3xl w-full text-center">
                                            <h2 className="text-2xl md:text-3xl font-bold mb-6">Simple, transparent pricing</h2>
                                            <p className="text-slate-400 mb-12 text-sm md:text-base">No hidden fees. Scale as you grow.</p>
                                            <div className="bg-slate-800 p-8 rounded-2xl border border-slate-700">
                                                <div className="text-slate-400 font-bold mb-2 uppercase tracking-wide text-xs">Enterprise Plan</div>
                                                <div className="text-4xl md:text-5xl font-extrabold mb-6">$999<span className="text-base md:text-lg text-slate-500 font-medium">/mo</span></div>
                                                <button onClick={() => setActivePage('sales')} className="w-full py-4 bg-blue-600 rounded-lg font-bold hover:bg-blue-500 transition-colors">Start Free Trial</button>
                                            </div>
                                        </div>
                                    </section>

                                    <section id="corp-dem" className="px-8 md:px-12 py-24 bg-blue-600 text-white text-center">
                                        <h2 className="text-3xl md:text-4xl font-extrabold mb-6 tracking-tight">Ready to transform?</h2>
                                        <p className="text-blue-100 mb-10 max-w-xl mx-auto text-base md:text-lg">Join thousands of organizations using NexusTrust to secure their future.</p>
                                        <button onClick={() => setActivePage('sales')} className="px-6 md:px-8 py-3 md:py-4 bg-white text-blue-900 rounded-lg font-bold shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all text-sm md:text-base">Contact Sales Today</button>
                                    </section>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="sales"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    transition={{ duration: 0.3 }}
                                    className="px-8 md:px-12 py-16 flex flex-col md:flex-row gap-12 max-w-5xl mx-auto w-full"
                                >
                                    <div className="flex-1">
                                        <button onClick={() => setActivePage('home')} className="text-blue-600 font-semibold text-sm mb-8 flex items-center gap-2 hover:text-blue-800 transition-colors">
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                                            Back to Home
                                        </button>
                                        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-6 tracking-tight leading-[1.15]">Contact our Sales Team</h1>
                                        <p className="text-slate-500 mb-10 leading-relaxed">Fill out the form and a NexusTrust representative will be in touch within 24 hours to discuss your organizational needs.</p>

                                        <div className="space-y-6">
                                            <div className="flex items-center gap-4 text-slate-700">
                                                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                                </div>
                                                <div>
                                                    <div className="font-bold">Enterprise Solutions</div>
                                                    <div className="text-sm text-slate-500">Custom tailored architecture scaling.</div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4 text-slate-700">
                                                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                                                </div>
                                                <div>
                                                    <div className="font-bold">24/7 Priority Support</div>
                                                    <div className="text-sm text-slate-500">Direct lines to engineering staff.</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex-1 bg-white p-8 rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/50">
                                        <form className="flex flex-col gap-5" onClick={(e) => e.preventDefault()}>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="flex flex-col gap-1.5">
                                                    <label className="text-sm font-semibold text-slate-700">First Name</label>
                                                    <input type="text" className="border border-slate-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm" placeholder="John" />
                                                </div>
                                                <div className="flex flex-col gap-1.5">
                                                    <label className="text-sm font-semibold text-slate-700">Last Name</label>
                                                    <input type="text" className="border border-slate-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm" placeholder="Doe" />
                                                </div>
                                            </div>
                                            <div className="flex flex-col gap-1.5">
                                                <label className="text-sm font-semibold text-slate-700">Work Email</label>
                                                <input type="email" className="border border-slate-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm" placeholder="john@company.com" />
                                            </div>
                                            <div className="flex flex-col gap-1.5">
                                                <label className="text-sm font-semibold text-slate-700">Company Name</label>
                                                <input type="text" className="border border-slate-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm" placeholder="Acme Inc." />
                                            </div>
                                            <div className="flex flex-col gap-1.5">
                                                <label className="text-sm font-semibold text-slate-700">How can we help?</label>
                                                <textarea className="border border-slate-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm resize-none h-24" placeholder="Tell us about your goals..."></textarea>
                                            </div>
                                            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-lg transition-colors mt-2 shadow-md shadow-blue-600/20">Submit Request</button>
                                            <p className="text-[10px] text-slate-400 text-center mt-2">By submitting you agree to our terms of service.</p>
                                        </form>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </main>
                    <footer className="bg-slate-950 text-slate-500 py-10 px-8 md:px-12 text-xs md:text-sm text-center">
                        © 2026 NexusTrust Corporation. All rights reserved.
                    </footer>
                </div>
            );
        default:
            return (
                <div className="w-full h-full flex flex-col items-center justify-center p-8 bg-neutral-950/80 text-center font-sans overflow-hidden">
                    <svg className="w-12 h-12 text-white mb-6 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M5 13l4 4L19 7" />
                    </svg>
                    <h3 className="text-sm font-bold text-white tracking-widest uppercase mb-4">Atmosphere Locked In</h3>
                    <p className="text-white text-xs leading-relaxed max-w-sm">
                        Live previews are currently disabled for extended layout combinations and custom prompts. Your specific vision will be applied during the final build phase.
                    </p>
                </div>
            );
    }
}

// ------------------------------------------------------------------
// Step 3: The Engine (Features Selection)
// ------------------------------------------------------------------

function EngineStep({ values, onChange, onValid }: { values: string[], onChange: (v: string[]) => void, onValid: () => void }) {
    const mainEngines = [
        {
            id: 'ecommerce',
            title: 'Sell Products & Services (E-Commerce)',
            desc: 'A complete digital storefront with secure checkout, inventory management, and seamless payment gateways.',
            icon: '🛍️',
            subFeatures: [
                { id: 'ec_subscriptions', title: 'Recurring Subscriptions', desc: 'Allow users to subscribe for monthly deliveries or access.' },
                { id: 'ec_digital', title: 'Digital Downloads', desc: 'Secure links for selling PDFs, courses, or digital art.' },
                { id: 'ec_reviews', title: 'Customer Reviews', desc: 'Integrated product ratings and photo reviews.' }
            ]
        },
        {
            id: 'service',
            title: 'Capture Leads & Bookings',
            desc: 'Streamlined funnels to convert visitors into clients, featuring interactive calendars and automated scheduling.',
            icon: '📅',
            subFeatures: [
                { id: 'sv_deposits', title: 'Upfront Deposits', desc: 'Collect partial payments at the time of booking.' },
                { id: 'sv_crm', title: 'CRM Integration', desc: 'Automatically pipe new leads into Salesforce, Hubspot, etc.' },
                { id: 'sv_quotes', title: 'Dynamic Quoting', desc: 'Interactive forms that estimate costs based on user inputs.' }
            ]
        },
        {
            id: 'content',
            title: 'Publish High-Volume Content',
            desc: 'Powerful CMS architecture for blogs, news outlets, or magazines. Built for SEO and rapid publishing.',
            icon: '📰',
            subFeatures: [
                { id: 'ct_paywall', title: 'Premium Paywall', desc: 'Gate specific articles behind a paid subscription or login.' },
                { id: 'ct_newsletter', title: 'Newsletter Sync', desc: 'Automated email collection and campaign syncing.' },
                { id: 'ct_authors', title: 'Author Profiles', desc: 'Dedicated pages for writers showcasing their article history.' }
            ]
        },
        {
            id: 'portfolio',
            title: 'Showcase Creative Portfolios',
            desc: 'Immersive, visually-driven galleries and case studies designed to highlight your absolute best work.',
            icon: '🎨',
            subFeatures: [
                { id: 'pt_video', title: 'Cinematic Video Headers', desc: 'Optimized autoplaying background videos for high impact.' },
                { id: 'pt_lightbox', title: 'Advanced Lightbox', desc: 'Full-screen, swipeable image viewing for desktop and mobile.' },
                { id: 'pt_case', title: 'Deep Case Studies', desc: 'Structured layouts for explaining the "why" behind the work.' }
            ]
        },
        {
            id: 'community',
            title: 'Build a Social Community',
            desc: 'Interactive platforms featuring user profiles, discussion forums, or gated membership areas.',
            icon: '👥',
            subFeatures: [
                { id: 'cm_messaging', title: 'Direct Messaging', desc: 'Private peer-to-peer chat between community members.' },
                { id: 'cm_forums', title: 'Discussion Forums', desc: 'Threaded conversations with moderation tools.' },
                { id: 'cm_gamify', title: 'Gamification Badge System', desc: 'Reward active users with points and distinct visual ranks.' }
            ]
        },
        {
            id: 'brochure',
            title: 'Establish Digital Presence',
            desc: 'A fast, striking, and highly optimized informational site designed to build trust and authority.',
            icon: '📄',
            subFeatures: [
                { id: 'br_animations', title: 'Premium Micro-interactions', desc: 'Subtle scroll animations that make the brand feel expensive.' },
                { id: 'br_locations', title: 'Multi-Location Mapping', desc: 'Interactive maps for franchises or multiple office spaces.' },
                { id: 'br_team', title: 'Interactive Rosters', desc: 'Sleek team member directories with modal bios.' }
            ]
        }
    ];

    const toggleEngine = (id: string, e: React.MouseEvent) => {
        // Prevent clicking the main card from instantly closing if clicking a sub-feature
        const target = e.target as HTMLElement;
        if (target.closest('.sub-feature-btn')) return;

        if (values.includes(id)) {
            // Unselecting the main engine also removes its sub-features
            const engine = mainEngines.find(eng => eng.id === id);
            const subIdsToRemove = engine ? engine.subFeatures.map(sf => sf.id) : [];
            onChange(values.filter(v => v !== id && !subIdsToRemove.includes(v)));
        } else {
            onChange([...values, id]);
        }
    };

    const [showAdditional, setShowAdditional] = useState(false);

    const additionalEngines = [
        { id: 'web_app', title: 'Web Application (SaaS)', desc: 'Complex logic, user dashboards, and data processing.', icon: '⚙️' },
        { id: 'directory', title: 'Directory / Listing', desc: 'Searchable databases with map integrations and multiple profile types.', icon: '🗺️' },
        { id: 'portal', title: 'Internal Portal', desc: 'Secure backend platform for document management and team workflows.', icon: '🔐' },
        { id: 'event', title: 'Event Management', desc: 'Ticketing, interactive itineraries, and speaker profiles.', icon: '🎪' }
    ];

    const toggleSubFeature = (subId: string) => {
        if (values.includes(subId)) {
            onChange(values.filter(v => v !== subId));
        } else {
            onChange([...values, subId]);
        }
    };

    return (
        <div className="w-full max-w-5xl flex flex-col items-center relative gap-16 pointer-events-auto h-auto px-4 pb-4">

            <div className="w-full flex flex-col gap-10">

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full items-start">
                    {mainEngines.map((engine) => {
                        const isSelected = values.includes(engine.id);
                        return (
                            <div
                                key={engine.id}
                                className={`rounded-2xl border transition-all duration-300 relative overflow-hidden flex flex-col group ${isSelected
                                    ? 'border-white bg-white/5'
                                    : 'border-neutral-800 bg-transparent hover:border-neutral-600 hover:bg-neutral-900/20'
                                    }`}
                            >
                                <button
                                    onClick={(e) => toggleEngine(engine.id, e)}
                                    className="text-left p-6 md:p-8 w-full focus:outline-none relative flex flex-col gap-6"
                                >
                                    <div className="flex justify-between items-start w-full">
                                        <div className="text-3xl md:text-4xl opacity-80 group-hover:opacity-100 transition-opacity">{engine.icon}</div>
                                        {/* Selection Indicator */}
                                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${isSelected ? 'border-white bg-white' : 'border-neutral-700 bg-transparent'
                                            }`}>
                                            {isSelected && <svg className="w-3 h-3 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-2 relative z-10 w-full pr-4">
                                        <h2 className={`text-xl font-medium tracking-tight transition-colors ${isSelected ? 'text-white' : 'text-white'}`}>{engine.title}</h2>
                                        <p className={`text-sm leading-relaxed transition-colors ${isSelected ? 'text-white' : 'text-white'}`}>{engine.desc}</p>
                                    </div>

                                </button>

                                <AnimatePresence>
                                    {isSelected && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.3, ease: 'easeOut' }}
                                            className="overflow-hidden border-t border-neutral-800/50 bg-neutral-950/30"
                                        >
                                            <div className="p-6 md:p-8 flex flex-col gap-5">
                                                <h3 className="text-[10px] font-medium text-white uppercase tracking-[0.2em] mb-1">Optional Add-ons</h3>
                                                <div className="flex flex-col gap-2">
                                                    {engine.subFeatures.map((sub) => {
                                                        const isSubSelected = values.includes(sub.id);
                                                        return (
                                                            <button
                                                                key={sub.id}
                                                                onClick={() => toggleSubFeature(sub.id)}
                                                                className={`sub-feature-btn text-left py-3 px-4 rounded-lg flex items-center justify-between gap-4 transition-colors ${isSubSelected
                                                                    ? 'bg-white/10 text-white'
                                                                    : 'bg-transparent text-white hover:bg-neutral-900/50 hover:text-white'
                                                                    }`}
                                                            >
                                                                <div className="flex flex-col gap-1">
                                                                    <div className="text-sm font-medium">{sub.title}</div>
                                                                    <div className="text-xs opacity-60 leading-relaxed font-light">{sub.desc}</div>
                                                                </div>
                                                                <div className={`shrink-0 w-4 h-4 rounded-sm border flex items-center justify-center transition-colors ${isSubSelected ? 'border-white bg-white' : 'border-neutral-700 bg-transparent'
                                                                    }`}>
                                                                    {isSubSelected && <svg className="w-3 h-3 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>}
                                                                </div>
                                                            </button>
                                                        )
                                                    })}
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                            </div>
                        );
                    })}
                </div>

                <div className="flex flex-col items-center w-full mt-4">
                    <button
                        onClick={() => setShowAdditional(!showAdditional)}
                        className="flex items-center gap-2 py-3 text-white hover:text-white transition-colors text-xs font-medium tracking-widest uppercase group"
                    >
                        <span>More specific objectives</span>
                        <svg className={`w-3 h-3 transform transition-transform duration-300 ${showAdditional ? 'rotate-180' : 'rotate-0'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>

                    <AnimatePresence>
                        {showAdditional && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.3, ease: 'easeOut' }}
                                className="w-full overflow-hidden mt-6"
                            >
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                                    {additionalEngines.map((engine) => {
                                        const isSelected = values.includes(engine.id);
                                        return (
                                            <button
                                                key={engine.id}
                                                onClick={() => toggleEngine(engine.id, { target: document.createElement('div') } as any)} // Fake event to bypass sub-feature check
                                                className={`text-left p-6 rounded-2xl border transition-all duration-300 flex items-center justify-between gap-4 group ${isSelected
                                                    ? 'border-white bg-white/5'
                                                    : 'border-neutral-800 bg-transparent hover:border-neutral-700 hover:bg-neutral-900/20'
                                                    }`}
                                            >
                                                <div className="flex items-center gap-5">
                                                    <div className="text-2xl shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">{engine.icon}</div>
                                                    <div className="flex-grow">
                                                        <h3 className={`text-base font-medium transition-colors ${isSelected ? 'text-white' : 'text-white'}`}>{engine.title}</h3>
                                                        <p className={`text-xs mt-1 transition-colors ${isSelected ? 'text-white' : 'text-white'}`}>{engine.desc}</p>
                                                    </div>
                                                </div>
                                                <div className={`shrink-0 w-4 h-4 rounded-full border flex items-center justify-center transition-all ${isSelected ? 'border-white bg-white' : 'border-neutral-700 bg-transparent'
                                                    }`}>
                                                    {isSelected && <svg className="w-3 h-3 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                                <div className="mt-4 w-full">
                                    <textarea
                                        placeholder="Need something else? Describe any other specific objectives or engines here..."
                                        className="w-full bg-neutral-900/40 border border-neutral-800 rounded-2xl p-5 text-sm md:text-base text-white placeholder:text-white focus:outline-none focus:border-neutral-500 transition-colors resize-none"
                                        rows={3}
                                        value={values.find(v => v.startsWith('custom:'))?.replace('custom:', '') || ''}
                                        onChange={(e) => {
                                            const newText = e.target.value;
                                            const otherValues = values.filter(v => !v.startsWith('custom:'));
                                            if (newText.trim() === '') {
                                                onChange(otherValues);
                                            } else {
                                                onChange([...otherValues, `custom:${newText}`]);
                                            }
                                        }}
                                    />
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div >

            <AnimatePresence>
                {values.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="fixed bottom-12 left-1/2 -translate-x-1/2 z-[60]"
                    >
                        <button
                            onClick={onValid}
                            className="px-10 py-4 bg-white text-black rounded-full font-bold hover:scale-105 transition-transform tracking-widest uppercase text-sm pointer-events-auto shadow-[0_0_50px_rgba(255,255,255,0.3)] flex items-center gap-3"
                        >
                            CONFIRM ENGINES
                            <span className="bg-black text-white px-2.5 py-1 rounded-full text-xs">
                                {values.filter(v => mainEngines.some(e => e.id === v) || additionalEngines.some(e => e.id === v)).length} CORE
                            </span>
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div >
    );
}

// ------------------------------------------------------------------
// Step 4: The Crowd (Audience Selection & Input)
// ------------------------------------------------------------------

function CrowdStep({ value, onChange, onValid }: { value: string, onChange: (v: string) => void, onValid: () => void }) {
    const predefinedTags = [
        "Creatives & Designers", "Corporate Executives", "Gen-Z Consumers",
        "Tech Enthusiasts", "Local Community", "High-Net-Worth Individuals",
        "Small Business Owners", "E-commerce Shoppers", "Healthcare Professionals",
        "Real Estate Investors", "Fitness Enthusiasts", "Remote Workers"
    ];

    const currentTags = value.split(',').map(t => t.trim()).filter(t => t.length > 0);

    const toggleTag = (tag: string) => {
        let newTags;
        if (currentTags.includes(tag)) {
            newTags = currentTags.filter(t => t !== tag);
        } else {
            newTags = [...currentTags, tag];
        }
        onChange(newTags.join(', '));
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        // We only want the input to manage the "custom" part, but for simplicity here 
        // we'll let it manage the whole string, or just let users type freely.
        onChange(e.target.value);
    };

    return (
        <div className="w-full max-w-2xl flex flex-col items-center relative gap-8 pointer-events-auto">

            {/* Visual: Blurred abstract shapes representing a crowd */}
            <div className="absolute inset-0 -z-10 overflow-hidden rounded-full opacity-20 blur-3xl mix-blend-screen pointer-events-none">
                <motion.div
                    animate={{ rotate: 360, scale: [1, 1.2, 1] }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="absolute top-0 left-10 w-64 h-64 bg-blue-600 rounded-full mix-blend-screen"
                />
                <motion.div
                    animate={{ rotate: -360, scale: [1, 1.5, 1] }}
                    transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                    className="absolute bottom-0 right-10 w-64 h-64 bg-purple-600 rounded-full mix-blend-screen"
                />
            </div>

            <div className="w-full relative">
                <label className="text-sm font-mono text-white mb-4 block text-center uppercase tracking-widest">
                    Describe your ideal user
                </label>
                <input
                    type="text"
                    value={value}
                    onChange={handleInputChange}
                    placeholder="e.g. Forward-thinking innovators looking for..."
                    className="w-full bg-neutral-900/50 border border-neutral-700 rounded-2xl px-6 py-5 text-xl text-white placeholder:text-white focus:outline-none focus:border-white focus:bg-neutral-900 transition-colors backdrop-blur-sm"
                />
            </div>

            <div className="w-full mt-4">
                <p className="text-sm font-mono text-white mb-4 text-center uppercase tracking-widest">
                    Or select common groups:
                </p>
                <div className="flex flex-wrap justify-center gap-3">
                    {predefinedTags.map(tag => {
                        const isActive = currentTags.includes(tag);
                        return (
                            <button
                                key={tag}
                                onClick={() => toggleTag(tag)}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 border ${isActive
                                    ? 'bg-white text-black border-white shadow-[0_0_15px_rgba(255,255,255,0.4)]'
                                    : 'bg-transparent text-white border-neutral-700 hover:border-neutral-400 hover:text-white'
                                    }`}
                            >
                                {isActive && <span className="mr-2">✓</span>}
                                {tag}
                            </button>
                        )
                    })}
                </div>
            </div>

            <AnimatePresence>
                {value.trim().length > 3 && (
                    <motion.button
                        initial={{ opacity: 0, scale: 0.9, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: -10 }}
                        onClick={onValid}
                        className="mt-8 px-10 py-4 bg-white text-black rounded-full font-bold hover:scale-105 transition-transform tracking-wider text-sm pointer-events-auto shadow-[0_0_40px_rgba(255,255,255,0.2)]"
                    >
                        CONFIRM AUDIENCE
                    </motion.button>
                )}
            </AnimatePresence>
        </div>
    );
}

// ------------------------------------------------------------------
// Step 5: The Voice (Tone Selection)
// ------------------------------------------------------------------

function VoiceStep({ value, onChange, onValid }: { value: number, onChange: (v: number) => void, onValid: () => void }) {
    // value ranges from 0 (Formal/Classic) to 100 (Playful/Modern)

    // Generate equalizer bars
    const [bars] = useState(() => Array.from({ length: 15 }, () => Math.random()));

    // The closer to 100, the more erratic/bouncy the animation.
    // The closer to 0, the more uniform and slow.
    const bounceFactor = value / 100;

    return (
        <div className="w-full max-w-2xl flex flex-col items-center relative gap-12 pointer-events-auto">

            {/* Visual Equalizer */}
            <div className="flex items-end justify-center gap-2 h-32 w-full">
                {bars.map((baseHeight, i) => {
                    // Create dynamic heights based on the slider value
                    const minHeight = 20 + (1 - bounceFactor) * 40; // Formal = taller baseline
                    const variance = bounceFactor * 60; // Playful = more variance

                    return (
                        <motion.div
                            key={i}
                            animate={{
                                height: [
                                    `${minHeight + (Math.random() * variance)}%`,
                                    `${minHeight + (Math.random() * variance)}%`,
                                    `${minHeight + (Math.random() * variance)}%`
                                ],
                                backgroundColor: [
                                    value < 30 ? '#3b82f6' : value < 70 ? '#a855f7' : '#ec4899',
                                    value < 30 ? '#2563eb' : value < 70 ? '#9333ea' : '#db2777'
                                ]
                            }}
                            transition={{
                                duration: 1.5 - (bounceFactor * 1), // Faster when playful
                                repeat: Infinity,
                                repeatType: 'reverse',
                                ease: "easeInOut"
                            }}
                            className="w-3 md:w-4 rounded-t-sm"
                        />
                    );
                })}
            </div>

            {/* Slider Controls */}
            <div className="w-full flex flex-col items-center gap-6">
                <input
                    type="range"
                    min="0"
                    max="100"
                    value={value}
                    onChange={(e) => onChange(parseInt(e.target.value))}
                    className="w-full h-2 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-white"
                />

                <div className="w-full flex justify-between text-sm font-mono uppercase tracking-widest text-white">
                    <span className={value < 30 ? "text-blue-400 font-bold" : ""}>Formal / Classic</span>
                    <span className={value >= 30 && value <= 70 ? "text-purple-400 font-bold" : ""}>Balanced</span>
                    <span className={value > 70 ? "text-pink-400 font-bold" : ""}>Playful / Modern</span>
                </div>
            </div>

            <motion.button
                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                onClick={onValid}
                className="mt-4 px-10 py-4 bg-white text-black rounded-full font-bold hover:scale-105 transition-transform tracking-wider text-sm pointer-events-auto"
            >
                CONFIRM BRAND VOICE
            </motion.button>
        </div>
    );
}

// ------------------------------------------------------------------
// Step 6: The Horizon (Timeline Selection)
// ------------------------------------------------------------------

function HorizonStep({ value, onChange, onValid }: { value: string, onChange: (v: string) => void, onValid: () => void }) {
    const timelines = [
        { id: 'asap', label: 'As Soon As Possible', desc: 'Accelerated process. Give us the core, fast.' },
        { id: '1week', label: '1 Week', desc: 'Standard turnaround for a polished, tailored experience.' },
        { id: '1month', label: '1 Month+', desc: 'Complex build. Custom integrations and deep architecture.' },
    ];

    return (
        <div className="w-full max-w-3xl flex flex-col items-center relative gap-12 pointer-events-auto">

            {/* Visual Timeline Graphic */}
            <div className="relative w-full h-32 flex items-center justify-center mb-8">
                {/* Base line */}
                <div className="absolute top-1/2 left-0 right-0 h-px bg-neutral-800 -translate-y-1/2" />

                {/* Points */}
                <div className="w-full flex justify-between relative z-10 px-8">
                    {timelines.map((tl, idx) => {
                        const isSelected = value === tl.id;
                        const isPast = timelines.findIndex(t => t.id === value) >= idx;

                        return (
                            <div key={tl.id} className="flex flex-col items-center gap-4">
                                <motion.div
                                    className={`w-4 h-4 rounded-full transition-colors duration-500 ${isSelected ? 'bg-orange-500 shadow-[0_0_20px_rgba(249,115,22,0.8)]'
                                        : isPast ? 'bg-white' : 'bg-neutral-800'
                                        }`}
                                    animate={isSelected ? { scale: [1, 1.3, 1] } : { scale: 1 }}
                                    transition={{ repeat: isSelected ? Infinity : 0, duration: 2 }}
                                />
                            </div>
                        );
                    })}
                </div>

                {/* Progress Line */}
                {value && (
                    <motion.div
                        className="absolute top-1/2 left-0 h-[2px] bg-gradient-to-r from-white to-orange-500 -translate-y-1/2 origin-left"
                        initial={{ scaleX: 0 }}
                        animate={{
                            scaleX: value === 'asap' ? 0.33 : value === '1month' ? 0.66 : 1
                        }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                    />
                )}
            </div>

            {/* Selection Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
                {timelines.map((tl) => {
                    const isSelected = value === tl.id;
                    return (
                        <button
                            key={tl.id}
                            onClick={() => onChange(tl.id)}
                            className={`relative flex flex-col items-center text-center p-6 rounded-2xl border transition-all duration-300 ${isSelected
                                ? 'border-orange-500 bg-neutral-900/50 scale-105 shadow-[0_0_30px_rgba(249,115,22,0.1)]'
                                : 'border-neutral-800 bg-neutral-950/40 hover:border-neutral-700 hover:bg-neutral-900/60'
                                }`}
                        >
                            <h3 className={`text-xl font-bold mb-3 transition-colors ${isSelected ? 'text-white' : 'text-white'}`}>
                                {tl.label}
                            </h3>
                            <p className="text-sm text-white leading-relaxed">
                                {tl.desc}
                            </p>

                            {isSelected && (
                                <motion.div
                                    layoutId="horizon-glow"
                                    className="absolute inset-0 border border-orange-500/50 rounded-2xl pointer-events-none mix-blend-screen"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                />
                            )}
                        </button>
                    )
                })}
            </div>

            <AnimatePresence>
                {value && (
                    <motion.button
                        initial={{ opacity: 0, scale: 0.9, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: -10 }}
                        onClick={onValid}
                        className="mt-8 px-10 py-4 bg-white text-black rounded-full font-bold hover:scale-105 transition-transform tracking-wider text-sm pointer-events-auto shadow-[0_0_40px_rgba(255,255,255,0.2)]"
                    >
                        CONFIRM TIMELINE
                    </motion.button>
                )}
            </AnimatePresence>
        </div>
    );
}

// ------------------------------------------------------------------
// Step 7: Final Details (Additional Information)
// ------------------------------------------------------------------

function DetailsStep({ value, onChange, onValid }: { value: string, onChange: (v: string) => void, onValid: () => void }) {
    return (
        <div className="w-full max-w-3xl flex flex-col items-center relative gap-8 pointer-events-auto">
            <div className="w-full relative">
                <label className="text-sm font-mono text-white mb-4 block text-center uppercase tracking-widest">
                    Optional
                </label>
                <textarea
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder="Any extra context, dreams, absolute dealbreakers, or links to references..."
                    className="w-full h-48 bg-neutral-900/50 border border-neutral-700 rounded-2xl px-6 py-5 text-xl text-white placeholder:text-white focus:outline-none focus:border-white focus:bg-neutral-900 transition-colors backdrop-blur-sm resize-none text-center flex items-center justify-center"
                />
            </div>
        </div>
    );
}

// ------------------------------------------------------------------
// Build Progress Screen (shown after form completion)
// ------------------------------------------------------------------

const BUILD_STAGES = [
    { id: 'analyzing', label: 'Analyzing Vision', desc: 'Parsing goals and brand identity...' },
    { id: 'designing', label: 'Designing Architecture', desc: 'Structuring pages and components...' },
    { id: 'generating', label: 'Generating Style System', desc: 'Applying palette, typography & motion...' },
    { id: 'assembling', label: 'Assembling Modules', desc: 'Connecting features and interactions...' },
    { id: 'qa', label: 'Quality Assurance', desc: 'Running performance & accessibility checks...' },
    { id: 'deploying', label: 'Preparing Delivery', desc: 'Packaging your unique build...' },
];

const VOICE_LABELS: Record<number, string> = {
    0: 'Formal & Corporate',
    25: 'Professional',
    50: 'Balanced',
    75: 'Casual & Bold',
    100: 'Wild & Edgy',
};

function getVoiceLabel(v: number) {
    const closest = [0, 25, 50, 75, 100].reduce((a, b) => Math.abs(b - v) < Math.abs(a - v) ? b : a);
    return VOICE_LABELS[closest];
}

function BuildProgressScreen({ formData, onCancel }: { formData: StepData; onCancel: () => void }) {
    const [activeStageIndex, setActiveStageIndex] = useState(0);
    const [showCancelConfirm, setShowCancelConfirm] = useState(false);

    // Cycle through stages automatically
    useEffect(() => {
        if (activeStageIndex >= BUILD_STAGES.length - 1) return;
        const timer = setTimeout(() => {
            setActiveStageIndex(prev => prev + 1);
        }, 2800);
        return () => clearTimeout(timer);
    }, [activeStageIndex]);

    const progress = ((activeStageIndex + 1) / BUILD_STAGES.length) * 100;

    const summaryRows = [
        { label: 'Vision', value: formData.vision || '—' },
        { label: 'Aesthetic', value: formData.aesthetic ? formData.aesthetic.replace('custom:', 'Custom: ') : '—' },
        { label: 'Features', value: formData.features.length > 0 ? formData.features.join(', ') : '—' },
        { label: 'Target Audience', value: formData.audience || '—' },
        { label: 'Brand Voice', value: getVoiceLabel(formData.voice) },
        { label: 'Timeline', value: formData.timeline || '—' },
        { label: 'Extra Details', value: formData.additionalInfo || 'None provided' },
    ];

    return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-start pt-24 pb-20 px-4 md:px-8 relative overflow-y-auto">

            {/* Logo */}
            <a href="/" className="absolute top-8 left-8 font-extrabold text-xl tracking-tighter text-white z-50 hover:opacity-70 transition-opacity mix-blend-difference">
                Number1
            </a>

            {/* Ambient glow */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-orange-500/5 blur-[120px]" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="w-full max-w-4xl z-10 flex flex-col gap-12"
            >
                {/* Header */}
                <div className="text-center">
                    <p className="text-xs font-mono uppercase tracking-[0.4em] text-orange-500 mb-3">Build Initiated</p>
                    <h1 className="text-4xl md:text-6xl font-bold tracking-tighter font-syne">Crafting Your Vision</h1>
                    <p className="text-neutral-400 mt-4 text-sm max-w-md mx-auto">
                        Our AI is now building your site. You can monitor progress below.
                    </p>
                </div>

                {/* Progress Bar */}
                <div className="w-full flex flex-col gap-3">
                    <div className="flex justify-between text-xs font-mono text-neutral-500">
                        <span>BUILD PROGRESS</span>
                        <span>{Math.round(progress)}%</span>
                    </div>
                    <div className="w-full h-[3px] bg-neutral-900 rounded-full overflow-hidden">
                        <motion.div
                            className="h-full bg-gradient-to-r from-orange-600 to-orange-400 rounded-full"
                            initial={{ width: '0%' }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 0.8, ease: 'easeInOut' }}
                        />
                    </div>
                </div>

                {/* Build Stages */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {BUILD_STAGES.map((stage, i) => {
                        const isDone = i < activeStageIndex;
                        const isActive = i === activeStageIndex;
                        return (
                            <motion.div
                                key={stage.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1, duration: 0.4 }}
                                className={`flex items-start gap-4 p-4 rounded-2xl border transition-all duration-500 ${isActive
                                        ? 'border-orange-500/60 bg-orange-500/5 shadow-[0_0_20px_rgba(249,115,22,0.08)]'
                                        : isDone
                                            ? 'border-neutral-800 bg-neutral-900/30'
                                            : 'border-neutral-900 bg-transparent opacity-40'
                                    }`}
                            >
                                {/* Icon */}
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 transition-all duration-500 ${isDone ? 'bg-green-500/20 border border-green-500/40' :
                                        isActive ? 'bg-orange-500/20 border border-orange-500/50' :
                                            'bg-neutral-900 border border-neutral-800'
                                    }`}>
                                    {isDone ? (
                                        <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    ) : isActive ? (
                                        <motion.div
                                            className="w-2 h-2 rounded-full bg-orange-400"
                                            animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
                                            transition={{ repeat: Infinity, duration: 1.2 }}
                                        />
                                    ) : (
                                        <div className="w-2 h-2 rounded-full bg-neutral-700" />
                                    )}
                                </div>

                                {/* Label */}
                                <div className="min-w-0">
                                    <p className={`font-semibold text-sm ${isDone ? 'text-neutral-400 line-through decoration-neutral-600' : isActive ? 'text-white' : 'text-neutral-600'}`}>
                                        {stage.label}
                                    </p>
                                    {isActive && (
                                        <motion.p
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="text-xs text-orange-400/80 mt-0.5 font-mono"
                                        >
                                            {stage.desc}
                                        </motion.p>
                                    )}
                                    {isDone && (
                                        <p className="text-xs text-green-500/60 mt-0.5 font-mono">Complete</p>
                                    )}
                                </div>
                            </motion.div>
                        );
                    })}
                </div>

                {/* Summary Table */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.6 }}
                    className="w-full"
                >
                    <h2 className="text-xs font-mono uppercase tracking-[0.35em] text-neutral-500 mb-4">Brief Summary</h2>
                    <div className="border border-neutral-800 rounded-2xl overflow-hidden">
                        {summaryRows.map((row, i) => (
                            <div
                                key={row.label}
                                className={`flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-6 px-5 py-4 ${i !== summaryRows.length - 1 ? 'border-b border-neutral-900' : ''
                                    } ${i % 2 === 0 ? 'bg-neutral-950/80' : 'bg-black'}`}
                            >
                                <span className="text-xs font-mono uppercase tracking-widest text-neutral-500 sm:w-36 flex-shrink-0 pt-0.5">
                                    {row.label}
                                </span>
                                <span className="text-sm text-neutral-200 leading-relaxed line-clamp-3">
                                    {row.value}
                                </span>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Cancel Build Button */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="flex flex-col items-center gap-4 mt-4"
                >
                    {!showCancelConfirm ? (
                        <button
                            id="cancel-build-btn"
                            onClick={() => setShowCancelConfirm(true)}
                            className="px-8 py-3 rounded-full border border-red-900/60 text-red-500 text-sm font-mono uppercase tracking-widest hover:bg-red-950/40 hover:border-red-700 transition-all duration-300 hover:shadow-[0_0_20px_rgba(239,68,68,0.1)]"
                        >
                            Cancel Build
                        </button>
                    ) : (
                        <AnimatePresence>
                            <motion.div
                                key="confirm"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0 }}
                                className="flex flex-col items-center gap-4 p-6 rounded-2xl border border-red-900/60 bg-red-950/20 text-center max-w-sm"
                            >
                                <p className="text-sm text-red-300 font-mono">
                                    Are you sure? This will discard your entire brief and the build process.
                                </p>
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setShowCancelConfirm(false)}
                                        className="px-6 py-2 rounded-full border border-neutral-700 text-neutral-300 text-sm hover:border-neutral-500 transition-colors"
                                    >
                                        Keep Building
                                    </button>
                                    <button
                                        id="confirm-cancel-build-btn"
                                        onClick={onCancel}
                                        className="px-6 py-2 rounded-full bg-red-600 text-white text-sm font-bold hover:bg-red-500 transition-colors shadow-[0_0_20px_rgba(239,68,68,0.3)]"
                                    >
                                        Yes, Cancel
                                    </button>
                                </div>
                            </motion.div>
                        </AnimatePresence>
                    )}
                    <p className="text-xs text-neutral-700 font-mono">
                        STAGE {activeStageIndex + 1} OF {BUILD_STAGES.length}
                    </p>
                </motion.div>

            </motion.div>
        </div>
    );
}
