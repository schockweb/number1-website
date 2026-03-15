import { useLanguageStore } from '@/lib/store/useLanguageStore';
import dictionaries from '@/lib/translations';

export function useTranslation() {
    const { locale, setLocale } = useLanguageStore();

    const t = (key: string): string => {
        const dict = dictionaries[locale];
        if (dict && dict[key]) return dict[key];
        // Fallback to English
        const fallback = dictionaries['en'];
        return fallback[key] || key;
    };

    return { t, locale, setLocale };
}
