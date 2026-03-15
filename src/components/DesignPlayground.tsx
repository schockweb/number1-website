"use client";

import React, { useState, useRef, useCallback } from 'react';
import {
    Sparkles, Zap, ArrowUpCircle, X,
    Pencil, Trash2, DollarSign, BarChart3, Image as ImageIcon, Loader2,
    Eye, Check, AlertTriangle, Maximize2, Clock
} from 'lucide-react';
import {
    generateDesign,
    getSessionTelemetry,
    resetSessionTelemetry,
    LOW_RES_COST,
    UPSCALE_COST,
    type GeneratedDesign,
    type SessionTelemetry,
} from '@/lib/aiService';
import { motion, AnimatePresence } from 'framer-motion';

const INSPIRATION_PRESETS = [
    { label: 'Neon Pricing Table', prompt: 'A neon-themed pricing table with 3 tiers' },
    { label: 'Glassmorphism Dashboard', prompt: 'A glassmorphism analytics dashboard with stats cards' },
    { label: 'Brutalist Hero', prompt: 'A brutalist hero section for a SaaS landing page' },
    { label: 'Feature Cards', prompt: 'A modern feature card grid with icons and descriptions' },
    { label: 'Dark Landing Page', prompt: 'A dark-mode landing page hero with CTA buttons' },
    { label: 'Minimal Profile', prompt: 'A minimal user profile card with avatar and stats' },
];

export function DesignPlayground() {
    const [prompt, setPrompt] = useState('');
    const [designs, setDesigns] = useState<GeneratedDesign[]>([]);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isUpscaling, setIsUpscaling] = useState(false);
    const [editingDesign, setEditingDesign] = useState<GeneratedDesign | null>(null);
    const [editPrompt, setEditPrompt] = useState('');
    const [showConfirmUpscale, setShowConfirmUpscale] = useState(false);
    const [upscaleTargetId, setUpscaleTargetId] = useState<string | null>(null);
    const [showAdmin, setShowAdmin] = useState(false);
    const [telemetry, setTelemetry] = useState<SessionTelemetry>(getSessionTelemetry());
    const [spotlightDesign, setSpotlightDesign] = useState<GeneratedDesign | null>(null);
    const promptRef = useRef<HTMLTextAreaElement>(null);

    const refreshTelemetry = useCallback(() => {
        setTelemetry(getSessionTelemetry());
    }, []);

    const dismissSpotlight = () => {
        setSpotlightDesign(null);
    };

    const handleGenerate = async (inputPrompt?: string) => {
        const finalPrompt = inputPrompt || prompt;
        if (!finalPrompt.trim() || isGenerating) return;

        setIsGenerating(true);
        try {
            // If there's a current spotlight, it has already been added to designs
            // Just dismiss it — it's already in the gallery
            if (spotlightDesign) {
                setSpotlightDesign(null);
            }
            const design = await generateDesign(finalPrompt.trim(), '512px');
            setDesigns(prev => [design, ...prev]);
            setSelectedId(design.id);
            setSpotlightDesign(design);
            setPrompt('');
            refreshTelemetry();
        } finally {
            setIsGenerating(false);
        }
    };

    const handleEditDesign = async () => {
        if (!editPrompt.trim() || !editingDesign || isGenerating) return;

        setIsGenerating(true);
        try {
            const design = await generateDesign(editPrompt.trim(), '512px');
            setDesigns(prev => prev.map(d => d.id === editingDesign.id ? design : d));
            if (selectedId === editingDesign.id) setSelectedId(design.id);
            setEditingDesign(design);
            setEditPrompt(design.prompt);
            refreshTelemetry();
        } finally {
            setIsGenerating(false);
        }
    };

    const handleUpscale = async () => {
        const target = designs.find(d => d.id === upscaleTargetId);
        if (!target || isUpscaling) return;
        setShowConfirmUpscale(false);
        setIsUpscaling(true);
        try {
            const upscaled = await generateDesign(target.prompt, '4k');
            setDesigns(prev => prev.map(d => d.id === upscaleTargetId ? upscaled : d));
            if (selectedId === upscaleTargetId) setSelectedId(upscaled.id);
            if (editingDesign?.id === upscaleTargetId) {
                setEditingDesign(upscaled);
                setEditPrompt(upscaled.prompt);
            }
            refreshTelemetry();
        } finally {
            setIsUpscaling(false);
            setUpscaleTargetId(null);
        }
    };

    const handleDelete = (id: string) => {
        setDesigns(prev => prev.filter(d => d.id !== id));
        if (selectedId === id) {
            setSelectedId(designs.length > 1 ? designs.find(d => d.id !== id)?.id || null : null);
        }
        if (editingDesign?.id === id) setEditingDesign(null);
    };

    const openEdit = (design: GeneratedDesign) => {
        setEditingDesign(design);
        setEditPrompt(design.prompt);
    };

    const handleReset = () => {
        resetSessionTelemetry();
        refreshTelemetry();
    };

    const buildSrcdoc = (html: string) => {
        return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>*{margin:0;padding:0;box-sizing:border-box}html,body{height:100%;overflow:hidden}</style></head><body>${html}</body></html>`;
    };

    const formatTime = (ts: number) => {
        const d = new Date(ts);
        return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="h-full flex flex-col"
        >
            {/* ── Header ── */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl md:text-3xl font-medium tracking-tight text-foreground">Design Playground</h1>
                    <p className="text-sm text-muted mt-1">Managed by **Number1**, your premier digital employee</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400 text-xs font-mono font-bold">
                        <DollarSign className="w-3 h-3" />
                        {telemetry.totalCost.toFixed(2)}
                    </div>
                    <button
                        onClick={() => setShowAdmin(!showAdmin)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all border ${showAdmin
                            ? 'bg-orange-500/10 border-orange-500/30 text-orange-400'
                            : 'bg-white/[0.04] border-white/[0.08] text-muted hover:text-foreground'
                            }`}
                    >
                        <BarChart3 className="w-3 h-3" />
                        <span className="hidden sm:inline">Admin</span>
                    </button>
                </div>
            </div>

            {/* ── Admin Panel ── */}
            <AnimatePresence>
                {showAdmin && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden mb-6"
                    >
                        <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-5">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-sm font-bold uppercase tracking-widest text-muted">Session Admin</h3>
                                <button onClick={handleReset} className="text-xs text-red-400 hover:text-red-300 font-mono transition-colors">Reset</button>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                {[
                                    { label: 'Total Spent', value: `$${telemetry.totalCost.toFixed(2)}`, color: 'text-emerald-400' },
                                    { label: 'Generations', value: telemetry.generationCount, color: 'text-foreground' },
                                    { label: 'Upscales', value: telemetry.upscaleCount, color: 'text-indigo-400' },
                                    { label: 'Avg Cost/Gen', value: `$${(telemetry.generationCount + telemetry.upscaleCount > 0 ? telemetry.totalCost / (telemetry.generationCount + telemetry.upscaleCount) : 0).toFixed(3)}`, color: 'text-orange-400' },
                                ].map(s => (
                                    <div key={s.label} className="bg-white/[0.02] rounded-xl p-4 border border-white/[0.06]">
                                        <div className="text-muted text-[10px] uppercase tracking-widest mb-1">{s.label}</div>
                                        <div className={`text-xl font-bold font-mono ${s.color}`}>{s.value}</div>
                                    </div>
                                ))}
                            </div>
                            {telemetry.log.length > 0 && (
                                <div className="max-h-32 overflow-y-auto space-y-1.5">
                                    {telemetry.log.map((entry, i) => (
                                        <div key={i} className="flex items-center justify-between text-xs px-3 py-2 bg-white/[0.02] rounded-lg">
                                            <div className="flex items-center gap-2">
                                                <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${entry.action === 'Upscale 4K' ? 'bg-indigo-500/20 text-indigo-300' : 'bg-emerald-500/20 text-emerald-300'}`}>
                                                    {entry.action}
                                                </span>
                                                <span className="text-muted truncate max-w-[200px]">{entry.prompt}</span>
                                            </div>
                                            <span className="text-orange-400 font-mono font-bold shrink-0">${entry.cost.toFixed(2)}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── Generator Row ── */}
            <div className="flex flex-col lg:flex-row gap-4 mb-8">
                <div className="flex-1 bg-white/[0.02] border border-white/[0.06] rounded-2xl p-5">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted block mb-3">
                        Describe your UI
                    </label>
                    <textarea
                        ref={promptRef}
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="e.g. A neon-themed pricing table with 3 tiers..."
                        className="w-full bg-white/[0.06] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-white/30 focus:outline-none focus:border-white/20 focus:ring-1 focus:ring-white/10 transition-all resize-none h-20"
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleGenerate();
                            }
                        }}
                    />
                    <button
                        onClick={() => handleGenerate()}
                        disabled={!prompt.trim() || isGenerating}
                        className="mt-3 w-full flex items-center justify-center gap-2 px-5 py-3 bg-foreground text-background rounded-xl font-bold text-xs uppercase tracking-widest hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        {isGenerating ? (
                            <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</>
                        ) : (
                            <><Sparkles className="w-4 h-4" /> Generate — ${LOW_RES_COST.toFixed(2)}</>
                        )}
                    </button>
                </div>
                <div className="lg:w-[300px] shrink-0">
                    <div className="text-[10px] font-bold uppercase tracking-widest text-muted mb-3">Inspiration</div>
                    <div className="flex flex-wrap gap-2">
                        {INSPIRATION_PRESETS.map((preset) => (
                            <button
                                key={preset.label}
                                onClick={() => {
                                    setPrompt(preset.prompt);
                                    promptRef.current?.focus();
                                }}
                                className="px-3 py-1.5 bg-white/[0.04] border border-white/[0.08] rounded-full text-xs text-muted hover:text-foreground hover:border-white/20 transition-all"
                            >
                                {preset.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── Inline Spotlight Preview ── */}
            <AnimatePresence>
                {spotlightDesign && !editingDesign && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.35, ease: 'easeOut' }}
                        className="overflow-hidden mb-6"
                    >
                        <div className="rounded-2xl overflow-hidden border border-white/[0.1] bg-[#0e0e14] shadow-lg">
                            {/* Spotlight header */}
                            <div className="flex items-center justify-between px-5 py-3 border-b border-white/[0.06] bg-white/[0.02]">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                    <span className="text-xs font-bold uppercase tracking-widest text-white/60">Curated by Number1</span>
                                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-white/[0.06] text-white/40 border border-white/[0.08]">
                                        {spotlightDesign.resolution}
                                    </span>
                                </div>
                                <button
                                    onClick={dismissSpotlight}
                                    className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/[0.08] text-white/40 hover:text-white transition-all"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            {/* Large inline preview */}
                            <div className="bg-neutral-900 relative" style={{ height: '60vh' }}>
                                <iframe
                                    key={spotlightDesign.id}
                                    srcDoc={buildSrcdoc(spotlightDesign.html)}
                                    className="w-full h-full border-none"
                                    title="Spotlight Preview"
                                    sandbox="allow-scripts"
                                />
                            </div>

                            {/* Spotlight footer */}
                            <div className="flex items-center justify-between px-5 py-3 border-t border-white/[0.06] bg-white/[0.02]">
                                <p className="text-xs text-white/40 truncate mr-4">
                                    <span className="text-white/20 uppercase tracking-widest text-[10px] mr-2">Prompt:</span>
                                    {spotlightDesign.prompt}
                                </p>
                                <div className="flex items-center gap-2 shrink-0">
                                    <button
                                        onClick={() => {
                                            openEdit(spotlightDesign);
                                            dismissSpotlight();
                                        }}
                                        className="flex items-center gap-1.5 px-3 py-2 bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.08] text-white rounded-xl text-xs font-bold uppercase tracking-widest transition-all"
                                    >
                                        <Pencil className="w-3 h-3" />
                                        Edit
                                    </button>
                                    {spotlightDesign.resolution !== '4k' && (
                                        <button
                                            onClick={() => {
                                                setUpscaleTargetId(spotlightDesign.id);
                                                setShowConfirmUpscale(true);
                                            }}
                                            className="flex items-center gap-1.5 px-3 py-2 bg-indigo-500 hover:bg-indigo-400 text-white rounded-xl text-xs font-bold uppercase tracking-widest transition-all shadow-md"
                                        >
                                            <ArrowUpCircle className="w-3 h-3" />
                                            Upscale 4K
                                        </button>
                                    )}
                                    <button
                                        onClick={dismissSpotlight}
                                        className="flex items-center gap-1.5 px-3 py-2 bg-white text-black rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-white/90 transition-all"
                                    >
                                        Done
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── Gallery ── */}
            <div className="flex-1 min-h-0">
                {designs.length > 0 ? (
                    <>
                        <div className="text-[10px] font-bold uppercase tracking-widest text-muted mb-4 flex items-center justify-between">
                            <span>Your Designs ({designs.length})</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 overflow-y-auto max-h-[calc(100vh-420px)] pb-4 pr-1">
                            {designs.map((design) => (
                                <motion.div
                                    key={design.id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.3 }}
                                    className={`group relative rounded-2xl overflow-hidden border-2 transition-all bg-neutral-900 ${selectedId === design.id
                                        ? 'border-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.15)]'
                                        : 'border-white/[0.06] hover:border-white/[0.15]'
                                        }`}
                                >
                                    {/* Preview thumbnail — bigger */}
                                    <div
                                        className="relative aspect-[16/10] overflow-hidden cursor-pointer"
                                        onClick={() => setSelectedId(design.id)}
                                    >
                                        <iframe
                                            srcDoc={buildSrcdoc(design.html)}
                                            className="border-none pointer-events-none origin-top-left absolute top-0 left-0"
                                            style={{ transform: 'scale(0.5)', width: '200%', height: '200%' }}
                                            title={design.prompt}
                                            sandbox="allow-scripts"
                                        />
                                        {/* Gradient overlay on hover */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300" />
                                    </div>

                                    {/* Card footer */}
                                    <div className="px-4 py-3 bg-white/[0.02] border-t border-white/[0.06]">
                                        <p className="text-xs text-muted truncate mb-2">{design.prompt}</p>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                {/* Resolution badge */}
                                                <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${design.resolution === '4k'
                                                    ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                                                    : 'bg-white/[0.06] text-white/50 border border-white/[0.08]'
                                                    }`}>
                                                    {design.resolution}
                                                </span>
                                                {/* Time */}
                                                <span className="text-[10px] text-white/30 flex items-center gap-1">
                                                    <Clock className="w-2.5 h-2.5" />
                                                    {formatTime(design.timestamp)}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                {/* Edit */}
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); openEdit(design); }}
                                                    className="w-7 h-7 flex items-center justify-center rounded-lg bg-white/[0.06] hover:bg-white/[0.12] text-white/50 hover:text-white transition-all"
                                                    title="Edit"
                                                >
                                                    <Pencil className="w-3 h-3" />
                                                </button>
                                                {/* Upscale */}
                                                {design.resolution !== '4k' && (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setUpscaleTargetId(design.id);
                                                            setShowConfirmUpscale(true);
                                                        }}
                                                        className="w-7 h-7 flex items-center justify-center rounded-lg bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-400 transition-all"
                                                        title="Upscale to 4K"
                                                    >
                                                        <ArrowUpCircle className="w-3 h-3" />
                                                    </button>
                                                )}
                                                {design.resolution === '4k' && (
                                                    <span className="w-7 h-7 flex items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
                                                        <Check className="w-3 h-3" />
                                                    </span>
                                                )}
                                                {/* Delete */}
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleDelete(design.id); }}
                                                    className="w-7 h-7 flex items-center justify-center rounded-lg bg-white/[0.04] hover:bg-red-500/20 text-white/30 hover:text-red-400 transition-all"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="w-3 h-3" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </>
                ) : (
                    /* Empty State */
                    <div className="flex-1 flex items-center justify-center rounded-2xl border-2 border-dashed border-white/[0.06] min-h-[300px]">
                        <div className="text-center max-w-sm px-8">
                            <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mx-auto mb-5">
                                <Eye className="w-8 h-8 text-muted" />
                            </div>
                            <h3 className="text-lg font-medium text-foreground mb-2">No designs yet</h3>
                            <p className="text-sm text-muted leading-relaxed">
                                Describe a UI above and hit Generate. Your designs will appear here as cards you can edit and upscale.
                            </p>
                        </div>
                    </div>
                )}
            </div>


            {/* ── Edit Design Overlay ── */}
            <AnimatePresence>
                {editingDesign && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 md:p-8"
                        onClick={() => setEditingDesign(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.92, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.92, opacity: 0 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-[#0e0e14] border border-white/[0.08] rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden"
                        >
                            {/* Overlay Header */}
                            <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
                                <div className="flex items-center gap-3">
                                    <Pencil className="w-4 h-4 text-indigo-400" />
                                    <h2 className="text-base font-bold text-white">Edit Design</h2>
                                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${editingDesign.resolution === '4k'
                                        ? 'bg-indigo-500/20 text-indigo-300'
                                        : 'bg-white/[0.06] text-white/50'
                                        }`}>
                                        {editingDesign.resolution}
                                    </span>
                                </div>
                                <button
                                    onClick={() => setEditingDesign(null)}
                                    className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/[0.08] text-white/50 hover:text-white transition-all"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            {/* Overlay Preview */}
                            <div className="flex-1 min-h-0 bg-neutral-900 relative">
                                <iframe
                                    key={editingDesign.id}
                                    srcDoc={buildSrcdoc(editingDesign.html)}
                                    className="w-full h-full border-none min-h-[300px]"
                                    style={{ height: '50vh' }}
                                    title="Edit Preview"
                                    sandbox="allow-scripts"
                                />
                                {(isGenerating || isUpscaling) && (
                                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-10">
                                        <div className="flex flex-col items-center gap-3">
                                            <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
                                            <span className="text-sm text-white/70 font-mono">
                                                {isUpscaling ? 'Upscaling to 4K...' : 'Regenerating...'}
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Overlay Edit Bar */}
                            <div className="px-6 py-4 border-t border-white/[0.06]">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 block mb-2">Refine Prompt</label>
                                <div className="flex gap-3">
                                    <div className="flex-1 flex items-center gap-2 bg-white/[0.06] border border-white/[0.08] rounded-xl px-4 py-3">
                                        <Pencil className="w-3.5 h-3.5 text-white/30 shrink-0" />
                                        <input
                                            type="text"
                                            value={editPrompt}
                                            onChange={(e) => setEditPrompt(e.target.value)}
                                            className="flex-1 bg-transparent text-sm text-white placeholder:text-white/25 focus:outline-none"
                                            placeholder="Edit your prompt to refine this design..."
                                            onKeyDown={(e) => { if (e.key === 'Enter') handleEditDesign(); }}
                                            autoFocus
                                        />
                                    </div>
                                    <button
                                        onClick={handleEditDesign}
                                        disabled={!editPrompt.trim() || isGenerating}
                                        className="flex items-center gap-2 px-5 py-3 bg-white text-black rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-white/90 transition-all disabled:opacity-40"
                                    >
                                        {isGenerating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
                                        Regenerate
                                    </button>
                                    {editingDesign.resolution !== '4k' && (
                                        <button
                                            onClick={() => {
                                                setUpscaleTargetId(editingDesign.id);
                                                setShowConfirmUpscale(true);
                                            }}
                                            disabled={isUpscaling}
                                            className="flex items-center gap-2 px-5 py-3 bg-indigo-500 text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-indigo-400 transition-all disabled:opacity-40 shadow-md"
                                        >
                                            <ArrowUpCircle className="w-3.5 h-3.5" />
                                            <span className="hidden sm:inline">4K</span>
                                        </button>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── Upscale Confirmation Modal ── */}
            <AnimatePresence>
                {showConfirmUpscale && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm"
                        onClick={() => { setShowConfirmUpscale(false); setUpscaleTargetId(null); }}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-[#0e0e14] border border-white/[0.08] rounded-2xl p-6 max-w-sm w-full mx-4 shadow-2xl"
                        >
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
                                    <AlertTriangle className="w-5 h-5 text-orange-400" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-white">Confirm Upscale</h3>
                                    <p className="text-xs text-white/40">This action will incur additional cost</p>
                                </div>
                            </div>
                            <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4 mb-5">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm text-white/50">Current</span>
                                    <span className="text-sm text-white font-mono">512px</span>
                                </div>
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm text-white/50">Target</span>
                                    <span className="text-sm text-indigo-400 font-mono font-bold">4K Ultra</span>
                                </div>
                                <div className="border-t border-white/[0.06] my-2 pt-2 flex justify-between items-center">
                                    <span className="text-sm font-medium text-white">Cost</span>
                                    <span className="text-lg font-bold text-orange-400 font-mono">${UPSCALE_COST.toFixed(2)}</span>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => { setShowConfirmUpscale(false); setUpscaleTargetId(null); }}
                                    className="flex-1 px-4 py-3 border border-white/[0.1] text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-white/[0.05] transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleUpscale}
                                    className="flex-1 px-4 py-3 bg-indigo-500 text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-indigo-400 transition-all shadow-md"
                                >
                                    Confirm & Upscale
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
