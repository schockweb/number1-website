"use client";

import React, { useState } from 'react';
import { Button } from './ui/Button';
import { Card } from './ui/Card';

interface ResultViewProps {
    prompt: string;
    onRestart: () => void;
}

export function ResultView({ prompt, onRestart }: ResultViewProps) {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        await navigator.clipboard.writeText(prompt);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="w-full max-w-3xl mx-auto space-y-8 animate-in fade-in zoom-in duration-500">
            <div className="text-center space-y-4">
                <h2 className="text-4xl font-bold tracking-tight">Your Vision, Crystallized.</h2>
                <p className="text-neutral-500">
                    Copy this prompt and paste it into Antigravity to begin your journey.
                </p>
            </div>

            <Card depth="deep" className="bg-background border border-neutral-200 overflow-hidden relative">
                <pre className="whitespace-pre-wrap font-mono text-sm text-neutral-800 p-4 bg-white rounded-none border border-neutral-100 max-h-[500px] overflow-y-auto">
                    {prompt}
                </pre>

                <div className="absolute top-4 right-4 flex space-x-2">
                    {/* Floating actions could go here */}
                </div>
            </Card>

            <div className="flex justify-center gap-4">
                <Button onClick={handleCopy} size="lg" className="w-48">
                    {copied ? "Copied!" : "Copy Prompt"}
                </Button>
                <Button variant="outline" onClick={onRestart} size="lg">
                    Start Over
                </Button>
            </div>
        </div>
    );
}
