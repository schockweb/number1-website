"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

/* ─── Types ───────────────────────────────────────────────────────────────── */

interface Onboarding {
    industry?: string; website?: string; description?: string;
    clientType?: string; targetMarket?: string; geography?: string; painPoints?: string;
    brandPersonality?: string; communicationStyle?: string; brandValues?: string; avoidWords?: string;
    competitors?: string; advantage?: string;
    crmTool?: string; inventoryTool?: string; emailMarketing?: string;
    ecommercePlatform?: string; communicationTools?: string; bookingTool?: string;
    dataStorage?: string; hasDocuments?: string; documentTypes?: string;
    aiCanAccess?: string; monthlySalesVolume?: string; staffCount?: string; existingAutomations?: string;
    primaryGoal?: string; automationPriority?: string; biggestChallenge?: string;
    contactPhone?: string;
}

interface Subscription {
    id: string; planTier: string; priceChfCents: number; maxAgents: number;
    status: string; currentPeriodStart: string; currentPeriodEnd: string;
    refundEligibleUntil: string; cancelledAt?: string;
}

interface AgentRule {
    id: string; agentTierId: number; customPromptText: string; status: string;
}

interface Report { id: string; competitor: string; createdAt: string; }

interface ClientData {
    id: string; name: string; email: string; companyName: string;
    planTier: string; onboardingStatus: string; createdAt: string;
    onboarding?: Onboarding; subscription?: Subscription;
    agentRules?: AgentRule[]; reports?: Report[];
}

type Tab = 'overview' | 'subscription' | 'ai' | 'profile' | 'reports' | 'settings';

/* ─── Constants ───────────────────────────────────────────────────────────── */

const TABS: { id: Tab; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'subscription', label: 'Subscription' },
    { id: 'ai', label: 'AI Instructions' },
    { id: 'profile', label: 'Business Profile' },
    { id: 'reports', label: 'Reports' },
    { id: 'settings', label: 'Settings' },
];

const STATUS_CFG: Record<string, { label: string; cls: string; dot: string }> = {
    pending:   { label: 'Awaiting Setup', cls: 'text-amber-400 bg-amber-400/10 border-amber-400/30', dot: 'bg-amber-400' },
    onboarded: { label: 'Brief Received', cls: 'text-blue-400 bg-blue-400/10 border-blue-400/30', dot: 'bg-blue-400' },
    active:    { label: 'AI Active',      cls: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30', dot: 'bg-emerald-400' },
    paused:    { label: 'Paused',         cls: 'text-white/40 bg-white/5 border-white/10', dot: 'bg-white/40' },
};

const AGENTS: Record<number, { name: string; desc: string }> = {
    1: { name: 'Lead Generator', desc: 'Captures qualified leads' },
    2: { name: 'Customer Support', desc: 'Handles inquiries' },
    3: { name: 'Content Writer', desc: 'Creates marketing content' },
    4: { name: 'Social Media Manager', desc: 'Manages social channels' },
    5: { name: 'Email Marketer', desc: 'Runs email campaigns' },
    6: { name: 'SEO Analyst', desc: 'Optimises search rankings' },
    7: { name: 'Ad Manager', desc: 'Optimises paid ad spend' },
    8: { name: 'Sales Assistant', desc: 'Supports the pipeline' },
    9: { name: 'Data Analyst', desc: 'Business data insights' },
    10: { name: 'Inventory Manager', desc: 'Stock optimisation' },
    11: { name: 'Scheduling Agent', desc: 'Meeting coordination' },
    12: { name: 'Competitor Intel', desc: 'Monitors competitors' },
    13: { name: 'Brand Guardian', desc: 'Brand consistency' },
    14: { name: 'Report Builder', desc: 'Executive reporting' },
    15: { name: 'Workflow Automator', desc: 'System automation' },
};

const inputCls = "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-white/40 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all";

/* ─── Page ────────────────────────────────────────────────────────────────── */

export default function ClientDashboard() {
    const { token } = useParams<{ token: string }>();
    const [client, setClient] = useState<ClientData | null>(null);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);
    const [tab, setTab] = useState<Tab>('overview');

    // report modal
    const [reportOpen, setReportOpen] = useState(false);
    const [competitor, setCompetitor] = useState('');
    const [reportStatus, setReportStatus] = useState<'idle' | 'loading' | 'done'>('idle');

    // settings
    const [sName, setSName] = useState('');
    const [sCompany, setSCompany] = useState('');
    const [sMsg, setSMsg] = useState<{ ok: boolean; text: string } | null>(null);
    const [sSaving, setSSaving] = useState(false);
    const [curPwd, setCurPwd] = useState('');
    const [newPwd, setNewPwd] = useState('');
    const [cfmPwd, setCfmPwd] = useState('');
    const [pMsg, setPMsg] = useState<{ ok: boolean; text: string } | null>(null);
    const [pSaving, setPSaving] = useState(false);

    useEffect(() => {
        fetch(`/api/dashboard/${token}`)
            .then(r => r.json())
            .then(d => {
                if (d.error) setNotFound(true);
                else { setClient(d); setSName(d.name || ''); setSCompany(d.companyName || ''); }
            })
            .catch(() => setNotFound(true))
            .finally(() => setLoading(false));
    }, [token]);

    /* ── Loading ── */
    if (loading) return (
        <div className="min-h-screen bg-[#080810] flex items-center justify-center">
            <div className="w-10 h-10 rounded-full border-2 border-indigo-500/30 border-t-indigo-500 animate-spin" />
        </div>
    );

    /* ── Not found ── */
    if (notFound) return (
        <div className="min-h-screen bg-[#080810] flex items-center justify-center text-center px-6">
            <div>
                <div className="text-6xl mb-6">🔒</div>
                <h1 className="text-2xl font-syne font-bold text-white mb-3">Dashboard Not Found</h1>
                <p className="text-blue-300 mb-8">This link may have expired or is invalid.</p>
                <Link href="/get-started" className="px-6 py-3 bg-white text-black rounded-full text-sm font-bold hover:bg-white/90 transition-colors">
                    Start Onboarding
                </Link>
            </div>
        </div>
    );

    if (!client) return null;

    const statusCfg = STATUS_CFG[client.onboardingStatus] || STATUS_CFG.pending;
    const isActive = client.onboardingStatus === 'active';
    const firstName = client.name.split(' ')[0];
    const memberSince = new Date(client.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

    const requestReport = async () => {
        if (!competitor.trim() || !client) return;
        setReportStatus('loading');
        await fetch('/api/competitor-report', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ competitor, email: client.email, clientId: client.id }),
        });
        setReportStatus('done');
        setTimeout(() => { setReportOpen(false); setReportStatus('idle'); setCompetitor(''); }, 2500);
    };

    /* ─────────────────────────────────────────────────────────────────────── */
    /*  TAB RENDERERS                                                         */
    /* ─────────────────────────────────────────────────────────────────────── */

    const Overview = () => (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            {/* Status */}
            <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6">
                <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0 ${isActive ? 'bg-emerald-500/15' : 'bg-amber-500/10'}`}>
                        {isActive ? '✅' : '⏳'}
                    </div>
                    <div>
                        <h2 className="font-syne font-semibold text-white text-lg mb-1">
                            {isActive ? 'Your AI is live and running' : 'Your brief has been received'}
                        </h2>
                        <p className="text-blue-200/80 text-sm leading-relaxed">
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
                            ['AI configuring', false],
                            ['AI live', false],
                        ].map(([label, done], i) => (
                            <div key={i} className={`p-3 rounded-xl border text-center text-xs ${done ? 'border-indigo-500/40 bg-indigo-500/10 text-indigo-300' : 'border-white/10 bg-white/[0.02] text-white/60'}`}>
                                <span className="block text-lg mb-1">{done ? '✓' : '○'}</span>
                                {label as string}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                    { label: 'Plan', value: client.planTier, color: 'text-indigo-400' },
                    { label: 'Member Since', value: memberSince, color: 'text-blue-400' },
                    { label: 'Max Agents', value: client.subscription?.maxAgents || '—', color: 'text-emerald-400' },
                    { label: 'Reports', value: client.reports?.length || 0, color: 'text-amber-400' },
                ].map(s => (
                    <div key={s.label} className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-5">
                        <div className="text-[10px] font-mono tracking-widest uppercase text-indigo-300 mb-2">{s.label}</div>
                        <div className={`text-xl font-syne font-bold ${s.color}`}>{String(s.value)}</div>
                    </div>
                ))}
            </div>

            {/* Help */}
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 text-center">
                <p className="text-blue-200/70 text-sm mb-2">Questions about your setup?</p>
                <a href="mailto:schockweb@gmail.com" className="text-indigo-400 hover:text-indigo-300 text-sm font-semibold transition-colors">
                    Contact the Number1 team →
                </a>
            </div>
        </motion.div>
    );

    const SubscriptionTab = () => {
        const sub = client.subscription;
        const prices: Record<string, string> = { STANDARD: 'CHF 950', PREMIUM: 'CHF 1,499', BUSINESS: 'CHF 3,500' };
        const colors: Record<string, string> = { STANDARD: 'indigo', PREMIUM: 'violet', BUSINESS: 'amber' };
        const c = colors[client.planTier] || 'indigo';

        return (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                {/* Plan card */}
                <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl overflow-hidden">
                    <div className={`h-1 bg-gradient-to-r from-${c}-500 to-${c}-400`} />
                    <div className="p-6">
                        <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
                            <div>
                                <div className="text-[10px] font-mono tracking-widest uppercase text-indigo-300 mb-1">Current Plan</div>
                                <div className={`text-3xl font-syne font-bold text-${c}-400`}>{client.planTier}</div>
                            </div>
                            <div className="text-right">
                                <div className="text-2xl font-syne font-bold text-white">{prices[client.planTier] || '—'}</div>
                                <div className="text-xs text-blue-300">/month</div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {[
                                { l: 'Max AI Agents', v: sub?.maxAgents ? `${sub.maxAgents} agents` : '—' },
                                { l: 'Status', v: sub?.status ? sub.status.charAt(0).toUpperCase() + sub.status.slice(1) : 'Active' },
                                { l: 'Period', v: sub?.currentPeriodStart ? `${new Date(sub.currentPeriodStart).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} – ${new Date(sub.currentPeriodEnd).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}` : '—' },
                                { l: 'Refund Window', v: sub?.refundEligibleUntil ? (new Date(sub.refundEligibleUntil) > new Date() ? `Until ${new Date(sub.refundEligibleUntil).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}` : 'Expired') : '—' },
                            ].map(i => (
                                <div key={i.l} className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-3">
                                    <div className="text-[10px] font-mono tracking-widest uppercase text-indigo-300 mb-1">{i.l}</div>
                                    <div className="text-sm font-medium text-white">{i.v}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Upgrade */}
                <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6 flex items-center justify-between flex-wrap gap-4">
                    <div>
                        <h3 className="font-syne font-semibold text-white mb-1">Need more?</h3>
                        <p className="text-blue-200/80 text-sm">Upgrade to unlock more AI agents and premium features.</p>
                    </div>
                    <Link href="/employee#pricing" className="px-5 py-2.5 rounded-full bg-white/[0.06] border border-white/[0.1] text-white text-sm font-semibold hover:bg-white/[0.1] transition-all">
                        Upgrade Plan →
                    </Link>
                </div>
            </motion.div>
        );
    };

    const AITab = () => {
        const rules = client.agentRules || [];
        const max = client.subscription?.maxAgents || 5;

        return (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                {/* Info */}
                <div className="bg-blue-500/5 border border-blue-500/15 rounded-2xl p-5 flex gap-3 items-start">
                    <span className="text-lg">💡</span>
                    <p className="text-sm text-blue-200/80 leading-relaxed">
                        These instructions shape how your AI agents behave. They are configured by the Number1 team based on your business brief.
                        To request changes, <a href="mailto:schockweb@gmail.com" className="text-blue-400 hover:text-blue-300 font-semibold transition-colors">contact the team</a>.
                    </p>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {Array.from({ length: max }, (_, i) => i + 1).map(tid => {
                        const a = AGENTS[tid] || { name: `Agent ${tid}`, desc: 'AI agent' };
                        const rule = rules.find(r => r.agentTierId === tid);
                        const has = !!rule?.customPromptText;

                        return (
                            <div key={tid} className={`bg-white/[0.03] border rounded-2xl p-5 ${has ? 'border-indigo-500/20' : 'border-white/[0.08]'}`}>
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-syne font-bold ${has ? 'bg-indigo-500/15 text-indigo-400' : 'bg-white/5 text-white/50'}`}>
                                            {String(tid).padStart(2, '0')}
                                        </div>
                                        <div>
                                            <div className="text-sm font-semibold text-white">{a.name}</div>
                                            <div className="text-xs text-blue-300/80">{a.desc}</div>
                                        </div>
                                    </div>
                                    <div className={`w-2 h-2 rounded-full ${has ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.4)]' : 'bg-white/15'}`} />
                                </div>
                                {has ? (
                                    <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-3 text-xs text-indigo-200/70 font-mono leading-relaxed max-h-24 overflow-hidden">
                                        {rule!.customPromptText.slice(0, 200)}{rule!.customPromptText.length > 200 ? '…' : ''}
                                    </div>
                                ) : (
                                    <div className="bg-white/[0.02] rounded-xl p-3 text-center text-xs text-white/50">
                                        No custom instructions yet
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </motion.div>
        );
    };

    const ProfileTab = () => {
        const ob = client.onboarding;
        if (!ob) return (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="text-center py-16">
                <div className="text-5xl mb-4">📋</div>
                <h2 className="text-xl font-syne font-bold text-white mb-2">No business profile yet</h2>
                <p className="text-blue-200/80 mb-6 text-sm">Complete the onboarding form to set up your business profile.</p>
                <Link href="/get-started" className="px-6 py-3 bg-white text-black rounded-full text-sm font-bold">Complete Brief →</Link>
            </motion.div>
        );

        const sections = [
            { title: 'Business Info', items: [['Industry', ob.industry], ['Website', ob.website], ['Description', ob.description]] },
            { title: 'Audience', items: [['Client Type', ob.clientType], ['Target Market', ob.targetMarket], ['Geography', ob.geography], ['Pain Points', ob.painPoints]] },
            { title: 'Brand Voice', items: [['Personality', ob.brandPersonality], ['Style', ob.communicationStyle], ['Values', ob.brandValues], ['Avoid', ob.avoidWords]] },
            { title: 'Competition', items: [['Competitors', ob.competitors], ['Advantage', ob.advantage]] },
            { title: 'Tech Stack', items: [['CRM', ob.crmTool], ['Inventory', ob.inventoryTool], ['Email', ob.emailMarketing], ['E-commerce', ob.ecommercePlatform], ['Comms', ob.communicationTools], ['Booking', ob.bookingTool]] },
            { title: 'Data & AI', items: [['Storage', ob.dataStorage], ['Documents', ob.hasDocuments], ['Types', ob.documentTypes], ['AI Access', ob.aiCanAccess], ['Sales Vol.', ob.monthlySalesVolume], ['Staff', ob.staffCount]] },
            { title: 'Goals', items: [['Primary Goal', ob.primaryGoal], ['Priority', ob.automationPriority], ['Challenge', ob.biggestChallenge]] },
        ];

        return (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
                <div className="flex items-center justify-between">
                    <div />
                    <Link href="/get-started" className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold transition-colors">
                        Update profile →
                    </Link>
                </div>
                {sections.map(sec => {
                    const filled = sec.items.filter(([, v]) => v);
                    if (!filled.length) return null;
                    return (
                        <div key={sec.title} className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6">
                            <h3 className="font-syne font-semibold text-white mb-4">{sec.title}</h3>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                {filled.map(([label, value]) => (
                                    <div key={label as string} className="bg-white/[0.03] rounded-xl p-3 border border-white/[0.06]">
                                        <div className="text-[10px] font-mono tracking-widest text-indigo-300 uppercase mb-1">{label as string}</div>
                                        <div className="text-sm text-white font-medium leading-relaxed">{value as string}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </motion.div>
        );
    };

    const ReportsTab = () => (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
            <div className="flex items-center justify-end">
                <button onClick={() => setReportOpen(true)} className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-full transition-colors">
                    + Request Report
                </button>
            </div>

            {client.reports && client.reports.length > 0 ? (
                <div className="space-y-2">
                    {client.reports.map(r => (
                        <div key={r.id} className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <span className="text-lg">🔍</span>
                                <div>
                                    <div className="text-sm font-semibold text-white">{r.competitor}</div>
                                    <div className="text-xs text-blue-300">{new Date(r.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                                </div>
                            </div>
                            <span className="text-xs text-emerald-400 font-semibold">Sent to email</span>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl py-16 text-center">
                    <div className="text-4xl mb-3">📊</div>
                    <p className="text-blue-200/70 text-sm">No reports yet. Request your first competitor analysis above.</p>
                </div>
            )}
        </motion.div>
    );

    const SettingsTab = () => {
        const saveProfile = async (e: React.FormEvent) => {
            e.preventDefault(); setSSaving(true); setSMsg(null);
            try {
                const res = await fetch('/api/account', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: sName, company: sCompany }) });
                const d = await res.json();
                setSMsg(res.ok ? { ok: true, text: 'Profile updated.' } : { ok: false, text: d.error || 'Failed.' });
            } catch { setSMsg({ ok: false, text: 'Network error.' }); }
            setSSaving(false);
        };
        const savePwd = async (e: React.FormEvent) => {
            e.preventDefault(); setPSaving(true); setPMsg(null);
            if (newPwd !== cfmPwd) { setPMsg({ ok: false, text: 'Passwords do not match.' }); setPSaving(false); return; }
            try {
                const res = await fetch('/api/account', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ currentPassword: curPwd, newPassword: newPwd }) });
                const d = await res.json();
                if (res.ok) { setPMsg({ ok: true, text: 'Password updated.' }); setCurPwd(''); setNewPwd(''); setCfmPwd(''); }
                else setPMsg({ ok: false, text: d.error || 'Failed.' });
            } catch { setPMsg({ ok: false, text: 'Network error.' }); }
            setPSaving(false);
        };

        return (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                {/* Profile */}
                <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6">
                    <h3 className="font-syne font-semibold text-white mb-1">Profile Information</h3>
                    <p className="text-blue-200/70 text-xs mb-5">Update your name and company details.</p>
                    {sMsg && <div className={`p-3 rounded-xl mb-4 text-sm ${sMsg.ok ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300' : 'bg-red-500/10 border border-red-500/30 text-red-300'}`}>{sMsg.text}</div>}
                    <form onSubmit={saveProfile} className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold tracking-widest uppercase text-indigo-300 mb-1">Email</label>
                            <input value={client.email} disabled className={`${inputCls} opacity-35 cursor-not-allowed`} />
                        </div>
                        <div>
                            <label className="block text-xs font-bold tracking-widest uppercase text-indigo-300 mb-1">Full Name</label>
                            <input value={sName} onChange={e => setSName(e.target.value)} required className={inputCls} />
                        </div>
                        <div>
                            <label className="block text-xs font-bold tracking-widest uppercase text-indigo-300 mb-1">Company</label>
                            <input value={sCompany} onChange={e => setSCompany(e.target.value)} className={inputCls} />
                        </div>
                        <button type="submit" disabled={sSaving} className="px-6 py-3 bg-white text-black rounded-full text-sm font-bold hover:bg-white/90 transition-all disabled:opacity-40">
                            {sSaving ? 'Saving…' : 'Save Profile'}
                        </button>
                    </form>
                </div>

                {/* Password */}
                <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6">
                    <h3 className="font-syne font-semibold text-white mb-1">Change Password</h3>
                    <p className="text-blue-200/70 text-xs mb-5">Minimum 8 characters.</p>
                    {pMsg && <div className={`p-3 rounded-xl mb-4 text-sm ${pMsg.ok ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300' : 'bg-red-500/10 border border-red-500/30 text-red-300'}`}>{pMsg.text}</div>}
                    <form onSubmit={savePwd} className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold tracking-widest uppercase text-indigo-300 mb-1">Current Password</label>
                            <input type="password" value={curPwd} onChange={e => setCurPwd(e.target.value)} required className={inputCls} />
                        </div>
                        <div>
                            <label className="block text-xs font-bold tracking-widest uppercase text-indigo-300 mb-1">New Password</label>
                            <input type="password" value={newPwd} onChange={e => setNewPwd(e.target.value)} required className={inputCls} />
                        </div>
                        <div>
                            <label className="block text-xs font-bold tracking-widest uppercase text-indigo-300 mb-1">Confirm</label>
                            <input type="password" value={cfmPwd} onChange={e => setCfmPwd(e.target.value)} required className={inputCls} />
                        </div>
                        <button type="submit" disabled={pSaving} className="px-6 py-3 bg-white text-black rounded-full text-sm font-bold hover:bg-white/90 transition-all disabled:opacity-40">
                            {pSaving ? 'Updating…' : 'Update Password'}
                        </button>
                    </form>
                </div>

                {/* Sign out */}
                <div className="bg-red-500/[0.04] border border-red-500/15 rounded-2xl p-6">
                    <h3 className="font-syne font-semibold text-red-400/80 mb-1">Sign Out</h3>
                    <p className="text-red-300/80 text-xs mb-4">You will be signed out on this device.</p>
                    <Link href="/" className="inline-flex px-5 py-2.5 rounded-full bg-red-500/10 border border-red-500/25 text-red-400/80 text-sm font-semibold hover:bg-red-500/20 transition-all">
                        Sign Out
                    </Link>
                </div>
            </motion.div>
        );
    };

    const TabContent = () => {
        switch (tab) {
            case 'overview': return <Overview />;
            case 'subscription': return <SubscriptionTab />;
            case 'ai': return <AITab />;
            case 'profile': return <ProfileTab />;
            case 'reports': return <ReportsTab />;
            case 'settings': return <SettingsTab />;
        }
    };

    /* ─── Render ──────────────────────────────────────────────────────────── */

    return (
        <div className="min-h-screen bg-[#080810] text-white">
            {/* Ambient */}
            <div className="fixed inset-0 pointer-events-none -z-10">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80vw] h-[50vh] bg-indigo-600/[0.07] rounded-full blur-[160px]" />
            </div>

            {/* ── Nav ── */}
            <nav className="sticky top-0 z-50 flex items-center justify-between px-6 py-4 border-b border-white/[0.06] bg-[#080810]/90 backdrop-blur-xl">
                <div className="flex items-center gap-3">
                    <Link href="/" className="flex items-center gap-2 text-white no-underline">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold font-syne text-sm">N1</div>
                        <span className="text-sm font-syne font-bold text-white">Number<span className="text-indigo-400">1</span></span>
                    </Link>
                    <span className="text-white/15 mx-2">|</span>
                    <span className="text-xs font-mono tracking-widest uppercase text-indigo-300">Dashboard</span>
                </div>
                <div className="flex items-center gap-4">
                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold ${statusCfg.cls}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot} ${isActive ? 'animate-pulse' : ''}`} />
                        {statusCfg.label}
                    </div>
                    <Link href="/" className="text-blue-300 text-sm font-medium hover:text-white transition-colors no-underline hidden md:block">
                        ← Home
                    </Link>
                </div>
            </nav>

            {/* ── Hero header ── */}
            <div className="px-6 pt-8 pb-2 max-w-4xl mx-auto">
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
                    <h1 className="text-3xl md:text-4xl font-syne font-bold text-white mb-1">
                        Welcome, {firstName} 👋
                    </h1>
                    <p className="text-blue-300 text-sm">{client.companyName} · {client.email}</p>
                </motion.div>
            </div>

            {/* ── Tab bar ── */}
            <div className="sticky top-[65px] z-40 border-b border-white/[0.06] bg-[#080810]/90 backdrop-blur-xl">
                <div className="max-w-4xl mx-auto px-6 flex gap-1 overflow-x-auto scrollbar-hide">
                    {TABS.map(t => (
                        <button
                            key={t.id}
                            onClick={() => setTab(t.id)}
                            className={`px-4 py-3 text-sm font-medium whitespace-nowrap transition-all border-b-2 ${
                                tab === t.id
                                    ? 'text-white border-indigo-500'
                                    : 'text-white/60 border-transparent hover:text-white'
                            }`}
                            style={{ background: 'none', cursor: 'pointer' }}
                        >
                            {t.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* ── Content ── */}
            <div className="max-w-4xl mx-auto px-6 py-8">
                <AnimatePresence mode="wait">
                    <TabContent key={tab} />
                </AnimatePresence>
            </div>

            {/* ── Report Modal ── */}
            <AnimatePresence>
                {reportOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setReportOpen(false)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
                        <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
                            className="relative w-full max-w-sm bg-[#0F111A] border border-white/10 rounded-3xl p-8 shadow-2xl">
                            <h3 className="font-syne font-bold text-white text-xl mb-2">Request Analysis</h3>
                            <p className="text-blue-200/80 text-sm mb-6">Enter a competitor name and we&apos;ll email you a full AI report.</p>
                            {reportStatus === 'done' ? (
                                <div className="text-center py-4">
                                    <div className="text-4xl mb-3">✅</div>
                                    <p className="text-white font-semibold">Report requested!</p>
                                    <p className="text-blue-200/80 text-sm mt-1">Check your email in ~20 seconds.</p>
                                </div>
                            ) : (
                                <>
                                    <input type="text" value={competitor} onChange={e => setCompetitor(e.target.value)}
                                        className={`${inputCls} mb-4`} placeholder="e.g. Acme Corp" autoFocus />
                                    <button onClick={requestReport} disabled={reportStatus === 'loading' || !competitor.trim()}
                                        className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all disabled:opacity-40 flex items-center justify-center gap-2">
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
