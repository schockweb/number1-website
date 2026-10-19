"use client";

import React from 'react';
import Link from 'next/link';

export default function WebsiteMakeoverPage() {
  return (
    <div className="min-h-screen bg-[#07070A] text-white relative font-syne overflow-x-hidden">
      {/* Top navigation */}
      <nav className="sticky top-0 z-50 flex items-center justify-between px-6 md:px-12 py-4 bg-[#07070A]/90 backdrop-blur-md border-b border-white/10 font-mono">
        <Link href="/" className="text-xl font-extrabold tracking-tight text-white hover:opacity-80 transition-opacity">
          Number<span className="opacity-35">1</span>.Studio
        </Link>

        <div className="flex items-center gap-4">
          <Link href="/" className="text-xs text-white/60 hover:text-white transition-colors">
            [ ← BACK ]
          </Link>
          <Link
            href="/makeover"
            className="px-5 py-2.5 bg-white text-black text-xs font-extrabold tracking-widest uppercase hover:bg-white/90 transition-all border border-white"
          >
            [ LAUNCH MAKEOVER ]
          </Link>
        </div>
      </nav>

      {/* Hero + CTA to Makeover Tool */}
      <div className="relative overflow-hidden">
        {/* Ambient glow (UNTOUCHED BACKGROUND) */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-20%] left-[10%] w-[40rem] h-[40rem] bg-indigo-500/[0.06] rounded-full blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[10%] w-[35rem] h-[35rem] bg-violet-500/[0.05] rounded-full blur-[120px]" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-6 md:px-12 pt-16 md:pt-28 pb-16 text-center">
          <div className="inline-block px-3 py-1 bg-white/[0.03] border border-white/15 mb-6">
            <span className="text-xs font-mono tracking-widest text-indigo-400 uppercase font-bold">
              // SECTION 02 // LEGACY SITE RE-ENGINEERING
            </span>
          </div>

          <h1 className="text-3xl md:text-6xl font-extrabold text-white tracking-tight leading-[1.08] mb-6 uppercase">
            2010 WEBSITE MAKEOVERS & BRAND SUITES
          </h1>

          <p className="text-sm md:text-base text-white/60 max-w-xl mx-auto leading-relaxed font-mono mb-10">
            Overhaul legacy 2010-era websites into ultra-fast, high-converting digital platforms with unified brand collateral, virtual cards, logos, and letterheads.
          </p>

          <Link
            href="/makeover"
            className="inline-block px-8 py-4 bg-white text-black font-mono font-extrabold text-xs tracking-widest uppercase hover:bg-white/90 transition-all border border-white shadow-2xl"
          >
            [ LAUNCH MAKEOVER TOOL ]
          </Link>
        </div>

        {/* Feature Grid */}
        <div className="relative z-10 max-w-5xl mx-auto px-6 md:px-12 pb-24">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 font-mono">
            {[
              {
                step: '01 / AI VISUAL SCAN',
                title: 'STRUCTURAL AUDIT',
                desc: 'Scans site layout, typography scale, CSS grid spacing, and performance signals in real time.',
              },
              {
                step: '02 / ANNOTATION ENGINE',
                title: 'PIN-POINT COMMENTS',
                desc: 'Drop pins directly onto live preview elements to specify exact modifications and design preferences.',
              },
              {
                step: '03 / BRAND COLLATERAL',
                title: 'FULL BRAND SUITE',
                desc: 'Synthesize custom proposals complete with virtual cards, email signatures, letterheads, and logos.',
              },
            ].map((item) => (
              <div
                key={item.title}
                className="bg-white/[0.02] border border-white/15 p-6 hover:border-white/30 transition-all duration-300"
              >
                <div className="text-[10px] font-bold text-indigo-400 mb-2 tracking-widest">{item.step}</div>
                <h3 className="text-sm font-bold text-white mb-2 tracking-tight uppercase font-syne">{item.title}</h3>
                <p className="text-xs text-white/50 leading-relaxed font-mono">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
