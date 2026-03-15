"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useCurrency, REGIONS, type Currency } from '@/lib/useCurrency';

// ─── SVG Icons ────────────────────────────────────────────────────────────────

const Icons = {
  report: (
    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
  cost: (
    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  onboarding: (
    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
    </svg>
  ),
  sentiment: (
    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  ),
  data: (
    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
    </svg>
  ),
  revenue: (
    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
  ),
  churn: (
    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    </svg>
  ),
  ads: (
    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
    </svg>
  ),
  forecast: (
    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
    </svg>
  ),
  stock: (
    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
  ),
  risk: (
    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  ),
  compliance: (
    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
    </svg>
  ),
  supply: (
    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  ),
  payroll: (
    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
    </svg>
  ),
  talent: (
    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  check: (
    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  ),
  arrow: (
    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
    </svg>
  ),
  shield: (
    <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  ),
  cpu: (
    <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 3H7a2 2 0 00-2 2v2M9 3h6M9 3v18m6-18h2a2 2 0 012 2v2m0 0V7m0 0v10m0-10h-6m6 10v2a2 2 0 01-2 2h-2m0 0H9m6 0v-6M9 21H7a2 2 0 01-2-2v-2m0 0V15m0 0H3m2 0h4M3 9h2m0 0h4M3 15h2" />
    </svg>
  ),
  clock: (
    <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  lock: (
    <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
  ),
};

// ─── Tier Data ────────────────────────────────────────────────────────────────

const TIERS = [
  {
    id: 'standard',
    name: 'Standard',
    subtitle: 'Operational control',
    price: 'R950',
    period: '/month',
    accent: '#6366F1',
    border: 'rgba(99,102,241,0.2)',
    glow: 'rgba(99,102,241,0.08)',
    badge: null,
    agents: [
      { icon: Icons.report, name: 'Report Generator', desc: 'Automated executive reporting — weekly, monthly, on demand.' },
      { icon: Icons.cost, name: 'Cost Analyst', desc: 'Identifies overhead and spend that should not be there.' },
      { icon: Icons.onboarding, name: 'Onboarding Agent', desc: 'Structured onboarding flows for clients and new hires.' },
      { icon: Icons.sentiment, name: 'Sentiment Analyzer', desc: 'Reads customer and team signals from all your data sources.' },
      { icon: Icons.data, name: 'Data Steward', desc: 'Keeps your data clean, classified, and audit-ready.' },
    ],
    cta: 'Get Started',
    ctaHref: '/get-started',
  },
  {
    id: 'premium',
    name: 'Premium',
    subtitle: 'Revenue intelligence',
    price: 'R1,499',
    period: '/month',
    accent: '#8B5CF6',
    border: 'rgba(139,92,246,0.3)',
    glow: 'rgba(139,92,246,0.1)',
    badge: null,
    agents: [
      { icon: Icons.check, name: 'All Standard agents', desc: '' },
      { icon: Icons.revenue, name: 'Revenue Optimizer', desc: 'Identifies and acts on untapped revenue across every channel.' },
      { icon: Icons.churn, name: 'Churn Predictor', desc: 'Surfaces at-risk accounts before they disengage.' },
      { icon: Icons.ads, name: 'Ad Strategist', desc: 'Reallocates spend in real time toward your highest-performing channels.' },
      { icon: Icons.forecast, name: 'Forecast Engine', desc: 'Demand and revenue forecasting with scenario modelling.' },
      { icon: Icons.stock, name: 'Stock Analyzer', desc: 'Inventory intelligence — what moves, what sits, what margin remains.' },
    ],
    cta: 'Get Started',
    ctaHref: '/get-started',
  },
  {
    id: 'business',
    name: 'Business',
    subtitle: 'Full-spectrum intelligence',
    price: 'R3,500',
    period: '/month',
    accent: '#D97706',
    border: 'rgba(217,119,6,0.25)',
    glow: 'rgba(217,119,6,0.07)',
    badge: null,
    agents: [
      { icon: Icons.check, name: 'All Premium agents', desc: '' },
      { icon: Icons.risk, name: 'Risk Assessor', desc: 'Enterprise risk scanning — operational, financial, and reputational.' },
      { icon: Icons.compliance, name: 'Compliance Monitor', desc: 'Continuous regulatory tracking across your jurisdiction.' },
      { icon: Icons.supply, name: 'Supply Chain Agent', desc: 'Vendor, logistics, and procurement optimisation at scale.' },
      { icon: Icons.payroll, name: 'Payroll Automator', desc: 'Error-free payroll with real-time tax and benefits compliance.' },
      { icon: Icons.talent, name: 'Talent Scout', desc: 'Candidate scoring and pipeline management across all roles.' },
    ],
    cta: 'Get Started',
    ctaHref: '/get-started',
  },
];

const TRUST = [
  { icon: Icons.lock, label: 'Bank-grade encryption', desc: 'Your data never leaves your environment unencrypted.' },
  { icon: Icons.cpu, label: 'Learns your business', desc: 'Improves with every interaction — no manual retraining.' },
  { icon: Icons.clock, label: 'Live in 48 hours', desc: 'No lengthy implementation. Operational within two days.' },
  { icon: Icons.shield, label: 'You are always in control', desc: 'Override any decision. The system works for you.' },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function EmployeePage() {
  const [selected, setSelected] = useState('premium');
  const { currency, setCurrency, region, formatPrice, ready } = useCurrency();

  const PRICE_KEYS: Record<string, keyof typeof region.prices> = {
    standard: 'standard',
    premium: 'premium',
    business: 'business',
  };

  return (
    <div style={{ minHeight: '100vh', background: '#080A0F', color: '#fff', overflowX: 'hidden' }}>

      {/* Subtle noise / gradient backdrop */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '60vh', background: 'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(99,102,241,0.07), transparent)' }} />
      </div>

      {/* ── Nav ── */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem 3rem', borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(8,10,15,0.9)', backdropFilter: 'blur(16px)' }}>
        <Link href="/" style={{ textDecoration: 'none', color: '#fff', fontWeight: 800, fontSize: '1rem', letterSpacing: '-0.04em', fontFamily: 'var(--font-syne, sans-serif)' }}>
          Number<span style={{ opacity: 0.3 }}>1</span>
        </Link>
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          <Link href="/" style={{ color: 'rgba(255,255,255,0.35)', textDecoration: 'none', fontSize: '0.8rem', fontWeight: 500, letterSpacing: '0.02em' }}>Back</Link>
          <a href="#pricing" style={{ padding: '0.5rem 1.25rem', background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.7)', borderRadius: '8px', fontSize: '0.78rem', fontWeight: 600, textDecoration: 'none', border: '1px solid rgba(255,255,255,0.08)', letterSpacing: '0.02em' }}>
            View Pricing
          </a>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section style={{ position: 'relative', zIndex: 10, maxWidth: '760px', margin: '0 auto', padding: '4rem 2rem 4rem', textAlign: 'center' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}>

          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem', padding: '0.3rem 0.9rem', borderRadius: '4px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#6366F1' }} />
            <span style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)' }}>
              Number1.Employee — by Number1.Studios
            </span>
          </div>

          <h1 style={{ fontSize: 'clamp(2.4rem, 5vw, 4.2rem)', fontWeight: 700, letterSpacing: '-0.035em', lineHeight: 1.08, marginBottom: '1.5rem', fontFamily: 'var(--font-syne, sans-serif)', color: '#F8FAFC' }}>
            The employee that never<br />
            <span style={{ color: 'rgba(255,255,255,0.3)' }}>misses a day of work.</span>
          </h1>

          <p style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.4)', maxWidth: '520px', margin: '0 auto 2.5rem', lineHeight: 1.8 }}>
            Not software. A trusted specialist — one who knows your business, works continuously,
            and scales with you. Up to 15 roles. One weekly fee.
          </p>

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
            <a href="#pricing" style={{ padding: '0.8rem 1.75rem', background: '#fff', color: '#000', borderRadius: '8px', fontWeight: 700, fontSize: '0.82rem', letterSpacing: '0.04em', textDecoration: 'none' }}>
              See Pricing
            </a>
            <Link href="/get-started" style={{ padding: '0.8rem 1.75rem', background: 'transparent', color: 'rgba(255,255,255,0.5)', borderRadius: '8px', fontWeight: 600, fontSize: '0.82rem', border: '1px solid rgba(255,255,255,0.1)', textDecoration: 'none' }}>
              Start Discovery
            </Link>
          </div>
        </motion.div>
      </section>

      {/* ── Trust row ── */}
      <section style={{ position: 'relative', zIndex: 10, borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)', padding: '2.5rem 2rem' }}>
        <div style={{ maxWidth: '960px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem' }}>
          {TRUST.map((t, i) => (
            <motion.div key={i} initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ delay: i * 0.07 }} viewport={{ once: true }}
              style={{ display: 'flex', alignItems: 'flex-start', gap: '0.9rem' }}>
              <div style={{ color: 'rgba(255,255,255,0.25)', flexShrink: 0, marginTop: '2px' }}>{t.icon}</div>
              <div>
                <div style={{ fontWeight: 600, color: 'rgba(255,255,255,0.75)', fontSize: '0.82rem', marginBottom: '0.2rem' }}>{t.label}</div>
                <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.75rem', lineHeight: 1.6 }}>{t.desc}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Pricing ── */}
      <section id="pricing" style={{ position: 'relative', zIndex: 10, padding: '4rem 2rem 5rem' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>

          {/* Pricing header + currency toggle */}
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            style={{ marginBottom: '3rem', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '1.25rem' }}>
            <div>
              <div style={{ fontSize: '0.63rem', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)', marginBottom: '0.75rem', fontFamily: 'monospace' }}>Pricing</div>
              <h2 style={{ fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)', fontWeight: 700, letterSpacing: '-0.025em', lineHeight: 1.15, marginBottom: '0.5rem', fontFamily: 'var(--font-syne, sans-serif)' }}>
                One tier for every stage of your business.
              </h2>
              <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.88rem', lineHeight: 1.8 }}>
                Start where it makes sense. Scale up when you see the return.
              </p>
            </div>

            {/* Currency toggle */}
            {ready && (
              <div style={{ display: 'flex', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '8px', padding: '3px', gap: '2px' }}>
                {(['USD', 'EUR', 'CHF'] as Currency[]).map((c) => (
                  <button
                    key={c}
                    onClick={() => setCurrency(c)}
                    style={{
                      padding: '0.4rem 0.9rem',
                      borderRadius: '6px',
                      border: 'none',
                      background: currency === c ? 'rgba(255,255,255,0.1)' : 'transparent',
                      color: currency === c ? '#fff' : 'rgba(255,255,255,0.3)',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      letterSpacing: '0.05em',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {REGIONS[c].label}
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* Tier grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25px', background: 'rgba(255,255,255,0.05)', borderRadius: '16px', overflow: 'hidden' }}>
            {TIERS.map((tier, ti) => {
              const isSelected = selected === tier.id;
              return (
                <motion.div
                  key={tier.id}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: ti * 0.08, duration: 0.5 }}
                  viewport={{ once: true }}
                  onClick={() => setSelected(tier.id)}
                  style={{
                    position: 'relative',
                    background: isSelected ? `rgba(${tier.id === 'standard' ? '99,102,241' : tier.id === 'premium' ? '139,92,246' : '217,119,6'},0.06)` : '#0C0E15',
                    padding: '2.5rem',
                    cursor: 'pointer',
                    transition: 'background 0.3s ease',
                    borderTop: isSelected ? `2px solid ${tier.accent}` : '2px solid transparent',
                  }}
                >
                  {/* Badge */}
                  {tier.badge && (
                    <div style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', padding: '0.2rem 0.65rem', borderRadius: '4px', fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: tier.accent, border: `1px solid ${tier.border}` }}>
                      {tier.badge}
                    </div>
                  )}

                  {/* Tier name + price */}
                  <div style={{ marginBottom: '1.75rem' }}>
                    <div style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: tier.accent, marginBottom: '0.5rem', fontFamily: 'monospace' }}>
                      {tier.subtitle}
                    </div>
                    <div style={{ fontWeight: 800, fontSize: '1.2rem', color: '#fff', marginBottom: '0.75rem', fontFamily: 'var(--font-syne, sans-serif)', letterSpacing: '-0.02em' }}>
                      {tier.name}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '2rem', fontWeight: 700, color: '#fff', letterSpacing: '-0.03em', fontFamily: 'var(--font-syne, sans-serif)', opacity: ready ? 1 : 0, transition: 'opacity 0.3s' }}>
                        {ready ? formatPrice(region.prices[PRICE_KEYS[tier.id]]) : ''}
                      </span>
                      <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: '0.75rem', letterSpacing: '0.02em' }}>/week</span>
                    </div>
                  </div>

                  {/* Divider */}
                  <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)', marginBottom: '1.75rem' }} />

                  {/* Agent list */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
                    {tier.agents.map((agent, ai) => (
                      <div key={ai} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                        <div style={{ color: `${tier.accent}`, opacity: 0.7, flexShrink: 0, marginTop: '1px' }}>
                          {agent.icon}
                        </div>
                        <div>
                          <div style={{ fontSize: '0.82rem', fontWeight: 600, color: agent.desc ? 'rgba(255,255,255,0.75)' : 'rgba(255,255,255,0.4)', letterSpacing: '0.01em' }}>{agent.name}</div>
                          {agent.desc && <div style={{ fontSize: '0.73rem', color: 'rgba(255,255,255,0.3)', lineHeight: 1.6, marginTop: '0.15rem' }}>{agent.desc}</div>}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* CTA */}
                  <Link href={tier.ctaHref} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '0.85rem 1.25rem', borderRadius: '8px', textDecoration: 'none',
                    background: isSelected ? tier.accent : 'rgba(255,255,255,0.04)',
                    color: isSelected ? '#fff' : 'rgba(255,255,255,0.35)',
                    border: `1px solid ${isSelected ? 'transparent' : 'rgba(255,255,255,0.07)'}`,
                    fontSize: '0.8rem', fontWeight: 700,
                    transition: 'all 0.25s ease',
                  }}>
                    <span>{tier.cta}</span>
                    <span style={{ opacity: 0.7 }}>{Icons.arrow}</span>
                  </Link>
                </motion.div>
              );
            })}
          </div>

          <p style={{ textAlign: 'center', marginTop: '1.75rem', color: 'rgba(255,255,255,0.2)', fontSize: '0.75rem', letterSpacing: '0.02em' }}>
            Billed weekly &mdash; 7-day satisfaction guarantee &mdash; cancel anytime &mdash; no setup fees
          </p>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section style={{ position: 'relative', zIndex: 10, borderTop: '1px solid rgba(255,255,255,0.05)', padding: '5rem 2rem 7rem' }}>
        <div style={{ maxWidth: '560px', margin: '0 auto', textAlign: 'center' }}>
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} viewport={{ once: true }}>
            <h2 style={{ fontSize: 'clamp(1.6rem, 3vw, 2.4rem)', fontWeight: 700, letterSpacing: '-0.025em', marginBottom: '1rem', fontFamily: 'var(--font-syne, sans-serif)', lineHeight: 1.15 }}>
              Your team is ready<br />
              <span style={{ color: 'rgba(255,255,255,0.25)' }}>when you are.</span>
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.9rem', lineHeight: 1.8, marginBottom: '2rem' }}>
              Most businesses are paying for capacity they are not using.<br />
              Start with what you need. Scale as you grow.
            </p>
            <Link href="/get-started" style={{ display: 'inline-block', padding: '0.9rem 2.25rem', background: '#fff', color: '#000', borderRadius: '8px', fontWeight: 700, fontSize: '0.82rem', letterSpacing: '0.04em', textDecoration: 'none' }}>
              Begin Discovery Call
            </Link>
            <div style={{ marginTop: '1.25rem', color: 'rgba(255,255,255,0.15)', fontSize: '0.72rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              Number1.Employee &mdash; Number1.Studios
            </div>
          </motion.div>
        </div>
      </section>

    </div>
  );
}
