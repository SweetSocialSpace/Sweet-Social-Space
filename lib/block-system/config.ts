export const BLOCK_CONFIG = Object.freeze({
  DEFAULT_COUNTRY: 'US',
  FALLBACK_CITY: '',
  STORAGE_KEYS: Object.freeze({
    ZIP: 'user_zip',
    CITY: 'user_city',
  }),
  NEVER_SHOW: 'YOUR BLOCK', // banned string
}) as const
