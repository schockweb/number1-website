"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useCurrency, REGIONS, type Currency } from '@/lib/useCurrency';
import BookCallModal from '@/components/BookCallModal';

// ─── All 15 AI Services ── Full definitions with tier, icon, name, and description
const ALL_SERVICES = [
  // ── Standard Tier (5 agents) ──
  { tier: 'Standard', accent: '#6366F1', icon: <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>, name: 'Report Generator', desc: 'Produces executive-ready reports — weekly, monthly, or on demand. Financial summaries, KPI dashboards, and operational briefs delivered automatically to your inbox.' },
  { tier: 'Standard', accent: '#6366F1', icon: <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>, name: 'Cost Analyst', desc: 'Scans your P&L, vendor invoices, and operational spend to expose hidden costs, duplicate charges, and budget overruns. Recommends specific cuts with projected savings.' },
  { tier: 'Standard', accent: '#6366F1', icon: <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>, name: 'Onboarding Agent', desc: 'Creates structured onboarding flows for new clients and hires. Task sequences, document collection, welcome comms, and progress tracking — all hands-free.' },
  { tier: 'Standard', accent: '#6366F1', icon: <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>, name: 'Sentiment Analyzer', desc: 'Monitors customer reviews, support tickets, social mentions, and internal surveys. Surfaces sentiment trends and flags issues before they become problems.' },
  { tier: 'Standard', accent: '#6366F1', icon: <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" /></svg>, name: 'Data Steward', desc: 'Keeps your databases clean, de-duplicated, and audit-compliant. Enforces naming conventions, detects anomalies, and maintains data lineage across systems.' },

  // ── Premium Tier (5 agents) ──
  { tier: 'Premium', accent: '#8B5CF6', icon: <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>, name: 'Revenue Optimizer', desc: 'Identifies untapped revenue across every channel — upsell opportunities, pricing gaps, dormant accounts, and underperforming products. Actionable recommendations daily.' },
  { tier: 'Premium', accent: '#8B5CF6', icon: <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>, name: 'Churn Predictor', desc: 'Uses engagement patterns, payment behaviour, and support frequency to flag at-risk accounts 2–4 weeks before they disengage. Includes retention playbooks.' },
  { tier: 'Premium', accent: '#8B5CF6', icon: <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" /></svg>, name: 'Ad Strategist', desc: 'Monitors your paid media campaigns in real time. Reallocates budget toward top-performing creatives and channels. ROI-first, always-on optimisation.' },
  { tier: 'Premium', accent: '#8B5CF6', icon: <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" /></svg>, name: 'Forecast Engine', desc: 'Demand and revenue forecasting with scenario modelling. "What if" simulations for pricing changes, market shifts, and seasonal demand. 90-day rolling projections.' },
  { tier: 'Premium', accent: '#8B5CF6', icon: <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>, name: 'Stock Analyzer', desc: 'Inventory intelligence — tracks what moves, what sits, and what margin remains. Suggests reorder points, clearance candidates, and supplier negotiations.' },

  // ── Business Tier (5 agents) ──
  { tier: 'Business', accent: '#D97706', icon: <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>, name: 'Risk Assessor', desc: 'Scans for operational, financial, and reputational risk across your business. Regulatory changes, vendor dependencies, market exposure — all monitored 24/7.' },
  { tier: 'Business', accent: '#D97706', icon: <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>, name: 'Compliance Monitor', desc: 'Tracks regulatory requirements across your jurisdiction — POPIA, GDPR, tax filings, industry-specific mandates. Alerts before deadlines, not after.' },
  { tier: 'Business', accent: '#D97706', icon: <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>, name: 'Supply Chain Agent', desc: 'End-to-end procurement and logistics optimisation. Vendor scoring, delivery tracking, cost benchmarking, and alternative supplier recommendations.' },
  { tier: 'Business', accent: '#D97706', icon: <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>, name: 'Payroll Automator', desc: 'Error-free payroll processing with real-time tax and benefits compliance. Handles deductions, leave accruals, overtime, and payslip distribution.' },
  { tier: 'Business', accent: '#D97706', icon: <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>, name: 'Talent Scout', desc: 'Candidate sourcing and scoring across job boards, LinkedIn, and referrals. JD generation, shortlisting, and interview scheduling — fully automated pipeline.' },
];

const TIERS_DATA = [
  {
    id: 'standard', name: 'Standard', subtitle: 'Operational Control',
    accent: '#6366F1', border: 'rgba(99,102,241,0.2)', glow: 'rgba(99,102,241,0.08)',
    agentCount: 5,
    highlights: ['Automated reporting', 'Cost analysis & savings', 'Client onboarding flows', 'Sentiment monitoring', 'Data quality management'],
  },
  {
    id: 'premium', name: 'Premium', subtitle: 'Revenue Intelligence',
    accent: '#8B5CF6', border: 'rgba(139,92,246,0.3)', glow: 'rgba(139,92,246,0.1)',
    agentCount: 10,
    highlights: ['Everything in Standard', 'Revenue optimisation', 'Churn prediction', 'Ad spend management', 'Demand forecasting', 'Inventory intelligence'],
  },
  {
    id: 'business', name: 'Business', subtitle: 'Full-Spectrum Intelligence',
    accent: '#D97706', border: 'rgba(217,119,6,0.25)', glow: 'rgba(217,119,6,0.07)',
    agentCount: 15,
    highlights: ['Everything in Premium', 'Enterprise risk scanning', 'Regulatory compliance', 'Supply chain optimisation', 'Automated payroll', 'Talent acquisition'],
  },
];

const HOW_IT_WORKS = [
  { step: '01', title: 'Strategy Consultation', desc: 'We learn your business, systems, and goals in a focused 30-minute call.', icon: <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg> },
  { step: '02', title: 'Configuration', desc: 'We configure your AI employees with your data, brand voice, and workflows.', icon: <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg> },
  { step: '03', title: 'Instant Deployment', desc: 'Your AI team goes live immediately. No waiting, no lengthy implementation.', icon: <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg> },
  { step: '04', title: 'Continuous Learning', desc: 'Your employees improve every week — learning your business, adapting to changes.', icon: <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg> },
];

export default function EmployeePage() {
  const [selected, setSelected] = useState('premium');
  const [showBookCall, setShowBookCall] = useState(false);
  const { currency, setCurrency, region, formatPrice, ready } = useCurrency();

  const PRICE_KEYS: Record<string, keyof typeof region.prices> = {
    standard: 'standard', premium: 'premium', business: 'business',
  };

  const fadeUp = { initial: { opacity: 0, y: 24 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true } };

  return (
    <div style={{ minHeight: '100vh', background: '#080A0F', color: '#fff', overflowX: 'hidden' }}>

      {/* Background glows */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', top: '-15%', left: '30%', width: '60vw', height: '60vw', maxWidth: 900, maxHeight: 900, background: 'radial-gradient(ellipse, rgba(99,102,241,0.08), transparent 65%)', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', bottom: '-20%', right: '15%', width: '50vw', height: '50vw', maxWidth: 700, maxHeight: 700, background: 'radial-gradient(ellipse, rgba(139,92,246,0.05), transparent 65%)', borderRadius: '50%' }} />
      </div>

      {/* ── Nav ── */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 50,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '1.25rem clamp(1.25rem, 4vw, 3rem)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        background: 'rgba(8,10,15,0.92)', backdropFilter: 'blur(16px)',
      }}>
        <Link href="/" style={{ textDecoration: 'none', color: '#fff', fontWeight: 800, fontSize: '1.1rem', letterSpacing: '-0.04em', fontFamily: 'var(--font-syne, sans-serif)', cursor: 'pointer' }}>
          Number<span style={{ opacity: 0.35 }}>1</span>.Studio
        </Link>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <Link href="/" style={{ color: 'rgba(255,255,255,0.45)', textDecoration: 'none', fontSize: '0.8rem', fontWeight: 500 }}>Home</Link>
          <a href="#pricing" style={{ padding: '0.5rem 1.25rem', background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.75)', borderRadius: '8px', fontSize: '0.78rem', fontWeight: 600, textDecoration: 'none', border: '1px solid rgba(255,255,255,0.08)' }}>
            Pricing
          </a>
          <Link href="/book-a-call" style={{
            padding: '0.5rem 1.25rem',
            background: 'linear-gradient(135deg, rgba(52,211,153,0.15), rgba(96,165,250,0.1))',
            color: '#34D399', borderRadius: '8px',
            fontSize: '0.78rem', fontWeight: 700, textDecoration: 'none',
            border: '1px solid rgba(52,211,153,0.25)',
            display: 'inline-flex', alignItems: 'center', gap: '6px',
          }}>
            <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            Contact Us
          </Link>
        </div>
      </nav>

      {/* ══════════════════ HERO ══════════════════ */}
      <section style={{ position: 'relative', zIndex: 10, maxWidth: 800, margin: '0 auto', padding: 'clamp(3rem, 8vw, 6rem) 2rem clamp(2rem, 5vw, 4rem)', textAlign: 'center' }}>
        <motion.div {...fadeUp} transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}>

          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: '2rem', padding: '6px 16px', borderRadius: 6, background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#6366F1' }} />
            <span style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#A5B4FC' }}>
              Number1.Employee
            </span>
          </div>

          <h1 style={{
            fontSize: 'clamp(2.2rem, 5vw, 4rem)', fontWeight: 800,
            letterSpacing: '-0.035em', lineHeight: 1.08, marginBottom: '1.75rem',
            fontFamily: 'var(--font-syne, sans-serif)', color: '#F1F5F9',
          }}>
            AI employees that run<br />
            <span style={{
              background: 'linear-gradient(120deg, #6366F1, #8B5CF6, #D97706)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>
              your business operations.
            </span>
          </h1>

          <p style={{ fontSize: 'clamp(0.95rem, 1.5vw, 1.125rem)', color: 'rgba(255,255,255,0.7)', maxWidth: 580, margin: '0 auto 1rem', lineHeight: 1.8 }}>
            <strong style={{ color: '#E2E8F0' }}>Number1.Employee</strong> is not software. It&apos;s a team of specialised AI agents that 
            understand your business, execute real work, and improve every week — from financial reporting 
            and cost analysis to talent acquisition and regulatory compliance.
          </p>
          <p style={{ fontSize: '0.95rem', color: 'rgba(255,255,255,0.55)', maxWidth: 520, margin: '0 auto 2.5rem', lineHeight: 1.8 }}>
            Up to <strong style={{ color: '#C7D2FE' }}>15 AI employees</strong>. One weekly fee. No setup costs. Live instantly.
          </p>

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="#pricing" style={{
              padding: '0.85rem 2rem', background: '#fff', color: '#000', borderRadius: 10,
              fontWeight: 700, fontSize: '0.85rem', letterSpacing: '0.03em', textDecoration: 'none',
              transition: 'transform 0.15s', minHeight: 48,
            }}>
              See Pricing
            </a>
            <Link href="/get-started" style={{
              padding: '0.85rem 2rem', background: 'transparent', color: 'rgba(255,255,255,0.7)',
              borderRadius: 10, fontWeight: 600, fontSize: '0.85rem',
              border: '1px solid rgba(255,255,255,0.15)', textDecoration: 'none', minHeight: 48,
            }}>
              Get Started →
            </Link>
          </div>
        </motion.div>
      </section>

      {/* ══════════════════ HOW IT WORKS ══════════════════ */}
      <section style={{ position: 'relative', zIndex: 10, borderTop: '1px solid rgba(255,255,255,0.06)', padding: 'clamp(3rem, 5vw, 5rem) 2rem' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <motion.div {...fadeUp} style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <div style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginBottom: '0.75rem', fontFamily: 'monospace' }}>How It Works</div>
            <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2.25rem)', fontWeight: 700, letterSpacing: '-0.025em', fontFamily: 'var(--font-syne, sans-serif)', color: '#E2E8F0' }}>
              From consultation to deployment in 4 steps.
            </h2>
          </motion.div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' }}>
            {HOW_IT_WORKS.map((s, i) => (
              <motion.div key={i} {...fadeUp} transition={{ delay: i * 0.08 }}
                style={{
                  padding: '2rem 1.5rem', borderRadius: 16,
                  background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
                  textAlign: 'center',
                }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 14,
                  background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.15)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#818CF8', margin: '0 auto 14px',
                }}>{s.icon}</div>
                <div style={{ fontFamily: 'monospace', fontSize: 11, color: 'rgba(255,255,255,0.25)', letterSpacing: '0.15em', marginBottom: 8 }}>STEP {s.step}</div>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: '#E2E8F0', marginBottom: 8 }}>{s.title}</div>
                <div style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.55)', lineHeight: 1.7 }}>{s.desc}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════ PRICING ══════════════════ */}
      <section id="pricing" style={{ position: 'relative', zIndex: 10, padding: 'clamp(3rem, 5vw, 5rem) 2rem' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>

          <motion.div {...fadeUp} style={{ marginBottom: '3rem', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '1.25rem' }}>
            <div>
              <div style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginBottom: '0.75rem', fontFamily: 'monospace' }}>Pricing</div>
              <h2 style={{ fontSize: 'clamp(1.5rem, 3.5vw, 2.5rem)', fontWeight: 700, letterSpacing: '-0.025em', lineHeight: 1.15, marginBottom: '0.5rem', fontFamily: 'var(--font-syne, sans-serif)', color: '#E2E8F0' }}>
                One tier for every stage of your business.
              </h2>
              <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.95rem', lineHeight: 1.8 }}>
                Start where it makes sense. Scale up when you see the return.
              </p>
            </div>

            {ready && (
              <div style={{ display: 'flex', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: 3, gap: 2 }}>
                {(['USD', 'EUR', 'CHF'] as Currency[]).map((c) => (
                  <button key={c} onClick={() => setCurrency(c)} style={{
                    padding: '0.45rem 1rem', borderRadius: 6, border: 'none',
                    background: currency === c ? 'rgba(255,255,255,0.12)' : 'transparent',
                    color: currency === c ? '#fff' : 'rgba(255,255,255,0.4)',
                    fontSize: '0.74rem', fontWeight: 700, cursor: 'pointer', letterSpacing: '0.05em',
                    transition: 'all 0.15s',
                  }}>
                    {REGIONS[c].label}
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* Tier cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25px', background: 'rgba(255,255,255,0.05)', borderRadius: 18, overflow: 'hidden' }}>
            {TIERS_DATA.map((tier, ti) => {
              const isSelected = selected === tier.id;
              return (
                <motion.div
                  key={tier.id} {...fadeUp} transition={{ delay: ti * 0.08, duration: 0.5 }}
                  onClick={() => setSelected(tier.id)}
                  style={{
                    position: 'relative', background: isSelected ? '#0E1019' : '#0C0E15',
                    padding: 'clamp(1.75rem, 3vw, 2.5rem)', cursor: 'pointer',
                    transition: 'background 0.3s',
                    borderTop: isSelected ? `2px solid ${tier.accent}` : '2px solid transparent',
                  }}
                >
                  {/* Tier header */}
                  <div style={{ marginBottom: '1.75rem' }}>
                    <div style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: tier.accent, marginBottom: '0.5rem', fontFamily: 'monospace' }}>
                      {tier.subtitle}
                    </div>
                    <div style={{ fontWeight: 800, fontSize: '1.25rem', color: '#F1F5F9', marginBottom: '0.75rem', fontFamily: 'var(--font-syne, sans-serif)', letterSpacing: '-0.02em' }}>
                      {tier.name}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '2.25rem', fontWeight: 700, color: '#F1F5F9', letterSpacing: '-0.03em', fontFamily: 'var(--font-syne, sans-serif)', opacity: ready ? 1 : 0, transition: 'opacity 0.3s' }}>
                        {ready ? formatPrice(region.prices[PRICE_KEYS[tier.id]]) : ''}
                      </span>
                      <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem' }}>/week</span>
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.45)', marginTop: 8 }}>
                      {tier.agentCount} AI employees included
                    </div>
                  </div>

                  <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', marginBottom: '1.75rem' }} />

                  {/* Highlights */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2rem' }}>
                    {tier.highlights.map((h, hi) => (
                      <div key={hi} style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                        <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke={tier.accent} strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                        <span style={{ fontSize: '0.85rem', color: hi === 0 && tier.id !== 'standard' ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.8)', fontWeight: 500 }}>{h}</span>
                      </div>
                    ))}
                  </div>

                  {/* CTA */}
                  <Link href="/get-started" style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    padding: '0.9rem 1.25rem', borderRadius: 10, textDecoration: 'none',
                    background: isSelected ? tier.accent : 'rgba(255,255,255,0.05)',
                    color: isSelected ? '#fff' : 'rgba(255,255,255,0.55)',
                    border: `1px solid ${isSelected ? 'transparent' : 'rgba(255,255,255,0.08)'}`,
                    fontSize: '0.85rem', fontWeight: 700, transition: 'all 0.25s', minHeight: 48,
                  }}>
                    Get Started →
                  </Link>
                </motion.div>
              );
            })}
          </div>

          <p style={{ textAlign: 'center', marginTop: '1.75rem', color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem', letterSpacing: '0.02em' }}>
            Billed weekly &mdash; 7-day satisfaction guarantee &mdash; cancel anytime &mdash; no setup fees
          </p>
        </div>
      </section>

      {/* ══════════════════ ALL 15 SERVICES ══════════════════ */}
      <section id="services" style={{ position: 'relative', zIndex: 10, borderTop: '1px solid rgba(255,255,255,0.06)', padding: 'clamp(3rem, 5vw, 5rem) 2rem' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <motion.div {...fadeUp} style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <div style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginBottom: '0.75rem', fontFamily: 'monospace' }}>Your AI Team</div>
            <h2 style={{ fontSize: 'clamp(1.5rem, 3.5vw, 2.5rem)', fontWeight: 700, letterSpacing: '-0.025em', lineHeight: 1.15, fontFamily: 'var(--font-syne, sans-serif)', color: '#E2E8F0', marginBottom: 12 }}>
              All 15 AI employees, explained.
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.95rem', lineHeight: 1.8, maxWidth: 600, margin: '0 auto' }}>
              Each employee is a specialised AI agent trained on your business data. Here&apos;s exactly what each one does.
            </p>
          </motion.div>

          {/* Grouped by tier */}
          {['Standard', 'Premium', 'Business'].map((tierName) => {
            const tierServices = ALL_SERVICES.filter(s => s.tier === tierName);
            const tierAccent = tierServices[0]?.accent || '#6366F1';
            return (
              <div key={tierName} style={{ marginBottom: '3rem' }}>
                <motion.div {...fadeUp} style={{
                  display: 'inline-flex', alignItems: 'center', gap: 10,
                  padding: '8px 18px', borderRadius: 8, marginBottom: '1.5rem',
                  background: `${tierAccent}10`, border: `1px solid ${tierAccent}25`,
                }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: tierAccent }} />
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: tierAccent }}>
                    {tierName} Tier
                  </span>
                </motion.div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem' }}>
                  {tierServices.map((service, si) => (
                    <motion.div key={si} {...fadeUp} transition={{ delay: si * 0.05 }}
                      style={{
                        padding: '1.5rem', borderRadius: 16,
                        background: 'rgba(255,255,255,0.02)',
                        border: '1px solid rgba(255,255,255,0.06)',
                        transition: 'border-color 0.2s',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                        <div style={{
                          width: 38, height: 38, borderRadius: 10,
                          background: `${service.accent}12`, border: `1px solid ${service.accent}25`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: service.accent, flexShrink: 0,
                        }}>
                          {service.icon}
                        </div>
                        <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#E2E8F0' }}>{service.name}</div>
                      </div>
                      <div style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.75 }}>
                        {service.desc}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ══════════════════ FINAL CTA ══════════════════ */}
      <section style={{ position: 'relative', zIndex: 10, borderTop: '1px solid rgba(255,255,255,0.06)', padding: 'clamp(3rem, 5vw, 5rem) 2rem clamp(4rem, 7vw, 7rem)' }}>
        <div style={{ maxWidth: 600, margin: '0 auto', textAlign: 'center' }}>
          <motion.div {...fadeUp}>
            <h2 style={{ fontSize: 'clamp(1.6rem, 3vw, 2.4rem)', fontWeight: 700, letterSpacing: '-0.025em', marginBottom: '1rem', fontFamily: 'var(--font-syne, sans-serif)', lineHeight: 1.15, color: '#E2E8F0' }}>
              Your team is ready<br />
              <span style={{ color: 'rgba(255,255,255,0.35)' }}>when you are.</span>
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.95rem', lineHeight: 1.8, marginBottom: '2rem' }}>
              Most businesses are paying for capacity they&apos;re not using.<br />
              Start with what you need. Scale as you grow.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/get-started" style={{
                display: 'inline-block', padding: '0.9rem 2.25rem',
                background: '#fff', color: '#000', borderRadius: 10,
                fontWeight: 700, fontSize: '0.85rem', letterSpacing: '0.03em', textDecoration: 'none', minHeight: 48,
              }}>
                Book a Consultation
              </Link>
              <button onClick={() => setShowBookCall(true)} style={{
                background: 'none', border: '1px solid rgba(249,115,22,0.3)',
                color: '#F97316', padding: '0.9rem 2rem', borderRadius: 10,
                fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', letterSpacing: '0.03em',
                transition: 'all 0.2s', minHeight: 48,
              }}>
                📞 Speak to Sales
              </button>
            </div>
            <div style={{ marginTop: '1.5rem', color: 'rgba(255,255,255,0.25)', fontSize: '0.72rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Number1.Employee &mdash; by Number1.Studios
            </div>
          </motion.div>
        </div>
      </section>

      <BookCallModal isOpen={showBookCall} onClose={() => setShowBookCall(false)} source="employee" />
    </div>
  );
}
