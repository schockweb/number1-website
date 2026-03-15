"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';

// ─── Colour Palettes ──────────────────────────────────────────────────────────
const PALETTES = [
  {
    id: 'midnight',
    name: 'Midnight Luxury',
    emotion: 'Authority · Prestige · Premium',
    desc: 'Deep blacks and gold accents trigger trust and exclusivity.',
    bg: '#0A0A0B',
    surface: '#141517',
    accent: '#C8A97E',
    text: '#FFFFFF',
    muted: '#71717A',
    badge: 'bg-amber-500/20 text-amber-300 border border-amber-500/30',
    preview: ['#0A0A0B', '#141517', '#C8A97E', '#FFFFFF'],
  },
  {
    id: 'cyber',
    name: 'Neon Cyber',
    emotion: 'Energy · Speed · Innovation',
    desc: 'Electric greens on dark backgrounds read as cutting-edge and fast.',
    bg: '#050511',
    surface: '#0A0A1F',
    accent: '#00FF9D',
    text: '#FFFFFF',
    muted: '#4A4B6B',
    badge: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
    preview: ['#050511', '#0A0A1F', '#00FF9D', '#FFFFFF'],
  },
  {
    id: 'nordic',
    name: 'Nordic Clean',
    emotion: 'Trust · Clarity · Simplicity',
    desc: 'High contrast white and black signals confidence and clean direction.',
    bg: '#FAFAFA',
    surface: '#FFFFFF',
    accent: '#18181B',
    text: '#18181B',
    muted: '#A1A1AA',
    badge: 'bg-zinc-200 text-zinc-700 border border-zinc-300',
    preview: ['#FAFAFA', '#FFFFFF', '#18181B', '#71717A'],
  },
  {
    id: 'vibrant',
    name: 'Vibrant SaaS',
    emotion: 'Growth · Optimism · Action',
    desc: 'Indigo-led palettes signal modern SaaS and inspire action.',
    bg: '#F8FAFC',
    surface: '#FFFFFF',
    accent: '#4F46E5',
    text: '#0F172A',
    muted: '#64748B',
    badge: 'bg-indigo-100 text-indigo-700 border border-indigo-300',
    preview: ['#F8FAFC', '#4F46E5', '#0F172A', '#64748B'],
  },
  {
    id: 'ember',
    name: 'Ember Brand',
    emotion: 'Passion · Urgency · Bold',
    desc: 'Warm reds and deep backgrounds drive urgency and bold identity.',
    bg: '#0D0705',
    surface: '#1A0E0A',
    accent: '#F97316',
    text: '#FFF7ED',
    muted: '#7C5342',
    badge: 'bg-orange-500/20 text-orange-300 border border-orange-500/30',
    preview: ['#0D0705', '#1A0E0A', '#F97316', '#FFF7ED'],
  },
  {
    id: 'ocean',
    name: 'Royal Ocean',
    emotion: 'Calm · Depth · Intelligence',
    desc: 'Deep navy and cyan create an aura of expertise and cool authority.',
    bg: '#020B18',
    surface: '#061525',
    accent: '#22D3EE',
    text: '#E0F2FE',
    muted: '#475569',
    badge: 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30',
    preview: ['#020B18', '#061525', '#22D3EE', '#E0F2FE'],
  },
  {
    id: 'rosegold',
    name: 'Rose Gold',
    emotion: 'Elegance · Femininity · Warmth',
    desc: 'Blush tones and rose gold exude warmth, sophistication and approachability.',
    bg: '#1A0D10',
    surface: '#2A1318',
    accent: '#FDA4AF',
    text: '#FFF1F2',
    muted: '#9F6672',
    badge: 'bg-rose-500/20 text-rose-300 border border-rose-500/30',
    preview: ['#1A0D10', '#2A1318', '#FDA4AF', '#FFF1F2'],
  },
  {
    id: 'forest',
    name: 'Forest Sage',
    emotion: 'Natural · Organic · Grounded',
    desc: 'Earthy greens and warm neutrals build an eco-conscious, grounded identity.',
    bg: '#0A120A',
    surface: '#131F13',
    accent: '#86EFAC',
    text: '#F0FDF4',
    muted: '#6B7C6B',
    badge: 'bg-green-500/20 text-green-300 border border-green-500/30',
    preview: ['#0A120A', '#131F13', '#86EFAC', '#F0FDF4'],
  },
  {
    id: 'cosmic',
    name: 'Cosmic Purple',
    emotion: 'Creative · Mystical · Bold',
    desc: 'Deep violets and electric purples signal creativity and disruptive thinking.',
    bg: '#0A050F',
    surface: '#130A1E',
    accent: '#A855F7',
    text: '#FAF5FF',
    muted: '#6B4F80',
    badge: 'bg-purple-500/20 text-purple-300 border border-purple-500/30',
    preview: ['#0A050F', '#130A1E', '#A855F7', '#FAF5FF'],
  },
  {
    id: 'sand',
    name: 'Warm Sand',
    emotion: 'Warmth · Approachable · Human',
    desc: 'Warm beige and terracotta tones create a welcoming, human-first brand feel.',
    bg: '#FAF5EE',
    surface: '#FFFFFF',
    accent: '#92400E',
    text: '#1C0F08',
    muted: '#A87B5A',
    badge: 'bg-amber-100 text-amber-800 border border-amber-300',
    preview: ['#FAF5EE', '#FFFFFF', '#92400E', '#A87B5A'],
  },
];

// ─── Layouts ─────────────────────────────────────────────────────────────────
const LAYOUTS = [
  {
    id: 'hero',
    name: 'Hero Centered',
    icon: '◈',
    desc: 'Attention-first. One bold statement that commands the entire viewport.',
  },
  {
    id: 'split',
    name: 'Split Screen',
    icon: '◫',
    desc: 'Balanced storytelling. Visual on one side, message on the other.',
  },
  {
    id: 'grid',
    name: 'Feature Grid',
    icon: '▦',
    desc: 'Structured clarity. Multiple benefits presented without overwhelm.',
  },
  {
    id: 'magazine',
    name: 'Editorial',
    icon: '☰',
    desc: 'Premium narrative. Guides the eye down a curated visual story.',
  },
  {
    id: 'testimonial',
    name: 'Social Proof',
    icon: '❝',
    desc: 'Trust at the forefront. Quotes, faces and logos build immediate credibility.',
  },
  {
    id: 'pricing',
    name: 'Pricing Tiers',
    icon: '⬡',
    desc: 'Decision-driving layout. Three tiers guide users toward the mid-tier anchor.',
  },
  {
    id: 'sidebar',
    name: 'Sidebar App',
    icon: '▤',
    desc: 'SaaS-native. Navigation on the left, content on the right — familiar and fast.',
  },
  {
    id: 'cta',
    name: 'Minimal CTA',
    icon: '▷',
    desc: 'One goal, zero distractions. Strips everything back to drive a single action.',
  },
  {
    id: 'dashboard',
    name: 'Dashboard',
    icon: '◼',
    desc: 'Data-first design. Cards, metrics and charts communicate power instantly.',
  },
];

// ─── Colour insights ──────────────────────────────────────────────────────────
const COLOUR_INSIGHTS = [
  {
    color: '#C8A97E',
    label: 'Gold / Amber',
    tags: ['Luxury', 'Authority', 'Premium'],
    brand: 'Rolex · Cartier',
    bg: 'from-amber-950 to-amber-900',
  },
  {
    color: '#4F46E5',
    label: 'Indigo / Violet',
    tags: ['Trust', 'Modern', 'SaaS'],
    brand: 'Stripe · Linear',
    bg: 'from-indigo-950 to-indigo-900',
  },
  {
    color: '#00FF9D',
    label: 'Electric Green',
    tags: ['Growth', 'Speed', 'Tech'],
    brand: 'Vercel · Framer',
    bg: 'from-emerald-950 to-emerald-900',
  },
  {
    color: '#F97316',
    label: 'Ember Orange',
    tags: ['Energy', 'Urgency', 'Bold'],
    brand: 'Replit · Figma',
    bg: 'from-orange-950 to-orange-900',
  },
  {
    color: '#18181B',
    label: 'Pure Black',
    tags: ['Clarity', 'Editorial', 'Clean'],
    brand: 'Apple · Arc',
    bg: 'from-zinc-800 to-zinc-900',
  },
];

// ─── Preview renderer ─────────────────────────────────────────────────────────
function LivePreview({ palette, layout }: { palette: typeof PALETTES[0]; layout: string }) {
  const isLight = palette.id === 'nordic' || palette.id === 'vibrant' || palette.id === 'sand';
  const textColor = isLight ? palette.text : palette.text;
  const mutedColor = palette.muted;

  return (
    <div
      className="w-full h-full rounded-2xl overflow-hidden flex flex-col transition-all duration-700"
      style={{ background: palette.bg, color: textColor }}
    >
      {/* Browser chrome */}
      <div
        className="h-10 flex items-center px-4 gap-2 border-b shrink-0 transition-all duration-700"
        style={{ background: palette.surface, borderColor: `${palette.accent}22` }}
      >
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-red-400 opacity-60" />
          <div className="w-2.5 h-2.5 rounded-full bg-amber-400 opacity-60" />
          <div className="w-2.5 h-2.5 rounded-full bg-green-400 opacity-60" />
        </div>
        <div
          className="mx-auto h-5 w-40 rounded-full opacity-30 border"
          style={{ background: palette.bg, borderColor: `${palette.accent}44` }}
        />
      </div>

      {/* Template Content */}
      <div className="flex-1 relative overflow-hidden">
        <AnimatePresence mode="wait">
          {layout === 'hero' && (
            <motion.div
              key="hero"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="absolute inset-0 flex flex-col items-center justify-center text-center p-8"
            >
              <div
                className="absolute inset-0 opacity-10 blur-[80px] rounded-full scale-150"
                style={{ background: palette.accent }}
              />
              <div
                className="inline-block px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase mb-4 border"
                style={{ color: palette.accent, borderColor: `${palette.accent}44` }}
              >
                Now Available
              </div>
              <h1 className="text-3xl font-bold tracking-tight mb-3 leading-tight" style={{ color: textColor }}>
                Design that{' '}
                <span style={{ color: palette.accent }}>commands</span>{' '}
                attention.
              </h1>
              <p className="text-sm mb-6 max-w-xs leading-relaxed" style={{ color: mutedColor }}>
                Stop blending in. Build an aesthetic that explicitly targets the psychology of your best prospects.
              </p>
              <div className="flex gap-3">
                <button
                  className="px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg transition-all"
                  style={{ background: palette.accent, color: isLight ? '#fff' : '#000' }}
                >
                  Get Started
                </button>
                <button
                  className="px-5 py-2.5 rounded-xl text-sm font-bold border transition-all"
                  style={{ color: textColor, borderColor: `${palette.accent}44` }}
                >
                  View Gallery
                </button>
              </div>
            </motion.div>
          )}

          {layout === 'split' && (
            <motion.div
              key="split"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="absolute inset-0 flex"
            >
              {/* Left text */}
              <div className="w-1/2 flex flex-col justify-center p-8" style={{ background: palette.bg }}>
                <div
                  className="text-[9px] font-bold tracking-[0.2em] uppercase mb-3"
                  style={{ color: palette.accent }}
                >
                  Introducing
                </div>
                <h2 className="text-2xl font-bold leading-tight mb-3" style={{ color: textColor }}>
                  Built for<br />
                  <span style={{ color: palette.accent }}>scale.</span>
                </h2>
                <p className="text-xs leading-relaxed mb-5" style={{ color: mutedColor }}>
                  Powerful tools for teams that move fast and build things that last.
                </p>
                <button
                  className="self-start px-4 py-2 rounded-lg text-xs font-bold"
                  style={{ background: palette.accent, color: isLight ? '#fff' : '#000' }}
                >
                  Learn More →
                </button>
              </div>
              {/* Right visual */}
              <div
                className="w-1/2 flex items-center justify-center"
                style={{ background: palette.surface }}
              >
                <div
                  className="w-24 h-24 rounded-2xl opacity-30"
                  style={{ background: palette.accent }}
                />
                <div
                  className="absolute w-16 h-16 rounded-full opacity-20 blur-xl"
                  style={{ background: palette.accent }}
                />
              </div>
            </motion.div>
          )}

          {layout === 'grid' && (
            <motion.div
              key="grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="absolute inset-0 p-6 overflow-hidden"
            >
              <h2 className="text-lg font-bold mb-1" style={{ color: textColor }}>
                Everything you need
              </h2>
              <p className="text-[10px] mb-4" style={{ color: mutedColor }}>
                One platform. Every tool.
              </p>
              <div className="grid grid-cols-2 gap-3">
                {['Analytics', 'Automation', 'Integrations', 'Reports'].map((f, i) => (
                  <div
                    key={f}
                    className="p-4 rounded-xl border"
                    style={{ background: palette.surface, borderColor: `${palette.accent}22` }}
                  >
                    <div
                      className="w-6 h-6 rounded-lg mb-2 opacity-60"
                      style={{ background: palette.accent }}
                    />
                    <div className="text-xs font-bold mb-1" style={{ color: textColor }}>
                      {f}
                    </div>
                    <div className="text-[10px] leading-relaxed" style={{ color: mutedColor }}>
                      Seamless and powerful
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {layout === 'magazine' && (
            <motion.div
              key="magazine"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="absolute inset-0 p-6 flex flex-col gap-3 overflow-hidden"
            >
              {/* Big headline bar */}
              <div
                className="px-4 py-3 rounded-xl"
                style={{ background: palette.accent }}
              >
                <div
                  className="text-xs font-bold tracking-widest uppercase"
                  style={{ color: isLight ? '#fff' : '#000' }}
                >
                  Cover Story
                </div>
                <div
                  className="text-lg font-bold leading-tight"
                  style={{ color: isLight ? '#fff' : '#000' }}
                >
                  The Art of First Impression
                </div>
              </div>
              {/* Two column cards */}
              <div className="flex gap-3 flex-1">
                <div
                  className="flex-1 rounded-xl p-3 flex flex-col justify-end border"
                  style={{ background: palette.surface, borderColor: `${palette.accent}22` }}
                >
                  <div className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: palette.accent }}>
                    Design
                  </div>
                  <div className="text-xs font-bold" style={{ color: textColor }}>
                    Why aesthetics drive revenue
                  </div>
                </div>
                <div className="w-1/3 flex flex-col gap-2">
                  {[1, 2].map(i => (
                    <div
                      key={i}
                      className="flex-1 rounded-xl border"
                      style={{ background: palette.surface, borderColor: `${palette.accent}22` }}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          )}
          {layout === 'testimonial' && (
            <motion.div
              key="testimonial"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="absolute inset-0 p-6 flex flex-col gap-4 overflow-hidden"
            >
              <div className="text-[9px] font-bold tracking-[0.25em] uppercase mb-1" style={{ color: palette.accent }}>What clients say</div>
              {/* Big quote */}
              <div className="rounded-2xl p-5 flex-1 flex flex-col justify-between border" style={{ background: palette.surface, borderColor: `${palette.accent}22` }}>
                <div className="text-2xl font-bold mb-2" style={{ color: palette.accent }}>❝</div>
                <p className="text-sm font-medium leading-relaxed flex-1" style={{ color: textColor }}>
                  Working with this team transformed our brand identity overnight. Revenue up 40% in 3 months.
                </p>
                <div className="flex items-center gap-3 mt-4">
                  <div className="w-8 h-8 rounded-full opacity-60" style={{ background: palette.accent }} />
                  <div>
                    <div className="text-xs font-bold" style={{ color: textColor }}>Sarah Chen</div>
                    <div className="text-[10px]" style={{ color: mutedColor }}>CEO, Apex Labs</div>
                  </div>
                </div>
              </div>
              {/* Logo strip */}
              <div className="flex gap-2">
                {[1,2,3,4].map(i => (
                  <div key={i} className="flex-1 h-6 rounded-lg opacity-20" style={{ background: palette.accent }} />
                ))}
              </div>
            </motion.div>
          )}

          {layout === 'pricing' && (
            <motion.div
              key="pricing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="absolute inset-0 p-5 flex flex-col overflow-hidden"
            >
              <h2 className="text-base font-bold mb-3 text-center" style={{ color: textColor }}>Simple pricing</h2>
              <div className="flex gap-3 flex-1 items-stretch">
                {[{ label: 'Starter', price: '$29', featured: false }, { label: 'Pro', price: '$79', featured: true }, { label: 'Scale', price: '$149', featured: false }].map(tier => (
                  <div
                    key={tier.label}
                    className={`flex-1 rounded-2xl p-4 flex flex-col border transition-all ${tier.featured ? 'scale-105 shadow-xl' : ''}`}
                    style={{
                      background: tier.featured ? palette.accent : palette.surface,
                      borderColor: tier.featured ? palette.accent : `${palette.accent}22`,
                    }}
                  >
                    <div className="text-[9px] font-bold tracking-widest uppercase mb-2"
                      style={{ color: tier.featured ? (isLight ? '#fff' : '#000') : mutedColor }}>
                      {tier.label}
                    </div>
                    <div className="text-xl font-bold mb-3"
                      style={{ color: tier.featured ? (isLight ? '#fff' : '#000') : textColor }}>
                      {tier.price}
                    </div>
                    <div className="space-y-1.5 flex-1">
                      {[1,2,3].map(j => (
                        <div key={j} className="h-1.5 rounded-full opacity-30" style={{ background: tier.featured ? (isLight ? '#fff' : '#000') : palette.accent }} />
                      ))}
                    </div>
                    <div className="mt-3 h-7 rounded-xl flex items-center justify-center"
                      style={{ background: tier.featured ? 'rgba(0,0,0,0.2)' : `${palette.accent}22` }}>
                      <div className="w-10 h-1.5 rounded-full opacity-50" style={{ background: tier.featured ? '#fff' : palette.accent }} />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {layout === 'sidebar' && (
            <motion.div
              key="sidebar"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="absolute inset-0 flex overflow-hidden"
            >
              {/* Sidebar */}
              <div className="w-[30%] flex flex-col gap-2 p-4 border-r" style={{ background: palette.surface, borderColor: `${palette.accent}22` }}>
                <div className="w-14 h-4 rounded-full mb-3 opacity-60" style={{ background: palette.accent }} />
                {['Home', 'Analytics', 'Projects', 'Team', 'Settings'].map((item, i) => (
                  <div
                    key={item}
                    className="px-3 py-2 rounded-lg text-[10px] font-bold"
                    style={{
                      background: i === 0 ? `${palette.accent}22` : 'transparent',
                      color: i === 0 ? palette.accent : mutedColor,
                    }}
                  >
                    {item}
                  </div>
                ))}
              </div>
              {/* Main content */}
              <div className="flex-1 p-4 flex flex-col gap-3" style={{ background: palette.bg }}>
                <div className="h-4 w-24 rounded-full opacity-50" style={{ background: palette.accent }} />
                <div className="grid grid-cols-2 gap-2">
                  {[1,2,3,4].map(i => (
                    <div key={i} className="h-14 rounded-xl border" style={{ background: palette.surface, borderColor: `${palette.accent}22` }} />
                  ))}
                </div>
                <div className="flex-1 rounded-xl border" style={{ background: palette.surface, borderColor: `${palette.accent}22` }} />
              </div>
            </motion.div>
          )}

          {layout === 'cta' && (
            <motion.div
              key="cta"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="absolute inset-0 flex flex-col items-center justify-center text-center p-10"
            >
              <div className="absolute inset-0 opacity-5" style={{ background: `radial-gradient(circle at 50% 50%, ${palette.accent}, transparent 70%)` }} />
              <div className="text-[9px] font-mono tracking-[0.3em] uppercase mb-4" style={{ color: palette.accent }}>Limited spots available</div>
              <h1 className="text-3xl font-bold leading-tight mb-4" style={{ color: textColor }}>
                Ready to grow<br />
                <span style={{ color: palette.accent }}>10× faster?</span>
              </h1>
              <button
                className="px-10 py-3.5 rounded-full text-sm font-bold shadow-2xl"
                style={{ background: palette.accent, color: isLight ? '#fff' : '#000', boxShadow: `0 0 40px ${palette.accent}44` }}
              >
                Start Free Trial
              </button>
              <div className="mt-4 text-[10px]" style={{ color: mutedColor }}>No credit card required · Cancel anytime</div>
            </motion.div>
          )}

          {layout === 'dashboard' && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="absolute inset-0 p-5 flex flex-col gap-3 overflow-hidden"
            >
              {/* Top metric cards */}
              <div className="flex gap-2">
                {[{ label: 'Revenue', val: '$48.2K' }, { label: 'Users', val: '12.4K' }, { label: 'Conv.', val: '6.8%' }].map(m => (
                  <div key={m.label} className="flex-1 rounded-xl p-3 border" style={{ background: palette.surface, borderColor: `${palette.accent}22` }}>
                    <div className="text-[9px] font-bold uppercase tracking-widest mb-1" style={{ color: mutedColor }}>{m.label}</div>
                    <div className="text-base font-bold" style={{ color: palette.accent }}>{m.val}</div>
                  </div>
                ))}
              </div>
              {/* Chart placeholder */}
              <div className="flex-1 rounded-xl border p-4 flex items-end gap-1" style={{ background: palette.surface, borderColor: `${palette.accent}22` }}>
                {[40, 65, 45, 80, 55, 90, 70, 85, 60, 95, 75, 100].map((h, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-t-sm transition-all"
                    style={{ height: `${h}%`, background: i === 10 ? palette.accent : `${palette.accent}33` }}
                  />
                ))}
              </div>
              {/* Bottom row */}
              <div className="flex gap-2">
                <div className="flex-1 h-10 rounded-xl border" style={{ background: palette.surface, borderColor: `${palette.accent}22` }} />
                <div className="flex-1 h-10 rounded-xl border" style={{ background: palette.surface, borderColor: `${palette.accent}22` }} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function CanvasPage() {
  return (
    <React.Suspense fallback={<div className="min-h-screen bg-black" />}>
      <CanvasContent />
    </React.Suspense>
  );
}

function CanvasContent() {
  const [activePalette, setActivePalette] = useState(PALETTES[0]);
  const [activeLayout, setActiveLayout] = useState('hero');
  const [hoveredColor, setHoveredColor] = useState<number | null>(null);
  const [step, setStep] = useState(0); // 0=intro, 1=color, 2=layout, 3=playground

  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: heroScroll } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroY = useTransform(heroScroll, [0, 1], ['0%', '25%']);
  const heroOpacity = useTransform(heroScroll, [0, 0.7], [1, 0]);

  // Step auto-progression based on scroll
  useEffect(() => {
    const sections = ['#section-intro', '#section-colour', '#section-layout', '#section-playground'];
    const observers = sections.map((id, i) => {
      const el = document.querySelector(id);
      if (!el) return null;
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setStep(i); },
        { threshold: 0.3 }
      );
      obs.observe(el);
      return obs;
    });
    return () => observers.forEach(o => o?.disconnect());
  }, []);

  return (
    <div className="min-h-screen bg-[#060608] text-white overflow-x-hidden">

      {/* ── Floating Progress Nav ─────────────────────────────── */}
      <div className="fixed right-6 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-3">
        {['Intro', 'Colour', 'Layout', 'Playground'].map((label, i) => (
          <a
            key={i}
            href={`#section-${label.toLowerCase()}`}
            className="group flex items-center gap-3 justify-end"
          >
            <span
              className="text-[10px] font-bold tracking-widest uppercase opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ color: step === i ? '#C8A97E' : '#71717A' }}
            >
              {label}
            </span>
            <div
              className="rounded-full transition-all duration-300"
              style={{
                width: step === i ? 10 : 6,
                height: step === i ? 10 : 6,
                background: step === i ? '#C8A97E' : '#3F3F46',
              }}
            />
          </a>
        ))}
      </div>

      {/* ── SECTION 1: INTRO ─────────────────────────────────── */}
      <section
        id="section-intro"
        ref={heroRef}
        className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden"
      >
        {/* Animated ambient bg */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-15%] left-[5%] w-[50rem] h-[50rem] bg-amber-700/10 rounded-full blur-[150px] animate-pulse" style={{ animationDuration: '8s' }} />
          <div className="absolute bottom-[-10%] right-[0%] w-[40rem] h-[40rem] bg-indigo-700/10 rounded-full blur-[150px] animate-pulse" style={{ animationDuration: '12s' }} />
        </div>

        <motion.div
          style={{ y: heroY, opacity: heroOpacity }}
          className="relative z-10 text-center max-w-4xl mx-auto px-6"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.04] border border-white/10 mb-8">
              <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              <span className="text-[11px] font-mono tracking-[0.2em] text-white/50 uppercase">Design Intelligence</span>
            </div>

            <h1 className="text-6xl md:text-8xl font-bold tracking-tight leading-[1.02] mb-6"
              style={{ fontFamily: 'var(--font-syne, sans-serif)' }}>
              The{' '}
              <span className="bg-gradient-to-r from-amber-400 via-amber-300 to-orange-400 bg-clip-text text-transparent">
                Canvas
              </span>
            </h1>

            <p className="text-lg md:text-xl text-white/50 max-w-2xl mx-auto leading-relaxed mb-12">
              Colour and layout aren't decoration — they're strategy. Before we build your site, we make decisions that silently persuade every visitor.
            </p>

            <a
              href="#section-colour"
              className="inline-flex items-center gap-3 px-8 py-4 bg-white/[0.06] border border-white/10 rounded-full text-sm font-semibold hover:bg-white/10 transition-all group"
            >
              Begin Exploring
              <svg className="w-4 h-4 group-hover:translate-y-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </a>
          </motion.div>
        </motion.div>

        {/* Scroll cue */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/20"
        >
          <span className="text-[9px] font-mono tracking-[0.3em] uppercase">Scroll</span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="w-px h-10 bg-gradient-to-b from-white/20 to-transparent"
          />
        </motion.div>
      </section>

      {/* ── SECTION 2: COLOUR ────────────────────────────────── */}
      <section id="section-colour" className="relative py-32 px-6">
        <div className="max-w-6xl mx-auto">

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-24"
          >
            <div className="text-[11px] font-mono tracking-[0.3em] text-amber-500 uppercase mb-4">01 — Colour</div>
            <h2 className="text-5xl md:text-6xl font-bold tracking-tight mb-6"
              style={{ fontFamily: 'var(--font-syne, sans-serif)' }}>
              Colour is <span className="text-amber-400">psychology</span>
            </h2>
            <p className="text-white/40 text-lg max-w-xl mx-auto leading-relaxed">
              Every shade triggers an emotion. Before a visitor reads a single word, they've already felt something about your brand.
            </p>
          </motion.div>

          {/* Colour showcase cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-20">
            {COLOUR_INSIGHTS.map((c, i) => (
              <motion.div
                key={c.label}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                onMouseEnter={() => setHoveredColor(i)}
                onMouseLeave={() => setHoveredColor(null)}
                className={`relative rounded-2xl overflow-hidden cursor-pointer transition-all duration-500 bg-gradient-to-b ${c.bg} border border-white/[0.06] ${hoveredColor === i ? 'scale-105 shadow-2xl' : 'scale-100'}`}
                style={{ minHeight: 220 }}
              >
                {/* Colour swatch */}
                <div className="p-5 flex flex-col h-full">
                  <div
                    className="w-14 h-14 rounded-xl mb-auto shadow-lg transition-all duration-500"
                    style={{
                      background: c.color,
                      boxShadow: hoveredColor === i ? `0 0 30px ${c.color}66` : 'none',
                    }}
                  />

                  <div className="mt-8">
                    <div className="text-xs font-bold text-white/30 tracking-widest uppercase mb-2">{c.label}</div>
                    <div className="flex flex-wrap gap-1 mb-3">
                      {c.tags.map(t => (
                        <span key={t} className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-white/10 text-white/60 uppercase tracking-wider">
                          {t}
                        </span>
                      ))}
                    </div>
                    <div className="text-[10px] text-white/30 font-mono">{c.brand}</div>
                  </div>
                </div>

                {hoveredColor === i && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
                  >
                    <p className="text-sm text-white/80 text-center leading-relaxed font-medium">
                      {c.tags.join(' · ')}
                    </p>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>

          {/* Three principles */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { num: '01', title: 'First impression', body: 'Visitors judge your brand in 50ms. Colour is the first thing they process — before layout, before copy.' },
              { num: '02', title: 'Emotional trigger', body: 'Blue builds trust. Red creates urgency. Gold signals exclusivity. These are not opinions — they are wired into us.' },
              { num: '03', title: 'Conversion lever', body: 'A single accent colour on your primary CTA can lift conversions by up to 32%. Colour is your most powerful conversion tool.' },
            ].map((p, i) => (
              <motion.div
                key={p.num}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-7"
              >
                <div className="text-[11px] font-mono text-amber-500 tracking-widest mb-3">{p.num}</div>
                <h3 className="text-lg font-bold mb-3 text-white">{p.title}</h3>
                <p className="text-sm text-white/40 leading-relaxed">{p.body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 3: LAYOUT ────────────────────────────────── */}
      <section id="section-layout" className="relative py-32 px-6 border-t border-white/[0.04]">
        <div className="max-w-6xl mx-auto">

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-20"
          >
            <div className="text-[11px] font-mono tracking-[0.3em] text-indigo-400 uppercase mb-4">02 — Layout</div>
            <h2 className="text-5xl md:text-6xl font-bold tracking-tight mb-6"
              style={{ fontFamily: 'var(--font-syne, sans-serif)' }}>
              Layout is the <span className="text-indigo-400">invisible hand</span>
            </h2>
            <p className="text-white/40 text-lg max-w-xl mx-auto leading-relaxed">
              Structure guides where eyes travel. A great layout reduces friction, builds trust, and leads every visitor exactly where you want them.
            </p>
          </motion.div>

          {/* Layout cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-20">
            {LAYOUTS.map((l, i) => (
              <motion.div
                key={l.id}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 flex flex-col gap-4"
              >
                <div className="text-3xl text-white/20">{l.icon}</div>
                <div>
                  <div className="text-sm font-bold text-white mb-2">{l.name}</div>
                  <div className="text-xs text-white/35 leading-relaxed">{l.desc}</div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Eye path illustration */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="rounded-3xl border border-white/[0.06] bg-white/[0.02] p-8 md:p-12 flex flex-col md:flex-row gap-10 items-center"
          >
            <div className="md:w-5/12 space-y-5">
              <h3 className="text-2xl font-bold text-white leading-tight">
                The eye follows a path.<br />
                <span className="text-indigo-400">We design that path.</span>
              </h3>
              <p className="text-white/40 text-sm leading-relaxed">
                Studies show users scan in an F-pattern. We engineer layouts to intercept that scan at every critical moment — headline, proof, CTA.
              </p>
              <div className="flex flex-col gap-3 pt-2">
                {['Hero → Hook', 'Hook → Proof', 'Proof → Action'].map((step, i) => (
                  <div key={step} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center text-[10px] font-bold text-indigo-400">
                      {i + 1}
                    </div>
                    <span className="text-sm font-medium text-white/60">{step}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Wireframe visualization */}
            <div className="md:w-7/12 w-full">
              <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 space-y-4">
                {/* Nav */}
                <div className="flex justify-between items-center">
                  <div className="w-20 h-3 rounded-full bg-white/20" />
                  <div className="flex gap-3">
                    {[1, 2, 3].map(n => <div key={n} className="w-10 h-2 rounded-full bg-white/10" />)}
                  </div>
                </div>
                {/* Hero headline */}
                <div className="space-y-2 pt-4">
                  <div className="w-3/4 h-5 rounded-full bg-white/25" />
                  <div className="w-1/2 h-5 rounded-full bg-indigo-500/50" />
                </div>
                {/* Body text */}
                <div className="space-y-1.5 opacity-40">
                  <div className="w-full h-2 rounded-full bg-white/30" />
                  <div className="w-full h-2 rounded-full bg-white/30" />
                  <div className="w-2/3 h-2 rounded-full bg-white/30" />
                </div>
                {/* CTA */}
                <div className="w-32 h-9 rounded-lg bg-indigo-500/80 flex items-center justify-center">
                  <div className="w-16 h-2 rounded-full bg-white/70" />
                </div>
                {/* Feature grid */}
                <div className="grid grid-cols-3 gap-3 pt-2">
                  {[1, 2, 3].map(n => (
                    <div key={n} className="h-14 rounded-xl bg-white/[0.04] border border-white/[0.06]" />
                  ))}
                </div>
              </div>
              {/* Eye path arrows */}
              <div className="flex justify-between px-4 mt-3 text-[10px] text-white/20 font-mono">
                <span>↓ Attention</span>
                <span>↓ Interest</span>
                <span>→ Action</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── SECTION 4: PLAYGROUND ────────────────────────────── */}
      <section id="section-playground" className="relative py-32 px-6 border-t border-white/[0.04]">
        <div className="max-w-6xl mx-auto">

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <div className="text-[11px] font-mono tracking-[0.3em] text-emerald-400 uppercase mb-4">03 — Playground</div>
            <h2 className="text-5xl md:text-6xl font-bold tracking-tight mb-4"
              style={{ fontFamily: 'var(--font-syne, sans-serif)' }}>
              See it <span className="text-emerald-400">live</span>
            </h2>
            <p className="text-white/40 text-lg max-w-lg mx-auto">
              Mix palettes and layouts below. Find the combination that feels like you.
            </p>
          </motion.div>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Controls */}
            <div className="lg:w-72 flex flex-col gap-6 shrink-0">

              {/* Palette selector */}
              <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
                <div className="text-[10px] font-mono tracking-[0.2em] text-white/30 uppercase mb-4">Colour Palette</div>
                <div className="space-y-2">
                  {PALETTES.map(p => (
                    <button
                      key={p.id}
                      onClick={() => setActivePalette(p)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-all text-left ${
                        activePalette.id === p.id
                          ? 'border-amber-500/50 bg-amber-500/10'
                          : 'border-white/[0.06] hover:border-white/20 bg-transparent'
                      }`}
                    >
                      {/* Swatch row */}
                      <div className="flex gap-1 shrink-0">
                        {p.preview.map((c, i) => (
                          <div key={i} className="w-3.5 h-3.5 rounded-full border border-white/10" style={{ background: c }} />
                        ))}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className={`text-xs font-bold truncate ${activePalette.id === p.id ? 'text-amber-300' : 'text-white/70'}`}>
                          {p.name}
                        </div>
                        <div className="text-[9px] text-white/25 truncate">{p.emotion}</div>
                      </div>
                      {activePalette.id === p.id && (
                        <div className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Layout selector */}
              <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
                <div className="text-[10px] font-mono tracking-[0.2em] text-white/30 uppercase mb-4">Layout</div>
                <div className="space-y-2">
                  {LAYOUTS.map(l => (
                    <button
                      key={l.id}
                      onClick={() => setActiveLayout(l.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-all text-left ${
                        activeLayout === l.id
                          ? 'border-emerald-500/50 bg-emerald-500/10'
                          : 'border-white/[0.06] hover:border-white/20 bg-transparent'
                      }`}
                    >
                      <span className={`text-lg ${activeLayout === l.id ? 'text-emerald-400' : 'text-white/30'}`}>{l.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className={`text-xs font-bold ${activeLayout === l.id ? 'text-emerald-300' : 'text-white/70'}`}>
                          {l.name}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Palette insight */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={activePalette.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5"
                >
                  <div className="text-[10px] font-mono text-white/30 uppercase tracking-widest mb-3">Insight</div>
                  <div
                    className="w-10 h-1.5 rounded-full mb-3"
                    style={{ background: activePalette.accent }}
                  />
                  <p className="text-sm text-white/50 leading-relaxed">{activePalette.desc}</p>
                  <div className={`mt-3 inline-block text-[10px] font-bold px-3 py-1 rounded-full ${activePalette.badge}`}>
                    {activePalette.emotion}
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Live Preview — floats with user scroll */}
            <div className="flex-1 min-w-0">
              <div
                className="sticky"
                style={{ top: '2rem', height: 'calc(100vh - 4rem)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}
              >
                <div
                  className="rounded-3xl overflow-hidden border border-white/[0.06] shadow-2xl transition-all duration-700 flex-1"
                  style={{ boxShadow: `0 40px 100px ${activePalette.accent}22`, minHeight: 0 }}
                >
                  <LivePreview palette={activePalette} layout={activeLayout} />
                </div>
                <div className="flex items-center justify-center gap-2 text-white/20 text-xs shrink-0 pb-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live Preview — changes apply instantly
                </div>
              </div>
            </div>
          </div>

          {/* CTA to continue */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="mt-24"
          >
            {/* Teaser card */}
            <div className="rounded-3xl border border-white/[0.06] bg-white/[0.02] p-10 md:p-14 flex flex-col md:flex-row items-center gap-8 mb-8">
              <div className="flex-1 space-y-3">
                <div className="text-[10px] font-mono tracking-[0.25em] text-white/30 uppercase">Next Step</div>
                <h3 className="text-2xl md:text-3xl font-bold text-white leading-tight"
                  style={{ fontFamily: 'var(--font-syne, sans-serif)' }}>
                  Design your layout —<br />
                  <span style={{ color: activePalette.accent }}>section by section.</span>
                </h3>
                <p className="text-white/40 text-sm leading-relaxed max-w-md">
                  Take your chosen palette and build the exact layout for your website. Add sections, set spacing, and see it all come to life in real time.
                </p>
                {/* Current selection summary */}
                <div className="flex items-center gap-3 pt-2">
                  <div className="flex gap-1">
                    {activePalette.preview.map((c, i) => (
                      <div key={i} className="w-4 h-4 rounded-full border border-white/10" style={{ background: c }} />
                    ))}
                  </div>
                  <span className="text-xs text-white/30 font-mono">{activePalette.name}</span>
                  <span className="text-white/20">·</span>
                  <span className="text-xs text-white/30 font-mono capitalize">{activeLayout}</span>
                </div>
              </div>
              <Link
                href={`/canvas/design?palette=${activePalette.id}&layout=${activeLayout}`}
                className="shrink-0 inline-flex items-center gap-3 px-10 py-5 rounded-2xl font-bold text-sm tracking-wider hover:scale-[1.03] transition-all group shadow-2xl"
                style={{
                  background: activePalette.accent,
                  color: ['nordic', 'vibrant', 'sand'].includes(activePalette.id) ? '#fff' : '#000',
                  boxShadow: `0 20px 60px ${activePalette.accent}44`,
                }}
              >
                Build My Layout
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
            </div>
            <div className="text-center">
              <Link href="/" className="text-xs text-white/20 hover:text-white/50 transition-colors">
                ← Back to Home
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

    </div>
  );
}
