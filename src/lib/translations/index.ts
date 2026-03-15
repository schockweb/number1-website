import type { Locale } from '@/lib/store/useLanguageStore';
import en from './en';
import de from './de';
import deCH from './de-CH';
import fr from './fr';
import it from './it';
import es from './es';
import pt from './pt';
import nl from './nl';

const dictionaries: Record<Locale, Record<string, string>> = {
    en,
    de,
    'de-CH': deCH,
    fr,
    it,
    es,
    pt,
    nl,
};

export default dictionaries;
