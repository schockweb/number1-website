"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

export const dynamic = "force-dynamic";

// ─── Shared palette data (mirrors canvas page) ───────────────────────────────
const PALETTES = [
  { id: "midnight", name: "Midnight Luxury", emotion: "Authority · Prestige · Premium", bg: "#0A0A0B", surface: "#141517", accent: "#C8A97E", text: "#FFFFFF", muted: "#71717A", preview: ["#0A0A0B", "#141517", "#C8A97E", "#FFFFFF"] },
  { id: "cyber",    name: "Neon Cyber",      emotion: "Energy · Speed · Innovation",   bg: "#050511", surface: "#0A0A1F", accent: "#00FF9D", text: "#FFFFFF", muted: "#4A4B6B", preview: ["#050511", "#0A0A1F", "#00FF9D", "#FFFFFF"] },
  { id: "nordic",   name: "Nordic Clean",    emotion: "Trust · Clarity · Simplicity", bg: "#FAFAFA", surface: "#FFFFFF", accent: "#18181B", text: "#18181B", muted: "#A1A1AA", preview: ["#FAFAFA", "#FFFFFF", "#18181B", "#71717A"] },
  { id: "vibrant",  name: "Vibrant SaaS",    emotion: "Growth · Optimism · Action",   bg: "#F8FAFC", surface: "#FFFFFF", accent: "#4F46E5", text: "#0F172A", muted: "#64748B", preview: ["#F8FAFC", "#4F46E5", "#0F172A", "#64748B"] },
  { id: "ember",    name: "Ember Brand",     emotion: "Passion · Urgency · Bold",     bg: "#0D0705", surface: "#1A0E0A", accent: "#F97316", text: "#FFF7ED", muted: "#7C5342", preview: ["#0D0705", "#1A0E0A", "#F97316", "#FFF7ED"] },
  { id: "ocean",    name: "Royal Ocean",     emotion: "Calm · Depth · Intelligence",  bg: "#020B18", surface: "#061525", accent: "#22D3EE", text: "#E0F2FE", muted: "#475569", preview: ["#020B18", "#061525", "#22D3EE", "#E0F2FE"] },
  { id: "rosegold", name: "Rose Gold",       emotion: "Elegance · Femininity · Warmth", bg: "#1A0D10", surface: "#2A1318", accent: "#FDA4AF", text: "#FFF1F2", muted: "#9F6672", preview: ["#1A0D10", "#2A1318", "#FDA4AF", "#FFF1F2"] },
  { id: "forest",   name: "Forest Sage",     emotion: "Natural · Organic · Grounded",  bg: "#0A120A", surface: "#131F13", accent: "#86EFAC", text: "#F0FDF4", muted: "#6B7C6B", preview: ["#0A120A", "#131F13", "#86EFAC", "#F0FDF4"] },
  { id: "cosmic",   name: "Cosmic Purple",   emotion: "Creative · Mystical · Bold",    bg: "#0A050F", surface: "#130A1E", accent: "#A855F7", text: "#FAF5FF", muted: "#6B4F80", preview: ["#0A050F", "#130A1E", "#A855F7", "#FAF5FF"] },
  { id: "sand",     name: "Warm Sand",       emotion: "Warmth · Approachable · Human", bg: "#FAF5EE", surface: "#FFFFFF", accent: "#92400E", text: "#1C0F08", muted: "#A87B5A", preview: ["#FAF5EE", "#FFFFFF", "#92400E", "#A87B5A"] },
];
const LIGHT_IDS = ["nordic", "vibrant", "sand"];

// ─── Available sections library ──────────────────────────────────────────────
interface SectionDef {
  id: string;
  label: string;
  icon: string;
  hint: string;
  render: (p: typeof PALETTES[0], spacing: string) => React.ReactNode;
}

const spacingMap: Record<string, string> = { compact: "py-4 px-5", balanced: "py-8 px-7", airy: "py-14 px-8" };

const SECTION_LIBRARY: SectionDef[] = [
  {
    id: "navbar",
    label: "Navigation Bar",
    icon: "≡",
    hint: "Top bar with logo and links",
    render: (p, sp) => (
      <div className={`flex justify-between items-center ${spacingMap[sp]} border-b`} style={{ background: p.surface, borderColor: `${p.accent}22` }}>
        <div className="font-bold text-sm tracking-widest" style={{ color: p.accent }}>BRAND</div>
        <div className="flex gap-5">
          {["Home", "Work", "Pricing", "Contact"].map(l => (
            <div key={l} className="text-[11px] font-medium" style={{ color: p.muted }}>{l}</div>
          ))}
        </div>
        <div className="px-4 py-1.5 rounded-lg text-[11px] font-bold" style={{ background: p.accent, color: LIGHT_IDS.includes(p.id) ? "#fff" : "#000" }}>Get Started</div>
      </div>
    ),
  },
  {
    id: "hero",
    label: "Hero Section",
    icon: "◈",
    hint: "Bold headline with CTA buttons",
    render: (p, sp) => (
      <div className={`flex flex-col items-center text-center ${spacingMap[sp]} relative`} style={{ background: p.bg }}>
        <div className="absolute inset-0 opacity-[0.04] blur-3xl" style={{ background: `radial-gradient(circle, ${p.accent}, transparent 70%)` }} />
        <div className="text-[9px] font-mono tracking-[0.25em] uppercase mb-3" style={{ color: p.accent }}>Introducing v2.0</div>
        <h1 className="text-2xl font-bold leading-tight mb-3" style={{ color: p.text }}>
          Built for the next generation
        </h1>
        <p className="text-xs max-w-xs leading-relaxed mb-5" style={{ color: p.muted }}>
          Stop blending in. Build an identity that speaks before you say a word.
        </p>
        <div className="flex gap-3">
          <div className="px-5 py-2.5 rounded-xl text-xs font-bold" style={{ background: p.accent, color: LIGHT_IDS.includes(p.id) ? "#fff" : "#000" }}>Start Free</div>
          <div className="px-5 py-2.5 rounded-xl text-xs font-bold border" style={{ color: p.text, borderColor: `${p.accent}44` }}>See Demo</div>
        </div>
      </div>
    ),
  },
  {
    id: "stats",
    label: "Stats / Metrics",
    icon: "◎",
    hint: "3 key numbers that build credibility",
    render: (p, sp) => (
      <div className={`grid grid-cols-3 gap-4 ${spacingMap[sp]}`} style={{ background: p.bg }}>
        {[{ n: "98%", l: "Client Satisfaction" }, { n: "4.2×", l: "Average ROI" }, { n: "240+", l: "Projects Delivered" }].map(s => (
          <div key={s.l} className="text-center p-4 rounded-2xl border" style={{ background: p.surface, borderColor: `${p.accent}22` }}>
            <div className="text-xl font-bold mb-1" style={{ color: p.accent }}>{s.n}</div>
            <div className="text-[10px]" style={{ color: p.muted }}>{s.l}</div>
          </div>
        ))}
      </div>
    ),
  },
  {
    id: "features",
    label: "Features Grid",
    icon: "▦",
    hint: "2×2 grid of key capabilities",
    render: (p, sp) => (
      <div className={`${spacingMap[sp]}`} style={{ background: p.bg }}>
        <div className="text-center mb-5">
          <div className="text-sm font-bold mb-1" style={{ color: p.text }}>Everything you need</div>
          <div className="text-[10px]" style={{ color: p.muted }}>One platform. Every tool.</div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {["Analytics", "Automation", "Integrations", "AI Reports"].map(f => (
            <div key={f} className="p-4 rounded-xl border" style={{ background: p.surface, borderColor: `${p.accent}22` }}>
              <div className="w-5 h-5 rounded-lg mb-2 opacity-70" style={{ background: p.accent }} />
              <div className="text-xs font-bold mb-1" style={{ color: p.text }}>{f}</div>
              <div className="text-[10px] leading-relaxed" style={{ color: p.muted }}>Seamless and powerful</div>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    id: "split",
    label: "Split Visual",
    icon: "◫",
    hint: "Image one side, text the other",
    render: (p, sp) => (
      <div className="flex" style={{ background: p.bg }}>
        <div className={`w-1/2 flex flex-col justify-center ${spacingMap[sp]}`}>
          <div className="text-[9px] font-mono uppercase tracking-widest mb-2" style={{ color: p.accent }}>Our Story</div>
          <div className="text-sm font-bold leading-tight mb-3" style={{ color: p.text }}>Built by founders, for founders.</div>
          <div className="text-[10px] leading-relaxed" style={{ color: p.muted }}>We've been where you are. Every feature we build is something we personally needed.</div>
        </div>
        <div className="w-1/2 flex items-center justify-center min-h-[120px]" style={{ background: p.surface }}>
          <div className="w-16 h-16 rounded-2xl opacity-30" style={{ background: p.accent }} />
        </div>
      </div>
    ),
  },
  {
    id: "testimonial",
    label: "Testimonial",
    icon: "❝",
    hint: "Social proof quote with avatar",
    render: (p, sp) => (
      <div className={`${spacingMap[sp]}`} style={{ background: p.bg }}>
        <div className="rounded-2xl p-6 border" style={{ background: p.surface, borderColor: `${p.accent}22` }}>
          <div className="text-xl font-bold mb-2" style={{ color: p.accent }}>❝</div>
          <p className="text-sm font-medium leading-relaxed mb-4" style={{ color: p.text }}>
            "Working with this team transformed our brand overnight. Revenue up 40% in 3 months."
          </p>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full" style={{ background: p.accent, opacity: 0.6 }} />
            <div>
              <div className="text-xs font-bold" style={{ color: p.text }}>Sarah Chen</div>
              <div className="text-[10px]" style={{ color: p.muted }}>CEO, Apex Labs</div>
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "pricing",
    label: "Pricing Tiers",
    icon: "⬡",
    hint: "3-tier pricing table",
    render: (p, sp) => (
      <div className={`${spacingMap[sp]}`} style={{ background: p.bg }}>
        <div className="text-center mb-4">
          <div className="text-sm font-bold mb-1" style={{ color: p.text }}>Simple, transparent pricing</div>
          <div className="text-[10px]" style={{ color: p.muted }}>No surprises. Cancel anytime.</div>
        </div>
        <div className="flex gap-3">
          {[{ l: "Starter", price: "$29", f: false }, { l: "Pro", price: "$79", f: true }, { l: "Scale", price: "$149", f: false }].map(t => (
            <div key={t.l} className={`flex-1 rounded-2xl p-4 border ${t.f ? "scale-[1.04] shadow-xl" : ""}`}
              style={{ background: t.f ? p.accent : p.surface, borderColor: t.f ? p.accent : `${p.accent}22` }}>
              <div className="text-[9px] font-bold uppercase tracking-widest mb-1"
                style={{ color: t.f ? (LIGHT_IDS.includes(p.id) ? "#fff" : "#000") : p.muted }}>{t.l}</div>
              <div className="text-lg font-bold mb-3" style={{ color: t.f ? (LIGHT_IDS.includes(p.id) ? "#fff" : "#000") : p.text }}>{t.price}</div>
              <div className="space-y-1.5 mb-3">
                {[1, 2, 3].map(j => <div key={j} className="h-1.5 rounded-full opacity-30"
                  style={{ background: t.f ? (LIGHT_IDS.includes(p.id) ? "#fff" : "#000") : p.accent }} />)}
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    id: "cta",
    label: "Call to Action",
    icon: "▷",
    hint: "Single bold conversion moment",
    render: (p, sp) => (
      <div className={`flex flex-col items-center text-center ${spacingMap[sp]} relative rounded-2xl mx-4 my-2`}
        style={{ background: p.accent }}>
        <div className="text-[10px] font-mono tracking-widest uppercase mb-3" style={{ color: LIGHT_IDS.includes(p.id) ? "rgba(0,0,0,0.5)" : "rgba(255,255,255,0.5)" }}>
          Limited availability
        </div>
        <div className="text-base font-bold leading-tight mb-4" style={{ color: LIGHT_IDS.includes(p.id) ? "#fff" : "#000" }}>
          Ready to level up?<br />Start your free trial today.
        </div>
        <div className="px-6 py-2.5 rounded-xl text-xs font-bold"
          style={{ background: LIGHT_IDS.includes(p.id) ? "#fff" : "#000", color: LIGHT_IDS.includes(p.id) ? p.accent : p.accent }}>
          Get Started Free →
        </div>
      </div>
    ),
  },
  {
    id: "gallery",
    label: "Gallery / Portfolio",
    icon: "▣",
    hint: "Visual showcase of past work",
    render: (p, sp) => (
      <div className={`${spacingMap[sp]}`} style={{ background: p.bg }}>
        <div className="text-center mb-4">
          <div className="text-sm font-bold" style={{ color: p.text }}>Our Work</div>
          <div className="text-[10px]" style={{ color: p.muted }}>Selected projects</div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="rounded-xl border aspect-video flex items-center justify-center"
              style={{ background: p.surface, borderColor: `${p.accent}22` }}>
              <div className="w-6 h-6 rounded-lg opacity-30" style={{ background: p.accent }} />
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    id: "faq",
    label: "FAQ",
    icon: "?",
    hint: "Common questions answered",
    render: (p, sp) => (
      <div className={`${spacingMap[sp]}`} style={{ background: p.bg }}>
        <div className="text-sm font-bold mb-4 text-center" style={{ color: p.text }}>Frequently Asked</div>
        {["How does it work?", "What's included?", "Can I cancel anytime?"].map((q, i) => (
          <div key={q} className={`py-3 border-b flex justify-between items-center ${i === 0 ? "border-t" : ""}`}
            style={{ borderColor: `${p.accent}22` }}>
            <div className="text-xs font-medium" style={{ color: p.text }}>{q}</div>
            <div className="text-xs" style={{ color: p.accent }}>+</div>
          </div>
        ))}
      </div>
    ),
  },
  {
    id: "team",
    label: "Team Section",
    icon: "◉",
    hint: "Introduce the people behind the brand",
    render: (p, sp) => (
      <div className={`${spacingMap[sp]}`} style={{ background: p.bg }}>
        <div className="text-center mb-5">
          <div className="text-sm font-bold mb-1" style={{ color: p.text }}>The Team</div>
          <div className="text-[10px]" style={{ color: p.muted }}>The people who make it happen</div>
        </div>
        <div className="flex gap-4 justify-center">
          {[{ n: "Alex R.", role: "CEO" }, { n: "Mia S.", role: "Design" }, { n: "Tom K.", role: "Tech" }].map(m => (
            <div key={m.n} className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 rounded-full border-2" style={{ background: p.surface, borderColor: `${p.accent}44` }} />
              <div className="text-[10px] font-bold text-center" style={{ color: p.text }}>{m.n}</div>
              <div className="text-[9px]" style={{ color: p.muted }}>{m.role}</div>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    id: "contact",
    label: "Contact Form",
    icon: "✉",
    hint: "Simple enquiry form",
    render: (p, sp) => (
      <div className={`${spacingMap[sp]}`} style={{ background: p.bg }}>
        <div className="text-sm font-bold mb-5 text-center" style={{ color: p.text }}>Get in Touch</div>
        <div className="space-y-3 max-w-xs mx-auto">
          {["Name", "Email", "Message"].map(f => (
            <div key={f} className="rounded-xl border p-3 text-[10px]" style={{ background: p.surface, borderColor: `${p.accent}22`, color: p.muted }}>{f}</div>
          ))}
          <div className="rounded-xl py-3 text-center text-[11px] font-bold" style={{ background: p.accent, color: LIGHT_IDS.includes(p.id) ? "#fff" : "#000" }}>
            Send Message
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "footer",
    label: "Footer",
    icon: "▬",
    hint: "Final links and brand sign-off",
    render: (p, sp) => (
      <div className={`${spacingMap[sp]} border-t`} style={{ background: p.surface, borderColor: `${p.accent}22` }}>
        <div className="flex justify-between items-center">
          <div className="font-bold text-sm tracking-widest" style={{ color: p.accent }}>BRAND</div>
          <div className="flex gap-4">
            {["Privacy", "Terms", "Twitter", "LinkedIn"].map(l => (
              <div key={l} className="text-[10px]" style={{ color: p.muted }}>{l}</div>
            ))}
          </div>
          <div className="text-[10px]" style={{ color: p.muted }}>© 2026 Brand Co.</div>
        </div>
      </div>
    ),
  },
];

// ─── Step Progress ────────────────────────────────────────────────────────────
function StepBar({ step, accent }: { step: number; accent: string }) {
  const steps = ["Palette", "Layout", "Summary"];
  return (
    <div className="flex items-center gap-2">
      {steps.map((s, i) => (
        <React.Fragment key={s}>
          <div className="flex items-center gap-2">
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all duration-500"
              style={{
                background: i <= step ? accent : "rgba(255,255,255,0.06)",
                color: i <= step ? (LIGHT_IDS.includes("") ? "#fff" : "#000") : "rgba(255,255,255,0.3)",
              }}
            >
              {i < step ? "✓" : i + 1}
            </div>
            <span className="text-xs font-medium hidden sm:block" style={{ color: i <= step ? "rgba(255,255,255,0.8)" : "rgba(255,255,255,0.25)" }}>
              {s}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div className="flex-1 h-px transition-all duration-700" style={{ background: i < step ? accent : "rgba(255,255,255,0.08)" }} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function DesignPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#060608]" />}>
      <DesignContent />
    </Suspense>
  );
}

function DesignContent() {
  const params = useSearchParams();
  const initPaletteId = params.get("palette") || "midnight";

  const [step, setStep] = useState(0); // 0=palette, 1=layout builder, 2=summary
  const [palette, setPalette] = useState(PALETTES.find(p => p.id === initPaletteId) || PALETTES[0]);
  const [sections, setSections] = useState<string[]>(["navbar", "hero", "features", "cta", "footer"]);
  const [spacing, setSpacing] = useState<"compact" | "balanced" | "airy">("balanced");
  const [dragOver, setDragOver] = useState<number | null>(null);
  const [dragFrom, setDragFrom] = useState<number | null>(null);
  const [previewPage, setPreviewPage] = useState(0); // paginated preview index
  const [sendStatus, setSendStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  const isLight = LIGHT_IDS.includes(palette.id);

  // Add section from library
  const addSection = (id: string) => {
    if (!sections.includes(id)) setSections(prev => [...prev.filter(s => s !== "footer"), id, "footer"].filter((s, i, a) => a.indexOf(s) === i));
    else setSections(prev => prev.filter(s => s !== id));
  };

  const removeSection = (idx: number) => setSections(prev => prev.filter((_, i) => i !== idx));

  const moveSection = (from: number, to: number) => {
    setSections(prev => {
      const next = [...prev];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
  };

  // Drag handlers
  const onDragStart = (e: React.DragEvent, idx: number) => { setDragFrom(idx); e.dataTransfer.effectAllowed = "move"; };
  const onDragOver = (e: React.DragEvent, idx: number) => { e.preventDefault(); setDragOver(idx); };
  const onDrop = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    if (dragFrom !== null && dragFrom !== idx) moveSection(dragFrom, idx);
    setDragFrom(null); setDragOver(null);
  };

  const getSectionDef = (id: string) => SECTION_LIBRARY.find(s => s.id === id)!;

  // Clamp previewPage when sections list changes
  React.useEffect(() => {
    setPreviewPage(p => Math.min(p, Math.max(0, sections.length - 1)));
  }, [sections.length]);

  // ── Generate AI prompts from the design choices ──────────────────────────────
  const generatePrompts = () => {
    const sp = spacing === "compact" ? "32px" : spacing === "balanced" ? "64px" : "96px";
    const prompts: { title: string; prompt: string }[] = [];

    // 1. Design system
    prompts.push({
      title: "Design System Foundation",
      prompt: `Build a premium website using the following design system. Background colour: ${palette.bg}. Card/surface colour: ${palette.surface}. Brand accent: ${palette.accent} — use for CTAs, highlights, borders, and icons. Primary text: ${palette.text}. Secondary/muted text: ${palette.muted}. Section vertical padding: ${sp}. Card border radius: 16px. Button border radius: 12px. All borders use accent at 12% opacity. Mood: ${palette.emotion}.`,
    });

    // 2. One prompt per section
    const sectionPrompts: Record<string, string> = {
      navbar: `Build a sticky navigation bar. Background: ${palette.surface}. Logo on the left in accent colour ${palette.accent}, font-weight 800, letter-spacing 0.15em, text 'BRAND'. Nav links centred (Home, Work, Pricing, Contact) in muted colour ${palette.muted}, font-size 13px. Right side: CTA button 'Get Started' with background ${palette.accent}, text contrast colour, padding 8px 20px, border-radius 10px. Height: 56px.`,
      hero: `Build a full-width hero section. Background: ${palette.bg}. Subtle radial glow in accent colour ${palette.accent} at 4% opacity behind the content. Eyebrow label in accent colour, font-mono, uppercase, small tracking. H1 heading: 'Built for the next generation', large bold font (48–64px). Subheading paragraph in muted colour, max-width 480px, centred. Two buttons side by side: primary with accent background, secondary with accent border only.`,
      stats: `Build a three-column stats strip. Background: ${palette.bg}. Each stat in a rounded card (background ${palette.surface}, border ${palette.accent} 12% opacity). Stat number large in accent colour ${palette.accent}. Label below in muted colour. Three stats: 98% Client Satisfaction, 4.2× Average ROI, 240+ Projects Delivered.`,
      features: `Build a 2x2 features grid section. Background: ${palette.bg}. Section heading 'Everything you need' centred. Each feature card: background ${palette.surface}, rounded-2xl, accent icon square, bold feature name, short description in muted colour ${palette.muted}. Features: Analytics, Automation, Integrations, AI Reports. Padding ${sp} top and bottom.`,
      split: `Build a split-screen section. Left 50%: text content with eyebrow label in accent ${palette.accent}, bold heading 'Built by founders, for founders', and body paragraph in muted colour. Right 50%: placeholder image/media area with surface background ${palette.surface} and a subtle accent shape. Both sides equal height.`,
      testimonial: `Build a testimonial section. Background: ${palette.bg}. Single large card (background ${palette.surface}, accent border). Large opening quote mark in accent ${palette.accent}. Quote text in primary text colour, 18px, semi-bold. Attribution row: avatar circle in accent colour + name bold + role muted. Card border-radius 20px. Padding ${sp}.`,
      pricing: `Build a 3-tier pricing section. Background: ${palette.bg}. Centre tier is featured: scale up 4%, shadow, background ${palette.accent}. Starter ($29) and Scale ($149) use surface background. Each card: tier label small uppercase, price large bold, 3 feature rows as placeholder bars, no CTA text needed. Section heading 'Simple, transparent pricing' centred above.`,
      cta: `Build a full-width call-to-action banner. Background: ${palette.accent}. Text colours use high-contrast inverse. Eyebrow label 'Limited availability' in accent inverse at 50% opacity. Bold headline 'Ready to level up? Start your free trial today.' in large font. Single centred button with dark/light background contrasting the accent, text 'Get Started Free →'. Border-radius 24px, padding ${sp}.`,
      gallery: `Build a portfolio/gallery section. Background: ${palette.bg}. Section heading 'Our Work' and subheading 'Selected projects'. 3-column grid of 6 project cards. Each card: aspect-ratio 16/9, background ${palette.surface}, accent border, placeholder icon centred. Card border-radius 16px. Hover state: slight scale and accent border glow.`,
      faq: `Build an FAQ accordion section. Background: ${palette.bg}. Section heading 'Frequently Asked' centred. Three FAQ rows with top/bottom border in accent at 12% opacity. Each row: question text on left, '+' toggle in accent on right. Clean horizontal lines, no background on rows. Padding ${sp} for section.`,
      team: `Build a team section. Background: ${palette.bg}. Heading 'The Team' and subheading centred. 3 team member cards in a row, centred. Each card: circular avatar (background ${palette.surface}, 2px accent border), bold name below, role in muted colour. Spacing between cards: 24px. Section padding ${sp}.`,
      contact: `Build a simple contact form section. Background: ${palette.bg}. Heading 'Get in Touch' centred. Centred form (max-width 400px): three input fields (Name, Email, Message) with surface background ${palette.surface}, accent border 12% opacity, border-radius 12px, placeholder text in muted colour. Submit button full-width, accent background, contrast text, border-radius 12px.`,
      footer: `Build a simple footer. Background: ${palette.surface}. Top border in accent at 12% opacity. Single row: brand logo left in accent ${palette.accent}, nav links centre (Privacy, Terms, Twitter, LinkedIn) in muted colour, copyright right in muted colour. Padding: 24px vertical.`,
    };

    sections.forEach(id => {
      const def = getSectionDef(id);
      if (def && sectionPrompts[id]) {
        prompts.push({ title: def.label, prompt: sectionPrompts[id] });
      }
    });

    return prompts;
  };

  const sendToDashboard = async () => {
    setSendStatus("sending");
    try {
      const prompts = generatePrompts();
      const report = {
        palette: {
          name: palette.name,
          emotion: palette.emotion,
          bg: palette.bg,
          surface: palette.surface,
          accent: palette.accent,
          text: palette.text,
          muted: palette.muted,
        },
        spacing,
        sections: sections.map((id, i) => ({
          order: i + 1,
          id,
          label: getSectionDef(id)?.label ?? id,
        })),
        prompts,
      };
      const res = await fetch("/api/build-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(report),
      });
      if (res.ok) setSendStatus("sent");
      else setSendStatus("error");
    } catch {
      setSendStatus("error");
    }
  };

  return (
    <div className="min-h-screen bg-[#060608] text-white overflow-x-hidden">

      {/* ── Header Bar ───────────────────────────── */}
      <div className="sticky top-0 z-50 bg-[#060608]/90 backdrop-blur-xl border-b border-white/[0.05]">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-6">
          {/* Back */}
          <Link href="/canvas#section-playground" className="flex items-center gap-2 text-white/30 hover:text-white/70 transition-colors text-xs font-medium shrink-0">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Canvas
          </Link>

          {/* Step bar */}
          <div className="flex-1 max-w-sm mx-auto">
            <StepBar step={step} accent={palette.accent} />
          </div>

          {/* Palette mini pill */}
          <div className="shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.06]">
            {palette.preview.slice(0, 3).map((c, i) => (
              <div key={i} className="w-3 h-3 rounded-full border border-white/10" style={{ background: c }} />
            ))}
            <span className="text-[10px] text-white/40 font-mono">{palette.name}</span>
          </div>
        </div>
      </div>

      {/* ── STEP 0: PALETTE ─────────────────────── */}
      <AnimatePresence mode="wait">
        {step === 0 && (
          <motion.div
            key="step-palette"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.5 }}
            className="max-w-6xl mx-auto px-6 py-16"
          >
            <div className="text-center mb-14">
              <div className="text-[11px] font-mono tracking-[0.3em] text-amber-500 uppercase mb-3">Step 1 of 3</div>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4" style={{ fontFamily: "var(--font-syne, sans-serif)" }}>
                Confirm your colour palette
              </h1>
              <p className="text-white/40 text-base max-w-lg mx-auto leading-relaxed">
                Choose the palette that best represents your brand. This will be applied across every section of your website.
              </p>
            </div>

            {/* Palette grid */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-14">
              {PALETTES.map(p => {
                const selected = palette.id === p.id;
                return (
                  <motion.button
                    key={p.id}
                    onClick={() => setPalette(p)}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="relative rounded-2xl overflow-hidden border-2 text-left transition-all duration-300"
                    style={{
                      background: p.bg,
                      borderColor: selected ? p.accent : "rgba(255,255,255,0.06)",
                      boxShadow: selected ? `0 0 30px ${p.accent}44` : "none",
                    }}
                  >
                    <div className="p-5">
                      {/* Accent square */}
                      <div className="w-10 h-10 rounded-xl mb-4" style={{ background: p.accent }} />
                      {/* Name */}
                      <div className="text-xs font-bold mb-1" style={{ color: p.text }}>{p.name}</div>
                      <div className="text-[9px] leading-relaxed" style={{ color: p.muted }}>{p.emotion}</div>
                      {/* Swatch row */}
                      <div className="flex gap-1 mt-3">
                        {p.preview.map((c, i) => (
                          <div key={i} className="w-3 h-3 rounded-full border border-white/10" style={{ background: c }} />
                        ))}
                      </div>
                    </div>
                    {selected && (
                      <div className="absolute top-3 right-3 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold"
                        style={{ background: p.accent, color: LIGHT_IDS.includes(p.id) ? "#fff" : "#000" }}>
                        ✓
                      </div>
                    )}
                  </motion.button>
                );
              })}
            </div>

            {/* Live mini preview of selected palette */}
            <div className="rounded-3xl overflow-hidden border border-white/[0.06] mb-10" style={{ background: palette.bg }}>
              <div className="h-8 flex items-center px-4 gap-2 border-b" style={{ background: palette.surface, borderColor: `${palette.accent}22` }}>
                <div className="flex gap-1.5"><div className="w-2 h-2 rounded-full bg-red-400 opacity-50" /><div className="w-2 h-2 rounded-full bg-amber-400 opacity-50" /><div className="w-2 h-2 rounded-full bg-green-400 opacity-50" /></div>
                <div className="mx-auto h-4 w-32 rounded-full opacity-20 border" style={{ background: palette.bg, borderColor: `${palette.accent}44` }} />
              </div>
              <div className="p-8 flex flex-col items-center text-center">
                <div className="text-[9px] font-mono tracking-widest uppercase mb-3" style={{ color: palette.accent }}>Preview</div>
                <h2 className="text-2xl font-bold mb-3" style={{ color: palette.text }}>
                  Your brand, in <span style={{ color: palette.accent }}>{palette.name}</span>
                </h2>
                <p className="text-sm max-w-sm leading-relaxed mb-5" style={{ color: palette.muted }}>{palette.emotion}</p>
                <div className="flex gap-3">
                  <div className="px-6 py-2.5 rounded-xl text-xs font-bold" style={{ background: palette.accent, color: isLight ? "#fff" : "#000" }}>Get Started</div>
                  <div className="px-6 py-2.5 rounded-xl text-xs font-bold border" style={{ color: palette.text, borderColor: `${palette.accent}44` }}>Learn More</div>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setStep(1)}
                className="inline-flex items-center gap-3 px-10 py-4 rounded-2xl font-bold text-sm tracking-wider shadow-2xl"
                style={{ background: palette.accent, color: isLight ? "#fff" : "#000", boxShadow: `0 16px 50px ${palette.accent}44` }}
              >
                Build My Layout
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* ── STEP 1: LAYOUT BUILDER ─────────────── */}
        {step === 1 && (
          <motion.div
            key="step-layout"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.5 }}
            className="max-w-7xl mx-auto px-6 py-10"
          >
            <div className="text-center mb-10">
              <div className="text-[11px] font-mono tracking-[0.3em] text-indigo-400 uppercase mb-3">Step 2 of 3</div>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-3" style={{ fontFamily: "var(--font-syne, sans-serif)" }}>
                Build your layout
              </h1>
              <p className="text-white/40 text-base max-w-lg mx-auto leading-relaxed">
                Add sections from the library, drag to reorder, and choose your spacing. Watch the live preview update in real time.
              </p>
            </div>

            <div className="flex flex-col lg:flex-row gap-6">

              {/* ── Left: Section library + spacing ── */}
              <div className="lg:w-64 shrink-0 flex flex-col gap-4">

                {/* Spacing toggle */}
                <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
                  <div className="text-[10px] font-mono text-white/30 uppercase tracking-widest mb-3">Spacing</div>
                  <div className="flex flex-col gap-1.5">
                    {(["compact", "balanced", "airy"] as const).map(s => (
                      <button
                        key={s}
                        onClick={() => setSpacing(s)}
                        className="px-3 py-2.5 rounded-xl border text-xs font-bold text-left transition-all"
                        style={{
                          borderColor: spacing === s ? palette.accent : "rgba(255,255,255,0.06)",
                          background: spacing === s ? `${palette.accent}18` : "transparent",
                          color: spacing === s ? palette.accent : "rgba(255,255,255,0.4)",
                        }}
                      >
                        <span className="capitalize">{s}</span>
                        <div className="text-[9px] font-normal opacity-60 mt-0.5">
                          {s === "compact" ? "Dense, information-rich" : s === "balanced" ? "Clean and readable" : "Open and premium"}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Section library */}
                <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 flex-1">
                  <div className="text-[10px] font-mono text-white/30 uppercase tracking-widest mb-3">Sections Library</div>
                  <div className="space-y-1.5">
                    {SECTION_LIBRARY.map(s => {
                      const active = sections.includes(s.id);
                      return (
                        <button
                          key={s.id}
                          onClick={() => addSection(s.id)}
                          title={s.hint}
                          className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl border text-left transition-all"
                          style={{
                            borderColor: active ? `${palette.accent}60` : "rgba(255,255,255,0.05)",
                            background: active ? `${palette.accent}12` : "transparent",
                          }}
                        >
                          <span className="text-base w-5 text-center shrink-0" style={{ color: active ? palette.accent : "rgba(255,255,255,0.2)" }}>{s.icon}</span>
                          <div className="flex-1 min-w-0">
                            <div className="text-[11px] font-bold truncate" style={{ color: active ? palette.accent : "rgba(255,255,255,0.6)" }}>{s.label}</div>
                          </div>
                          <span className="text-[10px] shrink-0" style={{ color: active ? palette.accent : "rgba(255,255,255,0.2)" }}>
                            {active ? "✓" : "+"}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* ── Centre: Build canvas (ordered list) ── */}
              <div className="flex-1 min-w-0">
                <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 mb-4">
                  <div className="text-[10px] font-mono text-white/30 uppercase tracking-widest mb-3">Your Layout — drag to reorder</div>
                  {sections.length === 0 ? (
                    <div className="text-center py-12 text-white/20 text-sm">Add sections from the library →</div>
                  ) : (
                    <div className="space-y-2">
                      <AnimatePresence>
                        {sections.map((id, idx) => {
                          const def = getSectionDef(id);
                          if (!def) return null;
                          return (
                            <motion.div
                              key={id}
                              layout
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.9 }}
                              transition={{ duration: 0.2 }}
                              draggable
                              onDragStart={e => onDragStart(e as unknown as React.DragEvent, idx)}
                              onDragOver={e => onDragOver(e as unknown as React.DragEvent, idx)}
                              onDrop={e => onDrop(e as unknown as React.DragEvent, idx)}
                              className="flex items-center gap-3 px-4 py-3 rounded-xl border cursor-grab active:cursor-grabbing transition-all"
                              style={{
                                borderColor: previewPage === idx ? palette.accent : dragOver === idx ? `${palette.accent}88` : "rgba(255,255,255,0.06)",
                                background: previewPage === idx ? `${palette.accent}18` : dragOver === idx ? `${palette.accent}10` : "rgba(255,255,255,0.02)",
                              }}
                            >
                              {/* Drag handle */}
                              <div className="text-white/20 text-xs select-none">⠿</div>

                              {/* Icon + label — click to preview */}
                              <button
                                className="flex items-center gap-2 flex-1 text-left"
                                onClick={() => setPreviewPage(idx)}
                              >
                                <span className="text-sm" style={{ color: palette.accent }}>{def.icon}</span>
                                <div className="flex-1">
                                  <div className="text-xs font-bold text-white/70">{def.label}</div>
                                  <div className="text-[10px] text-white/25">{def.hint}</div>
                                </div>
                              </button>

                              {/* Up/down */}
                              <div className="flex gap-1">
                                <button
                                  onClick={() => idx > 0 && moveSection(idx, idx - 1)}
                                  disabled={idx === 0}
                                  className="w-6 h-6 rounded-lg flex items-center justify-center text-xs disabled:opacity-20 hover:bg-white/10 transition-colors"
                                  style={{ color: "rgba(255,255,255,0.4)" }}
                                >↑</button>
                                <button
                                  onClick={() => idx < sections.length - 1 && moveSection(idx, idx + 1)}
                                  disabled={idx === sections.length - 1}
                                  className="w-6 h-6 rounded-lg flex items-center justify-center text-xs disabled:opacity-20 hover:bg-white/10 transition-colors"
                                  style={{ color: "rgba(255,255,255,0.4)" }}
                                >↓</button>
                              </div>

                              {/* Remove */}
                              <button onClick={() => removeSection(idx)} className="w-6 h-6 rounded-lg flex items-center justify-center text-xs hover:bg-red-500/20 hover:text-red-400 transition-colors" style={{ color: "rgba(255,255,255,0.2)" }}>✕</button>
                            </motion.div>
                          );
                        })}
                      </AnimatePresence>
                    </div>
                  )}
                </div>

                {/* Proceed */}
                <div className="flex justify-between items-center">
                  <button onClick={() => setStep(0)} className="text-xs text-white/30 hover:text-white/60 transition-colors">← Back to Palette</button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setStep(2)}
                    className="inline-flex items-center gap-3 px-8 py-3.5 rounded-2xl font-bold text-sm shadow-xl"
                    style={{ background: palette.accent, color: isLight ? "#fff" : "#000", boxShadow: `0 12px 40px ${palette.accent}44` }}
                  >
                    Review Summary
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </motion.button>
                </div>
              </div>

              {/* ── Right: Paginated live preview ── */}
              <div className="lg:w-96 shrink-0">
                <div className="sticky top-20" style={{ height: "calc(100vh - 6rem)" }}>

                  {/* Header row */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-[10px] font-mono text-white/25 uppercase tracking-widest">Live Preview</div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono" style={{ color: sections.length ? palette.accent : 'rgba(255,255,255,0.2)' }}>
                        {sections.length > 0 ? `Section ${previewPage + 1} of ${sections.length}` : 'No sections'}
                      </span>
                    </div>
                  </div>

                  {/* Browser frame */}
                  <div
                    className="rounded-2xl overflow-hidden border border-white/[0.06] shadow-2xl flex flex-col"
                    style={{ height: "calc(100% - 4.5rem)", boxShadow: `0 24px 80px ${palette.accent}22` }}
                  >
                    {/* Chrome bar */}
                    <div className="h-8 flex items-center gap-2 px-3 border-b shrink-0"
                      style={{ background: palette.surface, borderColor: `${palette.accent}22` }}>
                      <div className="flex gap-1">
                        <div className="w-2 h-2 rounded-full bg-red-400 opacity-50" />
                        <div className="w-2 h-2 rounded-full bg-amber-400 opacity-50" />
                        <div className="w-2 h-2 rounded-full bg-green-400 opacity-50" />
                      </div>
                      {/* Current section label */}
                      <div className="flex-1 flex justify-center">
                        {sections[previewPage] && (
                          <div className="text-[9px] font-mono px-3 py-0.5 rounded-full"
                            style={{ background: `${palette.accent}22`, color: palette.accent }}>
                            {getSectionDef(sections[previewPage])?.label}
                          </div>
                        )}
                      </div>
                      <div className="w-10" />{/* spacer */}
                    </div>

                    {/* Section page — animated */}
                    <div className="flex-1 relative overflow-hidden" style={{ background: palette.bg }}>
                      {sections.length === 0 ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                          <div className="text-3xl opacity-20">◫</div>
                          <div className="text-white/20 text-xs text-center">Add sections from the library<br />to see them here</div>
                        </div>
                      ) : (
                        <AnimatePresence mode="wait">
                          <motion.div
                            key={`${sections[previewPage]}-${previewPage}`}
                            initial={{ opacity: 0, x: 18 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -18 }}
                            transition={{ duration: 0.28 }}
                            className="absolute inset-0 overflow-auto"
                          >
                            {sections[previewPage] && getSectionDef(sections[previewPage])?.render(palette, spacing)}
                          </motion.div>
                        </AnimatePresence>
                      )}
                    </div>

                    {/* Navigation footer */}
                    <div className="h-11 shrink-0 flex items-center justify-between px-3 border-t"
                      style={{ background: palette.surface, borderColor: `${palette.accent}22` }}>
                      {/* Prev */}
                      <button
                        onClick={() => setPreviewPage(p => Math.max(0, p - 1))}
                        disabled={previewPage === 0 || sections.length === 0}
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-sm disabled:opacity-20 hover:bg-white/10 transition-all"
                        style={{ color: 'rgba(255,255,255,0.7)' }}
                      >←</button>

                      {/* Page dot pills */}
                      <div className="flex items-center gap-1.5 overflow-hidden max-w-[180px] flex-wrap justify-center">
                        {sections.map((_, i) => (
                          <button
                            key={i}
                            onClick={() => setPreviewPage(i)}
                            className="transition-all duration-300 rounded-full shrink-0"
                            style={{
                              width: previewPage === i ? '1.25rem' : '0.35rem',
                              height: '0.35rem',
                              background: previewPage === i ? palette.accent : 'rgba(255,255,255,0.2)',
                            }}
                          />
                        ))}
                      </div>

                      {/* Next */}
                      <button
                        onClick={() => setPreviewPage(p => Math.min(sections.length - 1, p + 1))}
                        disabled={previewPage >= sections.length - 1 || sections.length === 0}
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-sm disabled:opacity-20 hover:bg-white/10 transition-all"
                        style={{ color: 'rgba(255,255,255,0.7)' }}
                      >→</button>
                    </div>
                  </div>

                  {/* Hint */}
                  <div className="flex items-center justify-center gap-2 text-white/20 text-[10px] mt-2">
                    <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                    Click a section row to preview it · Use ← → to browse
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── STEP 2: SUMMARY ─────────────────────── */}
        {step === 2 && (
          <motion.div
            key="step-summary"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.5 }}
            className="max-w-5xl mx-auto px-6 py-16"
          >
            <div className="text-center mb-14">
              <div className="text-[11px] font-mono tracking-[0.3em] text-emerald-400 uppercase mb-3">Step 3 of 3</div>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4" style={{ fontFamily: "var(--font-syne, sans-serif)" }}>
                Your design brief
              </h1>
              <p className="text-white/40 text-base max-w-lg mx-auto leading-relaxed">
                Here's what you've designed. Take a screenshot — or start building now and we'll carry these choices forward.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">

              {/* Palette summary card */}
              <div className="rounded-3xl overflow-hidden border border-white/[0.06]" style={{ background: palette.bg }}>
                <div className="p-6 border-b" style={{ borderColor: `${palette.accent}22` }}>
                  <div className="text-[10px] font-mono text-white/30 uppercase tracking-widest mb-2">Colour Palette</div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl" style={{ background: palette.accent }} />
                    <div>
                      <div className="text-sm font-bold" style={{ color: palette.text }}>{palette.name}</div>
                      <div className="text-[10px]" style={{ color: palette.muted }}>{palette.emotion}</div>
                    </div>
                  </div>
                </div>
                <div className="p-6 flex gap-2">
                  {palette.preview.map((c, i) => (
                    <div key={i} className="flex-1 h-12 rounded-xl border border-white/10" style={{ background: c }} />
                  ))}
                </div>
              </div>

              {/* Layout summary card */}
              <div className="rounded-3xl border border-white/[0.06] bg-white/[0.02] p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="text-[10px] font-mono text-white/30 uppercase tracking-widest mb-2">Layout Structure</div>
                    <div className="text-sm font-bold text-white">{sections.length} sections</div>
                    <div className="text-[10px] text-white/30 capitalize mt-1">Spacing: {spacing}</div>
                  </div>
                  <button onClick={() => setStep(1)} className="text-[10px] text-white/30 hover:text-white/60 transition-colors border border-white/10 rounded-lg px-3 py-1.5">Edit</button>
                </div>
                <div className="space-y-1.5">
                  {sections.map((id, idx) => {
                    const def = getSectionDef(id);
                    if (!def) return null;
                    return (
                      <div key={id} className="flex items-center gap-2.5 py-1.5 border-b border-white/[0.04] last:border-0">
                        <span className="text-xs w-4 text-white/20 font-mono">{idx + 1}</span>
                        <span className="text-xs" style={{ color: palette.accent }}>{def.icon}</span>
                        <span className="text-xs text-white/50">{def.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Full live preview of their design */}
            <div className="rounded-3xl overflow-hidden border border-white/[0.06] shadow-2xl mb-10" style={{ boxShadow: `0 40px 100px ${palette.accent}22` }}>
              <div className="h-9 flex items-center px-4 gap-2 border-b" style={{ background: palette.surface, borderColor: `${palette.accent}22` }}>
                <div className="flex gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-red-400 opacity-60" /><div className="w-2.5 h-2.5 rounded-full bg-amber-400 opacity-60" /><div className="w-2.5 h-2.5 rounded-full bg-green-400 opacity-60" /></div>
                <div className="mx-auto h-5 w-44 rounded-full" style={{ background: `${palette.accent}20`, border: `1px solid ${palette.accent}30` }} />
              </div>
              <div style={{ background: palette.bg }}>
                {sections.map(id => {
                  const def = getSectionDef(id);
                  if (!def) return null;
                  return <div key={id}>{def.render(palette, spacing)}</div>;
                })}
              </div>
            </div>

            {/* CTA */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <button onClick={() => setStep(1)} className="text-sm text-white/30 hover:text-white/60 transition-colors">← Adjust layout</button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => { setSendStatus("idle"); setStep(3); }}
                className="inline-flex items-center gap-3 px-10 py-5 rounded-2xl font-bold text-sm tracking-wider shadow-2xl group"
                style={{ background: palette.accent, color: isLight ? "#fff" : "#000", boxShadow: `0 20px 60px ${palette.accent}44` }}
              >
                Finish Build
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* ── STEP 3: BUILD REPORT ────────────────────────────────── */}
        {step === 3 && (() => {
          const prompts = generatePrompts();
          return (
            <motion.div
              key="step-report"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.5 }}
              className="max-w-4xl mx-auto px-6 py-16"
            >
              {/* Header */}
              <div className="text-center mb-14">
                <div className="text-[11px] font-mono tracking-[0.3em] uppercase mb-3" style={{ color: palette.accent }}>Build Report</div>
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4" style={{ fontFamily: "var(--font-syne, sans-serif)" }}>
                  Ready to send
                </h1>
                <p className="text-white/40 text-base max-w-md mx-auto leading-relaxed">
                  Your design choices are compiled into a brief and a set of focused AI prompts. Send it to the dashboard and we'll take it from there.
                </p>
              </div>

              {/* ── Design Brief Summary ── */}
              <div className="rounded-3xl border border-white/[0.06] bg-white/[0.02] p-8 mb-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center text-sm" style={{ background: `${palette.accent}22`, color: palette.accent }}>◈</div>
                  <div>
                    <div className="text-[10px] font-mono text-white/30 uppercase tracking-widest">Design Brief</div>
                    <div className="text-sm font-bold text-white">Client specification summary</div>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Palette block */}
                  <div className="rounded-2xl border border-white/[0.04] bg-white/[0.02] p-4 space-y-2">
                    <div className="text-[10px] font-mono text-white/30 uppercase tracking-widest mb-3">Colour Palette</div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full shrink-0" style={{ background: palette.accent }} />
                      <span className="text-xs font-bold text-white">{palette.name}</span>
                    </div>
                    {[
                      { l: "Background", v: palette.bg },
                      { l: "Surface", v: palette.surface },
                      { l: "Accent", v: palette.accent },
                      { l: "Text", v: palette.text },
                      { l: "Muted", v: palette.muted },
                      { l: "Mood", v: palette.emotion },
                    ].map(r => (
                      <div key={r.l} className="flex justify-between items-center py-1 border-b border-white/[0.03] last:border-0">
                        <span className="text-[11px] text-white/40">{r.l}</span>
                        <div className="flex items-center gap-2">
                          {r.l !== "Mood" && (
                            <div className="w-3 h-3 rounded-full border border-white/10" style={{ background: r.v }} />
                          )}
                          <span className="text-[11px] font-mono text-white/60">{r.v}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  {/* Layout block */}
                  <div className="rounded-2xl border border-white/[0.04] bg-white/[0.02] p-4">
                    <div className="text-[10px] font-mono text-white/30 uppercase tracking-widest mb-3">Layout Structure</div>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xs font-bold text-white">{sections.length} Sections</span>
                      <span className="text-white/20">·</span>
                      <span className="text-xs text-white/40 capitalize">{spacing} spacing</span>
                    </div>
                    <div className="space-y-1.5">
                      {sections.map((id, i) => {
                        const def = getSectionDef(id);
                        return (
                          <div key={id} className="flex items-center gap-2.5 py-1">
                            <span className="text-[10px] font-mono text-white/20 w-4">{i + 1}</span>
                            <span className="text-xs" style={{ color: palette.accent }}>{def?.icon}</span>
                            <span className="text-[11px] text-white/50">{def?.label}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* ── AI Prompts ── */}
              <div className="rounded-3xl border border-white/[0.06] bg-white/[0.02] p-8 mb-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center text-sm" style={{ background: `${palette.accent}22`, color: palette.accent }}>✦</div>
                  <div>
                    <div className="text-[10px] font-mono text-white/30 uppercase tracking-widest">AI Prompts</div>
                    <div className="text-sm font-bold text-white">{prompts.length} scoped build instructions</div>
                  </div>
                  <div className="ml-auto text-[10px] text-white/25 font-mono">Paste directly into Antigravity</div>
                </div>

                <div className="space-y-4">
                  {prompts.map((p, i) => (
                    <div key={i} className="rounded-2xl border border-white/[0.04] overflow-hidden">
                      {/* Prompt header */}
                      <div className="flex items-center gap-3 px-4 py-2.5 border-b border-white/[0.04]"
                        style={{ background: `${palette.accent}0A` }}>
                        <span className="text-[10px] font-mono text-white/25">#{String(i + 1).padStart(2, "0")}</span>
                        <span className="text-[11px] font-bold" style={{ color: palette.accent }}>{p.title}</span>
                        <button
                          onClick={() => navigator.clipboard.writeText(p.prompt)}
                          className="ml-auto text-[10px] text-white/25 hover:text-white/60 transition-colors font-mono border border-white/10 rounded-lg px-2 py-0.5"
                        >
                          copy
                        </button>
                      </div>
                      {/* Prompt body */}
                      <div className="px-4 py-3 bg-black/20">
                        <p className="text-[11px] leading-relaxed text-white/55 font-mono">{p.prompt}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* ── Actions ── */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <button
                  onClick={() => setStep(2)}
                  className="text-sm text-white/30 hover:text-white/60 transition-colors"
                >
                  ← Back to Summary
                </button>

                <div className="flex items-center gap-4">
                  {sendStatus === "sent" ? (
                    <div className="flex items-center gap-2 px-6 py-3 rounded-2xl border"
                      style={{ borderColor: `${palette.accent}44`, background: `${palette.accent}12` }}>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: palette.accent }}>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-sm font-bold" style={{ color: palette.accent }}>Sent to Dashboard</span>
                    </div>
                  ) : (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={sendToDashboard}
                      disabled={sendStatus === "sending"}
                      className="inline-flex items-center gap-3 px-10 py-4 rounded-2xl font-bold text-sm tracking-wider shadow-2xl disabled:opacity-60 disabled:cursor-wait"
                      style={{ background: palette.accent, color: isLight ? "#fff" : "#000", boxShadow: `0 16px 50px ${palette.accent}44` }}
                    >
                      {sendStatus === "sending" ? (
                        <>
                          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                          </svg>
                          Sending…
                        </>
                      ) : (
                        <>
                          Send to Dashboard
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                          </svg>
                        </>
                      )}
                    </motion.button>
                  )}
                  {sendStatus === "error" && (
                    <div className="text-xs text-red-400 font-mono">Failed — try again</div>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })()}
      </AnimatePresence>

    </div>
  );
}
