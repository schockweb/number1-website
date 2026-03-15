/**
 * useCurrency — detects user's region from browser timezone/locale.
 * No external API required. Works instantly on load.
 *
 * Regions supported:
 *   US   → USD, weekly
 *   CH   → CHF, weekly
 *   EU   → EUR, weekly (all other European timezones)
 */

import { useState, useEffect } from 'react';

export type Currency = 'USD' | 'CHF' | 'EUR';

export interface PricingRegion {
    currency: Currency;
    symbol: string;
    locale: string;
    label: string;              // shown in the toggle
    prices: {
        standard: number;
        premium: number;
        business: number;
    };
}

export const REGIONS: Record<Currency, PricingRegion> = {
    USD: {
        currency: 'USD',
        symbol: '$',
        locale: 'en-US',
        label: '$ USD',
        prices: { standard: 950, premium: 1650, business: 3850 },
    },
    CHF: {
        currency: 'CHF',
        symbol: 'CHF',
        locale: 'de-CH',
        label: 'CHF',
        prices: { standard: 850, premium: 1500, business: 3500 },
    },
    EUR: {
        currency: 'EUR',
        symbol: '€',
        locale: 'de-DE',
        label: '€ EUR',
        prices: { standard: 890, premium: 1490, business: 3490 },
    },
};

function detectCurrency(): Currency {
    try {
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
        const lang = navigator.language || '';

        // Switzerland — specific timezone or locale
        if (tz === 'Europe/Zurich' || lang.includes('-CH') || lang.startsWith('gsw')) {
            return 'CHF';
        }

        // United States — America/* timezones (covers all US states + territories)
        if (tz.startsWith('America/') || lang === 'en-US') {
            return 'USD';
        }

        // European timezones → EUR
        if (tz.startsWith('Europe/')) {
            return 'EUR';
        }

        // Default to USD for the rest of the world (international audience)
        return 'USD';
    } catch {
        return 'USD';
    }
}

export function useCurrency() {
    const [currency, setCurrency] = useState<Currency>('USD');
    const [detected, setDetected] = useState<Currency>('USD');
    const [ready, setReady] = useState(false);

    useEffect(() => {
        const c = detectCurrency();
        setDetected(c);
        setCurrency(c);
        setReady(true);
    }, []);

    const region = REGIONS[currency];

    const formatPrice = (amount: number) =>
        region.currency === 'CHF'
            ? `CHF ${amount.toLocaleString('de-CH')}`
            : amount.toLocaleString(region.locale, { style: 'currency', currency: region.currency, minimumFractionDigits: 0, maximumFractionDigits: 0 });

    return { currency, setCurrency, detected, region, formatPrice, ready };
}
