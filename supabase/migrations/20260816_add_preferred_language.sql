ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS preferred_language TEXT NOT NULL DEFAULT 'en';

CREATE INDEX IF NOT EXISTS profiles_preferred_language_idx
ON public.profiles(preferred_language);
