"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

const PLANS = [
    {
        tier: 'Standard',
        price: '€299',
        period: '/mo',
        accent: 'from-blue-500 to-indigo-500',
        borderColor: 'border-white/10',
        badgeColor: 'text-indigo-400/80',
        ctaStyle: 'border border-white/20 text-white/80 hover:bg-white/10 hover:border-white/40',
        ctaLabel: 'Get Started',
        desc: 'The essential autonomous layer for growing teams that want to move faster.',
        features: [
            { label: 'Customer inquiry automation', included: true },
            { label: '24/7 availability', included: true },
            { label: 'Basic competitor monitoring', included: true },
            { label: 'Weekly performance reports', included: true },
            { label: 'Email outreach (500/mo)', included: true },
            { label: '1 brand voice profile', included: true },
            { label: 'Real-time competitor intelligence', included: false },
            { label: 'Predictive lead scoring & CRM sync', included: false },
            { label: 'Unlimited content generation', included: false },
            { label: 'Dedicated account manager', included: false },
        ],
    },
    {
        tier: 'Premium',
        price: '€699',
        period: '/mo',
        accent: 'from-indigo-500 to-violet-500',
        borderColor: 'border-indigo-500/50',
        badgeColor: 'text-indigo-400',

        ctaStyle: 'bg-white text-black hover:bg-white/90 shadow-xl shadow-white/10 hover:scale-[1.02]',
        ctaLabel: 'Get Started',
        desc: 'Full autonomy mode. Your AI runs end-to-end revenue operations without interruption.',
        features: [
            { label: 'Everything in Standard', included: true },
            { label: 'Real-time competitor intelligence', included: true },
            { label: 'Predictive lead scoring & CRM sync', included: true },
            { label: 'SEO content generation (unlimited)', included: true },
            { label: 'Personalised outreach (5,000/mo)', included: true },
            { label: 'Multi-channel campaign execution', included: true },
            { label: '3 brand voice profiles', included: true },
            { label: 'Daily performance insights', included: true },
            { label: 'Dedicated AI instance', included: false },
            { label: 'Custom SLAs & uptime guarantees', included: false },
        ],
    },
    {
        tier: 'Business',
        price: 'Custom',
        period: '',
        accent: 'from-fuchsia-500 to-pink-500',
        borderColor: 'border-white/10',
        badgeColor: 'text-fuchsia-400/70',
        ctaStyle: 'border border-fuchsia-500/40 text-fuchsia-300/80 hover:bg-fuchsia-500/10 hover:border-fuchsia-500/70',
        ctaLabel: 'Contact Sales',
        desc: 'Enterprise-grade deployment with dedicated infrastructure, SLAs and onboarding.',
        features: [
            { label: 'Everything in Premium', included: true },
            { label: 'Dedicated AI instance', included: true },
            { label: 'Custom integrations & API access', included: true },
            { label: 'Unlimited outreach & contacts', included: true },
            { label: 'White-label reporting dashboard', included: true },
            { label: 'Dedicated account manager', included: true },
            { label: 'Custom SLAs & uptime guarantees', included: true },
            { label: 'Priority model training on your data', included: true },
            { label: 'On-site onboarding & workshops', included: true },
            { label: 'Multi-region deployment', included: true },
        ],
    },
];

const FAQS = [
    { q: 'Can I switch plans at any time?', a: 'Yes. You can upgrade or downgrade at any billing cycle with no penalties. Changes take effect at the start of the next billing period.' },
    { q: 'Is there a free trial?', a: 'We offer a 14-day guided pilot on Standard and Premium plans so you can see Number1 working on your actual data before committing.' },
    { q: 'What does "Custom" pricing mean for Business?', a: 'Business pricing is scoped to your specific infrastructure needs, team size, and integration requirements. Book a call and we will scope it together.' },
    { q: 'Are there setup or onboarding fees?', a: 'No hidden fees. All plans include full onboarding. Business plans include dedicated onboarding sessions at no additional cost.' },
    { q: 'What integrations does Number1 Employee support?', a: 'Out of the box: HubSpot, Salesforce, Slack, Notion, Google Workspace, and over 40 more via native connectors. Custom integrations are available on Business.' },
];

export default function PricingPage() {
    const [openFaq, setOpenFaq] = useState<number | null>(null);

    return (
        <div className="min-h-screen bg-black text-white relative overflow-x-hidden">

            {/* Ambient background */}
            <div className="fixed inset-0 -z-10 pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[80vw] h-[80vw] bg-indigo-600/15 rounded-full blur-[160px]" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[70vw] h-[70vw] bg-violet-600/15 rounded-full blur-[160px]" />
            </div>

            {/* Nav */}
            <header className="sticky top-0 z-40 border-b border-white/[0.05] bg-black/50 backdrop-blur-xl">
                <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
                    <Link href="/account" className="font-syne font-bold text-xl tracking-tight text-white hover:opacity-70 transition-opacity">
                        Number<span className="opacity-40">1</span>
                    </Link>
                    <Link href="/account" className="text-xs font-mono text-white/40 hover:text-white transition-colors tracking-widest uppercase">
                        ← Back to Dashboard
                    </Link>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-6 py-12">

                {/* Hero */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="text-center mb-12"
                >
                    <span className="text-xs font-mono tracking-[0.35em] text-white/30 uppercase block mb-3">Pricing</span>
                    <h1 className="text-4xl md:text-5xl font-syne font-semibold tracking-tight mb-5">
                        Simple,{' '}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-violet-400 to-fuchsia-400">
                            transparent pricing.
                        </span>
                    </h1>
                    <p className="text-white/50 text-base max-w-xl mx-auto">
                        No hidden fees. No surprise invoices. Just one AI employee that gets smarter every day.
                    </p>
                </motion.div>

                {/* Plans */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
                    {PLANS.map((plan, i) => (
                        <motion.div
                            key={plan.tier}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1, duration: 0.6 }}
                            className={`relative flex flex-col rounded-3xl border ${plan.borderColor} p-8 overflow-hidden bg-white/[0.03]`}
                        >
                            {/* Glow bar */}
                            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

                            <div className="mb-6">
                                <span className={`text-[10px] font-mono tracking-[0.3em] uppercase block mb-3 ${plan.badgeColor}`}>{plan.tier}</span>
                                <div className="flex items-end gap-1 mb-3">
                                    <span className="text-4xl font-syne font-bold text-white">{plan.price}</span>
                                    {plan.period && <span className="text-white/40 text-sm mb-1.5">{plan.period}</span>}
                                </div>
                                <p className="text-white/50 text-sm leading-relaxed">{plan.desc}</p>
                            </div>

                            <ul className="space-y-3 flex-1 mb-8">
                                {plan.features.map((f) => (
                                    <li key={f.label} className={`flex items-start gap-3 text-sm ${f.included ? 'text-white/75' : 'text-white/25'}`}>
                                        {f.included ? (
                                            <svg className={`w-4 h-4 mt-0.5 shrink-0 bg-gradient-to-r ${plan.accent} rounded`} style={{ padding: '2px' }} fill="none" viewBox="0 0 24 24" stroke="white"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                        ) : (
                                            <svg className="w-4 h-4 mt-0.5 shrink-0 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                        )}
                                        {f.label}
                                    </li>
                                ))}
                            </ul>

                            <button className={`w-full text-center px-6 py-3.5 rounded-full text-sm font-semibold transition-all duration-300 ${plan.ctaStyle}`}>
                                {plan.ctaLabel}
                            </button>
                        </motion.div>
                    ))}
                </div>

                {/* Fine print */}
                <p className="text-center text-white/20 text-xs font-mono tracking-wide mb-24">
                    All plans include onboarding support · VAT may apply · Cancel anytime
                </p>

                {/* Comparison callout */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7 }}
                    className="rounded-3xl border border-white/[0.06] bg-white/[0.02] p-10 md:p-14 text-center mb-24"
                >
                    <p className="text-white/30 text-xs font-mono tracking-[0.3em] uppercase mb-4">Did you know</p>
                    <h2 className="text-3xl md:text-4xl font-syne font-semibold text-white mb-4">
                        One Number1 Employee replaces<br />3–5 full-time roles.
                    </h2>
                    <p className="text-white/50 text-lg max-w-xl mx-auto mb-8">
                        The average cost of a single marketing, sales ops, and content hire is over €150,000/year in salaries alone — before tools, training, and PTO.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link href="/account?tab=ai-services" className="px-8 py-4 bg-white text-black rounded-full font-bold text-sm tracking-widest uppercase hover:bg-white/90 transition-all hover:scale-105">
                            See It in Action
                        </Link>
                    </div>
                </motion.div>

                {/* FAQ */}
                <div className="max-w-2xl mx-auto">
                    <h2 className="text-2xl font-syne font-semibold text-white text-center mb-10">Frequently Asked Questions</h2>
                    <div className="space-y-2">
                        {FAQS.map((faq, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 10 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.05 }}
                                className="border border-white/[0.07] rounded-2xl overflow-hidden"
                            >
                                <button
                                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                                    className="w-full flex items-center justify-between px-6 py-5 text-left hover:bg-white/[0.03] transition-colors"
                                >
                                    <span className="font-medium text-white/80 text-sm pr-4">{faq.q}</span>
                                    <motion.div
                                        animate={{ rotate: openFaq === i ? 45 : 0 }}
                                        transition={{ duration: 0.2 }}
                                        className="shrink-0 w-6 h-6 rounded-full border border-white/20 flex items-center justify-center"
                                    >
                                        <svg className="w-3 h-3 text-white/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16M4 12h16" />
                                        </svg>
                                    </motion.div>
                                </button>
                                <AnimatePresence>
                                    {openFaq === i && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.3 }}
                                            className="overflow-hidden"
                                        >
                                            <p className="px-6 pb-5 text-sm text-white/50 leading-relaxed">{faq.a}</p>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        ))}
                    </div>
                </div>

            </main>

            {/* Footer strip */}
            <footer className="border-t border-white/[0.05] mt-20 py-8 text-center text-white/20 text-xs font-mono tracking-widest">
                © {new Date().getFullYear()} NUMBER1 · ALL RIGHTS RESERVED
            </footer>
        </div>
    );
}
