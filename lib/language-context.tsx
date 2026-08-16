export function LanguageProvider({ children }: any) {
  const getInitialLanguage = (): Language => {
    if (typeof window === "undefined") return "en";

    const saved = localStorage.getItem("sss_language") as Language;
    return saved && LANGUAGE_NAMES[saved] ? saved : "en";
  };

  const [language, setLanguageState] = useState<Language>(getInitialLanguage);

  useEffect(() => {
    document.documentElement.lang = language;

    const rtl = ["ar", "he", "fa", "ur"];
    document.documentElement.dir = rtl.includes(language) ? "rtl" : "ltr";

    localStorage.setItem("sss_language", language);
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        languageName: LANGUAGE_NAMES[language]
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}
