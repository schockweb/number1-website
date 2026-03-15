"use client";

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface BuildRequest {
    id: string; type: string; clientName: string | null; clientEmail: string | null;
    companyName: string | null; websiteUrl: string | null; summary: string;
    status: string; priority: string; notes: string | null; createdAt: string;
}

const STATUS_CFG = {
    new:         { label: 'New',         bg: 'bg-indigo-500/15',  text: 'text-indigo-300',  border: 'border-indigo-500/30',  dot: 'bg-indigo-400',            ring: 'ring-indigo-500/30' },
    reviewing:   { label: 'Reviewing',   bg: 'bg-amber-500/15',   text: 'text-amber-300',   border: 'border-amber-500/30',   dot: 'bg-amber-400',             ring: 'ring-amber-500/30' },
    in_progress: { label: 'In Progress', bg: 'bg-sky-500/15',     text: 'text-sky-300',     border: 'border-sky-500/30',     dot: 'bg-sky-400 animate-pulse', ring: 'ring-sky-500/30' },
    delivered:   { label: 'Delivered',   bg: 'bg-emerald-500/15', text: 'text-emerald-300', border: 'border-emerald-500/30', dot: 'bg-emerald-400',           ring: 'ring-emerald-500/30' },
} as Record<string, { label: string; bg: string; text: string; border: string; dot: string; ring: string }>;

const TYPE_CFG = {
    new_website: { label: 'New Website',      icon: '⚡', bg: 'bg-orange-500/15', text: 'text-orange-300', border: 'border-orange-500/30' },
    makeover:    { label: 'Website Makeover', icon: '✦',  bg: 'bg-violet-500/15', text: 'text-violet-300', border: 'border-violet-500/30' },
} as Record<string, { label: string; icon: string; bg: string; text: string; border: string }>;

const PRIORITY_CFG = {
    low:    { label: 'Low', icon: '↓', cls: 'text-white/35' },
    normal: { label: 'Normal', icon: '→', cls: 'text-white/55' },
    high:   { label: 'High', icon: '↑', cls: 'text-rose-400 font-bold' },
} as Record<string, { label: string; icon: string; cls: string }>;

const STATUS_ORDER = ['new', 'reviewing', 'in_progress', 'delivered'];
const PRIORITY_ORDER = ['low', 'normal', 'high'];

export default function AdminBuildRequestsPage() {
    const [requests, setRequests] = useState<BuildRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('all');
    const [typeFilter, setTypeFilter] = useState('all');
    const [selected, setSelected] = useState<BuildRequest | null>(null);
    const [editNotes, setEditNotes] = useState('');
    const [editStatus, setEditStatus] = useState('');
    const [editPriority, setEditPriority] = useState('');
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    const load = () => {
        setLoading(true);
        fetch('/api/admin/build-requests').then(r => r.json()).then(d => setRequests(d.requests || [])).finally(() => setLoading(false));
    };
    useEffect(() => { load(); }, []);

    const openDetail = (r: BuildRequest) => { setSelected(r); setEditNotes(r.notes || ''); setEditStatus(r.status); setEditPriority(r.priority); setSaved(false); };

    const saveChanges = async () => {
        if (!selected) return;
        setSaving(true);
        await fetch('/api/admin/build-requests', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: selected.id, status: editStatus, notes: editNotes, priority: editPriority }) });
        setSaving(false); setSaved(true);
        setRequests(prev => prev.map(r => r.id === selected.id ? { ...r, status: editStatus, notes: editNotes, priority: editPriority } : r));
        setSelected(prev => prev ? { ...prev, status: editStatus, notes: editNotes, priority: editPriority } : null);
    };

    const filtered = requests.filter(r => {
        const matchStatus = statusFilter === 'all' || r.status === statusFilter;
        const matchType = typeFilter === 'all' || r.type === typeFilter;
        return matchStatus && matchType;
    });

    const count = (key: string) => key === 'all' ? requests.length : requests.filter(r => r.status === key).length;
    const newCount = requests.filter(r => r.status === 'new').length;

    return (
        <div className="min-h-screen bg-[#06070f] text-white">
            <div className="fixed inset-0 pointer-events-none -z-10">
                <div className="absolute top-0 left-1/4 w-[60vw] h-[40vh] bg-indigo-600/[0.06] rounded-full blur-[160px]" />
                <div className="absolute bottom-0 right-1/4 w-[40vw] h-[30vh] bg-violet-600/[0.05] rounded-full blur-[140px]" />
            </div>
            <div className="max-w-7xl mx-auto px-6 py-8">
                <div className="flex items-start justify-between mb-10">
                    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
                        <div className="flex items-center gap-3 mb-1">
                            <h1 className="text-3xl font-bold tracking-tight">Build Requests</h1>
                            {newCount > 0 && <span className="px-2.5 py-0.5 rounded-full bg-indigo-500 text-white text-xs font-bold">{newCount} new</span>}
                        </div>
                        <p className="text-white/35 text-sm">All website builds and makeover requests from clients</p>
                    </motion.div>
                    <button onClick={load} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white/40 text-xs font-semibold hover:bg-white/[0.07] hover:text-white/70 transition-all">
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                        Refresh
                    </button>
                </div>

                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-8">
                    {[{ key: 'all', label: 'Total', color: 'text-white' }, { key: 'new', label: 'New', color: 'text-indigo-400' }, { key: 'reviewing', label: 'Reviewing', color: 'text-amber-400' }, { key: 'in_progress', label: 'In Progress', color: 'text-sky-400' }, { key: 'delivered', label: 'Delivered', color: 'text-emerald-400' }].map((s, i) => (
                        <motion.button key={s.key} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }} onClick={() => setStatusFilter(s.key)} className={`relative p-4 rounded-2xl border text-left transition-all duration-200 ${statusFilter === s.key ? 'bg-white/[0.06] border-white/20' : 'bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.04]'}`}>
                            <div className={`text-2xl font-bold ${s.color}`}>{count(s.key)}</div>
                            <div className="text-[10px] text-white/30 uppercase tracking-widest font-mono mt-0.5">{s.label}</div>
                        </motion.button>
                    ))}
                </motion.div>

                <div className="flex items-center gap-2 mb-6 flex-wrap">
                    <span className="text-[10px] font-mono text-white/25 uppercase tracking-widest mr-1">Type</span>
                    {(['all', 'new_website', 'makeover'] as const).map(f => {
                        const tc = f !== 'all' ? TYPE_CFG[f] : null;
                        return <button key={f} onClick={() => setTypeFilter(f)} className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${typeFilter === f ? 'bg-white/10 border-white/25 text-white' : 'bg-white/[0.02] border-white/[0.07] text-white/40 hover:text-white/70'}`}>{tc ? `${tc.icon} ${tc.label}` : 'All Types'}</button>;
                    })}
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-32"><div className="w-12 h-12 rounded-full border-2 border-indigo-500/20 border-t-indigo-500 animate-spin" /></div>
                ) : filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-32 text-center">
                        <h3 className="text-white/50 font-semibold text-lg mb-2">No requests yet</h3>
                        <p className="text-white/25 text-sm max-w-xs">Build requests submitted by clients will appear here.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                        {filtered.map((r, i) => {
                            const sc = STATUS_CFG[r.status] || STATUS_CFG.new;
                            const tc = TYPE_CFG[r.type] || { label: r.type, icon: '◻', bg: 'bg-white/5', text: 'text-white/40', border: 'border-white/10' };
                            const pc = PRIORITY_CFG[r.priority] || PRIORITY_CFG.normal;
                            return (
                                <motion.div key={r.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} onClick={() => openDetail(r)} className="group relative cursor-pointer bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.07] hover:border-white/[0.15] rounded-2xl p-5 transition-all duration-300 hover:-translate-y-0.5">
                                    {r.priority === 'high' && <div className="absolute top-0 left-5 right-5 h-[2px] bg-gradient-to-r from-transparent via-rose-500 to-transparent rounded-full" />}
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-semibold ${tc.bg} ${tc.text} ${tc.border}`}>{tc.icon} {tc.label}</span>
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-semibold ${sc.bg} ${sc.text} ${sc.border}`}><span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />{sc.label}</span>
                                        </div>
                                        <span className={`text-xs ${pc.cls}`}>{pc.icon} {pc.label}</span>
                                    </div>
                                    <div className="mb-3">
                                        <div className="font-semibold text-white text-base leading-tight">{r.clientName || r.companyName || r.websiteUrl || 'Anonymous'}</div>
                                        {r.clientEmail && <div className="text-xs text-white/30 mt-0.5">{r.clientEmail}</div>}
                                    </div>
                                    <p className="text-xs text-white/35 leading-relaxed line-clamp-3 mb-4">{r.summary.replace(/TYPE:.*\n\n/, '').substring(0, 160)}…</p>
                                    <div className="flex items-center justify-between pt-3 border-t border-white/[0.06]">
                                        <span className="text-[11px] text-white/25 font-mono">{new Date(r.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                        <span className="text-[11px] text-indigo-400 font-semibold flex items-center gap-1">Open brief <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg></span>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </div>

            <AnimatePresence>
                {selected && (
                    <>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelected(null)} className="fixed inset-0 bg-black/70 backdrop-blur-md z-40" />
                        <motion.aside initial={{ x: '100%', opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: '100%', opacity: 0 }} transition={{ type: 'spring', damping: 30, stiffness: 300 }} className="fixed right-0 top-0 bottom-0 w-full max-w-lg bg-[#0A0B14] border-l border-white/[0.08] z-50 flex flex-col shadow-2xl">
                            <div className="px-6 py-5 border-b border-white/[0.07] flex items-start justify-between shrink-0">
                                <div>
                                    <h2 className="font-bold text-white text-xl">{selected.clientName || selected.companyName || selected.websiteUrl || 'Build Brief'}</h2>
                                    {selected.clientEmail && <p className="text-white/35 text-xs mt-0.5">{selected.clientEmail}</p>}
                                </div>
                                <button onClick={() => setSelected(null)} className="w-8 h-8 rounded-full bg-white/[0.05] border border-white/[0.08] text-white/40 flex items-center justify-center hover:bg-white/[0.10] transition-all text-lg shrink-0">×</button>
                            </div>
                            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
                                <div>
                                    <div className="text-[10px] font-mono tracking-[0.15em] text-white/25 uppercase mb-3">Build Summary</div>
                                    <div className="bg-white/[0.02] border border-white/[0.07] rounded-2xl p-4 max-h-60 overflow-y-auto">
                                        {selected.summary.split('\n').map((line, i) => <p key={i} className="text-sm leading-relaxed text-white/50">{line || <br />}</p>)}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-[10px] font-mono tracking-[0.15em] text-white/25 uppercase mb-3">Status</div>
                                    <div className="grid grid-cols-2 gap-2">
                                        {STATUS_ORDER.map(s => {
                                            const sc = STATUS_CFG[s];
                                            return <button key={s} onClick={() => setEditStatus(s)} className={`flex items-center gap-2.5 px-4 py-3 rounded-xl border text-sm font-semibold transition-all ${editStatus === s ? `${sc.bg} ${sc.border} ${sc.text} ring-1 ${sc.ring}` : 'bg-white/[0.02] border-white/[0.07] text-white/35 hover:bg-white/[0.05]'}`}><span className={`w-2 h-2 rounded-full ${editStatus === s ? sc.dot : 'bg-white/15'}`} />{sc.label}</button>;
                                        })}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-[10px] font-mono tracking-[0.15em] text-white/25 uppercase mb-3">Priority</div>
                                    <div className="flex gap-2">
                                        {PRIORITY_ORDER.map(p => {
                                            const pc = PRIORITY_CFG[p];
                                            return <button key={p} onClick={() => setEditPriority(p)} className={`flex-1 py-2.5 rounded-xl border text-xs font-bold transition-all capitalize ${editPriority === p ? 'bg-white/10 border-white/25 text-white' : 'bg-white/[0.02] border-white/[0.07] text-white/35 hover:bg-white/[0.05]'}`}>{pc.icon} {pc.label}</button>;
                                        })}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-[10px] font-mono tracking-[0.15em] text-white/25 uppercase mb-3">Internal Notes</div>
                                    <textarea rows={5} value={editNotes} onChange={e => setEditNotes(e.target.value)} placeholder="Add timeline, scope, team notes…" className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white placeholder-white/15 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all resize-none" />
                                </div>
                            </div>
                            <div className="px-6 py-4 border-t border-white/[0.07] shrink-0">
                                <button onClick={saveChanges} disabled={saving} className={`w-full py-3.5 rounded-xl font-bold text-sm transition-all duration-300 ${saved ? 'bg-emerald-600 text-white' : 'bg-indigo-600 hover:bg-indigo-500 text-white'} disabled:opacity-40 flex items-center justify-center gap-2`}>
                                    {saving ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving…</> : saved ? '✓ Changes Saved' : 'Save Changes'}
                                </button>
                            </div>
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
