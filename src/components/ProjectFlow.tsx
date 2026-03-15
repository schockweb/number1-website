"use client";

import React, { useState } from 'react';
import { Button } from './ui/Button';
import { Card } from './ui/Card';

export interface BuildingStageAnswers {
    vibe: string;
    industry: string;
    colorPalette: string;
    features: string;
    voice: string;
}

interface BuildingStageFlowProps {
    onComplete: (answers: BuildingStageAnswers) => void;
    onBack?: () => void;
}

const questions = [
    {
        id: 'industry',
        question: "What industry or niche is this for?",
        options: ["Tech / SaaS", "Creative / Portfolio", "E-commerce", "Corporate / Finance", "Health / Wellness", "Other"],
    },
    {
        id: 'vibe',
        question: "How should the website feel?",
        options: ["Minimal & Clean", "Bold & Experimental", "Professional & Trustworthy", "Friendly & Playful", "Luxury & Elegant"],
    },
    {
        id: 'colorPalette',
        question: "What is your preferred color direction?",
        options: ["Monochrome (Black/White)", "Dark Mode", "Pastel & Soft", "Vibrant & High Contrast", "Nature & Earthy"],
    },
    {
        id: 'features',
        question: "What is the primary feature?",
        options: ["Blog / Content", "Product Showcase", "Service Booking", "Dashboard / Data", "Landing Page / Conversion"],
    },
    {
        id: 'voice',
        question: "What is the brand voice?",
        options: ["Professional & Formal", "Friendly & Casual", "Edgy & Disruptive", "Inspirational & Visionary"],
    },
];

export function BuildingStageFlow({ onComplete, onBack }: BuildingStageFlowProps) {
    const [currentStep, setCurrentStep] = useState(0);
    const [answers, setAnswers] = useState<Partial<BuildingStageAnswers>>({});

    const handleOptionSelect = (option: string) => {
        const currentQuestion = questions[currentStep];
        const newAnswers = { ...answers, [currentQuestion.id]: option };
        setAnswers(newAnswers);

        if (currentStep < questions.length - 1) {
            setTimeout(() => setCurrentStep(currentStep + 1), 300); // Slight delay for better UX
        } else {
            onComplete(newAnswers as BuildingStageAnswers);
        }
    };

    const progress = ((currentStep + 1) / questions.length) * 100;

    return (
        <div className="w-full max-w-2xl mx-auto">
            <div className="mb-8">
                <div className="h-1 w-full bg-gray-100 rounded-none overflow-hidden">
                    <div
                        className="h-full bg-black transition-all duration-500 ease-out"
                        style={{ width: `${progress}%` }}
                    />
                </div>
                <div className="mt-2 text-right text-xs text-gray-400 font-mono">
                    STEP {currentStep + 1}/{questions.length}
                </div>
            </div>

            <Card depth="soft" className="min-h-[400px] flex flex-col justify-center items-center text-center p-12">
                <h2 className="text-3xl font-bold mb-8 transition-all animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {questions[currentStep].question}
                </h2>

                <div className="flex flex-wrap gap-3 justify-center w-full max-w-lg">
                    {questions[currentStep].options.map((option) => (
                        <button
                            key={option}
                            onClick={() => handleOptionSelect(option)}
                            className="px-6 py-3 rounded-none border border-gray-200 hover:border-black hover:bg-black hover:text-white transition-all duration-200 text-sm font-medium"
                        >
                            {option}
                        </button>
                    ))}
                </div>
            </Card>

            <div className="mt-8 flex justify-between">
                {onBack && (
                    <Button variant="outline" size="sm" onClick={onBack}>
                        Back
                    </Button>
                )}
                {currentStep > 0 && (
                    <Button variant="outline" size="sm" onClick={() => setCurrentStep(currentStep - 1)}>
                        Previous
                    </Button>
                )}
            </div>
        </div>
    );
}
