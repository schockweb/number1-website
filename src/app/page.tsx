"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession, signOut } from 'next-auth/react';

// ─── Service Cards Data ───────────────────────────────────────────────────────

const CARDS = [
  {
    id: 'new',
    title: 'Brand New Website',
    description: 'Build a high-performance website from strategy and architecture to design and launch. We handle everything.',
    href: '/discovery',
    cta: 'Start Discovery',
    accent: '#F97316',
    accentDim: 'rgba(249,115,22,0.12)',
    accentGlow: 'rgba(249,115,22,0.25)',
    accentBorder: 'rgba(249,115,22,0.3)',
    features: ['Strategy & Architecture', 'Custom Design', 'SEO Optimised', 'Full Launch Support'],
    icon: (
      <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  },
  {
    id: 'makeover',
    title: 'Website Makeover',
    description: 'Analyse and transform your existing site with our AI-powered design engine. Keep the brand, upgrade everything else.',
    href: '/makeover',
    cta: 'Start Analysis',
    accent: '#818CF8',
    accentDim: 'rgba(129,140,248,0.12)',
    accentGlow: 'rgba(129,140,248,0.25)',
    accentBorder: 'rgba(129,140,248,0.3)',
    features: ['AI Site Analysis', 'Design Refresh', 'Performance Boost', 'Brand Consistency'],
    icon: (
      <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
    ),
  },
  {
    id: 'ai',
    title: 'Number1 Employee',
    description: 'Deploy a workforce of 15 intelligent agents to automate your business operations around the clock.',
    href: '/employee',
    cta: 'Hire Employee',
    accent: '#34D399',
    accentDim: 'rgba(52,211,153,0.12)',
    accentGlow: 'rgba(52,211,153,0.25)',
    accentBorder: 'rgba(52,211,153,0.3)',
    features: ['24/7 Automation', 'Lead Generation', 'Customer Support', 'Operations AI'],
    icon: (
      <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
  },
];

// ─── Service Card ─────────────────────────────────────────────────────────────

function ServiceCard({ card, index }: { card: typeof CARDS[0]; index: number }) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 + index * 0.12, ease: [0.22, 1, 0.36, 1] }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ height: '100%' }}
    >
      <Link href={card.href} style={{ display: 'block', height: '100%', textDecoration: 'none' }}>
        <div style={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          padding: '2rem',
          borderRadius: '1.5rem',
          border: `1px solid ${hovered ? card.accentBorder : 'rgba(255,255,255,0.07)'}`,
          background: hovered
            ? `linear-gradient(145deg, ${card.accentDim} 0%, rgba(255,255,255,0.02) 60%, transparent 100%)`
            : 'rgba(255,255,255,0.025)',
          boxShadow: hovered
            ? `0 0 0 1px ${card.accentBorder}, 0 24px 80px ${card.accentGlow}, 0 8px 32px rgba(0,0,0,0.4)`
            : '0 2px 20px rgba(0,0,0,0.3)',
          transition: 'all 0.4s cubic-bezier(0.22, 1, 0.36, 1)',
          transform: hovered ? 'translateY(-6px)' : 'translateY(0)',
          cursor: 'pointer',
          overflow: 'hidden',
        }}>

          {/* Glow blob */}
          <div style={{
            position: 'absolute', top: '-40%', left: '-20%',
            width: '140%', height: '140%',
            background: `radial-gradient(ellipse at 30% 30%, ${card.accentGlow} 0%, transparent 60%)`,
            opacity: hovered ? 1 : 0,
            transition: 'opacity 0.5s ease',
            pointerEvents: 'none',
          }} />

          {/* Icon */}
          <div style={{
            width: '3.5rem', height: '3.5rem', borderRadius: '1rem',
            background: hovered ? card.accent : card.accentDim,
            border: `1px solid ${hovered ? 'transparent' : card.accentBorder}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: hovered ? (card.accent === '#F97316' ? '#000' : '#fff') : card.accent,
            marginBottom: '1.5rem',
            transition: 'all 0.35s ease',
            boxShadow: hovered ? `0 8px 24px ${card.accentGlow}` : 'none',
          }}>
            {card.icon}
          </div>

          {/* Title */}
          <h2 style={{
            fontSize: '1.5rem', fontWeight: 800, color: '#fff',
            marginBottom: '0.75rem', lineHeight: 1.2,
            letterSpacing: '-0.02em',
            fontFamily: 'var(--font-syne, sans-serif)',
          }}>
            {card.title}
          </h2>

          {/* Description */}
          <p style={{
            fontSize: '0.875rem', color: 'rgba(255,255,255,0.5)',
            lineHeight: 1.7, marginBottom: '1.5rem', flexGrow: 1,
          }}>
            {card.description}
          </p>

          {/* Feature list */}
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem',
            marginBottom: '1.75rem',
            opacity: hovered ? 1 : 0.6,
            transition: 'opacity 0.3s ease',
          }}>
            {card.features.map((f) => (
              <div key={f} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <div style={{
                  width: '4px', height: '4px', borderRadius: '50%',
                  background: card.accent, flexShrink: 0,
                }} />
                <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.45)', fontWeight: 500 }}>
                  {f}
                </span>
              </div>
            ))}
          </div>

          {/* CTA row */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            paddingTop: '1.25rem',
            borderTop: `1px solid ${hovered ? card.accentBorder : 'rgba(255,255,255,0.06)'}`,
            transition: 'border-color 0.3s ease',
          }}>
            <span style={{
              fontSize: '0.85rem', fontWeight: 700, color: card.accent,
              letterSpacing: hovered ? '0.06em' : '0',
              transition: 'letter-spacing 0.3s ease',
            }}>
              {card.cta} {'\u2192'}
            </span>
            <div style={{
              width: '2.25rem', height: '2.25rem', borderRadius: '50%',
              background: hovered ? card.accent : 'rgba(255,255,255,0.05)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: hovered ? (card.accent === '#F97316' ? '#000' : '#fff') : card.accent,
              transition: 'all 0.3s ease',
              boxShadow: hovered ? `0 4px 14px ${card.accentGlow}` : 'none',
            }}>
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </div>
          </div>

        </div>
      </Link>
    </motion.div>
  );
}

// ─── Auth-aware Nav ───────────────────────────────────────────────────────────

const ADMIN_EMAILS = ['schockweb@gmail.com', 'saddison2020@outlook.com'];

function UserNav() {
  const { data: session, status } = useSession();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  if (status === 'loading') {
    return <div style={{ width: '100px' }} />;
  }

  if (status === 'authenticated' && session?.user) {
    const user = session.user;
    const firstName = (user.name || 'User').split(' ')[0];
    const avatar = user.image ||
      `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'U')}&background=random&bold=true`;

    return (
      <div style={{ position: 'relative' }} ref={dropdownRef}>
        <button
          onClick={() => setDropdownOpen((v) => !v)}
          style={{
            display: 'flex', alignItems: 'center', gap: '0.6rem',
            padding: '0.4rem 0.75rem 0.4rem 0.4rem',
            borderRadius: '999px',
            border: '1px solid rgba(255,255,255,0.12)',
            background: 'rgba(255,255,255,0.05)',
            cursor: 'pointer', color: '#fff',
            transition: 'all 0.2s ease',
          }}
        >
          <img
            src={avatar}
            alt={firstName}
            style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }}
          />
          <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{firstName}</span>
          <svg width="10" height="10" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ opacity: 0.5 }}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        <AnimatePresence>
          {dropdownOpen && (
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 4, scale: 0.96 }}
              transition={{ duration: 0.15 }}
              style={{
                position: 'absolute', top: 'calc(100% + 8px)', right: 0,
                minWidth: '190px',
                background: '#0F1117',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '16px',
                overflow: 'hidden',
                boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
                zIndex: 100,
              }}
            >
              {/* Header */}
              <div style={{ padding: '12px 14px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#fff' }}>{user.name}</div>
                <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.35)', marginTop: '2px' }}>{user.email}</div>
              </div>
              {/* Items */}
              <div style={{ padding: '6px' }}>
                <Link
                  href="/account"
                  onClick={() => setDropdownOpen(false)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    padding: '8px 10px', borderRadius: '10px',
                    color: 'rgba(255,255,255,0.65)', fontSize: '0.8rem', fontWeight: 500,
                    textDecoration: 'none',
                  }}
                >
                  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Account
                </Link>
                {ADMIN_EMAILS.includes(user.email || '') && (
                  <Link
                    href="/admin"
                    onClick={() => setDropdownOpen(false)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '8px',
                      padding: '8px 10px', borderRadius: '10px',
                      color: '#c9a84c', fontSize: '0.8rem', fontWeight: 600,
                      textDecoration: 'none', background: 'rgba(201,168,76,0.06)',
                    }}
                  >
                    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                    </svg>
                    Admin Dashboard
                  </Link>
                )}
                <button
                  onClick={() => { signOut({ callbackUrl: '/' }); setDropdownOpen(false); }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '8px', width: '100%',
                    padding: '8px 10px', borderRadius: '10px',
                    color: 'rgba(239,68,68,0.8)', fontSize: '0.8rem', fontWeight: 500,
                    background: 'none', border: 'none', cursor: 'pointer',
                  }}
                >
                  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Sign Out
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Signed out state
  return (
    <Link
      href="/signup"
      style={{
        padding: '0.6rem 1.25rem',
        background: '#fff', color: '#000',
        borderRadius: '999px', fontSize: '0.75rem',
        fontWeight: 800, letterSpacing: '0.1em',
        textTransform: 'uppercase', textDecoration: 'none',
        boxShadow: '0 4px 20px rgba(255,255,255,0.15)',
      }}
    >
      Get Started
    </Link>
  );
}

// ─── Mobile Landing Page ─────────────────────────────────────────────────────

function MobileHomePage({ isSignedIn, dashHref, dashInfo }: {
  isSignedIn: boolean;
  dashHref: string;
  dashInfo: { hasBrief: boolean; token?: string } | null;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const touchStartX = useRef(0);
  const touchDeltaX = useRef(0);
  const autoTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const directionRef = useRef(1);

  // Auto-advance every 5s
  useEffect(() => {
    autoTimer.current = setInterval(() => {
      directionRef.current = 1;
      setActiveIndex((prev) => (prev + 1) % CARDS.length);
    }, 5000);
    return () => { if (autoTimer.current) clearInterval(autoTimer.current); };
  }, []);

  const resetAutoTimer = () => {
    if (autoTimer.current) clearInterval(autoTimer.current);
    autoTimer.current = setInterval(() => {
      directionRef.current = 1;
      setActiveIndex((prev) => (prev + 1) % CARDS.length);
    }, 5000);
  };

  const goTo = (index: number, dir: number) => {
    directionRef.current = dir;
    setActiveIndex(index);
    resetAutoTimer();
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchDeltaX.current = 0;
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    touchDeltaX.current = e.touches[0].clientX - touchStartX.current;
  };
  const handleTouchEnd = () => {
    const threshold = 50;
    if (touchDeltaX.current < -threshold) {
      goTo((activeIndex + 1) % CARDS.length, 1);
    } else if (touchDeltaX.current > threshold) {
      goTo((activeIndex - 1 + CARDS.length) % CARDS.length, -1);
    }
    touchDeltaX.current = 0;
  };

  const card = CARDS[activeIndex];

  return (
    <>
      <style>{`
        @media (min-width: 769px) { .mobile-only { display: none !important; } }
        @media (max-width: 768px)  { .desktop-only { display: none !important; } }
      `}</style>

      <div className="mobile-only" style={{
        minHeight: '100dvh', background: '#07070A', color: '#fff',
        overflowX: 'hidden', position: 'relative',
        display: 'flex', flexDirection: 'column',
      }}>

        {/* Subtle ambient — colour follows active card */}
        <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
          <div style={{
            position: 'absolute', top: '-10%', left: '-20%',
            width: '80vw', height: '80vw',
            background: `radial-gradient(circle, ${card.accentGlow} 0%, transparent 65%)`,
            borderRadius: '50%',
            transition: 'background 0.6s ease',
          }} />
        </div>

        {/* Header */}
        <header style={{
          position: 'sticky', top: 0, zIndex: 50,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0.875rem 1.5rem',
          background: 'rgba(7,7,10,0.88)', backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}>
          <Link href="/" style={{
            fontSize: '1.1rem', fontWeight: 800, letterSpacing: '-0.04em',
            color: '#fff', textDecoration: 'none',
            fontFamily: 'var(--font-syne, sans-serif)',
          }}>Number<span style={{ opacity: 0.3 }}>1</span></Link>
          <UserNav />
        </header>

        {/* Compact Hero */}
        <section style={{ position: 'relative', zIndex: 10, padding: '2.5rem 1.5rem 1.5rem' }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <h1 style={{
              fontSize: 'clamp(2rem, 9vw, 2.8rem)',
              fontWeight: 900, lineHeight: 1.08,
              letterSpacing: '-0.04em', marginBottom: '0.6rem',
              fontFamily: 'var(--font-syne, sans-serif)',
            }}>
              What can we<br />
              <span style={{
                background: 'linear-gradient(120deg, #F97316 10%, #FBBF24 55%, #F97316 90%)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>build for you?</span>
            </h1>
            <p style={{
              fontSize: '0.82rem', color: 'rgba(255,255,255,0.35)',
              lineHeight: 1.6, maxWidth: '260px',
            }}>
              Swipe to explore our services.
            </p>
          </motion.div>
        </section>

        {/* ── Card Carousel ── */}
        <section
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          style={{
            position: 'relative', zIndex: 10,
            flex: '1 1 auto',
            display: 'flex', flexDirection: 'column',
            padding: '0.75rem 1.25rem 0',
            minHeight: '0',
          }}
        >
          {/* Card container */}
          <div style={{
            overflow: 'hidden', borderRadius: '1.5rem',
          }}>
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={card.id}
                initial={{ opacity: 0, x: directionRef.current * 80 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: directionRef.current * -80 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                style={{
                  display: 'flex', flexDirection: 'column',
                  padding: '1.75rem 1.5rem',
                  borderRadius: '1.5rem',
                  border: `1px solid ${card.accentBorder}`,
                  background: `linear-gradient(165deg, ${card.accentDim} 0%, rgba(255,255,255,0.02) 40%, rgba(7,7,10,0.95) 100%)`,
                  boxShadow: `0 8px 60px ${card.accentGlow}, 0 0 0 1px rgba(255,255,255,0.04) inset`,
                  overflow: 'hidden',
                  position: 'relative',
                }}
              >
                {/* Glow */}
                <div style={{
                  position: 'absolute', top: '-30%', left: '-20%',
                  width: '140%', height: '80%',
                  background: `radial-gradient(ellipse at 30% 30%, ${card.accentGlow} 0%, transparent 60%)`,
                  opacity: 0.6, pointerEvents: 'none',
                }} />

                {/* Content */}
                <div style={{ position: 'relative', zIndex: 2, flex: 1, display: 'flex', flexDirection: 'column' }}>
                  {/* Icon */}
                  <div style={{
                    width: '3.5rem', height: '3.5rem', borderRadius: '1rem',
                    background: card.accent,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: card.accent === '#F97316' ? '#000' : '#fff',
                    marginBottom: '1.25rem',
                    boxShadow: `0 8px 30px ${card.accentGlow}`,
                  }}>
                    {card.icon}
                  </div>

                  {/* Title */}
                  <h2 style={{
                    fontSize: '1.5rem', fontWeight: 800, color: '#fff',
                    letterSpacing: '-0.02em', marginBottom: '0.6rem', lineHeight: 1.15,
                    fontFamily: 'var(--font-syne, sans-serif)',
                  }}>{card.title}</h2>

                  {/* Description */}
                  <p style={{
                    fontSize: '0.82rem', color: 'rgba(255,255,255,0.45)',
                    lineHeight: 1.7, marginBottom: '1.25rem',
                  }}>{card.description}</p>

                  {/* Features */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginBottom: '1.5rem' }}>
                    {card.features.map((f) => (
                      <span key={f} style={{
                        fontSize: '0.62rem', fontWeight: 600,
                        padding: '0.22rem 0.6rem', borderRadius: '999px',
                        background: 'rgba(255,255,255,0.06)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        color: 'rgba(255,255,255,0.4)',
                      }}>{f}</span>
                    ))}
                  </div>

                  {/* Spacer */}
                  <div style={{ flex: 1 }} />

                  {/* CTA */}
                  <Link href={card.href} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    gap: '0.5rem', padding: '0.85rem 1.5rem',
                    borderRadius: '999px', background: card.accent,
                    color: card.accent === '#F97316' ? '#000' : '#fff',
                    fontSize: '0.82rem', fontWeight: 800,
                    letterSpacing: '0.03em', textDecoration: 'none',
                    boxShadow: `0 6px 24px ${card.accentGlow}`,
                  }}>
                    {card.cta}
                    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </Link>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Dot indicators */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            gap: '0.5rem', padding: '1rem 0 0.5rem',
          }}>
            {CARDS.map((c, i) => (
              <button
                key={c.id}
                onClick={() => goTo(i, i > activeIndex ? 1 : -1)}
                style={{
                  width: activeIndex === i ? '1.5rem' : '0.45rem',
                  height: '0.45rem', borderRadius: '999px',
                  border: 'none', padding: 0, cursor: 'pointer',
                  background: activeIndex === i ? card.accent : 'rgba(255,255,255,0.15)',
                  transition: 'all 0.3s ease',
                  boxShadow: activeIndex === i ? `0 0 10px ${card.accentGlow}` : 'none',
                }}
              />
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer style={{
          padding: '0.75rem 1.5rem 1.5rem',
          textAlign: 'center', position: 'relative', zIndex: 10,
        }}>
          {isSignedIn ? (
            <Link href={dashHref} style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
              fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)',
              textDecoration: 'none', fontWeight: 600,
            }}>
              {dashInfo?.hasBrief ? 'Open Dashboard' : 'Complete Your Brief'}
              <svg width="10" height="10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          ) : (
            <span style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.1)', fontFamily: 'monospace' }}>
              © {new Date().getFullYear()} Number1 Studio
            </span>
          )}
        </footer>

      </div>
    </>
  );
}

// ─── Landing Page ─────────────────────────────────────────────────────────────

export default function LandingPage() {
  const { data: session, status: authStatus } = useSession();
  const isAdmin = ADMIN_EMAILS.includes(session?.user?.email || '');
  const isSignedIn = authStatus === 'authenticated';

  // Fetch the user's dashboard status once signed in
  const [dashInfo, setDashInfo] = useState<{ hasBrief: boolean; token?: string } | null>(null);
  useEffect(() => {
    if (!isSignedIn) { setDashInfo(null); return; }
    fetch('/api/my-dashboard')
      .then((r) => r.json())
      .then((d) => setDashInfo({ hasBrief: d.hasBrief, token: d.token }))
      .catch(() => setDashInfo(null));
  }, [isSignedIn]);

  // Derive dashboard href
  const dashHref = dashInfo?.hasBrief && dashInfo.token
    ? `/dashboard/${dashInfo.token}`
    : '/get-started';

  return (
    <>
      <MobileHomePage isSignedIn={isSignedIn} dashHref={dashHref} dashInfo={dashInfo} />
      <div className="desktop-only" style={{ minHeight: '100vh', background: '#07070A', color: '#fff', overflowX: 'hidden', position: 'relative' }}>

      {/* Ambient background */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
        <div style={{ position: 'absolute', top: '-15%', left: '-5%', width: '55rem', height: '55rem', background: 'radial-gradient(circle, rgba(249,115,22,0.07) 0%, transparent 65%)', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', top: '-10%', right: '-10%', width: '45rem', height: '45rem', background: 'radial-gradient(circle, rgba(129,140,248,0.06) 0%, transparent 60%)', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', bottom: '-20%', right: '20%', width: '40rem', height: '40rem', background: 'radial-gradient(circle, rgba(52,211,153,0.05) 0%, transparent 60%)', borderRadius: '50%' }} />
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }} />
      </div>

      {/* Nav */}
      <nav style={{
        position: 'relative', zIndex: 20,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '1.5rem 3rem',
      }}>
        <Link href="/" style={{
          fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.04em',
          color: '#fff', textDecoration: 'none',
          fontFamily: 'var(--font-syne, sans-serif)',
        }}>
          Number<span style={{ opacity: 0.35 }}>1</span>
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <UserNav />
        </div>
      </nav>

      {/* Hero */}
      <div style={{ position: 'relative', zIndex: 10, textAlign: 'center', padding: '2.5rem 1.5rem 2rem' }}>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <h1 style={{
            fontSize: 'clamp(2.8rem, 6vw, 5rem)',
            fontWeight: 800, color: '#fff',
            letterSpacing: '-0.03em', lineHeight: 1.05,
            marginBottom: '1.25rem',
            fontFamily: 'var(--font-syne, sans-serif)',
          }}>
            What can we
            <br />
            <span style={{
              background: 'linear-gradient(120deg, #F97316 10%, #FBBF24 50%, #F97316 90%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              build for you?
            </span>
          </h1>

          <p style={{
            fontSize: '1rem', color: 'rgba(255,255,255,0.45)',
            maxWidth: '500px', margin: '0 auto 2rem',
            lineHeight: 1.75, fontWeight: 400,
          }}>
            Choose your path. From stunning websites to intelligent AI agents —
            we craft digital solutions that move your business forward.
          </p>

          {/* Dynamic CTA */}
          {isSignedIn ? (
            <Link
              href={dashHref}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                padding: '0.75rem 1.75rem',
                background: dashInfo?.hasBrief ? '#fff' : 'rgba(255,255,255,0.08)',
                color: dashInfo?.hasBrief ? '#000' : 'rgba(255,255,255,0.8)',
                borderRadius: '999px', fontSize: '0.82rem',
                fontWeight: 700, textDecoration: 'none',
                border: dashInfo?.hasBrief ? 'none' : '1px solid rgba(255,255,255,0.15)',
                letterSpacing: '0.04em',
                transition: 'all 0.2s ease',
              }}
            >
              {dashInfo?.hasBrief ? 'Open Dashboard' : 'Complete Your Brief'}
              <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          ) : (
            <Link
              href="/signup"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                padding: '0.75rem 1.75rem',
                background: '#fff', color: '#000',
                borderRadius: '999px', fontSize: '0.82rem',
                fontWeight: 700, textDecoration: 'none',
                letterSpacing: '0.04em',
              }}
            >
              Get Started
            </Link>
          )}
        </motion.div>
      </div>

      {/* Cards Grid */}
      <div style={{
        position: 'relative', zIndex: 10,
        maxWidth: '1200px', margin: '0 auto',
        padding: '0 1.5rem 4rem',
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '1.5rem',
          alignItems: 'stretch',
        }}>
          {CARDS.map((card, index) => (
            <ServiceCard key={card.id} card={card} index={index} />
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer style={{
        position: 'relative', zIndex: 10,
        borderTop: '1px solid rgba(255,255,255,0.06)',
        padding: '2rem 3rem',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem',
      }}>
        <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.2)', fontWeight: 600, letterSpacing: '-0.02em', fontFamily: 'var(--font-syne, sans-serif)' }}>
          Number<span style={{ opacity: 0.4 }}>1</span>
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          {[{ label: 'Privacy', href: '#' }, { label: 'Terms', href: '#' }, { label: 'Contact', href: 'mailto:hello@number1.studio' }].map((l) => (
            <a key={l.label} href={l.href} style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.25)', textDecoration: 'none', fontWeight: 500, letterSpacing: '0.04em', transition: 'color 0.15s' }}>
              {l.label}
            </a>
          ))}
        </div>
        <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.15)', fontFamily: 'monospace' }}>
          © {new Date().getFullYear()} Number1 Studio
        </span>
      </footer>

    </div>
    </>
  );
}
