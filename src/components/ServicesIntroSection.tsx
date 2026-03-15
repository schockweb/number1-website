import React from 'react';
import { motion } from 'framer-motion';

export function ServicesIntroSection() {
    return (
        <section className="py-24 border-t-2 border-black w-full bg-transparent relative z-10">
            <div className="container mx-auto px-4 max-w-6xl 2xl:max-w-[96rem]">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-start">

                    {/* Left side: Huge typography intro */}
                    <div className="space-y-8">
                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="text-5xl md:text-7xl font-bold tracking-tighter uppercase leading-none"
                        >
                            We build <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-neutral-400 to-neutral-800">
                                digital realities
                            </span>
                        </motion.h2>
                        <motion.div
                            initial={{ width: 0 }}
                            whileInView={{ width: "100%" }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.3, duration: 0.8 }}
                            className="h-1 bg-black"
                        />
                    </div>

                    {/* Right side: Detailed explanation & Process */}
                    <div className="space-y-12">
                        <motion.p
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2 }}
                            className="text-lg md:text-xl text-neutral-600 leading-relaxed font-medium"
                        >
                            Number1 is a specialized agency focused on creating extremely high-end, brutalist, and modern web applications. We do not use templates. Every pixel is constructed to establish absolute authority in your market.
                        </motion.p>

                        <div className="space-y-8">
                            <h3 className="text-sm font-bold uppercase tracking-widest border-b-2 border-black pb-2">What happens next</h3>

                            <ul className="space-y-6">
                                {[
                                    { step: "01", title: "Discovery", desc: "Select a visual direction that resonates with your brand ethos." },
                                    { step: "02", title: "Refinement", desc: "Answer specific questions to align the aesthetics with business objectives." },
                                    { step: "03", title: "Generation", desc: "We synthesize your choices into a precise architectural prompt." },
                                    { step: "04", title: "Execution", desc: "Our team builds your custom interactive reality." },
                                ].map((item, i) => (
                                    <motion.li
                                        key={item.step}
                                        initial={{ opacity: 0, x: -20 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: 0.3 + (i * 0.1) }}
                                        className="flex gap-6 group"
                                    >
                                        <span className="font-mono text-neutral-400 group-hover:text-black transition-colors">{item.step}</span>
                                        <div>
                                            <h4 className="font-bold text-lg uppercase tracking-tight">{item.title}</h4>
                                            <p className="text-neutral-500 mt-1">{item.desc}</p>
                                        </div>
                                    </motion.li>
                                ))}
                            </ul>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
}
