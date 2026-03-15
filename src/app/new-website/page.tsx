"use client";

import React from 'react';
import Link from 'next/link';
import { BuildingFlow } from '@/components/BuildingFlow';

export default function NewWebsitePage() {
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

      {/* Full BuildingFlow component */}
      <BuildingFlow />
    </div>
  );
}
