"use client";

import React from 'react';
import { motion } from 'framer-motion';

// Holding page while the site is under construction. The previous landing page
// (header, AI Employee section, footer, contact modal) is in git history.
export default function LandingPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#FFFFFF', color: '#000000', fontFamily: 'var(--font-syne, sans-serif)', overflowX: 'hidden' }}>

      <style>{`
        @media (max-width: 768px) {
          .hero-container { padding: 3rem 1rem 5rem !important; min-height: 100dvh !important; }
        }
      `}</style>

      {/* ── GRAND HERO SCREEN ── */}
      <section className="hero-container" style={{
        minHeight: '100vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '5rem 1.5rem', textAlign: 'center',
        position: 'relative',
        background: 'radial-gradient(circle at 50% 25%, rgba(249, 115, 22, 0.04) 0%, rgba(255, 255, 255, 1) 65%)',
      }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          style={{ maxWidth: '1000px', width: '100%' }}
        >
          {/* Main Title */}
          <h1 style={{
            fontSize: 'clamp(2.25rem, 10vw, 5.8rem)',
            fontWeight: 800, letterSpacing: '-0.04em',
            marginBottom: '0.25rem', lineHeight: 1.02, color: '#000000',
          }}>
            Number<span style={{ opacity: 0.35 }}>1</span>.Studio
          </h1>

          {/* Subheader */}
          <div style={{
            fontSize: 'clamp(1.5rem, 4vw, 2.5rem)',
            fontWeight: 800, color: '#000000',
            letterSpacing: '-0.02em', marginBottom: '2rem',
            textTransform: 'uppercase',
          }}>
            PROVIDES
          </div>

          {/* Core Proposition */}
          <p style={{
            fontSize: 'clamp(1.1rem, 2.5vw, 1.6rem)',
            fontWeight: 700, color: '#000000',
            maxWidth: '850px', margin: '0 auto',
            lineHeight: 1.4, letterSpacing: '-0.01em',
          }}>
            AI Solutions for your business, whether you are a startup or already in the game.
          </p>
        </motion.div>
      </section>

    </div>
  );
}
