"use client";

import React from 'react';
import Link from 'next/link';

export default function WebsiteMakeoverPage() {
  return (
    <div className="min-h-screen bg-background text-foreground relative">
      {/* Top navigation */}
      <nav className="sticky top-0 z-50 flex items-center justify-between px-8 md:px-16 py-5 bg-black/60 backdrop-blur-xl border-b border-white/[0.06]">
        <Link href="/" className="text-xl font-bold tracking-tighter font-syne text-white hover:opacity-80 transition-opacity">
          Number<span className="opacity-50">1</span>
        </Link>

        <div className="flex items-center gap-4">
          <Link href="/" className="text-sm text-white/50 hover:text-white transition-colors font-medium">
            ← Back
          </Link>
          <Link
            href="/auth"
            className="text-sm text-white/60 hover:text-white transition-colors font-medium"
          >
            Sign In
          </Link>
          <Link
            href="/pricing"
            className="px-5 py-2.5 bg-white text-black rounded-full text-xs font-bold tracking-widest uppercase hover:bg-white/90 transition-all shadow-lg hover:shadow-xl hover:scale-[1.02]"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero + CTA to Makeover Tool */}
      <div className="relative overflow-hidden">
        {/* Ambient glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-20%] left-[10%] w-[40rem] h-[40rem] bg-indigo-500/[0.06] rounded-full blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[10%] w-[35rem] h-[35rem] bg-violet-500/[0.05] rounded-full blur-[120px]" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-6 md:px-12 pt-20 md:pt-32 pb-16 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.04] border border-white/10 mb-8">
            <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
            <span className="text-[11px] font-mono tracking-[0.2em] text-white/60 uppercase font-semibold">
              AI-Powered Analysis
            </span>
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-syne font-bold text-white tracking-tight leading-[1.05] mb-6">
            Revamp your
            <br />
            <span className="bg-gradient-to-r from-indigo-400 via-violet-300 to-indigo-500 bg-clip-text text-transparent">
              existing website
            </span>
          </h1>

          <p className="text-base md:text-lg text-white/50 max-w-xl mx-auto leading-relaxed font-medium mb-12">
            Enter your website URL below and our AI analysis engine will scan your design, layout, typography, and colour palette — then deliver actionable recommendations in seconds.
          </p>

          <Link
            href="/makeover"
            className="inline-flex items-center gap-3 px-10 py-5 bg-white text-black rounded-full font-bold text-sm tracking-widest uppercase hover:bg-white/90 transition-all shadow-2xl shadow-white/10 hover:scale-[1.02] group"
          >
            Launch Makeover Tool
            <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
        </div>

        {/* Feature Grid */}
        <div className="relative z-10 max-w-5xl mx-auto px-6 md:px-12 pb-24">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              {
                icon: (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                ),
                title: 'AI Website Scan',
                desc: 'Our Gemini-powered engine analyses your site structure, design language, and SEO signals in real time.',
                color: 'text-indigo-400',
                bg: 'bg-indigo-500/10',
              },
              {
                icon: (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                ),
                title: 'Pin Comments',
                desc: 'Drop pins directly on your site preview and add notes about what you want changed — we handle the rest.',
                color: 'text-orange-400',
                bg: 'bg-orange-500/10',
              },
              {
                icon: (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                ),
                title: 'Instant Proposal',
                desc: 'Review the diagnostics, request a proposal, and get a professional redesign brief delivered to your inbox.',
                color: 'text-emerald-400',
                bg: 'bg-emerald-500/10',
              },
            ].map((item) => (
              <div
                key={item.title}
                className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-6 hover:bg-white/[0.04] hover:border-white/[0.12] transition-all duration-300"
              >
                <div className={`w-12 h-12 rounded-xl ${item.bg} flex items-center justify-center ${item.color} mb-4 border border-white/5`}>
                  {item.icon}
                </div>
                <h3 className="text-base font-syne font-bold text-white mb-2">{item.title}</h3>
                <p className="text-sm text-white/45 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
