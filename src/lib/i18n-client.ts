import fr from '../../contenu/i18n/fr.json';
import en from '../../contenu/i18n/en.json';
export const texts = (lang: string) => (lang === 'en' ? en : fr);
