"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

interface ClientData {
    id: string;
    name: string;
    email: string;
    companyName: string;
    planTier: string;
    onboardingStatus: string;
    createdAt: string;
    onboarding?: {
        industry?: string;
        website?: string;
        brandPersonality?: string;
        primaryGoal?: string;
        crmTool?: string;
        inventoryTool?: string;
        communicationTools?: string;
    };
    reports?: {
        id: string;
        competitor: string;
        createdAt: string;
    }[];
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; dot: string }> = {
    pending:    { label: 'Awaiting Setup',   color: 'text-amber-400',   bg: 'bg-amber-400/10 border-amber-400/30',   dot: 'bg-amber-400' },
    onboarded:  { label: 'Brief Received',   color: 'text-blue-400',    bg: 'bg-blue-400/10 border-blue-400/30',     dot: 'bg-blue-400' },
    active:     { label: 'AI Active',        color: 'text-emerald-400', bg: 'bg-emerald-400/10 border-emerald-400/30', dot: 'bg-emerald-400' },
    paused:     { label: 'Paused',           color: 'text-white/40',    bg: 'bg-white/5 border-white/10',             dot: 'bg-white/40' },
};

export default function ClientDashboard() {
    const { token } = useParams<{ token: string }>();
    const [client, setClient] = useState<ClientData | null>(null);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);
    const [reportModal, setReportModal] = useState(false);
    const [competitor, setCompetitor] = useState('');
    const [reportStatus, setReportStatus] = useState<'idle' | 'loading' | 'done'>('idle');

    useEffect(() => {
        fetch(`/api/dashboard/${token}`)
            .then((r) => r.json())
            .then((d) => {
                if (d.error) { setNotFound(true); }
                else { setClient(d); }
            })
            .catch(() => setNotFound(true))
            .finally(() => setLoading(false));
    }, [token]);

    const requestReport = async () => {
        if (!competitor.trim() || !client) return;
        setReportStatus('loading');
        await fetch('/api/competitor-report', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ competitor, email: client.email, clientId: client.id }),
        });
        setReportStatus('done');
        setTimeout(() => { setReportModal(false); setReportStatus('idle'); setCompetitor(''); }, 2500);
    };

    if (loading) return (
        <div className="min-h-screen bg-[#080810] flex items-center justify-center">
            <div className="w-10 h-10 rounded-full border-2 border-indigo-500/30 border-t-indigo-500 animate-spin" />
        </div>
    );

    if (notFound) return (
        <div className="min-h-screen bg-[#080810] flex items-center justify-center text-center px-6">
            <div>
                <div className="text-6xl mb-6">🔒</div>
                <h1 className="text-2xl font-syne font-bold text-white mb-3">Dashboard Not Found</h1>
                <p className="text-white/40 mb-8">This link may have expired or is invalid.</p>
                <Link href="/get-started" className="px-6 py-3 bg-indigo-600 text-white rounded-full text-sm font-semibold hover:bg-indigo-500 transition-colors">
                    Start Onboarding
                </Link>
            </div>
        </div>
    );

    if (!client) return null;

    const statusCfg = STATUS_CONFIG[client.onboardingStatus] || STATUS_CONFIG.pending;
    const isActive = client.onboardingStatus === 'active';

    return (
        <div className="min-h-screen bg-[#080810] text-white">
            <div className="fixed inset-0 pointer-events-none -z-10">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80vw] h-[50vh] bg-indigo-600/10 rounded-full blur-[160px]" />
            </div>

            {/* Header */}
            <header className="border-b border-white/[0.06] px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold font-syne text-sm">N1</div>
                    <span className="text-sm font-semibold text-white/70">Number1 Employee</span>
                </div>
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold ${statusCfg.bg} ${statusCfg.color}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot} animate-pulse`} />
                    {statusCfg.label}
                </div>
            </header>

            <div className="max-w-4xl mx-auto px-6 py-10 space-y-6">
                {/* Welcome */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <h1 className="text-3xl md:text-4xl font-syne font-bold text-white mb-1">
                        Welcome, {client.name.split(' ')[0]} 👋
                    </h1>
                    <p className="text-white/40">{client.companyName} · {client.email}</p>
                </motion.div>

                {/* Status card */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                    className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6">
                    <div className="flex items-start gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${isActive ? 'bg-emerald-500/20' : 'bg-amber-500/10'}`}>
                            {isActive ? '✅' : '⏳'}
                        </div>
                        <div className="flex-1">
                            <h2 className="font-syne font-semibold text-white text-lg mb-1">
                                {isActive ? 'Your AI is live and running' : 'Your brief has been received'}
                            </h2>
                            <p className="text-white/45 text-sm leading-relaxed">
                                {isActive
                                    ? 'Your Number1 Employee AI is configured with your brand voice, goals, and competitive intelligence. Use the tools below to generate reports and more.'
                                    : 'Our team is reviewing your business brief and configuring your AI setup. You\'ll receive an email once your AI is live — typically within 24–48 hours.'}
                            </p>
                        </div>
                    </div>
                    {!isActive && (
                        <div className="mt-5 grid grid-cols-4 gap-3">
                            {[
                                ['Brief submitted', true],
                                ['Team reviewing', client.onboardingStatus !== 'pending'],
                                ['AI configuring', client.onboardingStatus === 'active'],
                                ['AI live', client.onboardingStatus === 'active'],
                            ].map(([label, done], i) => (
                                <div key={i} className={`p-3 rounded-xl border text-center text-xs ${done ? 'border-indigo-500/40 bg-indigo-500/10 text-indigo-300' : 'border-white/10 bg-white/[0.02] text-white/30'}`}>
                                    <span className="block text-lg mb-1">{done ? '✓' : '○'}</span>
                                    {label as string}
                                </div>
                            ))}
                        </div>
                    )}
                </motion.div>

                {/* Your Profile Summary */}
                {client.onboarding && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
                        className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6">
                        <h2 className="font-syne font-semibold text-white mb-4">Your Business Profile</h2>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {[
                                ['Industry', client.onboarding.industry],
                                ['Brand Voice', client.onboarding.brandPersonality],
                                ['Primary Goal', client.onboarding.primaryGoal],
                                ['CRM', client.onboarding.crmTool],
                                ['Inventory', client.onboarding.inventoryTool],
                                ['Channels', client.onboarding.communicationTools],
                            ].filter(([, v]) => v).map(([label, value]) => (
                                <div key={label as string} className="bg-white/[0.03] rounded-xl p-3 border border-white/[0.06]">
                                    <div className="text-[10px] font-mono tracking-widest text-white/30 uppercase mb-1">{label as string}</div>
                                    <div className="text-sm text-white/80 font-medium">{value as string}</div>
                                </div>
                            ))}
                        </div>
                        <Link href="/get-started" className="mt-4 inline-flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
                            Update profile →
                        </Link>
                    </motion.div>
                )}

                {/* Competitor Reports */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                    className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6">
                    <div className="flex items-center justify-between mb-5">
                        <h2 className="font-syne font-semibold text-white">Competitor Reports</h2>
                        <button onClick={() => setReportModal(true)}
                            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-full transition-colors">
                            + Request Report
                        </button>
                    </div>
                    {client.reports && client.reports.length > 0 ? (
                        <div className="space-y-2">
                            {client.reports.map((r) => (
                                <div key={r.id} className="flex items-center justify-between p-3 rounded-xl border border-white/[0.06] bg-white/[0.02]">
                                    <div className="flex items-center gap-3">
                                        <span className="text-lg">🔍</span>
                                        <div>
                                            <div className="text-sm font-semibold text-white">{r.competitor}</div>
                                            <div className="text-xs text-white/30">{new Date(r.createdAt).toLocaleDateString()}</div>
                                        </div>
                                    </div>
                                    <span className="text-xs text-emerald-400 font-semibold">Sent to email</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-10 text-white/25 text-sm">
                            <div className="text-3xl mb-3">📊</div>
                            No reports yet. Request your first competitor analysis above.
                        </div>
                    )}
                </motion.div>

                {/* Need help */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
                    className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 text-center">
                    <p className="text-white/40 text-sm">Questions about your setup?</p>
                    <a href="mailto:schockweb@gmail.com" className="text-indigo-400 hover:text-indigo-300 text-sm font-semibold transition-colors">
                        Contact the Number1 team →
                    </a>
                </motion.div>
            </div>

            {/* Report modal */}
            <AnimatePresence>
                {reportModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setReportModal(false)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
                        <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
                            className="relative w-full max-w-sm bg-[#0F111A] border border-white/10 rounded-3xl p-8 shadow-2xl">
                            <h3 className="font-syne font-bold text-white text-xl mb-2">Request Analysis</h3>
                            <p className="text-white/40 text-sm mb-6">Enter a competitor name and we&apos;ll email you a full AI report.</p>
                            {reportStatus === 'done' ? (
                                <div className="text-center py-4">
                                    <div className="text-4xl mb-3">✅</div>
                                    <p className="text-white font-semibold">Report requested!</p>
                                    <p className="text-white/40 text-sm mt-1">Check your email in ~20 seconds.</p>
                                </div>
                            ) : (
                                <>
                                    <input type="text" value={competitor} onChange={(e) => setCompetitor(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-white/20 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all mb-4"
                                        placeholder="e.g. Acme Corp" autoFocus />
                                    <button onClick={requestReport} disabled={reportStatus === 'loading' || !competitor.trim()}
                                        className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3.5 rounded-xl transition-all disabled:opacity-40 flex items-center justify-center gap-2">
                                        {reportStatus === 'loading' ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Generating…</> : 'Request Report'}
                                    </button>
                                </>
                            )}
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
