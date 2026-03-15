import { NextResponse } from 'next/server';
import type { Locale } from '@/lib/store/useLanguageStore';

const COUNTRY_TO_LOCALE: Record<string, Locale> = {
    // English-speaking
    US: 'en', GB: 'en', AU: 'en', NZ: 'en', IE: 'en', CA: 'en', ZA: 'en',
    // Switzerland
    CH: 'de-CH',
    // German-speaking
    DE: 'de', AT: 'de', LI: 'de',
    // French-speaking
    FR: 'fr', BE: 'fr', LU: 'fr', MC: 'fr',
    // Italian
    IT: 'it', SM: 'it', VA: 'it',
    // Spanish
    ES: 'es', MX: 'es', AR: 'es', CO: 'es', CL: 'es', PE: 'es',
    // Portuguese
    PT: 'pt', BR: 'pt', AO: 'pt', MZ: 'pt',
    // Dutch
    NL: 'nl', SR: 'nl',
};

const COUNTRY_TO_CURRENCY: Record<string, string> = {
    US: 'USD',
    GB: 'GBP',
    CH: 'CHF',
    // Eurozone
    DE: 'EUR', FR: 'EUR', IT: 'EUR', ES: 'EUR', NL: 'EUR', AT: 'EUR', BE: 'EUR', IE: 'EUR', PT: 'EUR', GR: 'EUR', FI: 'EUR', EE: 'EUR', LV: 'EUR', LT: 'EUR', SK: 'EUR', SI: 'EUR', LU: 'EUR', MT: 'EUR', CY: 'EUR',
};

export async function GET() {
    try {
        const res = await fetch('http://ip-api.com/json/?fields=countryCode', {
            next: { revalidate: 0 },
        });

        if (!res.ok) {
            return NextResponse.json({ locale: 'en', currency: 'USD' });
        }

        const data = await res.json();
        const countryCode: string = data.countryCode || '';
        const locale = COUNTRY_TO_LOCALE[countryCode] || 'en';
        const currency = COUNTRY_TO_CURRENCY[countryCode] || 'USD';

        return NextResponse.json({ locale, currency });
    } catch {
        return NextResponse.json({ locale: 'en', currency: 'USD' });
    }
}

