import { type Currency } from './store/useLanguageStore';

const CONVERSION_RATES: Record<Currency, number> = {
    USD: 1,
    EUR: 0.94,
    CHF: 0.96,
    GBP: 0.82,
};

const CURRENCY_FORMATTERS: Record<Currency, Intl.NumberFormat> = {
    USD: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }),
    EUR: new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0, maximumFractionDigits: 0 }),
    CHF: new Intl.NumberFormat('de-CH', { style: 'currency', currency: 'CHF', minimumFractionDigits: 0, maximumFractionDigits: 0 }),
    GBP: new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', minimumFractionDigits: 0, maximumFractionDigits: 0 }),
};

export const convertAndFormatPrice = (usdPrice: number, targetCurrency: Currency): string => {
    const rate = CONVERSION_RATES[targetCurrency] || 1;
    const converted = usdPrice * rate;

    // Aesthetic rounding: for thousands, round to nearest 10 or 50 if it looks "clean" 
    // but for now let's just use the converted amount.
    return CURRENCY_FORMATTERS[targetCurrency].format(converted);
};
