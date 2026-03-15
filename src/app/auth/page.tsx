"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUserStore } from '@/lib/store/useUserStore';

export default function AuthPage() {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const { login } = useUserStore();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Mock authentication - in a real app this would call an API
        login({
            id: 'demo-user-1',
            name: isLogin ? 'Jane Doe' : name || 'New User',
            email: email,
            plan: 'Pro Membership',
            avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'New User')}&background=random`,
            createdAt: new Date().toISOString()
        });

        // Hard redirect to clear any previous state and force a fresh load of the account page
        window.location.href = '/account';
    };

    return (
        <div className="min-h-screen bg-[#FAFAFA] text-black font-mono selection:bg-black selection:text-white flex items-center justify-center p-8 relative overflow-hidden">

            {/* Minimalist grid background */}
            <div className="absolute inset-0 opacity-[0.05] pointer-events-none"
                style={{ backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)', backgroundSize: '48px 48px' }} />

            {/* Top right decorative element */}
            <div className="absolute top-8 right-8 w-16 h-16 border-2 border-black rounded-full flex items-center justify-center opacity-20 pointer-events-none">
                <span className="font-syne font-bold text-2xl">!</span>
            </div>

            <div className="w-full max-w-md relative z-10">

                <div className="mb-12 text-center">
                    <h1 className="text-4xl md:text-5xl font-syne font-bold tracking-tighter uppercase text-black">
                        Authenticate
                    </h1>
                </div>

                {/* Toggle Switch */}
                <div className="flex w-full border-2 border-black mb-8 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-white transition-all">
                    <button
                        type="button"
                        onClick={() => setIsLogin(true)}
                        className={`flex-1 py-4 font-syne font-bold text-lg md:text-xl uppercase transition-colors ${isLogin ? 'bg-black text-white' : 'bg-transparent text-black hover:bg-neutral-100'}`}
                    >
                        Log In
                    </button>
                    <div className="w-0.5 bg-black"></div>
                    <button
                        type="button"
                        onClick={() => setIsLogin(false)}
                        className={`flex-1 py-4 font-syne font-bold text-lg md:text-xl uppercase transition-colors ${!isLogin ? 'bg-black text-white' : 'bg-transparent text-black hover:bg-neutral-100'}`}
                    >
                        Sign Up
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6 bg-white border-2 border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                    <AnimatePresence mode="wait">
                        {!isLogin && (
                            <motion.div
                                initial={{ height: 0, opacity: 0, marginTop: 0 }}
                                animate={{ height: 'auto', opacity: 1, marginTop: '12px' }}
                                exit={{ height: 0, opacity: 0, marginTop: 0 }}
                                className="overflow-hidden"
                            >
                                <label className="block text-xs font-bold uppercase tracking-widest mb-1 h-4">Legal Name</label>
                                <input
                                    type="text"
                                    required={!isLogin}
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full bg-white border-2 border-black p-3 font-bold text-base focus:outline-none focus:bg-black focus:text-white transition-all placeholder:text-neutral-400 placeholder:font-normal"
                                    placeholder="John Doe"
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div>
                        <label className="block text-xs font-bold uppercase tracking-widest mb-1 h-4">Email Address</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-white border-2 border-black p-3 font-bold text-base focus:outline-none focus:bg-black focus:text-white transition-all placeholder:text-neutral-400 placeholder:font-normal"
                            placeholder="you@company.com"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold uppercase tracking-widest mb-1 h-4 flex justify-between">
                            <span>Password</span>
                            {isLogin && <a href="#" className="underline decoration-2 hover:bg-black hover:text-white px-1">Forgot?</a>}
                        </label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-white border-2 border-black p-3 font-bold text-base focus:outline-none focus:bg-black focus:text-white transition-all placeholder:text-neutral-400 placeholder:font-normal tracking-[0.2em]"
                            placeholder="••••••••"
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-black border-2 border-black text-white font-syne font-bold text-xl uppercase py-4 mt-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] relative top-0 left-0 hover:top-[2px] hover:left-[2px] hover:shadow-none transition-all flex items-center justify-center gap-2"
                    >
                        {isLogin ? 'Continue' : 'Create Account'}
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                    </button>
                </form>

            </div>

        </div>
    );
}
