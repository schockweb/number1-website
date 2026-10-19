"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { useSession, signOut } from 'next-auth/react';

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
            border: '1px solid rgba(15,23,42,0.15)',
            background: '#F8FAFC',
            cursor: 'pointer', color: '#0F172A',
            fontFamily: 'monospace',
          }}
        >
          <img
            src={avatar}
            alt={firstName}
            style={{ width: '24px', height: '24px', borderRadius: '0', objectFit: 'cover' }}
          />
          <span style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.05em' }}>{firstName.toUpperCase()}</span>
          <svg width="10" height="10" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ opacity: 0.6 }}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        <AnimatePresence>
          {dropdownOpen && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              transition={{ duration: 0.1 }}
              style={{
                position: 'absolute', top: 'calc(100% + 8px)', right: 0,
                minWidth: '200px',
                background: '#FFFFFF',
                border: '1px solid #E2E8F0',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                overflow: 'hidden',
                zIndex: 100,
                fontFamily: 'monospace',
              }}
            >
              <div style={{ padding: '10px 12px', borderBottom: '1px solid #E2E8F0' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0F172A' }}>{user.name}</div>
                <div style={{ fontSize: '0.65rem', color: '#64748B', marginTop: '2px' }}>{user.email}</div>
              </div>
              <div style={{ padding: '4px' }}>
                <Link
                  href="/account"
                  onClick={() => setDropdownOpen(false)}
                  style={{
                    display: 'block', padding: '8px 10px',
                    color: '#475569', fontSize: '0.75rem',
                    textDecoration: 'none', letterSpacing: '0.05em',
                  }}
                >
                  // ACCOUNT
                </Link>
                {ADMIN_EMAILS.includes(user.email || '') && (
                  <Link
                    href="/admin"
                    onClick={() => setDropdownOpen(false)}
                    style={{
                      display: 'block', padding: '8px 10px',
                      color: '#EA580C', fontSize: '0.75rem', fontWeight: 700,
                      textDecoration: 'none', letterSpacing: '0.05em',
                    }}
                  >
                    // ADMIN DASHBOARD
                  </Link>
                )}
                <button
                  onClick={() => { signOut({ callbackUrl: '/' }); setDropdownOpen(false); }}
                  style={{
                    display: 'block', width: '100%', textAlign: 'left',
                    padding: '8px 10px', color: '#DC2626',
                    fontSize: '0.75rem', background: 'none', border: 'none',
                    cursor: 'pointer', fontFamily: 'monospace', letterSpacing: '0.05em',
                  }}
                >
                  // SIGN OUT
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <Link
      href="/signup"
      style={{
        padding: '0.5rem 1rem',
        background: '#0F172A', color: '#FFFFFF',
        fontSize: '0.75rem', fontWeight: 800,
        letterSpacing: '0.08em', textTransform: 'uppercase',
        textDecoration: 'none', fontFamily: 'monospace',
      }}
    >
      [ GET STARTED ]
    </Link>
  );
}

export default function LandingPage() {
  const { data: session, status: authStatus } = useSession();
  const isSignedIn = authStatus === 'authenticated';
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [contactFormSubmitted, setContactFormSubmitted] = useState(false);
  const [contactFormSending, setContactFormSending] = useState(false);
  const [contactFormError, setContactFormError] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactMessage, setContactMessage] = useState('');

  const { scrollY } = useScroll();
  const headerLogoOpacity = useTransform(scrollY, [30, 160], [0, 1]);
  const headerLogoY = useTransform(scrollY, [30, 160], [-8, 0]);
  const headerLogoPointerEvents = useTransform(scrollY, [0, 30], ['none', 'auto']);

  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (window.location.hash) {
      window.history.pushState(null, '', '/');
    }
  };

  const [dashInfo, setDashInfo] = useState<{ hasBrief: boolean; token?: string } | null>(null);
  useEffect(() => {
    if (!isSignedIn) { setDashInfo(null); return; }
    fetch('/api/my-dashboard')
      .then((r) => r.json())
      .then((d) => setDashInfo({ hasBrief: d.hasBrief, token: d.token }))
      .catch(() => setDashInfo(null));
  }, [isSignedIn]);

  const dashHref = dashInfo?.hasBrief && dashInfo.token
    ? `/dashboard/${dashInfo.token}`
    : '/get-started';

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#FFFFFF', color: '#000000', fontFamily: 'var(--font-syne, sans-serif)', overflowX: 'hidden' }}>
      
      <style>{`
        @media (max-width: 768px) {
          .header-nav { padding: 0.85rem 1rem !important; }
          .header-logo { font-size: 1rem !important; }
          .hero-container { padding: 5.5rem 1rem 3rem !important; min-height: 100dvh !important; }
          .section-container { padding: 3.5rem 1rem !important; }
          .brutalist-grid { grid-template-columns: 1fr !important; gap: 1rem !important; }
          .btn-group { flex-direction: column !important; width: 100% !important; }
          .btn-group button, .btn-group a { width: 100% !important; text-align: center !important; }
          .footer-container { padding: 2rem 1rem !important; flex-direction: column !important; text-align: center !important; gap: 1rem !important; }
        }
      `}</style>

      {/* Header Navigation */}
      <header className="header-nav" style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '1.25rem 2rem',
        background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(12px)',
        borderBottom: '1px solid #E2E8F0',
      }}>
        <motion.div style={{ opacity: headerLogoOpacity, y: headerLogoY, pointerEvents: headerLogoPointerEvents }}>
          <Link
            href="/"
            onClick={handleLogoClick}
            className="header-logo"
            style={{
              fontSize: '1.2rem', fontWeight: 800, letterSpacing: '-0.03em',
              color: '#000000', textDecoration: 'none', display: 'inline-block',
              cursor: 'pointer',
            }}
          >
            Number<span style={{ opacity: 0.35 }}>1</span>.Studio
          </Link>
        </motion.div>
        <UserNav />
      </header>

      {/* ── GRAND HERO SCREEN ── */}
      <section className="hero-container" style={{
        minHeight: '100vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '8rem 1.5rem 5rem', textAlign: 'center',
        position: 'relative', zIndex: 10,
        background: 'radial-gradient(circle at 50% 25%, rgba(249, 115, 22, 0.04) 0%, rgba(255, 255, 255, 1) 65%)',
        borderBottom: '1px solid #E2E8F0',
      }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          style={{ maxWidth: '1000px', width: '100%' }}
        >
          {/* Main Title */}
          <h1 style={{
            fontSize: 'clamp(3rem, 8vw, 5.8rem)',
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
            maxWidth: '850px', margin: '0 auto 2.5rem',
            lineHeight: 1.4, letterSpacing: '-0.01em',
          }}>
            AI Solutions for your business, whether you are a startup or already in the game.
          </p>

          {/* Hidden for now: Brutalist Action Buttons */}
          {/* <div className="btn-group" style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexWrap: 'wrap', gap: '1.25rem', marginBottom: '1rem',
          }}>
            <button
              onClick={() => scrollToSection('ai-employee')}
              style={{
                padding: '1rem 2.25rem', background: '#000000', color: '#FFFFFF',
                border: '1px solid #000000', fontSize: '0.85rem', fontWeight: 800,
                letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer',
                fontFamily: 'monospace', borderRadius: '4px',
                boxShadow: '0 10px 25px -5px rgba(0,0,0,0.25)',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              }}
            >
              [ AI EMPLOYEE ]
            </button>
          </div> */}
        </motion.div>

        {/* Scroll Indicator */}
        <div style={{
          position: 'absolute', bottom: '1.5rem', left: 0, right: 0,
          display: 'flex', justifyContent: 'center', alignItems: 'center',
        }}>
          <span style={{ fontSize: '0.7rem', color: '#000000', fontFamily: 'monospace', letterSpacing: '0.1em', fontWeight: 700 }}>
            SCROLL // 01
          </span>
        </div>
      </section>

      {/* ── SECTION 01: THE AI EMPLOYEE (FULL PAGE CANVAS) ── */}
      <section id="ai-employee" className="section-container" style={{
        minHeight: '100vh', padding: '5rem 2rem 4rem', maxWidth: '1400px', margin: '0 auto',
        borderBottom: '1px solid #E2E8F0',
        position: 'relative', zIndex: 10,
        display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start',
      }}>
        {/* Top Left Title */}
        <div style={{ textAlign: 'left', width: '100%' }}>
          <h2 style={{
            fontSize: 'clamp(2.2rem, 4.5vw, 3.5rem)', fontWeight: 800,
            letterSpacing: '-0.03em', color: '#000000', margin: 0,
          }}>
            Number1 AI Employee
          </h2>
        </div>
      </section>

      {/* Hidden for now: SECTION 02: BRAND & WEBSITE MODERNIZATION */}
      {/* <section id="brand-modernization" className="section-container" style={{
        padding: '6rem 2rem', maxWidth: '1200px', margin: '0 auto',
        borderBottom: '1px solid #E2E8F0',
        position: 'relative', zIndex: 10,
      }}>
        <div style={{ marginBottom: '3.5rem' }}>
          <span style={{ fontSize: '0.75rem', color: '#4F46E5', fontFamily: 'monospace', fontWeight 800, letterSpacing: '0.1em' }}>
            // SECONDARY SERVICES
          </span>
          <h2 style={{
            fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 800,
            letterSpacing: '-0.03em', marginTop: '0.5rem', marginBottom: '1rem', color: '#000000',
          }}>
            SECTION 02 // LEGACY RE-ENGINEERING & BRAND SUITE
          </h2>
          <p style={{
            fontSize: '1rem', color: '#000000',
            maxWidth: '700px', lineHeight: 1.6, fontWeight: 500,
          }}>
            Complete digital presence transformations. We re-design 2010-era websites into modern high-speed platforms and construct unified corporate brand identities.
          </p>
        </div>

        <div className="brutalist-grid" style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1.5rem', marginBottom: '3rem',
        }}>
          <div style={{
            border: '1px solid #E2E8F0',
            background: '#FFFFFF',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
            padding: '2rem', display: 'flex', flexDirection: 'column',
          }}>
            <span style={{ fontSize: '0.75rem', color: '#4F46E5', fontFamily: 'monospace', fontWeight: 800, marginBottom: '1rem' }}>
              01 / 2010 WEBSITE RE-DESIGNS
            </span>
            <h3 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '0.75rem', letterSpacing: '-0.02em', color: '#000000' }}>
              Legacy Site Makeovers & Custom Builds
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#000000', lineHeight: 1.7, flexGrow: 1, fontFamily: 'monospace', fontWeight: 500 }}>
              Transforming outdated websites into ultra-fast, high-converting digital platforms built from strategy to deployment.
            </p>
          </div>

          <div style={{
            border: '1px solid #E2E8F0',
            background: '#FFFFFF',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
            padding: '2rem', display: 'flex', flexDirection: 'column',
          }}>
            <span style={{ fontSize: '0.75rem', color: '#4F46E5', fontFamily: 'monospace', fontWeight: 800, marginBottom: '1rem' }}>
              02 / FULL BRAND IDENTITY
            </span>
            <h3 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '0.75rem', letterSpacing: '-0.02em', color: '#000000' }}>
              Complete Digital Identity Collateral
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#000000', lineHeight: 1.7, flexGrow: 1, fontFamily: 'monospace', fontWeight: 500 }}>
              Unified corporate design assets including virtual business cards, email signatures, letterheads, and modern logo architecture.
            </p>
          </div>

          <div style={{
            border: '1px solid #E2E8F0',
            background: '#FFFFFF',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
            padding: '2rem', display: 'flex', flexDirection: 'column',
          }}>
            <span style={{ fontSize: '0.75rem', color: '#4F46E5', fontFamily: 'monospace', fontWeight: 800, marginBottom: '1rem' }}>
              03 / SYSTEM INTEGRATION
            </span>
            <h3 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '0.75rem', letterSpacing: '-0.02em', color: '#000000' }}>
              Ecosystem Connectivity
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#000000', lineHeight: 1.7, flexGrow: 1, fontFamily: 'monospace', fontWeight: 500 }}>
              Seamlessly integrating your new digital brand identity directly with your AI Employee operational workflow.
            </p>
          </div>
        </div>

        <div className="btn-group" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <Link href="/makeover" style={{
            padding: '0.85rem 1.75rem', background: '#4F46E5', color: '#FFFFFF',
            border: '1px solid #4F46E5', fontSize: '0.8rem', fontWeight: 800,
            letterSpacing: '0.08em', textTransform: 'uppercase',
            textDecoration: 'none', fontFamily: 'monospace',
            boxShadow: '0 4px 6px -1px rgba(79, 70, 229, 0.2)',
          }}>
            [ START SITE MAKEOVER ]
          </Link>
          <Link href="/discovery" style={{
            padding: '0.85rem 1.75rem', background: '#FFFFFF', color: '#000000',
            border: '1px solid #000000', fontSize: '0.8rem', fontWeight: 800,
            letterSpacing: '0.08em', textTransform: 'uppercase',
            textDecoration: 'none', fontFamily: 'monospace',
          }}>
            [ START DISCOVERY ]
          </Link>
        </div>
      </section> */}

      {/* ── FOOTER ── */}
      <footer className="footer-container" style={{
        padding: '3rem 2rem', maxWidth: '1200px', margin: '0 auto',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        flexWrap: 'wrap', gap: '1.5rem', fontFamily: 'monospace',
      }}>
        <span style={{ fontSize: '0.8rem', color: '#000000', fontWeight: 800 }}>
          Number<span style={{ opacity: 0.35 }}>1</span>.Studio
        </span>
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          <Link href="/book-a-call" style={{ fontSize: '0.75rem', color: '#000000', textDecoration: 'none', fontWeight: 700 }}>
            [ BOOK A CALL ]
          </Link>
          <button
            onClick={() => {
              setContactFormSubmitted(false);
              setContactFormError('');
              setContactName('');
              setContactEmail('');
              setContactMessage('');
              setContactModalOpen(true);
            }}
            style={{
              background: 'none', border: 'none', cursor: 'pointer', padding: 0,
              fontSize: '0.75rem', color: '#000000', fontWeight: 700,
              fontFamily: 'monospace', transition: 'color 0.2s ease',
            }}
          >
            [ CONTACT ]
          </button>
        </div>
        <span style={{ fontSize: '0.75rem', color: '#000000', fontWeight: 600 }}>
          © {new Date().getFullYear()} NUMBER1.STUDIO
        </span>
      </footer>

      {/* ── CONTACT POPUP MODAL ── */}
      <AnimatePresence>
        {contactModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed', inset: 0, zIndex: 200,
              background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: '1.5rem',
            }}
            onClick={() => setContactModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                width: '100%', maxWidth: '520px',
                background: '#FFFFFF', border: '1px solid #E2E8F0',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                padding: '2rem', fontFamily: 'monospace', position: 'relative',
              }}
            >
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid #E2E8F0', paddingBottom: '1rem' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#EA580C', letterSpacing: '0.05em' }}>
                  // CONTACT NUMBER1.STUDIO
                </span>
                <button
                  onClick={() => setContactModalOpen(false)}
                  style={{
                    background: 'none', border: 'none', color: '#64748B',
                    cursor: 'pointer', fontSize: '0.85rem', fontWeight: 800, fontFamily: 'monospace',
                  }}
                >
                  [ CLOSE X ]
                </button>
              </div>

              {/* Direct email bar */}
              <div style={{
                background: '#F8FAFC', border: '1px solid #E2E8F0',
                padding: '0.85rem 1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center',
                justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem',
              }}>
                <div>
                  <div style={{ fontSize: '0.65rem', color: '#64748B', marginBottom: '0.2rem' }}>DIRECT EMAIL</div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0F172A' }}>hello@number1.studio</div>
                </div>
                <button
                  onClick={() => {
                    if (navigator.clipboard) {
                      navigator.clipboard.writeText('hello@number1.studio');
                    }
                    setCopiedEmail(true);
                    setTimeout(() => setCopiedEmail(false), 2500);
                  }}
                  style={{
                    background: copiedEmail ? '#059669' : '#0F172A', color: '#FFFFFF',
                    border: 'none', padding: '0.4rem 0.8rem', fontSize: '0.7rem',
                    fontWeight: 800, cursor: 'pointer', fontFamily: 'monospace',
                  }}
                >
                  {copiedEmail ? '[ COPIED ]' : '[ COPY EMAIL ]'}
                </button>
              </div>

              {/* Form / Submitted state */}
              {contactFormSubmitted ? (
                <div style={{ padding: '2rem 1rem', textAlign: 'center', border: '1px solid #059669', background: '#ECFDF5' }}>
                  <div style={{ fontSize: '0.9rem', color: '#059669', fontWeight: 800, marginBottom: '0.5rem' }}>
                    [ MESSAGE SENT ]
                  </div>
                  <p style={{ fontSize: '0.75rem', color: '#047857' }}>
                    Thank you. Our team will get back to you shortly.
                  </p>
                </div>
              ) : (
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    setContactFormSending(true);
                    setContactFormError('');
                    try {
                      const res = await fetch('/api/contact', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          name: contactName,
                          email: contactEmail,
                          message: contactMessage,
                        }),
                      });
                      if (res.ok) {
                        setContactFormSubmitted(true);
                        setContactName('');
                        setContactEmail('');
                        setContactMessage('');
                      } else {
                        const data = await res.json();
                        setContactFormError(data.error || 'Failed to send message.');
                      }
                    } catch {
                      setContactFormError('Network error. Please try again.');
                    } finally {
                      setContactFormSending(false);
                    }
                  }}
                  style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
                >
                  {contactFormError && (
                    <div style={{ padding: '0.65rem', background: '#FEF2F2', border: '1px solid #EF4444', color: '#DC2626', fontSize: '0.75rem' }}>
                      {contactFormError}
                    </div>
                  )}

                  <div>
                    <label style={{ display: 'block', fontSize: '0.7rem', color: '#64748B', marginBottom: '0.4rem' }}>
                      NAME
                    </label>
                    <input
                      required
                      type="text"
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      placeholder="Your Name"
                      style={{
                        width: '100%', background: '#F8FAFC',
                        border: '1px solid #CBD5E1', color: '#0F172A',
                        padding: '0.65rem 0.8rem', fontSize: '0.8rem', fontFamily: 'monospace',
                        outline: 'none',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.7rem', color: '#64748B', marginBottom: '0.4rem' }}>
                      EMAIL ADDRESS
                    </label>
                    <input
                      required
                      type="email"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      placeholder="name@company.com"
                      style={{
                        width: '100%', background: '#F8FAFC',
                        border: '1px solid #CBD5E1', color: '#0F172A',
                        padding: '0.65rem 0.8rem', fontSize: '0.8rem', fontFamily: 'monospace',
                        outline: 'none',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.7rem', color: '#64748B', marginBottom: '0.4rem' }}>
                      MESSAGE
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={contactMessage}
                      onChange={(e) => setContactMessage(e.target.value)}
                      placeholder="Tell us about your project or business needs..."
                      style={{
                        width: '100%', background: '#F8FAFC',
                        border: '1px solid #CBD5E1', color: '#0F172A',
                        padding: '0.65rem 0.8rem', fontSize: '0.8rem', fontFamily: 'monospace',
                        outline: 'none', resize: 'vertical',
                      }}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={contactFormSending}
                    style={{
                      width: '100%', padding: '0.8rem', background: contactFormSending ? '#94A3B8' : '#EA580C',
                      color: '#FFFFFF', border: 'none', fontSize: '0.8rem',
                      fontWeight: 800, cursor: contactFormSending ? 'not-allowed' : 'pointer', fontFamily: 'monospace',
                      letterSpacing: '0.05em', marginTop: '0.5rem',
                      boxShadow: '0 4px 6px -1px rgba(234, 88, 12, 0.2)',
                    }}
                  >
                    {contactFormSending ? '[ SENDING... ]' : '[ SEND ]'}
                  </button>
                </form>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
