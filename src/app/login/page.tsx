"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const result = await signIn('credentials', {
            email,
            password,
            redirect: false,
        });

        if (result?.error) {
            setError('Incorrect email or password. Please try again.');
            setLoading(false);
            return;
        }

        // Full reload so the session cookie is picked up by the nav
        window.location.href = '/';
    };

    return (
        <div style={{ minHeight: '100vh', background: '#07070A', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', position: 'relative', overflow: 'hidden' }}>

            {/* Ambient glow */}
            <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none' }}>
                <div style={{ position: 'absolute', top: '-20%', right: '-10%', width: '45rem', height: '45rem', background: 'radial-gradient(circle, rgba(99,102,241,0.06) 0%, transparent 60%)', borderRadius: '50%' }} />
                <div style={{ position: 'absolute', bottom: '-20%', left: '-10%', width: '40rem', height: '40rem', background: 'radial-gradient(circle, rgba(249,115,22,0.05) 0%, transparent 60%)', borderRadius: '50%' }} />
            </div>

            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                style={{ width: '100%', maxWidth: '460px', position: 'relative', zIndex: 10 }}>

                {/* Logo */}
                <Link href="/" style={{ display: 'block', textAlign: 'center', marginBottom: '2rem', textDecoration: 'none', color: '#fff', fontSize: '1.4rem', fontWeight: 800, letterSpacing: '-0.04em', fontFamily: 'var(--font-syne, sans-serif)' }}>
                    Number<span style={{ opacity: 0.35 }}>1</span>
                </Link>

                <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '24px', padding: '2.75rem' }}>
                    <h1 style={{ color: '#fff', fontFamily: 'var(--font-syne, sans-serif)', fontSize: '1.6rem', fontWeight: 700, marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>Welcome back</h1>
                    <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.875rem', marginBottom: '2rem' }}>Sign in to your Number1 account.</p>

                    <AnimatePresence>
                        {error && (
                            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                                style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '12px', padding: '10px 14px', marginBottom: '1.25rem', color: 'rgba(239,68,68,0.9)', fontSize: '0.8rem' }}>
                                {error}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        {[
                            { label: 'Email Address', value: email, onChange: setEmail, type: 'email', placeholder: 'james@yourbusiness.com' },
                            { label: 'Password', value: password, onChange: setPassword, type: 'password', placeholder: '••••••••' },
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
                                    required
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
                            {loading ? 'Signing In…' : 'Sign In'}
                        </button>
                    </form>
                </div>

                <p style={{ textAlign: 'center', marginTop: '1.75rem', color: 'rgba(255,255,255,0.3)', fontSize: '0.82rem' }}>
                    Don&apos;t have an account?{' '}
                    <Link href="/signup" style={{ color: 'rgba(255,255,255,0.7)', fontWeight: 600, textDecoration: 'none' }}>Create one free</Link>
                </p>
            </motion.div>
        </div>
    );
}
