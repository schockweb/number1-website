"use client";

import React, { useRef, useState } from 'react';
import Link from 'next/link';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { useTranslation } from '@/lib/useTranslation';

const STAT_KEYS = [
    { value: '24/7', labelKey: 'stat.availability' },
    { value: '99%', labelKey: 'stat.accuracy' },
    { value: '10×', labelKey: 'stat.faster' },
    { value: '0', labelKey: 'stat.sickDays' },
];

const WORKFLOW_KEYS = [
    { step: '01', titleKey: 'workflow.01', descKey: 'workflow.01Desc' },
    { step: '02', titleKey: 'workflow.02', descKey: 'workflow.02Desc' },
    { step: '03', titleKey: 'workflow.03', descKey: 'workflow.03Desc' },
    { step: '04', titleKey: 'workflow.04', descKey: 'workflow.04Desc' },
];

export function AIServicesLanding() {
    const heroRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
    const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
    const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
    const [activeStep, setActiveStep] = useState(0);
    const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
    const { t } = useTranslation();

    return (
        <div className="relative text-foreground">

            {/* ── BACKGROUND ── */}
            <div className="fixed inset-0 -z-20 pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[80vw] h-[80vw] bg-indigo-600/20 rounded-full blur-[160px] animate-pulse" style={{ animationDuration: '10s' }} />
                <div className="absolute bottom-[-20%] right-[-10%] w-[70vw] h-[70vw] bg-violet-600/20 rounded-full blur-[160px] animate-pulse" style={{ animationDuration: '14s' }} />
                <div className="absolute top-[40%] left-[30%] w-[60vw] h-[60vw] bg-fuchsia-600/10 rounded-full blur-[180px] animate-pulse" style={{ animationDuration: '18s' }} />
            </div>

            {/* ── HERO ── */}
            <div ref={heroRef} className="relative min-h-screen flex flex-col items-center justify-center px-6 text-center">
                <motion.div
                    style={{ y: heroY, opacity: heroOpacity }}
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                    className="max-w-5xl mx-auto"
                >
                    <h1 className="text-5xl sm:text-6xl md:text-8xl font-syne font-semibold tracking-tight leading-[1.05] text-white mb-6">
                        {t('employee.heroTitle1')}<br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-violet-400 to-fuchsia-400">
                            {t('employee.heroTitle2')}
                        </span>
                    </h1>
                    <p className="text-lg md:text-xl text-white/60 max-w-2xl mx-auto leading-relaxed mb-10">
                        {t('employee.heroDesc')}
                    </p>
                </motion.div>
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.5 }}
                    className="hidden md:flex absolute bottom-8 left-1/2 -translate-x-1/2 flex-col items-center gap-2 text-white/30"
                >
                    <span className="text-[10px] font-mono tracking-widest uppercase">{t('employee.scroll')}</span>
                    <motion.div animate={{ y: [0, 6, 0] }} transition={{ repeat: Infinity, duration: 1.5 }} className="w-px h-8 bg-gradient-to-b from-white/30 to-transparent" />
                </motion.div>
            </div>

            {/* ── STATS BAR ── */}
            <div className="border-y border-white/[0.06] bg-white/[0.02] backdrop-blur-sm py-8 px-6">
                <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-0 md:divide-x divide-white/10">
                    {STAT_KEYS.map((s, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1, duration: 0.6 }}
                            viewport={{ once: true }}
                            className="text-center md:px-8"
                        >
                            <div className="text-3xl md:text-4xl font-syne font-bold text-white mb-1">{s.value}</div>
                            <div className="text-xs text-white/40 uppercase tracking-widest font-mono">{t(s.labelKey)}</div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* ── PLANS TABLE ── */}
            <div className="max-w-6xl mx-auto px-6 py-24 md:py-36">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <span className="text-xs font-mono tracking-[0.25em] text-white/40 uppercase block mb-4">Our Products</span>
                    <h2 className="text-4xl md:text-5xl font-syne font-semibold text-white tracking-tight">
                        One employee.<br />Three power levels.
                    </h2>
                    <p className="text-white/50 mt-4 text-lg max-w-xl mx-auto">Choose the Number1 Employee product that matches your ambition.</p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    {/* Standard */}
                    <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: 0, duration: 0.6 }} viewport={{ once: true }} className="relative flex flex-col rounded-3xl border border-white/[0.08] bg-white/[0.03] p-8 overflow-hidden">
                        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                        <div className="mb-6">
                            <h3 className="text-2xl font-syne font-bold text-white mb-3">Number1 Employee</h3>
                            <p className="text-white/50 text-sm leading-relaxed">The essential autonomous layer for growing teams that want to move faster.</p>
                        </div>
                        <ul className="space-y-3 flex-1 mb-8">
                            {['Customer inquiry automation', '24/7 availability', 'Basic competitor monitoring', 'Weekly performance reports', 'Email outreach (500/mo)', '1 brand voice profile'].map((f) => (
                                <li key={f} className="flex items-start gap-3 text-sm text-white/70">
                                    <svg className="w-4 h-4 text-indigo-400 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                    {f}
                                </li>
                            ))}
                        </ul>
                        <a href="/pricing" className="block w-full text-center px-6 py-3.5 rounded-full border border-white/20 text-white/80 text-sm font-semibold hover:bg-white/10 hover:border-white/40 transition-all duration-300">Learn More</a>
                    </motion.div>

                    {/* Premium */}
                    <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.6 }} viewport={{ once: true }} className="relative flex flex-col rounded-3xl border border-indigo-500/50 bg-gradient-to-b from-indigo-600/10 to-violet-600/5 p-8 overflow-hidden shadow-[0_0_60px_-20px_rgba(99,102,241,0.4)] scale-[1.02]">
                        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-400/80 to-transparent" />
                        <div className="absolute top-5 right-5 bg-gradient-to-r from-indigo-500 to-violet-500 text-white text-[10px] font-bold font-mono tracking-widest uppercase px-3 py-1 rounded-full shadow-lg">Most Popular</div>
                        <div className="mb-6">
                            <h3 className="text-2xl font-syne font-bold text-white mb-3">Premium Number1 Employee</h3>
                            <p className="text-white/60 text-sm leading-relaxed">Full autonomy mode. Your AI runs end-to-end revenue operations without interruption.</p>
                        </div>
                        <ul className="space-y-3 flex-1 mb-8">
                            {['Everything in Standard', 'Real-time competitor intelligence', 'Predictive lead scoring & CRM sync', 'SEO content generation (unlimited)', 'Personalised outreach (5,000/mo)', 'Multi-channel campaign execution', '3 brand voice profiles', 'Daily performance insights'].map((f) => (
                                <li key={f} className="flex items-start gap-3 text-sm text-white/80">
                                    <svg className="w-4 h-4 text-violet-400 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                    {f}
                                </li>
                            ))}
                        </ul>
                        <a href="/pricing" className="block w-full text-center px-6 py-3.5 rounded-full bg-white text-black text-sm font-bold uppercase tracking-widest hover:bg-white/90 transition-all duration-300 shadow-xl shadow-white/10 hover:scale-[1.02]">Learn More</a>
                    </motion.div>

                    {/* Business */}
                    <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.6 }} viewport={{ once: true }} className="relative flex flex-col rounded-3xl border border-white/[0.08] bg-white/[0.03] p-8 overflow-hidden">
                        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-fuchsia-400/30 to-transparent" />
                        <div className="mb-6">
                            <h3 className="text-2xl font-syne font-bold text-white mb-3">Number1 Business</h3>
                            <p className="text-white/50 text-sm leading-relaxed">Enterprise-grade deployment with dedicated infrastructure, SLAs and onboarding.</p>
                        </div>
                        <ul className="space-y-3 flex-1 mb-8">
                            {['Everything in Premium', 'Dedicated AI instance', 'Custom integrations & API access', 'Unlimited outreach & contacts', 'White-label reporting dashboard', 'Dedicated account manager', 'Custom SLAs & uptime guarantees', 'Priority model training on your data'].map((f) => (
                                <li key={f} className="flex items-start gap-3 text-sm text-white/70">
                                    <svg className="w-4 h-4 text-fuchsia-400 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                    {f}
                                </li>
                            ))}
                        </ul>
                        <a href="/pricing" className="block w-full text-center px-6 py-3.5 rounded-full border border-fuchsia-500/40 text-fuchsia-300/80 text-sm font-semibold hover:bg-fuchsia-500/10 hover:border-fuchsia-500/70 transition-all duration-300">Learn More</a>
                    </motion.div>
                </div>
            </div>

            {/* ── HOW IT WORKS ── */}
            <div className="border-t border-white/[0.06] py-24 md:py-36 px-6">
                <div className="max-w-5xl mx-auto">
                    <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} viewport={{ once: true }} className="text-center mb-16">
                        <span className="text-xs font-mono tracking-[0.25em] text-white/40 uppercase block mb-4">{t('employee.howItWorksLabel')}</span>
                        <h2 className="text-4xl md:text-5xl font-syne font-semibold text-white tracking-tight">
                            {t('employee.howItWorksTitle1')}<br />{t('employee.howItWorksTitle2')}
                        </h2>
                    </motion.div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-12">
                        {WORKFLOW_KEYS.map((w, i) => (
                            <button key={i} onClick={() => setActiveStep(i)} className={`p-4 rounded-2xl border text-left transition-all duration-300 ${activeStep === i ? 'bg-white text-black border-white shadow-2xl shadow-white/10' : 'bg-white/[0.03] border-white/[0.07] text-white/50 hover:bg-white/[0.06]'}`}>
                                <div className={`text-xs font-mono tracking-widest uppercase mb-2 ${activeStep === i ? 'text-black/40' : 'text-white/30'}`}>{w.step}</div>
                                <div className="font-semibold text-sm">{t(w.titleKey)}</div>
                            </button>
                        ))}
                    </div>
                    <AnimatePresence mode="wait">
                        <motion.div key={activeStep} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.4 }} className="rounded-3xl border border-white/[0.07] bg-white/[0.03] p-8 md:p-12">
                            <div className="flex items-start gap-6">
                                <div className="shrink-0 w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-syne font-bold text-xl shadow-lg">{WORKFLOW_KEYS[activeStep].step}</div>
                                <div>
                                    <h3 className="text-2xl md:text-3xl font-syne font-semibold text-white mb-3">{t(WORKFLOW_KEYS[activeStep].titleKey)}</h3>
                                    <p className="text-white/60 text-lg leading-relaxed">{t(WORKFLOW_KEYS[activeStep].descKey)}</p>
                                </div>
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>

            {/* ── CTA ── */}
            <div className="px-6 pb-24">
                <div className="max-w-4xl mx-auto">
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8 }} viewport={{ once: true }} className="relative overflow-hidden rounded-[3rem] p-12 md:p-20 text-center">
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 -z-10" />
                        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.15),transparent_60%)] -z-10" />
                        <div className="absolute inset-0 opacity-[0.08] -z-10" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.5) 1px,transparent 1px)', backgroundSize: '48px 48px' }} />
                        <h2 className="text-4xl md:text-6xl font-syne font-semibold text-white tracking-tight mb-5">
                            {t('employee.ctaTitle1')}<br />{t('employee.ctaTitle2')}
                        </h2>
                        <p className="text-white/70 text-lg mb-10 max-w-xl mx-auto">{t('employee.ctaDesc')}</p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link href="/get-started" className="px-10 py-5 bg-white text-black rounded-full font-bold text-sm tracking-widest uppercase hover:bg-white/90 transition-all shadow-2xl hover:scale-105">
                                Get Started
                            </Link>
                            <button onClick={() => setIsDemoModalOpen(true)} className="px-10 py-5 bg-white/10 text-white border border-white/30 rounded-full font-bold text-sm tracking-widest uppercase hover:bg-white/20 transition-all hover:scale-105">
                                Get Competitor Report
                            </button>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* ── DEMO MODAL ── */}
            <AnimatePresence>
                {isDemoModalOpen && (
                    <DemoModal onClose={() => setIsDemoModalOpen(false)} t={t} />
                )}
            </AnimatePresence>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────

function DemoModal({ onClose, t }: { onClose: () => void, t: (key: string) => string }) {
    const [competitor, setCompetitor] = useState('');
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [errorMsg, setErrorMsg] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!competitor.trim() || !email.trim()) return;
        setStatus('loading');
        setErrorMsg('');

        const instructions =
            typeof window !== 'undefined'
                ? localStorage.getItem('competitor-report-instructions') || undefined
                : undefined;

        try {
            const res = await fetch('/api/competitor-report', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ competitor, email, instructions }),
            });
            const data = await res.json();
            if (!res.ok || data.error) {
                setErrorMsg(data.error || 'Something went wrong. Please try again.');
                setStatus('error');
            } else {
                setStatus('success');
            }
        } catch {
            setErrorMsg('Network error. Please check your connection and try again.');
            setStatus('error');
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={status === 'loading' ? undefined : onClose}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative w-full max-w-md bg-[#0F111A] border border-white/10 rounded-3xl overflow-hidden shadow-2xl"
            >
                <div className="absolute inset-x-0 -top-40 h-80 bg-gradient-to-br from-indigo-500/20 to-fuchsia-500/20 blur-[80px] pointer-events-none" />

                {status !== 'loading' && (
                    <button onClick={onClose} className="absolute top-5 right-5 p-2 text-white/40 hover:text-white hover:bg-white/10 rounded-full transition-colors z-10">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                )}

                <div className="relative z-10 p-8 md:p-10">
                    <AnimatePresence mode="wait">

                        {/* FORM */}
                        {status === 'idle' && (
                            <motion.div key="form" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-fuchsia-500/20 flex items-center justify-center mx-auto mb-6">
                                    <svg className="w-7 h-7 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </div>
                                <h3 className="text-2xl font-syne font-semibold text-white mb-2 text-center">Competitor Analysis</h3>
                                <p className="text-white/50 text-sm text-center mb-8 leading-relaxed">
                                    Enter your competitor&apos;s name and your email. Our AI will analyse them and email you a full intelligence report.
                                </p>
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div>
                                        <label className="text-[10px] font-mono font-bold tracking-widest text-white/40 uppercase block mb-2">Competitor Name</label>
                                        <input required type="text" value={competitor} onChange={(e) => setCompetitor(e.target.value)}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-white placeholder-white/20 text-sm"
                                            placeholder="e.g. Acme Corp" autoFocus />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-mono font-bold tracking-widest text-white/40 uppercase block mb-2">Your Email</label>
                                        <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-white placeholder-white/20 text-sm"
                                            placeholder="you@company.com" />
                                    </div>
                                    <button type="submit" className="w-full bg-white text-black hover:bg-white/90 font-bold py-4 rounded-xl transition-all shadow-lg hover:scale-[1.02] mt-2">
                                        Send My Report
                                    </button>
                                </form>
                            </motion.div>
                        )}

                        {/* LOADING */}
                        {status === 'loading' && (
                            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center py-8">
                                <div className="w-16 h-16 rounded-full border-2 border-indigo-500/30 border-t-indigo-500 animate-spin mx-auto mb-6" />
                                <h3 className="text-xl font-syne font-semibold text-white mb-2">Analysing {competitor}…</h3>
                                <p className="text-white/40 text-sm">Our AI is generating your intelligence report. This takes about 15–20 seconds.</p>
                                <div className="mt-6 space-y-2">
                                    {['Researching brand positioning…', 'Mapping key offerings…', 'Identifying weaknesses & gaps…', 'Compiling recommendations…'].map((step, i) => (
                                        <motion.p key={step} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 4 }}
                                            className="text-xs text-indigo-400/70 font-mono flex items-center gap-2 justify-center">
                                            <span className="w-1 h-1 rounded-full bg-indigo-400 inline-block" />
                                            {step}
                                        </motion.p>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {/* SUCCESS */}
                        {status === 'success' && (
                            <motion.div key="success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-4">
                                <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-6">
                                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                </div>
                                <h3 className="text-2xl font-syne font-bold text-white mb-3">Report sent! 🎉</h3>
                                <p className="text-white/50 text-sm leading-relaxed max-w-xs mx-auto">
                                    Your AI-generated competitor intelligence report for <strong className="text-white">{competitor}</strong> has been sent to <strong className="text-white">{email}</strong>. Check your inbox.
                                </p>
                                <button onClick={onClose} className="mt-8 px-8 py-3 bg-white/10 text-white rounded-full text-sm font-semibold hover:bg-white/20 transition-all">
                                    Close
                                </button>
                            </motion.div>
                        )}

                        {/* ERROR */}
                        {status === 'error' && (
                            <motion.div key="error" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-4">
                                <div className="w-16 h-16 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center mx-auto mb-6">
                                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                </div>
                                <h3 className="text-xl font-syne font-bold text-white mb-2">Something went wrong</h3>
                                <p className="text-white/50 text-sm mb-6">{errorMsg}</p>
                                <button onClick={() => setStatus('idle')} className="px-8 py-3 bg-white/10 text-white rounded-full text-sm font-semibold hover:bg-white/20 transition-all">
                                    Try Again
                                </button>
                            </motion.div>
                        )}

                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    );
}
