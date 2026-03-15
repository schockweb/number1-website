import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Locale = 'en' | 'de' | 'de-CH' | 'fr' | 'it' | 'es' | 'pt' | 'nl';
export type Currency = 'USD' | 'EUR' | 'CHF' | 'GBP';

interface LanguageState {
    locale: Locale;
    currency: Currency;
    isDetected: boolean;
    setLocale: (locale: Locale) => void;
    setCurrency: (currency: Currency) => void;
    setDetected: () => void;
}

export const CURRENCY_MAP: Record<Locale, Currency> = {
    'en': 'USD',
    'de': 'EUR',
    'de-CH': 'CHF',
    'fr': 'EUR',
    'it': 'EUR',
    'es': 'EUR',
    'pt': 'EUR',
    'nl': 'EUR',
};

export const LOCALE_LABELS: Record<Locale, { flag: string; name: string }> = {
    'en': { flag: '🇬🇧', name: 'English' },
    'de': { flag: '🇩🇪', name: 'Deutsch' },
    'de-CH': { flag: '🇨🇭', name: 'Schwiizerdütsch' },
    'fr': { flag: '🇫🇷', name: 'Français' },
    'it': { flag: '🇮🇹', name: 'Italiano' },
    'es': { flag: '🇪🇸', name: 'Español' },
    'pt': { flag: '🇵🇹', name: 'Português' },
    'nl': { flag: '🇳🇱', name: 'Nederlands' },
};

export const useLanguageStore = create<LanguageState>()(
    persist(
        (set) => ({
            locale: 'en',
            currency: 'USD',
            isDetected: false,
            setLocale: (locale) => set({
                locale,
                currency: CURRENCY_MAP[locale] || 'USD'
            }),
            setCurrency: (currency) => set({ currency }),
            setDetected: () => set({ isDetected: true }),
        }),
        {
            name: 'number1-language',
        }
    )
);
