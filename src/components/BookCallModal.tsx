"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface BookCallModalProps {
  isOpen: boolean;
  onClose: () => void;
  source?: string; // Which page triggered it (for lead tracking)
}

export default function BookCallModal({ isOpen, onClose, source = 'website' }: BookCallModalProps) {
  const [form, setForm] = useState({ name: '', email: '', company: '', topic: '', date: '', time: '10:00' });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.email.trim() || !form.date) {
      setError('Please fill in your name, email, and preferred date.');
      return;
    }
    setError('');
    setSending(true);

    try {
      const res = await fetch('/api/book-call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          company: form.company,
          topic: form.topic || `Enquiry from ${source} page`,
          date: `${form.date}T${form.time}:00`,
        }),
      });

      if (res.ok) {
        setSent(true);
      } else {
        setError('Something went wrong. Please try again.');
      }
    } catch {
      setError('Connection error. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const handleClose = () => {
    onClose();
    // Reset after animation
    setTimeout(() => {
      setForm({ name: '', email: '', company: '', topic: '', date: '', time: '10:00' });
      setSent(false);
      setError('');
    }, 300);
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: 12,
    padding: '12px 16px',
    color: '#fff',
    fontSize: 14,
    outline: 'none',
    fontFamily: 'inherit',
    transition: 'border-color 0.2s',
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            style={{
              position: 'fixed', inset: 0,
              background: 'rgba(0,0,0,0.7)',
              backdropFilter: 'blur(12px)',
              zIndex: 1000,
            }}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.97 }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            style={{
              position: 'fixed',
              top: '50%', left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '90%', maxWidth: 440,
              background: '#0C0D15',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 24,
              overflow: 'hidden',
              zIndex: 1001,
              boxShadow: '0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.05) inset',
            }}
          >
            {/* Header gradient */}
            <div style={{
              padding: '28px 28px 20px',
              background: 'linear-gradient(135deg, rgba(249,115,22,0.08) 0%, rgba(129,140,248,0.06) 100%)',
              borderBottom: '1px solid rgba(255,255,255,0.06)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <div>
                  <h2 style={{ fontSize: 20, fontWeight: 800, color: '#fff', marginBottom: 6, letterSpacing: '-0.02em' }}>
                    Speak to Sales
                  </h2>
                  <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', lineHeight: 1.5 }}>
                    Book a free 30-minute consultation with our team.
                  </p>
                </div>
                <button onClick={handleClose} style={{
                  width: 32, height: 32, borderRadius: '50%',
                  background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                  color: 'rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 16, cursor: 'pointer', flexShrink: 0,
                }}>×</button>
              </div>
            </div>

            <div style={{ padding: '24px 28px 28px' }}>
              {sent ? (
                /* Success state */
                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                  <div style={{ fontSize: 40, marginBottom: 16 }}>✓</div>
                  <h3 style={{ fontSize: 18, fontWeight: 700, color: '#fff', marginBottom: 8 }}>
                    Call Booked!
                  </h3>
                  <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', lineHeight: 1.6, marginBottom: 20 }}>
                    We&apos;ll send a confirmation to <strong style={{ color: 'rgba(255,255,255,0.6)' }}>{form.email}</strong>. Looking forward to chatting!
                  </p>
                  <button onClick={handleClose} style={{
                    padding: '12px 32px', borderRadius: 12,
                    background: '#10B981', border: 'none', color: '#fff',
                    fontSize: 14, fontWeight: 700, cursor: 'pointer',
                  }}>Done</button>
                </div>
              ) : (
                /* Form */
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <input
                      placeholder="Your name *"
                      value={form.name}
                      onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                      style={{ ...inputStyle, flex: 1 }}
                    />
                    <input
                      placeholder="Company"
                      value={form.company}
                      onChange={e => setForm(p => ({ ...p, company: e.target.value }))}
                      style={{ ...inputStyle, flex: 1 }}
                    />
                  </div>
                  <input
                    type="email"
                    placeholder="Email address *"
                    value={form.email}
                    onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                    style={inputStyle}
                  />
                  <div style={{ display: 'flex', gap: 10 }}>
                    <input
                      type="date"
                      value={form.date}
                      onChange={e => setForm(p => ({ ...p, date: e.target.value }))}
                      style={{ ...inputStyle, flex: 2 }}
                    />
                    <input
                      type="time"
                      value={form.time}
                      onChange={e => setForm(p => ({ ...p, time: e.target.value }))}
                      style={{ ...inputStyle, flex: 1 }}
                    />
                  </div>
                  <input
                    placeholder="What would you like to discuss?"
                    value={form.topic}
                    onChange={e => setForm(p => ({ ...p, topic: e.target.value }))}
                    style={inputStyle}
                  />

                  {error && (
                    <div style={{ fontSize: 12, color: '#EF4444', padding: '6px 0' }}>{error}</div>
                  )}

                  <button
                    onClick={handleSubmit}
                    disabled={sending}
                    style={{
                      width: '100%', padding: 14, borderRadius: 14,
                      background: 'linear-gradient(135deg, #F97316, #FBBF24)',
                      border: 'none', color: '#000',
                      fontSize: 14, fontWeight: 800, letterSpacing: '0.02em',
                      cursor: sending ? 'default' : 'pointer',
                      opacity: sending ? 0.6 : 1,
                      transition: 'all 0.2s',
                      marginTop: 4,
                    }}
                  >
                    {sending ? 'Booking…' : 'Book My Free Call →'}
                  </button>

                  <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)', textAlign: 'center', marginTop: 2 }}>
                    Free · No obligation · 30 min with a real consultant
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
