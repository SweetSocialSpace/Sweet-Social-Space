export const locales = ['en', 'es', 'fr', 'de', 'zh'] as const;
export const defaultLocale = 'en' as const;

export type Locale = (typeof locales)[number];
