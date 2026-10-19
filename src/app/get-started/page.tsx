"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

// ─── Types ────────────────────────────────────────────────────────────────────

interface FormData {
    // Step 1 — Business
    companyName: string; industry: string; website: string; description: string;
    // Step 2 — Audience
    clientType: string; targetMarket: string; geography: string; painPoints: string;
    // Step 3 — Brand Voice
    brandPersonality: string; communicationStyle: string; brandValues: string; avoidWords: string;
    // Step 4 — Competition
    competitors: string; advantage: string;
    // Step 5 — Tech Stack
    crmTool: string; crmOther: string;
    inventoryTool: string; inventoryOther: string;
    emailMarketing: string; emailMarketingOther: string;
    ecommercePlatform: string; ecommerceOther: string;
    communicationTools: string[];
    bookingTool: string;
    // Step 6 — Data & AI Training
    dataStorage: string[];
    dataStorageOther: string;
    hasDocuments: string;
    documentTypes: string[];
    aiCanAccess: string[];
    monthlySalesVolume: string;
    staffCount: string;
    existingAutomations: string;
    // Step 7 — Automation Goals & Contact
    primaryGoal: string;
    automationPriority: string[];
    biggestChallenge: string;
    contactName: string;
    contactEmail: string;
    contactPhone: string;
}

const INITIAL: FormData = {
    companyName: '', industry: '', website: '', description: '',
    clientType: '', targetMarket: '', geography: '', painPoints: '',
    brandPersonality: '', communicationStyle: '', brandValues: '', avoidWords: '',
    competitors: '', advantage: '',
    crmTool: '', crmOther: '', inventoryTool: '', inventoryOther: '',
    emailMarketing: '', emailMarketingOther: '', ecommercePlatform: '', ecommerceOther: '',
    communicationTools: [], bookingTool: '',
    dataStorage: [], dataStorageOther: '', hasDocuments: '', documentTypes: [],
    aiCanAccess: [], monthlySalesVolume: '', staffCount: '', existingAutomations: '',
    primaryGoal: '', automationPriority: [], biggestChallenge: '',
    contactName: '', contactEmail: '', contactPhone: '',
};

const STEPS = [
    { id: 1, title: 'Your Business',      subtitle: 'Tell us about your company',          emoji: '🏢', color: 'from-indigo-500 to-blue-600' },
    { id: 2, title: 'Target Audience',    subtitle: 'Who are your customers?',              emoji: '🎯', color: 'from-violet-500 to-purple-600' },
    { id: 3, title: 'Brand Voice',        subtitle: 'How should your AI sound?',            emoji: '🎨', color: 'from-fuchsia-500 to-pink-600' },
    { id: 4, title: 'Competition',        subtitle: 'Who are you up against?',              emoji: '⚔️', color: 'from-orange-500 to-rose-500' },
    { id: 5, title: 'Tech Stack',         subtitle: 'What tools does your business use?',  emoji: '🔧', color: 'from-sky-500 to-cyan-600' },
    { id: 6, title: 'Data & AI Training', subtitle: 'What can the AI learn from?',         emoji: '🧠', color: 'from-amber-500 to-yellow-500' },
    { id: 7, title: 'Automation Goals',   subtitle: 'What should we automate first?',      emoji: '🚀', color: 'from-emerald-500 to-teal-600' },
];

const INDUSTRIES = ['E-Commerce / Retail','Real Estate','Finance & Banking','Healthcare','Legal Services','Marketing Agency','SaaS / Technology','Hospitality','Construction','Education','Automotive','Logistics','Food & Beverage','Other'];
const PERSONALITIES = [
    { label: 'Professional', desc: 'Formal, authoritative, trust-building' },
    { label: 'Friendly',     desc: 'Warm, approachable, conversational' },
    { label: 'Bold',         desc: 'Confident, direct, no-nonsense' },
    { label: 'Luxury',       desc: 'Refined, exclusive, premium' },
    { label: 'Playful',      desc: 'Fun, energetic, creative' },
    { label: 'Empathetic',   desc: 'Understanding, supportive, caring' },
];
const CRM_OPTIONS = ['HubSpot','Salesforce','Pipedrive','Zoho CRM','Monday.com','Google Sheets / Spreadsheets','No CRM — manual process','Other'];
const INVENTORY_OPTIONS = ['Xero','QuickBooks','Sage','Dear Inventory','TradeGecko','Cin7','WooCommerce (built-in)','Shopify (built-in)','Spreadsheets / Excel','Custom Internal System','No inventory system','Other'];
const EMAIL_OPTIONS = ['Mailchimp','Klaviyo','ActiveCampaign','SendGrid','Brevo (Sendinblue)','No email marketing','Other'];
const ECOMMERCE_OPTIONS = ['Shopify','WooCommerce','Magento','BigCommerce','Squarespace','None — not e-commerce','Other'];
const COMMS_OPTIONS = ['WhatsApp Business','Slack','Microsoft Teams','Telegram','Facebook Messenger','Instagram DMs','Email only','Other'];
const DATA_STORAGE_OPTIONS = ['Google Drive / Docs','Dropbox','Microsoft SharePoint / OneDrive','Local server / NAS','AWS / Azure / GCP','Notion','Airtable','Custom database','Spreadsheets (Excel / Sheets)','No centralised storage'];
const DOCUMENT_TYPES = ['Product catalogue / price list','FAQ document','Company overview / pitch deck','Training manuals / SOPs','Previous customer emails','Marketing copy / ad scripts','Terms & Conditions','Case studies / testimonials','Other'];
const AI_ACCESS_OPTIONS = ['Customer contact list (CRM export)','Product/service list','Inventory data','Past sales/order data','Website content','Email templates','Social media posts','Support tickets / queries','None yet'];
const AUTOMATION_OPTIONS = [
    { label: 'Customer inquiry automation', tier: 'Standard', price: '€299/mo' },
    { label: '24/7 AI availability', tier: 'Standard', price: '€299/mo' },
    { label: 'Basic competitor monitoring', tier: 'Standard', price: '€299/mo' },
    { label: 'Email outreach (500/mo)', tier: 'Standard', price: '€299/mo' },
    { label: 'Weekly performance reports', tier: 'Standard', price: '€299/mo' },
    { label: 'Real-time competitor intelligence', tier: 'Premium', price: '€699/mo' },
    { label: 'Predictive lead scoring & CRM sync', tier: 'Premium', price: '€699/mo' },
    { label: 'SEO content generation (unlimited)', tier: 'Premium', price: '€699/mo' },
    { label: 'Personalised outreach (5,000/mo)', tier: 'Premium', price: '€699/mo' },
    { label: 'Multi-channel campaign execution', tier: 'Premium', price: '€699/mo' },
    { label: 'Dedicated AI instance', tier: 'Business', price: '€1,299/mo' },
    { label: 'Custom integrations & API access', tier: 'Business', price: '€1,299/mo' },
    { label: 'Unlimited outreach & contacts', tier: 'Business', price: '€1,299/mo' },
    { label: 'White-label reporting dashboard', tier: 'Business', price: '€1,299/mo' },
    { label: 'Priority model training on your data', tier: 'Business', price: '€1,299/mo' },
];
const AI_GOALS = ['Generate more qualified leads','Automate customer support responses','Create content & social media posts','Monitor & outperform competitors','Build automated email sequences','Increase sales conversions','Reduce manual admin work','Improve customer retention'];

// ─── Utilities ────────────────────────────────────────────────────────────────

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
    return (
        <div>
            <label className="block text-xs font-bold tracking-widest uppercase text-white/40 mb-1">{label}</label>
            {hint && <p className="text-xs text-white/25 mb-2">{hint}</p>}
            {children}
        </div>
    );
}

const inputCls = "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-white/20 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/70 transition-all";
const selectCls = "w-full bg-[#12121f] border border-white/10 rounded-xl px-4 py-3.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/70 transition-all appearance-none cursor-pointer";
const textareaCls = `${inputCls} resize-none`;

function RadioGrid({ options, value, onChange, accent = 'indigo' }: { options: string[]; value: string; onChange: (v: string) => void; accent?: string }) {
    const on = `bg-${accent}-600/20 border-${accent}-500/60 text-white`;
    const off = 'bg-white/[0.03] border-white/10 text-white/60 hover:bg-white/[0.06]';
    return (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {options.map((o) => (
                <button key={o} type="button" onClick={() => onChange(o)}
                    className={`px-3 py-2.5 rounded-xl border text-left text-sm transition-all ${value === o ? on : off}`}>
                    {o}
                </button>
            ))}
        </div>
    );
}

function CheckGrid({ options, values, onChange, accent = 'indigo' }: { options: string[]; values: string[]; onChange: (v: string[]) => void; accent?: string }) {
    const toggle = (o: string) => onChange(values.includes(o) ? values.filter((x) => x !== o) : [...values, o]);
    const on = `bg-${accent}-600/20 border-${accent}-500/60 text-white`;
    const off = 'bg-white/[0.03] border-white/10 text-white/60 hover:bg-white/[0.06]';
    return (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {options.map((o) => (
                <button key={o} type="button" onClick={() => toggle(o)}
                    className={`px-3 py-2.5 rounded-xl border text-left text-sm transition-all flex items-start gap-2 ${values.includes(o) ? on : off}`}>
                    <span className={`mt-0.5 w-3.5 h-3.5 rounded shrink-0 border ${values.includes(o) ? 'bg-indigo-500 border-indigo-500' : 'border-white/30'} flex items-center justify-center`}>
                        {values.includes(o) && <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                    </span>
                    {o}
                </button>
            ))}
        </div>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function GetStartedPage() {
    const [step, setStep] = useState(0);
    const [form, setForm] = useState<FormData>(INITIAL);
    const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
    const [errorMsg, setErrorMsg] = useState('');
    const [direction, setDirection] = useState(1);
    const [dashboardToken, setDashboardToken] = useState('');

    const totalSteps = STEPS.length;
    const currentStep = STEPS[step];

    const set = (field: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
        setForm((f) => ({ ...f, [field]: e.target.value }));

    const pick = (field: keyof FormData, value: string) =>
        setForm((f) => ({ ...f, [field]: f[field] === value ? '' : value }));

    const checkToggle = (field: keyof FormData, value: string) => {
        const arr = form[field] as string[];
        setForm((f) => ({ ...f, [field]: arr.includes(value) ? arr.filter((x) => x !== value) : [...arr, value] }));
    };

    const goNext = () => { setDirection(1); setStep((s) => Math.min(s + 1, totalSteps - 1)); };
    const goBack = () => { setDirection(-1); setStep((s) => Math.max(s - 1, 0)); };

    const stepValid = () => {
        if (step === 0) return !!(form.companyName && form.industry && form.description);
        if (step === 1) return !!(form.clientType && form.targetMarket);
        if (step === 2) return !!form.brandPersonality;
        if (step === 3) return !!form.advantage;
        if (step === 4) return !!(form.crmTool && form.inventoryTool);
        if (step === 5) return form.dataStorage.length > 0;
        if (step === 6) return !!(form.primaryGoal && form.contactName && form.contactEmail);
        return true;
    };

    const handleSubmit = async () => {
        setStatus('submitting');
        try {
            const res = await fetch('/api/client-intake', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...form,
                    communicationTools: form.communicationTools.join(', '),
                    dataStorage: form.dataStorage.join(', '),
                    documentTypes: form.documentTypes.join(', '),
                    aiCanAccess: form.aiCanAccess.join(', '),
                    automationPriority: form.automationPriority.join(', '),
                }),
            });
            const data = await res.json();
            if (!res.ok || data.error) { setErrorMsg(data.error || 'Something went wrong.'); setStatus('error'); }
            else { if (data.dashboardToken) setDashboardToken(data.dashboardToken); setStatus('success'); }
        } catch { setErrorMsg('Network error. Please try again.'); setStatus('error'); }
    };

    // ── SUCCESS ──────────────────────────────────────────────────────────────
    if (status === 'success') {
        return (
            <div className="min-h-screen bg-[#080810] flex items-center justify-center px-6">
                <div className="fixed inset-0 pointer-events-none">
                    <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vw] bg-emerald-600/15 rounded-full blur-[160px]" />
                </div>
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center max-w-lg mx-auto relative z-10">
                    <div className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-8">
                        <svg className="w-10 h-10 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-syne font-bold text-white mb-4">Brief Received — We&apos;re On It</h1>
                    <p className="text-white/50 text-lg leading-relaxed mb-10">
                        Your business brief for <strong className="text-white">{form.companyName}</strong> has been processed and your AI services are being configured with your brand voice, industry data, and business goals.
                    </p>
                    <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-6 mb-8 text-left space-y-3">
                        <p className="text-xs font-mono tracking-widest text-white/30 uppercase mb-4">✅ Activated instantly</p>
                        {[
                            'Your business data has been mapped to all AI services',
                            'Competitor analysis is configured with your industry & market positioning',
                            'Website audit AI is trained on your brand voice & goals',
                            'Your personalised dashboard is ready to use',
                        ].map((t, i) => (
                            <div key={i} className="flex items-center gap-3 text-sm text-white/70">
                                <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold flex items-center justify-center shrink-0">✓</span>
                                {t}
                            </div>
                        ))}
                    </div>
                    <Link
                        href={dashboardToken ? `/dashboard/${dashboardToken}` : '/'}
                        className="inline-flex items-center gap-2 px-8 py-4 bg-white text-black rounded-full font-bold text-sm hover:bg-white/90 transition-all"
                    >
                        Go to Dashboard →
                    </Link>
                </motion.div>
            </div>
        );
    }

    // ── MAIN FORM ─────────────────────────────────────────────────────────────
    return (
        <div className="min-h-screen bg-[#080810] text-white flex flex-col">
            <div className="fixed inset-0 pointer-events-none -z-10">
                <div className={`absolute top-[-15%] left-[-10%] w-[70vw] h-[70vw] rounded-full blur-[180px] opacity-15 bg-gradient-to-br ${currentStep.color} transition-all duration-1000`} />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-violet-600/10 rounded-full blur-[160px]" />
            </div>

            {/* Header */}
            <header className="flex items-center justify-between px-6 py-5 border-b border-white/[0.06]">
                <Link href="/" className="text-sm text-white/50 hover:text-white transition-colors font-semibold">← Back</Link>
                <span className="text-xs font-mono tracking-widest text-white/30 uppercase">Client Onboarding</span>
                <span className="text-xs font-mono text-white/30">{step + 1} of {totalSteps}</span>
            </header>

            {/* Progress bar */}
            <div className="h-0.5 bg-white/[0.06]">
                <motion.div className={`h-full bg-gradient-to-r ${currentStep.color}`}
                    animate={{ width: `${((step + 1) / totalSteps) * 100}%` }}
                    transition={{ duration: 0.5, ease: 'easeOut' }} />
            </div>

            {/* Content */}
            <div className="flex-1 flex flex-col items-center justify-center px-6 py-10 overflow-y-auto">
                <div className="w-full max-w-3xl">

                    {/* Step header */}
                    <AnimatePresence mode="wait">
                        <motion.div key={`h${step}`} initial={{ opacity: 0, y: 16 * direction }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 * direction }} transition={{ duration: 0.3 }} className="mb-8">
                            <div className={`inline-flex items-center gap-2 bg-gradient-to-r ${currentStep.color} text-white text-[11px] font-bold font-mono tracking-widest uppercase px-4 py-1.5 rounded-full mb-4`}>
                                <span>{currentStep.emoji}</span>
                                <span>Step {step + 1} — {currentStep.title}</span>
                            </div>
                            <h2 className="text-3xl md:text-4xl font-syne font-bold text-white">{currentStep.subtitle}</h2>
                        </motion.div>
                    </AnimatePresence>

                    {/* Fields */}
                    <AnimatePresence mode="wait">
                        <motion.div key={`f${step}`} initial={{ opacity: 0, x: 40 * direction }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 * direction }} transition={{ duration: 0.3, ease: 'easeOut' }} className="space-y-6">

                            {/* ── STEP 1: Business ── */}
                            {step === 0 && (<>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <Field label="Company Name *">
                                        <input type="text" value={form.companyName} onChange={set('companyName')} className={inputCls} placeholder="e.g. Apex Solutions" autoFocus />
                                    </Field>
                                    <Field label="Industry *">
                                        <div className="relative">
                                            <select value={form.industry} onChange={set('industry')} className={selectCls}
                                                style={{ colorScheme: 'dark' }}>
                                                <option value="" disabled style={{ background: '#12121f', color: 'rgba(255,255,255,0.4)' }}>Select industry</option>
                                                {INDUSTRIES.map((i) => <option key={i} value={i} style={{ background: '#12121f', color: '#fff' }}>{i}</option>)}
                                            </select>
                                            <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-white/30">
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                            </div>
                                        </div>
                                    </Field>
                                </div>
                                <Field label="Website URL">
                                    <input type="url" value={form.website} onChange={set('website')} className={inputCls} placeholder="https://yourwebsite.com" />
                                </Field>
                                <Field label="Describe your business *" hint="What you do, who you serve, what makes you different">
                                    <textarea rows={4} value={form.description} onChange={set('description')} className={textareaCls} placeholder="e.g. We're a premium accounting firm in Johannesburg serving SMEs in the construction industry..." />
                                </Field>
                            </>)}

                            {/* ── STEP 2: Audience ── */}
                            {step === 1 && (<>
                                <Field label="Client Type *">
                                    <div className="grid grid-cols-2 gap-3">
                                        {[['B2B','You sell to other businesses'],['B2C','You sell to consumers'],['Both','Mix of B2B & B2C'],['B2G','Government / public sector']].map(([v, d]) => (
                                            <button key={v} type="button" onClick={() => pick('clientType', v)}
                                                className={`p-4 rounded-2xl border text-left transition-all ${form.clientType === v ? 'bg-violet-600/20 border-violet-500/60 text-white' : 'bg-white/[0.03] border-white/10 text-white/60 hover:bg-white/[0.06]'}`}>
                                                <div className="font-bold text-sm mb-1">{v}</div>
                                                <div className="text-xs text-white/40">{d}</div>
                                            </button>
                                        ))}
                                    </div>
                                </Field>
                                <Field label="Describe your ideal customer *">
                                    <textarea rows={3} value={form.targetMarket} onChange={set('targetMarket')} className={textareaCls} placeholder="Age, profession, income, interests, location..." />
                                </Field>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <Field label="Primary Market / Geography">
                                        <input type="text" value={form.geography} onChange={set('geography')} className={inputCls} placeholder="e.g. South Africa, USA, Global" />
                                    </Field>
                                    <Field label="Customer Pain Points">
                                        <input type="text" value={form.painPoints} onChange={set('painPoints')} className={inputCls} placeholder="e.g. Time, cost, finding reliable service..." />
                                    </Field>
                                </div>
                            </>)}

                            {/* ── STEP 3: Brand Voice ── */}
                            {step === 2 && (<>
                                <Field label="Brand Personality *">
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                        {PERSONALITIES.map(({ label, desc }) => (
                                            <button key={label} type="button" onClick={() => pick('brandPersonality', label)}
                                                className={`p-4 rounded-2xl border text-left transition-all ${form.brandPersonality === label ? 'bg-fuchsia-600/20 border-fuchsia-500/60 text-white' : 'bg-white/[0.03] border-white/10 text-white/60 hover:bg-white/[0.06]'}`}>
                                                <div className="font-bold text-sm mb-1">{label}</div>
                                                <div className="text-xs text-white/40">{desc}</div>
                                            </button>
                                        ))}
                                    </div>
                                </Field>
                                <Field label="Communication Style" hint="How should the AI write to your customers?">
                                    <input type="text" value={form.communicationStyle} onChange={set('communicationStyle')} className={inputCls} placeholder="e.g. Short & punchy, Long-form & educational, Story-driven..." />
                                </Field>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <Field label="Core Brand Values">
                                        <input type="text" value={form.brandValues} onChange={set('brandValues')} className={inputCls} placeholder="e.g. Innovation, Trust, Reliability..." />
                                    </Field>
                                    <Field label="Words / Phrases to NEVER Use">
                                        <input type="text" value={form.avoidWords} onChange={set('avoidWords')} className={inputCls} placeholder="e.g. Cheap, Budget, Basic..." />
                                    </Field>
                                </div>
                            </>)}

                            {/* ── STEP 4: Competition ── */}
                            {step === 3 && (<>
                                <Field label="Your Main Competitors" hint="List names or website URLs — the AI will monitor these">
                                    <textarea rows={4} value={form.competitors} onChange={set('competitors')} className={textareaCls} placeholder="e.g.&#10;Acme Corp — acme.com&#10;RivalBrand — rival.co.za&#10;Competitor Three — competitorthree.com" />
                                </Field>
                                <Field label="Your Competitive Advantage *" hint="Why should customers choose you over everyone else?">
                                    <textarea rows={4} value={form.advantage} onChange={set('advantage')} className={textareaCls} placeholder="What do you do better, faster, or differently than your competitors?" />
                                </Field>
                                <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-4 text-sm text-orange-300/80 leading-relaxed">
                                    💡 <strong>Tip:</strong> The more specific you are here, the better your AI will outpositon your competitors in every piece of outreach and content it creates.
                                </div>
                            </>)}

                            {/* ── STEP 5: Tech Stack ── */}
                            {step === 4 && (<>
                                <Field label="CRM / Customer Management Tool *" hint="Where do you track leads, clients and deals?">
                                    <RadioGrid options={CRM_OPTIONS} value={form.crmTool} onChange={(v) => setForm((f) => ({ ...f, crmTool: v }))} accent="sky" />
                                    {form.crmTool === 'Other' && (
                                        <input type="text" value={form.crmOther} onChange={set('crmOther')} className={`${inputCls} mt-2`} placeholder="Specify CRM tool name..." autoFocus />
                                    )}
                                </Field>
                                <Field label="Inventory / Stock Tracking *" hint="How do you manage products, stock levels or orders?">
                                    <RadioGrid options={INVENTORY_OPTIONS} value={form.inventoryTool} onChange={(v) => setForm((f) => ({ ...f, inventoryTool: v }))} accent="sky" />
                                    {form.inventoryTool === 'Other' && (
                                        <input type="text" value={form.inventoryOther} onChange={set('inventoryOther')} className={`${inputCls} mt-2`} placeholder="Specify inventory tool..." />
                                    )}
                                </Field>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <Field label="Email Marketing Platform">
                                        <RadioGrid options={EMAIL_OPTIONS} value={form.emailMarketing} onChange={(v) => setForm((f) => ({ ...f, emailMarketing: v }))} accent="sky" />
                                        {form.emailMarketing === 'Other' && (
                                            <input type="text" value={form.emailMarketingOther} onChange={set('emailMarketingOther')} className={`${inputCls} mt-2`} placeholder="Specify email platform..." />
                                        )}
                                    </Field>
                                    <Field label="E-Commerce Platform">
                                        <RadioGrid options={ECOMMERCE_OPTIONS} value={form.ecommercePlatform} onChange={(v) => setForm((f) => ({ ...f, ecommercePlatform: v }))} accent="sky" />
                                        {form.ecommercePlatform === 'Other' && (
                                            <input type="text" value={form.ecommerceOther} onChange={set('ecommerceOther')} className={`${inputCls} mt-2`} placeholder="Specify platform..." />
                                        )}
                                    </Field>
                                </div>
                                <Field label="Customer Communication Channels" hint="Select all that you actively use">
                                    <CheckGrid options={COMMS_OPTIONS} values={form.communicationTools}
                                        onChange={(v) => setForm((f) => ({ ...f, communicationTools: v }))} accent="sky" />
                                </Field>
                                <Field label="Appointment / Booking Tool" hint="How do clients book with you? (type 'None' if not applicable)">
                                    <input type="text" value={form.bookingTool} onChange={set('bookingTool')} className={inputCls} placeholder="e.g. Calendly, SimplyBook, Google Calendar, WhatsApp, None..." />
                                </Field>
                            </>)}

                            {/* ── STEP 6: Data & AI Training ── */}
                            {step === 5 && (<>
                                <Field label="Where is your business data stored? *" hint="Select all that apply — this helps us plan AI integrations">
                                    <CheckGrid options={DATA_STORAGE_OPTIONS} values={form.dataStorage}
                                        onChange={(v) => setForm((f) => ({ ...f, dataStorage: v }))} accent="amber" />
                                    {form.dataStorage.includes('') && (
                                        <input type="text" value={form.dataStorageOther} onChange={set('dataStorageOther')} className={`${inputCls} mt-2`} placeholder="Describe your data storage..." />
                                    )}
                                </Field>
                                <Field label="Do you have any documents for the AI to learn from?" hint="These help the AI understand your business deeply">
                                    <div className="grid grid-cols-3 gap-2 mb-3">
                                        {['Yes — I have documents','Not yet — will create','No — not applicable'].map((o) => (
                                            <button key={o} type="button" onClick={() => pick('hasDocuments', o)}
                                                className={`px-3 py-3 rounded-xl border text-xs text-center transition-all ${form.hasDocuments === o ? 'bg-amber-500/20 border-amber-500/60 text-white' : 'bg-white/[0.03] border-white/10 text-white/60 hover:bg-white/[0.06]'}`}>
                                                {o}
                                            </button>
                                        ))}
                                    </div>
                                    {form.hasDocuments === 'Yes — I have documents' && (
                                        <Field label="What document types do you have? (select all)">
                                            <CheckGrid options={DOCUMENT_TYPES} values={form.documentTypes}
                                                onChange={(v) => setForm((f) => ({ ...f, documentTypes: v }))} accent="amber" />
                                        </Field>
                                    )}
                                </Field>
                                <Field label="What data can the AI access to personalise responses?" hint="Select all that are available">
                                    <CheckGrid options={AI_ACCESS_OPTIONS} values={form.aiCanAccess}
                                        onChange={(v) => setForm((f) => ({ ...f, aiCanAccess: v }))} accent="amber" />
                                </Field>
                                <Field label="Any existing automations or workflows?" hint="Describe anything you've already automated, even simple things like email auto-replies">
                                    <textarea rows={3} value={form.existingAutomations} onChange={set('existingAutomations')} className={textareaCls} placeholder="e.g. We have a Zapier automation that adds new enquiries to a Google Sheet. We send a weekly Mailchimp newsletter manually..." />
                                </Field>
                            </>)}

                            {/* ── STEP 7: Goals & Contact ── */}
                            {step === 6 && (<>
                                <Field label="Primary AI Service Goal *">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                        {AI_GOALS.map((g) => (
                                            <button key={g} type="button" onClick={() => pick('primaryGoal', g)}
                                                className={`px-4 py-3 rounded-xl border text-left text-sm transition-all ${form.primaryGoal === g ? 'bg-emerald-600/20 border-emerald-500/60 text-white font-semibold' : 'bg-white/[0.03] border-white/10 text-white/60 hover:bg-white/[0.06]'}`}>
                                                {g}
                                            </button>
                                        ))}
                                    </div>
                                </Field>
                                <Field label="Which AI services are you interested in?" hint="Select services from each tier">
                                    <div className="space-y-4">
                                        {(['Standard', 'Premium', 'Business'] as const).map(tier => {
                                            const tierOpts = AUTOMATION_OPTIONS.filter(o => o.tier === tier);
                                            const tierColors: Record<string, { badge: string; border: string; bg: string; check: string }> = {
                                                Standard: { badge: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30', border: 'border-indigo-500/60', bg: 'bg-indigo-600/20', check: 'bg-indigo-500 border-indigo-500' },
                                                Premium:  { badge: 'bg-violet-500/20 text-violet-400 border-violet-500/30', border: 'border-violet-500/60', bg: 'bg-violet-600/20', check: 'bg-violet-500 border-violet-500' },
                                                Business: { badge: 'bg-fuchsia-500/20 text-fuchsia-400 border-fuchsia-500/30', border: 'border-fuchsia-500/60', bg: 'bg-fuchsia-600/20', check: 'bg-fuchsia-500 border-fuchsia-500' },
                                            };
                                            const c = tierColors[tier];
                                            const tierPrice = tierOpts[0]?.price || '';
                                            return (
                                                <div key={tier}>
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border ${c.badge}`}>{tier}</span>
                                                        <span className="text-[10px] text-white/25 font-semibold">{tierPrice}</span>
                                                    </div>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5">
                                                        {tierOpts.map(o => {
                                                            const sel = form.automationPriority.includes(o.label);
                                                            const toggle = () => setForm(f => ({ ...f, automationPriority: sel ? f.automationPriority.filter(x => x !== o.label) : [...f.automationPriority, o.label] }));
                                                            return (
                                                                <button key={o.label} type="button" onClick={toggle}
                                                                    className={`px-3 py-2.5 rounded-xl border text-left text-sm transition-all flex items-start gap-2 ${sel ? `${c.bg} ${c.border} text-white` : 'bg-white/[0.03] border-white/10 text-white/60 hover:bg-white/[0.06]'}`}>
                                                                    <span className={`mt-0.5 w-3.5 h-3.5 rounded shrink-0 border ${sel ? c.check : 'border-white/30'} flex items-center justify-center`}>
                                                                        {sel && <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                                                                    </span>
                                                                    {o.label}
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </Field>
                                <Field label="Biggest Current Business Challenge">
                                    <textarea rows={3} value={form.biggestChallenge} onChange={set('biggestChallenge')} className={textareaCls} placeholder="What is the #1 thing holding your business back right now?" />
                                </Field>
                                <div className="border-t border-white/[0.08] pt-5 grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <Field label="Your Name *">
                                        <input type="text" value={form.contactName} onChange={set('contactName')} className={inputCls} placeholder="Jane Smith" />
                                    </Field>
                                    <Field label="Your Email *">
                                        <input type="email" value={form.contactEmail} onChange={set('contactEmail')} className={inputCls} placeholder="jane@company.com" />
                                    </Field>
                                    <Field label="Phone / WhatsApp">
                                        <input type="tel" value={form.contactPhone} onChange={set('contactPhone')} className={inputCls} placeholder="+27 82 123 4567" />
                                    </Field>
                                </div>
                                {status === 'error' && (
                                    <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-300 text-sm">{errorMsg}</div>
                                )}
                            </>)}

                        </motion.div>
                    </AnimatePresence>

                    {/* Navigation */}
                    <div className="flex items-center justify-between mt-10 gap-4">
                        <button type="button" onClick={goBack} disabled={step === 0}
                            className="px-7 py-3.5 rounded-full border border-white/20 text-white/60 text-sm font-semibold hover:bg-white/10 hover:text-white transition-all disabled:opacity-20 disabled:pointer-events-none">
                            ← Back
                        </button>
                        {step < totalSteps - 1 ? (
                            <button type="button" onClick={goNext} disabled={!stepValid()}
                                className={`px-8 py-3.5 rounded-full bg-gradient-to-r ${currentStep.color} text-white font-bold text-sm hover:opacity-90 transition-all shadow-lg hover:scale-[1.02] disabled:opacity-30 disabled:pointer-events-none`}>
                                Continue →
                            </button>
                        ) : (
                            <button type="button" onClick={handleSubmit}
                                disabled={status === 'submitting' || !stepValid()}
                                className="flex items-center gap-2 px-8 py-3.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold text-sm hover:opacity-90 transition-all shadow-lg disabled:opacity-30 disabled:pointer-events-none">
                                {status === 'submitting' ? (<><div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />Submitting…</>) : <>Submit Brief →</>}
                            </button>
                        )}
                    </div>

                    {/* Dots */}
                    <div className="flex items-center justify-center gap-2 mt-8">
                        {STEPS.map((_, i) => (
                            <div key={i} className={`rounded-full transition-all duration-300 ${i === step ? 'w-6 h-2 bg-white' : i < step ? 'w-2 h-2 bg-white/40' : 'w-2 h-2 bg-white/15'}`} />
                        ))}
                    </div>
                    <p className="text-center text-xs text-white/20 mt-4">Your information is kept confidential and used only to configure your AI setup</p>
                </div>
            </div>
        </div>
    );
}
