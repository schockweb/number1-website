"use client";

import { useEffect } from 'react';
import { useLanguageStore, type Locale } from '@/lib/store/useLanguageStore';

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    const { isDetected, setLocale, setCurrency, setDetected } = useLanguageStore();

    useEffect(() => {
        if (isDetected) return;

        const detect = async () => {
            try {
                const res = await fetch('/api/detect-language');
                if (res.ok) {
                    const data = await res.json();
                    if (data.locale) {
                        setLocale(data.locale as Locale);
                    }
                    if (data.currency) {
                        setCurrency(data.currency as any);
                    }
                }
            } catch {
                // Silent fail — keep default English
            } finally {
                setDetected();
            }
        };

        detect();
    }, [isDetected, setLocale, setDetected]);

    return <>{children}</>;
}
