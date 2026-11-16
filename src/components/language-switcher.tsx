"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";

import { translations, type Dictionary, type Language } from "@/lib/i18n";

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

type I18nContextValue = {
  lang: Language;
  setLang: (lang: Language) => void;
  t: Dictionary;
};

const I18nContext = createContext<I18nContextValue>({
  lang: "en",
  setLang: () => {},
  t: translations.en,
});

export function useI18n() {
  return useContext(I18nContext);
}

// ---------------------------------------------------------------------------
// Provider — wraps the app (or the workspace section)
// ---------------------------------------------------------------------------

function readLangCookie(): Language {
  if (typeof document === "undefined") return "en";
  const match = document.cookie.match(
    /(?:^|;\s*)resort_lang=([a-z]{2})/i,
  );
  return match && match[1] === "tr" ? "tr" : "en";
}

export function LanguageProvider({
  children,
  initialLang,
}: {
  children: ReactNode;
  initialLang?: Language;
}) {
  const [lang, setLangState] = useState<Language>(
    initialLang ?? readLangCookie(),
  );

  const setLang = useCallback((next: Language) => {
    setLangState(next);
    try {
      document.cookie = `resort_lang=${next}; path=/; max-age=31536000; SameSite=Lax`;
    } catch {
      // SSR or cookie-blocked — ignore
    }
  }, []);

  const t = translations[lang];

  return (
    <I18nContext.Provider value={{ lang, setLang, t }}>
      {children}
    </I18nContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// Toggle pill — place in topbar and login page
// ---------------------------------------------------------------------------

export function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const { lang, setLang } = useI18n();
  const isTr = lang === "tr";

  return (
    <div
      className="lang-switcher"
      role="radiogroup"
      aria-label="Language"
    >
      <button
        type="button"
        role="radio"
        aria-checked={!isTr}
        onClick={() => setLang("en")}
        className={`lang-btn ${!isTr ? "lang-btn-active" : ""}`}
        data-compact={compact || undefined}
        aria-label="English"
        title="English"
      >
        <span aria-hidden="true">🇬🇧</span>
        <span>EN</span>
      </button>
      <button
        type="button"
        role="radio"
        aria-checked={isTr}
        onClick={() => setLang("tr")}
        className={`lang-btn ${isTr ? "lang-btn-active" : ""}`}
        data-compact={compact || undefined}
        aria-label="Türkçe"
        title="Türkçe"
      >
        <span aria-hidden="true">🇹🇷</span>
        <span>TR</span>
      </button>
    </div>
  );
}
