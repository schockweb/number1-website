"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

interface Profile {
    id: string;
    name: string;
    email: string;
    company: string | null;
    plan: string;
    createdAt: string;
}

const PLAN_CFG: Record<string, { label: string; color: string; bg: string; border: string }> = {
    'Free Tier':  { label: 'Free Tier',  color: '#94A3B8', bg: 'rgba(148,163,184,0.1)', border: 'rgba(148,163,184,0.25)' },
    'Standard':   { label: 'Standard',   color: '#818CF8', bg: 'rgba(129,140,248,0.1)', border: 'rgba(129,140,248,0.25)' },
    'Premium':    { label: 'Premium',    color: '#A855F7', bg: 'rgba(168,85,247,0.1)',  border: 'rgba(168,85,247,0.25)'  },
    'Business':   { label: 'Business',   color: '#F59E0B', bg: 'rgba(245,158,11,0.1)',  border: 'rgba(245,158,11,0.25)'  },
};

const labelStyle: React.CSSProperties = {
    display: 'block',
    color: 'rgba(255,255,255,0.45)',
    fontSize: '0.72rem',
    fontWeight: 700,
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    marginBottom: '0.4rem',
};

const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '0.7rem 1rem',
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.09)',
    borderRadius: '12px',
    color: '#fff',
    fontSize: '0.9rem',
    outline: 'none',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
};

const primaryBtnStyle: React.CSSProperties = {
    padding: '0.8rem',
    background: '#fff', color: '#000',
    borderRadius: '12px', border: 'none',
    fontWeight: 800, fontSize: '0.8rem',
    letterSpacing: '0.08em', textTransform: 'uppercase',
    cursor: 'pointer', marginTop: '0.25rem',
};

export default function AccountPage() {
    const { data: session, status, update: updateSession } = useSession();
    const router = useRouter();

    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);
    const [name, setName] = useState('');
    const [company, setCompany] = useState('');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [profileSaving, setProfileSaving] = useState(false);
    const [profileMsg, setProfileMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [passwordSaving, setPasswordSaving] = useState(false);
    const [passwordMsg, setPasswordMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    useEffect(() => {
        if (status === 'unauthenticated') router.push('/signup');
    }, [status, router]);

    useEffect(() => {
        if (status !== 'authenticated') return;
        fetch('/api/account')
            .then((r) => r.json())
            .then((d) => {
                if (d.user) {
                    setProfile(d.user);
                    setName(d.user.name || '');
                    setCompany(d.user.company || '');
                }
            })
            .finally(() => setLoading(false));
    }, [status]);

    const saveProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setProfileSaving(true);
        setProfileMsg(null);
        const res = await fetch('/api/account', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, company }),
        });
        const data = await res.json();
        if (!res.ok) {
            setProfileMsg({ type: 'error', text: data.error || 'Failed to save.' });
        } else {
            setProfile(data.user);
            setProfileMsg({ type: 'success', text: 'Profile updated successfully.' });
            await updateSession({ name: data.user.name });
        }
        setProfileSaving(false);
    };

    const savePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setPasswordSaving(true);
        setPasswordMsg(null);
        if (newPassword !== confirmPassword) {
            setPasswordMsg({ type: 'error', text: 'New passwords do not match.' });
            setPasswordSaving(false);
            return;
        }
        const res = await fetch('/api/account', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ currentPassword, newPassword }),
        });
        const data = await res.json();
        if (!res.ok) {
            setPasswordMsg({ type: 'error', text: data.error || 'Failed to update password.' });
        } else {
            setPasswordMsg({ type: 'success', text: 'Password updated successfully.' });
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        }
        setPasswordSaving(false);
    };

    if (status === 'loading' || loading) {
        return (
            <div style={{ minHeight: '100vh', background: '#07070A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: '2px solid rgba(168,85,247,0.2)', borderTopColor: '#A855F7', animation: 'spin 0.8s linear infinite' }} />
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    const plan = profile?.plan || 'Free Tier';
    const planCfg = PLAN_CFG[plan] || PLAN_CFG['Free Tier'];
    const avatar = session?.user?.image ||
        `https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.name || 'U')}&background=random&bold=true&size=128`;
    const memberSince = profile?.createdAt
        ? new Date(profile.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
        : '';

    const cardStyle: React.CSSProperties = {
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '20px',
        padding: '1.75rem',
        marginBottom: '1.5rem',
    };

    const sectionTitle: React.CSSProperties = {
        fontSize: '1rem', fontWeight: 700, marginBottom: '0.3rem',
        fontFamily: 'var(--font-syne, sans-serif)',
    };

    const sectionDesc: React.CSSProperties = {
        color: 'rgba(255,255,255,0.35)', fontSize: '0.8rem', marginBottom: '1.5rem',
    };

    const MsgBox = ({ msg }: { msg: { type: 'success' | 'error'; text: string } | null }) => (
        <AnimatePresence>
            {msg && (
                <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    style={{
                        padding: '10px 14px', borderRadius: '10px', marginBottom: '1rem', fontSize: '0.8rem',
                        background: msg.type === 'success' ? 'rgba(52,211,153,0.1)' : 'rgba(239,68,68,0.1)',
                        border: `1px solid ${msg.type === 'success' ? 'rgba(52,211,153,0.3)' : 'rgba(239,68,68,0.3)'}`,
                        color: msg.type === 'success' ? '#6EE7B7' : '#FCA5A5',
                    }}>
                    {msg.text}
                </motion.div>
            )}
        </AnimatePresence>
    );

    return (
        <div style={{ minHeight: '100vh', background: '#07070A', color: '#fff' }}>

            {/* Ambient glow */}
            <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
                <div style={{ position: 'absolute', top: '-20%', left: '-10%', width: '50vw', height: '50vh', background: 'radial-gradient(circle, rgba(168,85,247,0.06) 0%, transparent 65%)', borderRadius: '50%' }} />
                <div style={{ position: 'absolute', bottom: '-20%', right: '-10%', width: '40vw', height: '40vh', background: 'radial-gradient(circle, rgba(99,102,241,0.05) 0%, transparent 60%)', borderRadius: '50%' }} />
            </div>

            {/* Nav */}
            <nav style={{ position: 'relative', zIndex: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem 3rem', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <Link href="/" style={{ fontWeight: 800, fontSize: '1.1rem', letterSpacing: '-0.04em', color: '#fff', textDecoration: 'none', fontFamily: 'var(--font-syne, sans-serif)' }}>
                    Number<span style={{ opacity: 0.35 }}>1</span>
                </Link>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <Link href="/" style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 500 }}>
                        {'\u2190'} Home
                    </Link>
                    <button
                        onClick={() => signOut({ callbackUrl: '/' })}
                        style={{ background: 'none', border: '1px solid rgba(239,68,68,0.3)', color: 'rgba(239,68,68,0.7)', padding: '0.45rem 1rem', borderRadius: '10px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}
                    >
                        Sign Out
                    </button>
                </div>
            </nav>

            {/* Content */}
            <div style={{ position: 'relative', zIndex: 10, maxWidth: '720px', margin: '0 auto', padding: '3rem 1.5rem 6rem' }}>

                {/* Avatar + name header */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
                    style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '3rem' }}>
                    <img src={avatar} alt={profile?.name || 'You'} style={{ width: '72px', height: '72px', borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(168,85,247,0.3)', background: '#1a1a2e' }} />
                    <div>
                        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.025em', marginBottom: '0.3rem', fontFamily: 'var(--font-syne, sans-serif)' }}>
                            {profile?.name || 'Your Account'}
                        </h1>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                            <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem' }}>{profile?.email}</span>
                            <span style={{ padding: '0.2rem 0.65rem', borderRadius: '999px', fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', background: planCfg.bg, color: planCfg.color, border: `1px solid ${planCfg.border}` }}>
                                {planCfg.label}
                            </span>
                        </div>
                        {memberSince && (
                            <div style={{ marginTop: '0.25rem', color: 'rgba(255,255,255,0.2)', fontSize: '0.73rem' }}>
                                Member since {memberSince}
                            </div>
                        )}
                    </div>
                </motion.div>

                {/* Profile info */}
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} style={cardStyle}>
                    <h2 style={sectionTitle}>Profile Information</h2>
                    <p style={sectionDesc}>Update your name and company details.</p>
                    <MsgBox msg={profileMsg} />
                    <form onSubmit={saveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div>
                            <label style={labelStyle}>Email Address</label>
                            <input value={profile?.email || ''} disabled style={{ ...inputStyle, opacity: 0.35, cursor: 'not-allowed' }} />
                            <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.2)', marginTop: '0.3rem' }}>Email cannot be changed.</p>
                        </div>
                        <div>
                            <label style={labelStyle}>Full Name</label>
                            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your full name" required style={inputStyle} />
                        </div>
                        <div>
                            <label style={labelStyle}>Company (optional)</label>
                            <input value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Your business name" style={inputStyle} />
                        </div>
                        <button type="submit" disabled={profileSaving} style={profileSaving ? { ...primaryBtnStyle, background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.35)', cursor: 'not-allowed' } : primaryBtnStyle}>
                            {profileSaving ? 'Saving\u2026' : 'Save Profile'}
                        </button>
                    </form>
                </motion.div>

                {/* Change password */}
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }} style={cardStyle}>
                    <h2 style={sectionTitle}>Change Password</h2>
                    <p style={sectionDesc}>Minimum 8 characters. Stored as a bcrypt hash.</p>
                    <MsgBox msg={passwordMsg} />
                    <form onSubmit={savePassword} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div>
                            <label style={labelStyle}>Current Password</label>
                            <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="Your current password" required style={inputStyle} />
                        </div>
                        <div>
                            <label style={labelStyle}>New Password</label>
                            <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="8+ characters" required style={inputStyle} />
                        </div>
                        <div>
                            <label style={labelStyle}>Confirm New Password</label>
                            <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Repeat new password" required style={inputStyle} />
                        </div>
                        <button type="submit" disabled={passwordSaving} style={passwordSaving ? { ...primaryBtnStyle, background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.35)', cursor: 'not-allowed' } : primaryBtnStyle}>
                            {passwordSaving ? 'Updating\u2026' : 'Update Password'}
                        </button>
                    </form>
                </motion.div>

                {/* Plan */}
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.26 }} style={cardStyle}>
                    <h2 style={sectionTitle}>Your Plan</h2>
                    <p style={sectionDesc}>
                        You are on the <strong style={{ color: planCfg.color }}>{planCfg.label}</strong> plan.
                        Upgrade to unlock more AI agents and features.
                    </p>
                    <Link href="/employee#pricing" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.7rem 1.5rem', borderRadius: '12px', background: 'rgba(168,85,247,0.12)', color: '#C084FC', border: '1px solid rgba(168,85,247,0.3)', textDecoration: 'none', fontWeight: 700, fontSize: '0.85rem' }}>
                        Upgrade Plan {'\u2192'}
                    </Link>
                </motion.div>

                {/* Sign out */}
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.34 }}
                    style={{ background: 'rgba(239,68,68,0.04)', border: '1px solid rgba(239,68,68,0.14)', borderRadius: '20px', padding: '1.75rem' }}>
                    <h2 style={{ ...sectionTitle, color: 'rgba(239,68,68,0.8)' }}>Sign Out</h2>
                    <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.8rem', marginBottom: '1.25rem' }}>
                        You will be signed out on this device.
                    </p>
                    <button onClick={() => signOut({ callbackUrl: '/' })}
                        style={{ padding: '0.7rem 1.5rem', borderRadius: '12px', background: 'rgba(239,68,68,0.1)', color: 'rgba(239,68,68,0.85)', border: '1px solid rgba(239,68,68,0.25)', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}>
                        Sign Out
                    </button>
                </motion.div>

            </div>
        </div>
    );
}
