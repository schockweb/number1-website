"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

// ─── Types ────────────────────────────────────────────────────────────────────
interface WidgetData {
  id: string;
  type: "metric" | "chart" | "list" | "pipeline" | "hero" | "nav" | "quicklink" | "text" | "image" | "spacer" | "divider";
  x: number;
  y: number;
  w: number;  // grid columns (1-12)
  h: number;  // height in px
  title: string;
  content: Record<string, any>;
  locked: boolean;
}

// ─── Utility ──────────────────────────────────────────────────────────────────
let _idCounter = 0;
const uid = () => `w_${Date.now()}_${++_idCounter}`;

// ─── Color palette ────────────────────────────────────────────────────────────
const PALETTE = {
  bg:       "#F8FAFB",
  surface:  "#FFFFFF",
  border:   "rgba(0,0,0,0.06)",
  text:     "#0F172A",
  muted:    "#64748B",
  dimmed:   "#94A3B8",
  teal:     "#0D9488",
  tealDark: "#115E59",
  tealLight:"#CCFBF1",
  amber:    "#F59E0B",
  green:    "#10B981",
  red:      "#EF4444",
  indigo:   "#6366F1",
  purple:   "#8B5CF6",
};

// ─── Widget Templates ─────────────────────────────────────────────────────────
const WIDGET_TEMPLATES: { type: WidgetData["type"]; label: string; icon: string; desc: string; defaults: Partial<WidgetData> }[] = [
  {
    type: "nav", label: "Navigation Bar", icon: "☰", desc: "Top navigation with logo and links",
    defaults: { w: 12, h: 56, title: "Navigation", content: { brand: "EMS", links: ["Dashboard", "Admin Queue", "Cases", "Settings"] } },
  },
  {
    type: "hero", label: "Hero Section", icon: "★", desc: "Welcome banner with actions",
    defaults: { w: 12, h: 220, title: "Welcome back, System", content: { subtitle: "Your automated claims ingestion engine is online and processing.\nEverything is looking good today!", cta1: "Upload New PRF", cta2: "Go to Admin Queue", stats: [{ label: "TOTAL\nCLAIMS", value: "20" }, { label: "CASES", value: "20" }] } },
  },
  {
    type: "metric", label: "Metric Card", icon: "▦", desc: "Single KPI with label and value",
    defaults: { w: 3, h: 120, title: "Metric", content: { value: "0", subtitle: "Description here", icon: "📊", trend: "+12%" } },
  },
  {
    type: "chart", label: "Bar Chart", icon: "📊", desc: "Visual bar chart display",
    defaults: { w: 6, h: 200, title: "Analytics", content: { bars: [40, 65, 45, 80, 55, 90, 70, 85, 60, 95, 75, 100] } },
  },
  {
    type: "pipeline", label: "Pipeline", icon: "⟶", desc: "Multi-step processing pipeline",
    defaults: { w: 6, h: 170, title: "Live Processing Pipeline", content: { steps: [{ label: "Ingestion", value: 30, icon: "↓" }, { label: "Preprocessing", value: 0, icon: "⚙" }, { label: "AI OCR", value: 30, icon: "⚡" }, { label: "Adjudication", value: 0, icon: "✓" }, { label: "EDI Submit", value: 0, icon: "▲" }] } },
  },
  {
    type: "quicklink", label: "Quick Link", icon: "→", desc: "Navigation shortcut card",
    defaults: { w: 3, h: 70, title: "Admin Queue", content: { subtitle: "Click to manage →", color: PALETTE.teal } },
  },
  {
    type: "list", label: "Data List", icon: "≡", desc: "Scrollable data list or table",
    defaults: { w: 6, h: 240, title: "Recent Activity", content: { items: ["Claim #2041 processed", "PRF batch #18 split", "OCR completed for Doc #339", "Adjudication pending: 3 items", "ERA received from Discovery"] } },
  },
  {
    type: "text", label: "Text Block", icon: "T", desc: "Rich text / heading block",
    defaults: { w: 6, h: 60, title: "Section Title", content: { text: "Enter your text here...", fontSize: 18, fontWeight: 700 } },
  },
  {
    type: "image", label: "Image Placeholder", icon: "🖼", desc: "Image or media container",
    defaults: { w: 4, h: 180, title: "Image", content: { placeholder: true } },
  },
  {
    type: "divider", label: "Divider", icon: "—", desc: "Horizontal line separator",
    defaults: { w: 12, h: 20, title: "", content: {} },
  },
];

// ─── Initial EMS Dashboard Layout ─────────────────────────────────────────────
const INITIAL_DASHBOARD: WidgetData[] = [
  { id: "d_nav", type: "nav", x: 0, y: 0, w: 12, h: 56, title: "Navigation", locked: true, content: { brand: "EMS", links: ["Dashboard", "Admin Queue", "Case Management", "Adjudication", "EDI Submit", "ERA Tracking", "Analytics", "Settings"] } },
  { id: "d_hero", type: "hero", x: 0, y: 70, w: 12, h: 220, title: "Welcome back, System", locked: false, content: { subtitle: "Your automated claims ingestion engine is online and processing.\nEverything is looking good today!", cta1: "Upload New PRF", cta2: "Go to Admin Queue", stats: [{ label: "TOTAL\nCLAIMS", value: "20" }, { label: "CASES", value: "20" }] } },
  { id: "d_m1", type: "metric", x: 0, y: 310, w: 3, h: 120, title: "INGESTED PRFS", locked: false, content: { value: "30", subtitle: "Uploaded via all channels", icon: "📄", trend: "" } },
  { id: "d_m2", type: "metric", x: 3, y: 310, w: 3, h: 120, title: "COMPLETED OCR", locked: false, content: { value: "30", subtitle: "Extracted & Structured", icon: "✅", trend: "" } },
  { id: "d_m3", type: "metric", x: 0, y: 445, w: 3, h: 120, title: "REQUIRES REVIEW", locked: false, content: { value: "10", subtitle: "Awaiting manual verify", icon: "⚠️", trend: "" } },
  { id: "d_m4", type: "metric", x: 3, y: 445, w: 3, h: 120, title: "CLEAN CLAIMS", locked: false, content: { value: "0", subtitle: "Ready for submission", icon: "💳", trend: "" } },
  { id: "d_pipeline", type: "pipeline", x: 0, y: 580, w: 6, h: 170, title: "Live Processing Pipeline", locked: false, content: { steps: [{ label: "Ingestion", value: 30, icon: "↓" }, { label: "Preprocessing", value: 0, icon: "⚙" }, { label: "AI OCR", value: 30, icon: "⚡" }, { label: "Adjudication", value: 0, icon: "✓" }, { label: "EDI Submit", value: 0, icon: "▲" }] } },
  { id: "d_qa_title", type: "text", x: 6, y: 310, w: 6, h: 40, title: "Quick Access", locked: true, content: { text: "Quick Access", fontSize: 16, fontWeight: 800 } },
  { id: "d_qa1", type: "quicklink", x: 6, y: 360, w: 6, h: 65, title: "Admin Queue", locked: false, content: { subtitle: "Click to manage →", color: PALETTE.teal } },
  { id: "d_qa2", type: "quicklink", x: 6, y: 435, w: 6, h: 65, title: "Case Management", locked: false, content: { subtitle: "Click to manage →", color: PALETTE.muted } },
  { id: "d_qa3", type: "quicklink", x: 6, y: 510, w: 6, h: 65, title: "Adjudication Settings", locked: false, content: { subtitle: "Click to manage →", color: PALETTE.purple } },
  { id: "d_qa4", type: "quicklink", x: 6, y: 585, w: 6, h: 65, title: "AI Training / Rules", locked: false, content: { subtitle: "Click to manage →", color: PALETTE.amber } },
];

// ═══════════════════════════════════════════════════════════════════════════════
// WIDGET RENDERERS
// ═══════════════════════════════════════════════════════════════════════════════

function WidgetNav({ data }: { data: WidgetData }) {
  return (
    <div className="flex items-center justify-between w-full h-full px-5" style={{ fontFamily: "'Inter', sans-serif" }}>
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded" style={{ background: "conic-gradient(#0D9488, #FCD34D, #EF4444, #3B82F6)" }} />
        <div>
          <div className="text-sm font-extrabold" style={{ color: PALETTE.text }}>{data.content.brand}</div>
          <div className="text-[6px] font-bold tracking-[1px]" style={{ color: PALETTE.dimmed }}>MEDICAL CLAIMS</div>
        </div>
      </div>
      <div className="flex items-center gap-4">
        {(data.content.links || []).map((link: string, i: number) => (
          <div key={i} className="text-[11px] font-semibold px-2 py-1 rounded-md transition-colors" style={{
            color: i === 0 ? PALETTE.teal : PALETTE.muted,
            background: i === 0 ? PALETTE.tealLight : "transparent",
          }}>{link}</div>
        ))}
      </div>
      <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold" style={{ background: "#E2E8F0", color: PALETTE.muted }}>SA</div>
    </div>
  );
}

function WidgetHero({ data }: { data: WidgetData }) {
  const stats = data.content.stats || [];
  return (
    <div className="flex items-center justify-between w-full h-full px-10 rounded-2xl" style={{ background: `linear-gradient(135deg, ${PALETTE.teal}, ${PALETTE.tealDark})` }}>
      <div className="flex flex-col gap-3 max-w-[55%]">
        <h2 className="text-[26px] font-extrabold text-white leading-tight">{data.title}</h2>
        <p className="text-[13px] leading-relaxed whitespace-pre-line" style={{ color: PALETTE.tealLight }}>{data.content.subtitle}</p>
        <div className="flex gap-3 mt-2">
          {data.content.cta1 && <div className="px-4 py-2.5 rounded-lg text-[12px] font-bold bg-white flex items-center gap-2" style={{ color: PALETTE.teal }}>
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
            {data.content.cta1}
          </div>}
          {data.content.cta2 && <div className="px-4 py-2.5 rounded-lg text-[12px] font-bold text-white border border-white/30">{data.content.cta2}</div>}
        </div>
      </div>
      <div className="flex gap-3">
        {stats.map((s: any, i: number) => (
          <div key={i} className="rounded-xl px-5 py-4 flex flex-col justify-between min-w-[100px]" style={{ background: PALETTE.tealDark, minHeight: 110 }}>
            <div className="text-[9px] font-bold tracking-wide whitespace-pre-line" style={{ color: "#99F6E4" }}>{s.label}</div>
            <div className="text-[30px] font-extrabold text-white">{s.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function WidgetMetric({ data }: { data: WidgetData }) {
  return (
    <div className="flex flex-col justify-between w-full h-full p-5 rounded-xl border" style={{ background: PALETTE.surface, borderColor: PALETTE.border }}>
      <div className="flex justify-between items-start">
        <div className="text-[10px] font-bold tracking-wider uppercase" style={{ color: PALETTE.muted }}>{data.title}</div>
        <span className="text-base">{data.content.icon}</span>
      </div>
      <div>
        <div className="text-[30px] font-extrabold leading-none mb-1" style={{ color: PALETTE.text }}>{data.content.value}</div>
        <div className="text-[11px]" style={{ color: PALETTE.dimmed }}>{data.content.subtitle}</div>
      </div>
    </div>
  );
}

function WidgetChart({ data }: { data: WidgetData }) {
  const bars = data.content.bars || [];
  return (
    <div className="flex flex-col w-full h-full p-5 rounded-xl border" style={{ background: PALETTE.surface, borderColor: PALETTE.border }}>
      <div className="text-[13px] font-bold mb-3" style={{ color: PALETTE.text }}>{data.title}</div>
      <div className="flex-1 flex items-end gap-[3px]">
        {bars.map((h: number, i: number) => (
          <div key={i} className="flex-1 rounded-t-sm transition-all duration-300 hover:opacity-80" style={{
            height: `${h}%`,
            background: i === bars.length - 1 ? PALETTE.teal : `${PALETTE.teal}40`,
          }} />
        ))}
      </div>
    </div>
  );
}

function WidgetPipeline({ data }: { data: WidgetData }) {
  const steps = data.content.steps || [];
  return (
    <div className="flex flex-col w-full h-full p-5 rounded-xl border" style={{ background: PALETTE.surface, borderColor: PALETTE.border }}>
      <div className="flex justify-between items-center mb-5">
        <div className="text-[13px] font-extrabold" style={{ color: PALETTE.text }}>{data.title}</div>
        <div className="flex items-center gap-1.5 text-[11px] font-semibold" style={{ color: PALETTE.dimmed }}>
          <div className="w-1.5 h-1.5 rounded-full" style={{ background: PALETTE.dimmed }} /> Idle
        </div>
      </div>
      <div className="flex-1 flex items-center justify-between relative px-2">
        <div className="absolute left-8 right-8 h-px" style={{ background: "#E2E8F0", top: "20px" }} />
        {steps.map((s: any, i: number) => (
          <div key={i} className="flex flex-col items-center gap-2 relative z-10">
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-base border" style={{ background: PALETTE.surface, borderColor: "#E2E8F0", color: i < 2 ? PALETTE.teal : PALETTE.muted }}>
              {s.icon}
            </div>
            <div className="text-center">
              <div className="text-[13px] font-extrabold" style={{ color: PALETTE.text }}>{s.value}</div>
              <div className="text-[9px]" style={{ color: PALETTE.muted }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function WidgetQuickLink({ data }: { data: WidgetData }) {
  return (
    <div className="flex items-center gap-4 w-full h-full px-5 rounded-xl border cursor-pointer transition-all hover:shadow-md" style={{ background: "#F8FAFC", borderColor: PALETTE.border }}>
      <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm" style={{ background: `${data.content.color}18`, color: data.content.color }}>●</div>
      <div>
        <div className="text-[12px] font-bold" style={{ color: PALETTE.text }}>{data.title}</div>
        <div className="text-[11px]" style={{ color: PALETTE.dimmed }}>{data.content.subtitle}</div>
      </div>
    </div>
  );
}

function WidgetList({ data }: { data: WidgetData }) {
  const items = data.content.items || [];
  return (
    <div className="flex flex-col w-full h-full p-5 rounded-xl border" style={{ background: PALETTE.surface, borderColor: PALETTE.border }}>
      <div className="text-[13px] font-bold mb-3" style={{ color: PALETTE.text }}>{data.title}</div>
      <div className="flex-1 overflow-y-auto space-y-2">
        {items.map((item: string, i: number) => (
          <div key={i} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[11px]" style={{ background: i % 2 === 0 ? "#F8FAFB" : "transparent", color: PALETTE.text }}>
            <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: PALETTE.teal }} />
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}

function WidgetText({ data }: { data: WidgetData }) {
  return (
    <div className="flex items-center w-full h-full">
      <div style={{ fontSize: data.content.fontSize || 18, fontWeight: data.content.fontWeight || 700, color: PALETTE.text }}>
        {data.content.text || data.title}
      </div>
    </div>
  );
}

function WidgetImage({ data }: { data: WidgetData }) {
  return (
    <div className="w-full h-full rounded-xl overflow-hidden border flex items-center justify-center" style={{ background: "#F1F5F9", borderColor: PALETTE.border }}>
      <div className="flex flex-col items-center gap-2 text-center opacity-40">
        <svg width="32" height="32" fill="none" stroke={PALETTE.dimmed} strokeWidth="1.5" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="M21 15l-5-5L5 21" /></svg>
        <span className="text-[10px] font-semibold" style={{ color: PALETTE.dimmed }}>Image Placeholder</span>
      </div>
    </div>
  );
}

function WidgetDivider() {
  return <div className="w-full flex items-center h-full"><div className="w-full h-px" style={{ background: PALETTE.border }} /></div>;
}

function WidgetSpacer() {
  return <div />;
}

// ─── Widget Renderer ──────────────────────────────────────────────────────────
function RenderWidget({ data }: { data: WidgetData }) {
  switch (data.type) {
    case "nav": return <WidgetNav data={data} />;
    case "hero": return <WidgetHero data={data} />;
    case "metric": return <WidgetMetric data={data} />;
    case "chart": return <WidgetChart data={data} />;
    case "pipeline": return <WidgetPipeline data={data} />;
    case "quicklink": return <WidgetQuickLink data={data} />;
    case "list": return <WidgetList data={data} />;
    case "text": return <WidgetText data={data} />;
    case "image": return <WidgetImage data={data} />;
    case "divider": return <WidgetDivider />;
    case "spacer": return <WidgetSpacer />;
    default: return <div className="p-4 text-xs text-gray-400">Unknown widget</div>;
  }
}

// ─── Draggable Widget Container ───────────────────────────────────────────────
function DraggableWidget({ widget, selected, gridColWidth, onSelect, onMove, onResize, onDragEnd, zoom }: {
  widget: WidgetData;
  selected: boolean;
  gridColWidth: number;
  onSelect: () => void;
  onMove: (dx: number, dy: number) => void;
  onResize: (dw: number, dh: number) => void;
  onDragEnd: () => void;
  zoom: number;
}) {
  const [dragging, setDragging] = useState(false);
  const [resizing, setResizing] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (widget.locked) return;
    e.stopPropagation();
    onSelect();
    setDragging(true);
    dragStart.current = { x: e.clientX, y: e.clientY };
  }, [widget.locked, onSelect]);

  useEffect(() => {
    if (!dragging) return;
    const move = (e: MouseEvent) => {
      const dx = (e.clientX - dragStart.current.x) / zoom;
      const dy = (e.clientY - dragStart.current.y) / zoom;
      dragStart.current = { x: e.clientX, y: e.clientY };
      onMove(dx, dy);
    };
    const up = () => { setDragging(false); onDragEnd(); };
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
    return () => { window.removeEventListener("mousemove", move); window.removeEventListener("mouseup", up); };
  }, [dragging, zoom, onMove]);

  const handleResizeDown = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setResizing(true);
    dragStart.current = { x: e.clientX, y: e.clientY };
  }, []);

  useEffect(() => {
    if (!resizing) return;
    const move = (e: MouseEvent) => {
      const dw = (e.clientX - dragStart.current.x) / zoom;
      const dh = (e.clientY - dragStart.current.y) / zoom;
      dragStart.current = { x: e.clientX, y: e.clientY };
      onResize(dw, dh);
    };
    const up = () => setResizing(false);
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
    return () => { window.removeEventListener("mousemove", move); window.removeEventListener("mouseup", up); };
  }, [resizing, zoom, onResize]);

  const left = (widget.x * gridColWidth) + 10;
  const width = (widget.w * gridColWidth) - 20;

  return (
    <div
      onMouseDown={handleMouseDown}
      className="absolute group"
      style={{
        left, top: widget.y, width, height: widget.h,
        zIndex: selected ? 100 : 10,
        cursor: widget.locked ? "default" : dragging ? "grabbing" : "grab",
        outline: selected ? `2px solid ${PALETTE.teal}` : "2px solid transparent",
        outlineOffset: 2,
        borderRadius: 12,
        transition: dragging ? "none" : "outline 0.15s",
      }}
    >
      <RenderWidget data={widget} />

      {/* Selection handles */}
      {selected && !widget.locked && (
        <div onMouseDown={handleResizeDown}
          className="absolute w-3.5 h-3.5 rounded-sm cursor-nwse-resize hover:scale-125 transition-transform"
          style={{ bottom: -6, right: -6, background: PALETTE.teal, border: "2px solid white", boxShadow: "0 2px 6px rgba(0,0,0,0.15)" }}
        />
      )}
      {selected && (
        <>
          {[{ t: -5, l: -5 }, { t: -5, r: -5 }, { b: -5, l: -5 }].map((pos, i) => (
            <div key={i} className="absolute w-2.5 h-2.5 rounded-full pointer-events-none"
              style={{ ...pos as any, background: PALETTE.teal, border: "2px solid white", boxShadow: "0 1px 4px rgba(0,0,0,0.12)" }} />
          ))}
        </>
      )}

      {/* Lock indicator */}
      {widget.locked && (
        <div className="absolute top-1 right-1 text-[10px] opacity-30" title="Locked">🔒</div>
      )}
    </div>
  );
}

// ─── Widget Library Panel ─────────────────────────────────────────────────────
function WidgetLibrary({ onAddWidget }: { onAddWidget: (template: typeof WIDGET_TEMPLATES[0]) => void }) {
  return (
    <div className="space-y-1.5">
      {WIDGET_TEMPLATES.map(t => (
        <button key={t.type} onClick={() => onAddWidget(t)}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all hover:bg-white/[0.06] border border-transparent hover:border-white/[0.08] group">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-base bg-white/[0.04] group-hover:bg-white/[0.08] transition-colors">{t.icon}</div>
          <div className="flex-1 min-w-0">
            <div className="text-[11px] font-bold text-white/70 group-hover:text-white/90 truncate">{t.label}</div>
            <div className="text-[9px] text-white/30 truncate">{t.desc}</div>
          </div>
          <svg className="w-3.5 h-3.5 text-white/20 group-hover:text-white/40 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
        </button>
      ))}
    </div>
  );
}

// ─── Properties Panel ─────────────────────────────────────────────────────────
function PropertiesPanel({ widget, onChange, onDelete, onDuplicate, onToggleLock }: {
  widget: WidgetData;
  onChange: (patch: Partial<WidgetData>) => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onToggleLock: () => void;
}) {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="text-[10px] font-mono text-white/30 uppercase tracking-widest">Properties</div>
        <div className="flex gap-1">
          <button onClick={onDuplicate} className="w-7 h-7 rounded-lg flex items-center justify-center text-[12px] bg-white/[0.04] hover:bg-white/[0.08] text-white/40 hover:text-white/70 transition-all" title="Duplicate">⧉</button>
          <button onClick={onToggleLock} className="w-7 h-7 rounded-lg flex items-center justify-center text-[12px] bg-white/[0.04] hover:bg-white/[0.08] text-white/40 hover:text-white/70 transition-all" title={widget.locked ? "Unlock" : "Lock"}>{widget.locked ? "🔒" : "🔓"}</button>
          <button onClick={onDelete} className="w-7 h-7 rounded-lg flex items-center justify-center text-[12px] bg-white/[0.04] hover:bg-red-500/20 text-white/40 hover:text-red-400 transition-all" title="Delete">✕</button>
        </div>
      </div>

      {/* Identity */}
      <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 space-y-3">
        <div className="text-[9px] font-mono text-white/20 uppercase tracking-widest">Widget</div>
        <div className="flex items-center gap-2 text-[11px]">
          <span className="text-white/30">Type:</span>
          <span className="text-white/60 font-semibold capitalize">{widget.type}</span>
        </div>
        <div>
          <label className="text-[9px] text-white/25 uppercase block mb-1">Title</label>
          <input type="text" value={widget.title} onChange={e => onChange({ title: e.target.value })}
            className="w-full bg-white/[0.04] border border-white/[0.06] rounded-lg px-3 py-2 text-[11px] text-white/70 outline-none focus:border-teal-500/40" />
        </div>
      </div>

      {/* Layout */}
      <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 space-y-3">
        <div className="text-[9px] font-mono text-white/20 uppercase tracking-widest">Size & Position</div>
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: "Col", key: "x", val: widget.x },
            { label: "Y", key: "y", val: widget.y },
            { label: "Span", key: "w", val: widget.w },
            { label: "Height", key: "h", val: widget.h },
          ].map(f => (
            <div key={f.key} className="flex items-center gap-1.5">
              <span className="text-[9px] text-white/25 w-8">{f.label}</span>
              <input type="number" value={Math.round(f.val)} onChange={e => onChange({ [f.key]: Number(e.target.value) })}
                className="flex-1 bg-white/[0.04] border border-white/[0.06] rounded-lg px-2 py-1.5 text-[11px] text-white/70 font-mono outline-none focus:border-teal-500/40" />
            </div>
          ))}
        </div>
      </div>

      {/* Content editing for specific types */}
      {widget.type === "metric" && (
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 space-y-3">
          <div className="text-[9px] font-mono text-white/20 uppercase tracking-widest">Metric Data</div>
          <div>
            <label className="text-[9px] text-white/25 uppercase block mb-1">Value</label>
            <input type="text" value={widget.content.value} onChange={e => onChange({ content: { ...widget.content, value: e.target.value } })}
              className="w-full bg-white/[0.04] border border-white/[0.06] rounded-lg px-3 py-2 text-[11px] text-white/70 outline-none focus:border-teal-500/40" />
          </div>
          <div>
            <label className="text-[9px] text-white/25 uppercase block mb-1">Subtitle</label>
            <input type="text" value={widget.content.subtitle} onChange={e => onChange({ content: { ...widget.content, subtitle: e.target.value } })}
              className="w-full bg-white/[0.04] border border-white/[0.06] rounded-lg px-3 py-2 text-[11px] text-white/70 outline-none focus:border-teal-500/40" />
          </div>
          <div>
            <label className="text-[9px] text-white/25 uppercase block mb-1">Icon</label>
            <input type="text" value={widget.content.icon} onChange={e => onChange({ content: { ...widget.content, icon: e.target.value } })}
              className="w-full bg-white/[0.04] border border-white/[0.06] rounded-lg px-3 py-2 text-[11px] text-white/70 outline-none focus:border-teal-500/40" />
          </div>
        </div>
      )}

      {widget.type === "quicklink" && (
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 space-y-3">
          <div className="text-[9px] font-mono text-white/20 uppercase tracking-widest">Link Data</div>
          <div>
            <label className="text-[9px] text-white/25 uppercase block mb-1">Subtitle</label>
            <input type="text" value={widget.content.subtitle} onChange={e => onChange({ content: { ...widget.content, subtitle: e.target.value } })}
              className="w-full bg-white/[0.04] border border-white/[0.06] rounded-lg px-3 py-2 text-[11px] text-white/70 outline-none focus:border-teal-500/40" />
          </div>
        </div>
      )}

      {widget.type === "text" && (
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 space-y-3">
          <div className="text-[9px] font-mono text-white/20 uppercase tracking-widest">Text Content</div>
          <div>
            <label className="text-[9px] text-white/25 uppercase block mb-1">Text</label>
            <textarea value={widget.content.text} onChange={e => onChange({ content: { ...widget.content, text: e.target.value } })}
              className="w-full bg-white/[0.04] border border-white/[0.06] rounded-lg px-3 py-2 text-[11px] text-white/70 outline-none focus:border-teal-500/40 min-h-[60px] resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[9px] text-white/25 uppercase block mb-1">Font Size</label>
              <input type="number" value={widget.content.fontSize} onChange={e => onChange({ content: { ...widget.content, fontSize: Number(e.target.value) } })}
                className="w-full bg-white/[0.04] border border-white/[0.06] rounded-lg px-2 py-1.5 text-[11px] text-white/70 font-mono outline-none focus:border-teal-500/40" />
            </div>
            <div>
              <label className="text-[9px] text-white/25 uppercase block mb-1">Font Weight</label>
              <input type="number" value={widget.content.fontWeight} onChange={e => onChange({ content: { ...widget.content, fontWeight: Number(e.target.value) } })}
                className="w-full bg-white/[0.04] border border-white/[0.06] rounded-lg px-2 py-1.5 text-[11px] text-white/70 font-mono outline-none focus:border-teal-500/40" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


// ═══════════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════════════════════
// ─── Toast Notification ───────────────────────────────────────────────────────
function Toast({ message, onDone }: { message: string; onDone: () => void }) {
  useEffect(() => { const t = setTimeout(onDone, 2500); return () => clearTimeout(t); }, [onDone]);
  return (
    <motion.div
      initial={{ y: 40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 40, opacity: 0 }}
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[200] px-5 py-3 rounded-xl text-[12px] font-semibold shadow-2xl border border-white/[0.08] backdrop-blur-xl"
      style={{ background: "rgba(10,10,11,0.9)", color: "#14B8A6" }}
    >
      {message}
    </motion.div>
  );
}

// ─── Export Modal ─────────────────────────────────────────────────────────────
function ExportModal({ widgets, onClose }: { widgets: WidgetData[]; onClose: () => void }) {
  const json = JSON.stringify(widgets, null, 2);
  const [copied, setCopied] = useState(false);
  const copy = () => { navigator.clipboard.writeText(json); setCopied(true); setTimeout(() => setCopied(false), 2000); };
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[150] flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
        className="w-[640px] max-h-[80vh] bg-[#0E0E10] border border-white/[0.08] rounded-2xl shadow-2xl flex flex-col overflow-hidden"
        onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
          <div>
            <div className="text-sm font-bold text-white">Export Layout</div>
            <div className="text-[10px] text-white/30 mt-0.5">{widgets.length} widgets · JSON</div>
          </div>
          <div className="flex gap-2">
            <button onClick={copy}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-[11px] font-bold transition-all"
              style={{ background: copied ? "rgba(16,185,129,0.2)" : "rgba(13,148,136,0.15)", color: copied ? "#10B981" : "#14B8A6", border: `1px solid ${copied ? "rgba(16,185,129,0.3)" : "rgba(13,148,136,0.3)"}` }}>
              {copied ? "✓ Copied!" : "Copy JSON"}
            </button>
            <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-white/30 hover:text-white/60 hover:bg-white/[0.06] transition-all">✕</button>
          </div>
        </div>
        <pre className="flex-1 overflow-auto p-6 text-[11px] font-mono text-white/50 leading-relaxed">{json}</pre>
      </motion.div>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════════════════════
export default function ProjectBuilderPage() {
  const [widgets, setWidgets] = useState<WidgetData[]>(INITIAL_DASHBOARD);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1.15);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [panning, setPanning] = useState(false);
  const [showGrid, setShowGrid] = useState(true);
  const [leftPanel, setLeftPanel] = useState<"library" | "layers" | null>("library");
  const [showExport, setShowExport] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const panStart = useRef({ x: 0, y: 0, ox: 0, oy: 0 });
  const canvasRef = useRef<HTMLDivElement>(null);

  // ── Undo/Redo ──
  const historyRef = useRef<WidgetData[][]>([]);
  const futureRef = useRef<WidgetData[][]>([]);
  const pushHistory = useCallback((snapshot: WidgetData[]) => {
    historyRef.current = [...historyRef.current.slice(-30), snapshot.map(w => ({ ...w, content: { ...w.content } }))];
    futureRef.current = [];
  }, []);
  const undo = useCallback(() => {
    if (historyRef.current.length === 0) return;
    const prev = historyRef.current[historyRef.current.length - 1];
    historyRef.current = historyRef.current.slice(0, -1);
    futureRef.current = [...futureRef.current, widgets.map(w => ({ ...w, content: { ...w.content } }))];
    setWidgets(prev);
    setToast("↶ Undo");
  }, [widgets]);
  const redo = useCallback(() => {
    if (futureRef.current.length === 0) return;
    const next = futureRef.current[futureRef.current.length - 1];
    futureRef.current = futureRef.current.slice(0, -1);
    historyRef.current = [...historyRef.current, widgets.map(w => ({ ...w, content: { ...w.content } }))];
    setWidgets(next);
    setToast("↷ Redo");
  }, [widgets]);

  const GRID_COLS = 12;
  const CANVAS_WIDTH = 1200;
  const COL_WIDTH = CANVAS_WIDTH / GRID_COLS;

  const selected = widgets.find(w => w.id === selectedId) || null;

  // ── Canvas actions ──
  const addWidget = (template: typeof WIDGET_TEMPLATES[0]) => {
    pushHistory(widgets);
    const nw: WidgetData = {
      id: uid(),
      type: template.type,
      x: template.defaults.w === 12 ? 0 : 1,
      y: Math.max(0, ...widgets.map(w => w.y + w.h)) + 15,
      w: template.defaults.w || 6,
      h: template.defaults.h || 100,
      title: template.defaults.title || template.label,
      content: { ...template.defaults.content },
      locked: false,
    };
    setWidgets(prev => [...prev, nw]);
    setSelectedId(nw.id);
    setToast(`+ Added ${template.label}`);
  };

  const updateWidget = useCallback((id: string, patch: Partial<WidgetData>) => {
    setWidgets(prev => prev.map(w => w.id === id ? { ...w, ...patch } : w));
  }, []);

  const moveWidget = useCallback((id: string, dx: number, dy: number) => {
    setWidgets(prev => prev.map(w => {
      if (w.id !== id) return w;
      const newX = Math.max(0, Math.min(GRID_COLS - w.w, w.x + dx / COL_WIDTH));
      const newY = Math.max(0, w.y + dy);
      return { ...w, x: Math.round(newX * 2) / 2, y: Math.round(newY) };
    }));
  }, [COL_WIDTH]);

  const snapWidget = useCallback((id: string) => {
    pushHistory(widgets);
    setWidgets(prev => prev.map(w => {
      if (w.id !== id) return w;
      return { ...w, x: Math.round(w.x), y: Math.round(w.y / 5) * 5 };
    }));
  }, [widgets, pushHistory]);

  const resizeWidget = useCallback((id: string, dw: number, dh: number) => {
    setWidgets(prev => prev.map(w => {
      if (w.id !== id) return w;
      const newW = Math.max(1, Math.min(GRID_COLS - w.x, w.w + dw / COL_WIDTH));
      const newH = Math.max(30, w.h + dh);
      return { ...w, w: Math.round(newW), h: Math.round(newH) };
    }));
  }, [COL_WIDTH]);

  const deleteWidget = (id: string) => {
    pushHistory(widgets);
    const name = widgets.find(w => w.id === id)?.title || "Widget";
    setWidgets(prev => prev.filter(w => w.id !== id));
    if (selectedId === id) setSelectedId(null);
    setToast(`✕ Removed ${name}`);
  };

  const duplicateWidget = (id: string) => {
    pushHistory(widgets);
    const src = widgets.find(w => w.id === id);
    if (!src) return;
    const nw = { ...src, id: uid(), y: src.y + src.h + 10, content: { ...src.content } };
    setWidgets(prev => [...prev, nw]);
    setSelectedId(nw.id);
    setToast(`⧉ Duplicated ${src.title}`);
  };

  const resetCanvas = () => {
    if (window.confirm("Reset canvas to the original EMS Dashboard layout?")) {
      pushHistory(widgets);
      setWidgets(INITIAL_DASHBOARD.map(w => ({ ...w, content: { ...w.content } })));
      setSelectedId(null);
      setZoom(1.15);
      setPanOffset({ x: 0, y: 0 });
      setToast("↻ Canvas reset to original");
    }
  };

  // ── Pan ──
  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if (e.target === canvasRef.current || (e.target as HTMLElement).dataset.canvas) {
      setSelectedId(null);
    }
    if (e.button === 1 || e.altKey) {
      setPanning(true);
      panStart.current = { x: e.clientX, y: e.clientY, ox: panOffset.x, oy: panOffset.y };
    }
  };

  useEffect(() => {
    if (!panning) return;
    const move = (e: MouseEvent) => setPanOffset({ x: panStart.current.ox + (e.clientX - panStart.current.x), y: panStart.current.oy + (e.clientY - panStart.current.y) });
    const up = () => setPanning(false);
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
    return () => { window.removeEventListener("mousemove", move); window.removeEventListener("mouseup", up); };
  }, [panning]);

  // ── Zoom ──
  useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;
    const handler = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        setZoom(z => Math.min(3, Math.max(0.2, z - e.deltaY * 0.002)));
      }
    };
    el.addEventListener("wheel", handler, { passive: false });
    return () => el.removeEventListener("wheel", handler);
  }, []);

  // ── Keyboard ──
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Delete" && selectedId) deleteWidget(selectedId);
      if (e.key === "Escape") { setSelectedId(null); setShowExport(false); }
      if ((e.ctrlKey || e.metaKey) && e.key === "d" && selectedId) { e.preventDefault(); duplicateWidget(selectedId); }
      if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) { e.preventDefault(); undo(); }
      if ((e.ctrlKey || e.metaKey) && e.key === "z" && e.shiftKey) { e.preventDefault(); redo(); }
      if ((e.ctrlKey || e.metaKey) && e.key === "y") { e.preventDefault(); redo(); }
      if ((e.ctrlKey || e.metaKey) && e.key === "e") { e.preventDefault(); setShowExport(true); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  });

  return (
    <div className="h-screen flex flex-col bg-[#060608] text-white overflow-hidden select-none" style={{ fontFamily: "'Inter', sans-serif" }}>

      {/* ═══ Top Bar ═══ */}
      <div className="h-12 flex items-center px-4 gap-3 border-b border-white/[0.06] bg-[#0A0A0B]/95 backdrop-blur-xl shrink-0 z-50">
        {/* Back */}
        <Link href="/canvas" className="flex items-center gap-2 text-white/30 hover:text-white/60 transition-colors text-xs font-medium">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          Canvas
        </Link>

        <div className="w-px h-5 bg-white/[0.08]" />

        {/* Title */}
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-sm font-bold tracking-tight bg-gradient-to-r from-teal-400 to-emerald-400 bg-clip-text text-transparent" style={{ fontFamily: "var(--font-syne, sans-serif)" }}>
            Project Builder
          </span>
        </div>

        {/* Center tools */}
        <div className="flex-1 flex items-center justify-center gap-1">
          {/* Left panel toggles */}
          <button onClick={() => setLeftPanel("library")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all"
            style={{ background: leftPanel === "library" ? "rgba(13,148,136,0.15)" : "rgba(255,255,255,0.04)", color: leftPanel === "library" ? "#14B8A6" : "rgba(255,255,255,0.4)", border: `1px solid ${leftPanel === "library" ? "rgba(13,148,136,0.3)" : "rgba(255,255,255,0.06)"}` }}>
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
            Widgets
          </button>
          <button onClick={() => setLeftPanel("layers")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all"
            style={{ background: leftPanel === "layers" ? "rgba(13,148,136,0.15)" : "rgba(255,255,255,0.04)", color: leftPanel === "layers" ? "#14B8A6" : "rgba(255,255,255,0.4)", border: `1px solid ${leftPanel === "layers" ? "rgba(13,148,136,0.3)" : "rgba(255,255,255,0.06)"}` }}>
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
            Layers
          </button>

          <div className="w-px h-5 bg-white/[0.06] mx-2" />

          {/* Grid toggle */}
          <button onClick={() => setShowGrid(!showGrid)}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[13px] transition-all"
            style={{ background: showGrid ? "rgba(255,255,255,0.06)" : "transparent", color: showGrid ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.2)", border: `1px solid ${showGrid ? "rgba(255,255,255,0.08)" : "transparent"}` }}
            title="Toggle Grid">▦</button>

          <div className="w-px h-5 bg-white/[0.06] mx-1" />

          {/* Zoom */}
          <button onClick={() => setZoom(z => Math.min(3, z + 0.1))} className="w-7 h-7 rounded-lg flex items-center justify-center text-xs text-white/40 hover:text-white/60 bg-white/[0.03] hover:bg-white/[0.06] transition-all" title="Zoom In">+</button>
          <div className="text-[10px] font-mono text-white/30 w-10 text-center">{Math.round(zoom * 100)}%</div>
          <button onClick={() => setZoom(z => Math.max(0.2, z - 0.1))} className="w-7 h-7 rounded-lg flex items-center justify-center text-xs text-white/40 hover:text-white/60 bg-white/[0.03] hover:bg-white/[0.06] transition-all" title="Zoom Out">−</button>
          <button onClick={() => { setZoom(1.15); setPanOffset({ x: 0, y: 0 }); }}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-xs text-white/40 hover:text-white/60 bg-white/[0.03] hover:bg-white/[0.06] transition-all" title="Reset View">⊙</button>

          <div className="w-px h-5 bg-white/[0.06] mx-1" />

          {/* Undo / Redo */}
          <button onClick={undo} title="Undo (Ctrl+Z)"
            className="w-7 h-7 rounded-lg flex items-center justify-center text-xs text-white/40 hover:text-white/60 bg-white/[0.03] hover:bg-white/[0.06] transition-all disabled:opacity-20 disabled:cursor-default"
            disabled={historyRef.current.length === 0}>↶</button>
          <button onClick={redo} title="Redo (Ctrl+Shift+Z)"
            className="w-7 h-7 rounded-lg flex items-center justify-center text-xs text-white/40 hover:text-white/60 bg-white/[0.03] hover:bg-white/[0.06] transition-all disabled:opacity-20 disabled:cursor-default"
            disabled={futureRef.current.length === 0}>↷</button>

          <div className="w-px h-5 bg-white/[0.06] mx-1" />

          {/* Export */}
          <button onClick={() => setShowExport(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all bg-teal-500/10 hover:bg-teal-500/20 text-teal-400/80 hover:text-teal-400 border border-teal-500/20" title="Export Layout (Ctrl+E)">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
            Export
          </button>

          {/* Reset */}
          <button onClick={resetCanvas}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all bg-red-500/10 hover:bg-red-500/20 text-red-400/70 hover:text-red-400 border border-red-500/20" title="Reset to Original">
            ↻ Reset
          </button>
        </div>

        {/* Right */}
        <div className="flex items-center gap-3">
          <div className="text-[10px] font-mono text-white/20">{widgets.length} widgets</div>
          <div className="px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.06] text-[10px] text-white/30">
            <span className="text-teal-400 font-bold">Ctrl+Z</span> undo · <span className="text-teal-400 font-bold">Ctrl+E</span> export
          </div>
        </div>
      </div>

      {/* ═══ Main Area ═══ */}
      <div className="flex-1 flex overflow-hidden">

        {/* Left Panel - Permanent */}
        <div className="w-[240px] border-r border-white/[0.06] bg-[#0A0A0B] overflow-hidden shrink-0 z-30 flex flex-col">
          <div className="px-4 pt-4 pb-3">
            <div className="text-[10px] font-mono text-white/30 uppercase tracking-widest">
              {leftPanel === "library" ? "Widget Library" : "Layers"}
            </div>
          </div>
          <div className="flex-1 overflow-y-auto px-2 pb-4">
            {leftPanel === "library" && <WidgetLibrary onAddWidget={addWidget} />}
            {leftPanel === "layers" && (
              <div className="space-y-0.5">
                {widgets.map(w => (
                  <button key={w.id} onClick={() => setSelectedId(w.id)}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-all text-[11px]"
                    style={{
                      background: selectedId === w.id ? "rgba(13,148,136,0.12)" : "transparent",
                      color: selectedId === w.id ? "#14B8A6" : "rgba(255,255,255,0.5)",
                    }}>
                    <span className="text-[10px] opacity-50">{WIDGET_TEMPLATES.find(t => t.type === w.type)?.icon || "◻"}</span>
                    <span className="flex-1 truncate font-medium">{w.title || w.type}</span>
                    {w.locked && <span className="text-[8px] opacity-30">🔒</span>}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Canvas */}
        <div ref={canvasRef} className="flex-1 relative overflow-hidden flex items-center justify-center p-10" data-canvas="true"
          onMouseDown={handleCanvasMouseDown}
          style={{ cursor: panning ? "grabbing" : "default", background: "#111113" }}>

          {/* Grid overlay */}
          {showGrid && (
            <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{
              backgroundImage: `linear-gradient(rgba(255,255,255,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.4) 1px, transparent 1px)`,
              backgroundSize: `${40 * zoom}px ${40 * zoom}px`,
              backgroundPosition: `${panOffset.x % (40 * zoom)}px ${panOffset.y % (40 * zoom)}px`,
            }} />
          )}

          {/* Canvas surface */}
          <div className="absolute inset-0" style={{
            transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoom})`,
            transformOrigin: "center center",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}>
            {/* White canvas area */}
            <div data-canvas="true" className="relative shadow-2xl shrink-0" style={{
              width: CANVAS_WIDTH,
              height: Math.max(900, ...widgets.map(w => w.y + w.h)) + 80,
              background: PALETTE.bg,
              boxShadow: "0 25px 100px rgba(0,0,0,0.5)",
            }}>
              {/* Column guides */}
              {showGrid && (
                <div className="absolute inset-0 pointer-events-none opacity-[0.04]">
                  {Array.from({ length: GRID_COLS + 1 }).map((_, i) => (
                    <div key={i} className="absolute top-0 bottom-0 w-px" style={{ left: i * COL_WIDTH, background: PALETTE.teal }} />
                  ))}
                </div>
              )}

              {/* Padding area */}
              <div className="relative" style={{ padding: 20 }}>
                {widgets.map(w => (
                  <DraggableWidget
                    key={w.id}
                    widget={w}
                    selected={selectedId === w.id}
                    gridColWidth={COL_WIDTH}
                    onSelect={() => setSelectedId(w.id)}
                    onMove={(dx, dy) => moveWidget(w.id, dx, dy)}
                    onResize={(dw, dh) => resizeWidget(w.id, dw, dh)}
                    onDragEnd={() => snapWidget(w.id)}
                    zoom={zoom}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel — Properties (Permanent, empty state if none selected) */}
        <div className="w-[280px] border-l border-white/[0.06] bg-[#0A0A0B] overflow-hidden shrink-0 h-full flex flex-col">
          {selected ? (
            <div className="flex-1 overflow-y-auto p-4">
              <PropertiesPanel
                widget={selected}
                onChange={(patch) => updateWidget(selected.id, patch)}
                onDelete={() => deleteWidget(selected.id)}
                onDuplicate={() => duplicateWidget(selected.id)}
                onToggleLock={() => updateWidget(selected.id, { locked: !selected.locked })}
              />
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center flex-col text-center p-6 opacity-30">
              <svg className="w-8 h-8 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" /></svg>
              <div className="text-xs font-semibold">Select a widget</div>
              <div className="text-[10px] mt-1">Properties will appear here</div>
            </div>
          )}
        </div>
      </div>

      {/* Toast */}
      <AnimatePresence>
        {toast && <Toast message={toast} onDone={() => setToast(null)} />}
      </AnimatePresence>

      {/* Export Modal */}
      <AnimatePresence>
        {showExport && <ExportModal widgets={widgets} onClose={() => setShowExport(false)} />}
      </AnimatePresence>
    </div>
  );
}
