"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';

interface ClientFull {
    id: string; name: string; email: string; companyName: string;
    planTier: string; onboardingStatus: string; dashboardToken: string; createdAt: string;
    onboarding?: Record<string, string | null>;
    reports?: { id: string; competitor: string; createdAt: string; emailSentTo: string }[];
}

const STATUS: Record<string, { label: string; color: string; bg: string; border: string; dot: string }> = {
    pending:   { label: 'Pending Setup',  color: '#F59E0B', bg: 'rgba(245,158,11,0.08)',  border: 'rgba(245,158,11,0.25)',  dot: '#F59E0B' },
    onboarded: { label: 'Brief Received', color: '#3B82F6', bg: 'rgba(59,130,246,0.08)',  border: 'rgba(59,130,246,0.25)',  dot: '#3B82F6' },
    active:    { label: 'AI Active',      color: '#10B981', bg: 'rgba(16,185,129,0.08)',  border: 'rgba(16,185,129,0.25)',  dot: '#10B981' },
    paused:    { label: 'Paused',         color: 'rgba(255,255,255,0.35)', bg: 'rgba(255,255,255,0.04)', border: 'rgba(255,255,255,0.1)', dot: 'rgba(255,255,255,0.3)' },
};

const PLAN_COLOR: Record<string, string> = { STANDARD: '#6366F1', PREMIUM: '#A855F7', BUSINESS: '#F59E0B' };

const FIELD_LABELS: Record<string, string> = {
    industry: 'Industry', website: 'Website', description: 'Description',
    clientType: 'Client Type', targetMarket: 'Target Market', geography: 'Geography', painPoints: 'Pain Points',
    brandPersonality: 'Brand Personality', communicationStyle: 'Communication Style', brandValues: 'Brand Values', avoidWords: 'Avoid Words',
    competitors: 'Competitors', advantage: 'Competitive Advantage',
    crmTool: 'CRM', inventoryTool: 'Inventory / Stock', emailMarketing: 'Email Marketing', ecommercePlatform: 'E-Commerce',
    communicationTools: 'Communication Channels', bookingTool: 'Booking Tool',
    dataStorage: 'Data Storage', hasDocuments: 'Has Documents', documentTypes: 'Document Types', aiCanAccess: 'AI Can Access',
    monthlySalesVolume: 'Monthly Sales Volume', staffCount: 'Staff Count', existingAutomations: 'Existing Automations',
    primaryGoal: 'Primary AI Goal', automationPriority: 'Automate First', biggestChallenge: 'Biggest Challenge', contactPhone: 'Phone',
};

const SECTIONS = [
    { key: 'business', label: 'Business Details', accent: '#6366F1', icon: <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>, fields: ['industry', 'website', 'description'] },
    { key: 'audience', label: 'Target Audience', accent: '#3B82F6', icon: <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>, fields: ['clientType', 'targetMarket', 'geography', 'painPoints'] },
    { key: 'brand', label: 'Brand Voice', accent: '#EC4899', icon: <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" /></svg>, fields: ['brandPersonality', 'communicationStyle', 'brandValues', 'avoidWords'] },
    { key: 'tech', label: 'Tech Stack', accent: '#14B8A6', icon: <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>, fields: ['crmTool', 'inventoryTool', 'emailMarketing', 'ecommercePlatform', 'communicationTools', 'bookingTool'] },
    { key: 'data', label: 'Data & AI Training', accent: '#8B5CF6', icon: <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" /></svg>, fields: ['dataStorage', 'hasDocuments', 'documentTypes', 'aiCanAccess', 'monthlySalesVolume', 'staffCount', 'existingAutomations'] },
    { key: 'goals', label: 'Automation Goals', accent: '#10B981', icon: <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg>, fields: ['primaryGoal', 'automationPriority', 'biggestChallenge', 'contactPhone'] },
];

function Avatar({ name, size = 44 }: { name: string; size?: number }) {
    const initials = name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();
    return <div style={{ width: size, height: size, borderRadius: '50%', flexShrink: 0, background: 'linear-gradient(135deg, #6366F1, #8B5CF6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: size * 0.36, fontWeight: 700, color: '#fff', letterSpacing: '0.02em' }}>{initials}</div>;
}

export default function AdminClientDetailPage() {
    const { id } = useParams<{ id: string }>();
    const [client, setClient] = useState<ClientFull | null>(null);
    const [loading, setLoading] = useState(true);
    const [activating, setActivating] = useState(false);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        fetch(`/api/admin/clients?clientId=${id}`)
            .then((r) => r.json()).then(setClient).catch(console.error).finally(() => setLoading(false));
    }, [id]);

    const changeStatus = async (status: string) => {
        setActivating(true);
        await fetch('/api/admin/clients/activate', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ clientId: id, status }) });
        setClient((c) => c ? { ...c, onboardingStatus: status } : c);
        setActivating(false);
    };

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://number1.studio';

    const copyLink = () => {
        if (!client) return;
        navigator.clipboard.writeText(`${siteUrl}/dashboard/${client.dashboardToken}`);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}><div style={{ width: 36, height: 36, border: '2px solid rgba(99,102,241,0.2)', borderTopColor: '#6366F1', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} /><style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style></div>;
    if (!client) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', color: 'rgba(255,255,255,0.25)', fontSize: 14 }}>Client not found</div>;

    const st = STATUS[client.onboardingStatus] ?? STATUS.pending;
    const planColor = PLAN_COLOR[client.planTier] ?? '#888';
    const dashUrl = `${siteUrl}/dashboard/${client.dashboardToken}`;
    const joined = new Date(client.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

    return (
        <div style={{ maxWidth: 860, margin: '0 auto', padding: '0 0 4rem' }}>
            <Link href="/admin/clients" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'rgba(255,255,255,0.3)', textDecoration: 'none', fontSize: 12, fontWeight: 600, marginBottom: 24, letterSpacing: '0.02em' }}>
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                All Clients
            </Link>

            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 20, padding: '1.75rem', marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        <Avatar name={client.companyName || client.name} size={52} />
                        <div>
                            <h1 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em', marginBottom: 4 }}>{client.companyName}</h1>
                            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                                <span>{client.name}</span><span style={{ opacity: 0.3 }}>·</span>
                                <a href={`mailto:${client.email}`} style={{ color: '#818CF8', textDecoration: 'none' }}>{client.email}</a>
                            </div>
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 12px', borderRadius: 999, fontSize: 11, fontWeight: 700, letterSpacing: '0.04em', background: st.bg, color: st.color, border: `1px solid ${st.border}` }}>
                            <span style={{ width: 5, height: 5, borderRadius: '50%', background: st.dot }} />{st.label}
                        </span>
                        {client.onboardingStatus !== 'active' ? (
                            <button onClick={() => changeStatus('active')} disabled={activating} style={{ padding: '7px 16px', borderRadius: 10, background: 'rgba(16,185,129,0.12)', color: '#10B981', border: '1px solid rgba(16,185,129,0.3)', fontSize: 12, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                                <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 3l14 9-14 9V3z" /></svg>
                                {activating ? 'Activating…' : 'Activate AI'}
                            </button>
                        ) : (
                            <button onClick={() => changeStatus('paused')} disabled={activating} style={{ padding: '7px 16px', borderRadius: 10, background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.1)', fontSize: 12, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                                <svg width="12" height="12" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" /></svg> Pause
                            </button>
                        )}
                    </div>
                </div>
                <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: '1.25rem 0' }} />
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 12 }}>
                    {[{ label: 'Reports', value: String(client.reports?.length || 0) }, { label: 'Plan', value: client.planTier, color: planColor }, { label: 'Joined', value: joined }].map((s) => (
                        <div key={s.label} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: '0.75rem 1rem' }}>
                            <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)', fontFamily: 'monospace', marginBottom: 6 }}>{s.label}</div>
                            <div style={{ fontSize: '1rem', fontWeight: 700, color: s.color || '#fff', letterSpacing: '-0.01em' }}>{s.value}</div>
                        </div>
                    ))}
                </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
                style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: '1rem 1.25rem', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="rgba(255,255,255,0.3)" strokeWidth={2} style={{ flexShrink: 0 }}><path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)', fontFamily: 'monospace', marginBottom: 3 }}>Client Dashboard Link</div>
                    <div style={{ fontSize: 12, color: '#818CF8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{dashUrl}</div>
                </div>
                <button onClick={copyLink} style={{ flexShrink: 0, padding: '6px 14px', borderRadius: 8, fontSize: 11, fontWeight: 700, cursor: 'pointer', border: '1px solid', transition: 'all 0.15s', background: copied ? 'rgba(16,185,129,0.1)' : 'rgba(255,255,255,0.05)', borderColor: copied ? 'rgba(16,185,129,0.3)' : 'rgba(255,255,255,0.1)', color: copied ? '#10B981' : 'rgba(255,255,255,0.5)' }}>
                    {copied ? 'Copied ✓' : 'Copy'}
                </button>
            </motion.div>

            {client.onboarding && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 16 }}>
                    {SECTIONS.map(({ key, label, accent, icon, fields }, si) => {
                        const rows = fields.filter((f) => client.onboarding?.[f]);
                        if (rows.length === 0) return null;
                        return (
                            <motion.div key={key} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06 + si * 0.04 }}
                                style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderTop: `2px solid ${accent}`, borderRadius: 16, overflow: 'hidden' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0.85rem 1.25rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                    <span style={{ color: accent }}>{icon}</span>
                                    <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.6)', letterSpacing: '0.04em' }}>{label}</span>
                                </div>
                                <div>
                                    {rows.map((f, fi) => (
                                        <div key={f} style={{ display: 'grid', gridTemplateColumns: '180px 1fr', gap: 16, padding: '0.75rem 1.25rem', borderBottom: fi < rows.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none', alignItems: 'flex-start' }}>
                                            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)', fontFamily: 'monospace', paddingTop: 2 }}>{FIELD_LABELS[f] || f}</span>
                                            <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.72)', lineHeight: 1.6 }}>{String(client.onboarding![f])}</span>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            )}

            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderTop: '2px solid #c9a84c', borderRadius: 16, overflow: 'hidden' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0.85rem 1.25rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="#c9a84c" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                    <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.6)', letterSpacing: '0.04em' }}>Competitor Reports</span>
                    {(client.reports?.length ?? 0) > 0 && <span style={{ marginLeft: 'auto', fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 6, background: 'rgba(201,168,76,0.1)', color: '#c9a84c', border: '1px solid rgba(201,168,76,0.2)' }}>{client.reports!.length}</span>}
                </div>
                {client.reports && client.reports.length > 0 ? (
                    <div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', padding: '0.5rem 1.25rem', borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: 9, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.2)', fontFamily: 'monospace' }}>
                            <span>Competitor</span><span>Sent To</span><span>Date</span>
                        </div>
                        {client.reports.map((r, ri) => (
                            <div key={r.id} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', padding: '0.85rem 1.25rem', borderBottom: ri < client.reports!.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none', fontSize: 13, alignItems: 'center' }}>
                                <span style={{ fontWeight: 600, color: 'rgba(255,255,255,0.75)' }}>{r.competitor}</span>
                                <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: 12 }}>{r.emailSentTo}</span>
                                <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: 11, fontFamily: 'monospace', whiteSpace: 'nowrap' }}>{new Date(r.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div style={{ padding: '3rem', textAlign: 'center', color: 'rgba(255,255,255,0.2)', fontSize: 13 }}>No reports generated yet.</div>
                )}
            </motion.div>
        </div>
    );
}
