"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

export default function SignupPage() {
    const router = useRouter();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [company, setCompany] = useState('');
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [step, setStep] = useState<'form' | 'success'>('form');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (password !== confirm) {
            setError('Passwords do not match.');
            return;
        }
        if (password.length < 8) {
            setError('Password must be at least 8 characters.');
            return;
        }

        setLoading(true);

        // 1. Register account in database
        const registerRes = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password, company }),
        });
        const registerData = await registerRes.json();

        if (!registerRes.ok) {
            setError(registerData.error || 'Registration failed.');
            setLoading(false);
            return;
        }

        // 2. Immediately sign in with NextAuth
        const signInResult = await signIn('credentials', {
            email,
            password,
            redirect: false,
        });

        if (signInResult?.error) {
            setError('Account created but sign-in failed. Please log in manually.');
            setLoading(false);
            return;
        }

        // 3. Redirect to home (3-tile page) — full reload so session cookie is picked up
        setStep('success');
        setTimeout(() => { window.location.href = '/'; }, 1200);
    };

    return (
        <div style={{ minHeight: '100vh', background: '#07070A', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', position: 'relative', overflow: 'hidden' }}>

            {/* Ambient glow */}
            <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none' }}>
                <div style={{ position: 'absolute', top: '-20%', left: '-10%', width: '45rem', height: '45rem', background: 'radial-gradient(circle, rgba(249,115,22,0.06) 0%, transparent 60%)', borderRadius: '50%' }} />
                <div style={{ position: 'absolute', bottom: '-20%', right: '-10%', width: '40rem', height: '40rem', background: 'radial-gradient(circle, rgba(99,102,241,0.06) 0%, transparent 60%)', borderRadius: '50%' }} />
            </div>

            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                style={{ width: '100%', maxWidth: '480px', position: 'relative', zIndex: 10 }}>

                {/* Logo */}
                <Link href="/" style={{ display: 'block', textAlign: 'center', marginBottom: '2rem', textDecoration: 'none', color: '#fff', fontSize: '1.4rem', fontWeight: 800, letterSpacing: '-0.04em', fontFamily: 'var(--font-syne, sans-serif)' }}>
                    Number<span style={{ opacity: 0.35 }}>1</span>
                </Link>

                <AnimatePresence mode="wait">
                    {step === 'success' ? (
                        <motion.div key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                            style={{ textAlign: 'center', padding: '3rem 2rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '24px' }}>
                            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎉</div>
                            <h2 style={{ color: '#fff', fontFamily: 'var(--font-syne, sans-serif)', fontSize: '1.4rem', fontWeight: 700, marginBottom: '0.5rem' }}>Welcome to Number1</h2>
                            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem' }}>Your account is ready. Taking you home…</p>
                        </motion.div>
                    ) : (
                        <motion.div key="form">
                            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '24px', padding: '2.75rem' }}>
                                <h1 style={{ color: '#fff', fontFamily: 'var(--font-syne, sans-serif)', fontSize: '1.6rem', fontWeight: 700, marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>Create your account</h1>
                                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.875rem', marginBottom: '2rem' }}>Your data is stored securely in our database.</p>

                                {error && (
                                    <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                                        style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '12px', padding: '10px 14px', marginBottom: '1.25rem', color: 'rgba(239,68,68,0.9)', fontSize: '0.8rem' }}>
                                        {error}
                                    </motion.div>
                                )}

                                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                                    {[
                                        { label: 'Full Name', value: name, onChange: setName, type: 'text', placeholder: 'James Director', required: true },
                                        { label: 'Email Address', value: email, onChange: setEmail, type: 'email', placeholder: 'james@yourbusiness.com', required: true },
                                        { label: 'Company (optional)', value: company, onChange: setCompany, type: 'text', placeholder: 'Your Business Name', required: false },
                                        { label: 'Password', value: password, onChange: setPassword, type: 'password', placeholder: '8+ characters', required: true },
                                        { label: 'Confirm Password', value: confirm, onChange: setConfirm, type: 'password', placeholder: 'Repeat password', required: true },
                                    ].map((field) => (
                                        <div key={field.label}>
                                            <label style={{ display: 'block', color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.6rem' }}>
                                                {field.label}
                                            </label>
                                            <input
                                                type={field.type}
                                                value={field.value}
                                                onChange={(e) => field.onChange(e.target.value)}
                                                placeholder={field.placeholder}
                                                required={field.required}
                                                style={{
                                                    width: '100%', padding: '0.85rem 1.1rem', background: 'rgba(255,255,255,0.04)',
                                                    border: '1px solid rgba(255,255,255,0.09)', borderRadius: '12px',
                                                    color: '#fff', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box',
                                                    fontFamily: 'inherit',
                                                }}
                                            />
                                        </div>
                                    ))}

                                    <button type="submit" disabled={loading}
                                        style={{
                                            marginTop: '0.75rem', width: '100%', padding: '1rem',
                                            background: loading ? 'rgba(255,255,255,0.1)' : '#fff',
                                            color: loading ? 'rgba(255,255,255,0.5)' : '#000',
                                            borderRadius: '12px', border: 'none', fontWeight: 800,
                                            fontSize: '0.8rem', letterSpacing: '0.1em', textTransform: 'uppercase',
                                            cursor: loading ? 'not-allowed' : 'pointer',
                                            transition: 'all 0.2s ease',
                                        }}>
                                        {loading ? 'Creating Account…' : 'Create Account'}
                                    </button>
                                </form>
                            </div>

                            <p style={{ textAlign: 'center', marginTop: '1.75rem', color: 'rgba(255,255,255,0.3)', fontSize: '0.82rem' }}>
                                Already have an account?{' '}
                                <Link href="/login" style={{ color: 'rgba(255,255,255,0.7)', fontWeight: 600, textDecoration: 'none' }}>Sign In</Link>
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
}
