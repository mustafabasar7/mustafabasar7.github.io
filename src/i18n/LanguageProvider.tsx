import { createContext, useCallback, useContext, useEffect, useMemo, useState, type PropsWithChildren } from "react";
import { config as configEN } from "../config";
import { configTR } from "../config.tr";
import { UI, type Lang, type UIKey } from "./strings";

interface LanguageValue {
  lang: Lang;
  setLang: (l: Lang) => void;
  toggle: () => void;
  /** Localized `config` (same shape for both languages). */
  c: typeof configEN;
  /** Translate a UI string key. */
  t: (key: UIKey) => string;
}

const LanguageContext = createContext<LanguageValue | null>(null);

const STORAGE_KEY = "site-lang";

function initialLang(): Lang {
  if (typeof window === "undefined") return "en";
  const saved = window.localStorage.getItem(STORAGE_KEY);
  return saved === "tr" ? "tr" : "en"; // EN default
}

export const LanguageProvider = ({ children }: PropsWithChildren) => {
  const [lang, setLangState] = useState<Lang>(initialLang);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    try {
      window.localStorage.setItem(STORAGE_KEY, l);
    } catch {
      /* ignore storage failures */
    }
  }, []);

  const toggle = useCallback(() => setLang(lang === "en" ? "tr" : "en"), [lang, setLang]);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const value = useMemo<LanguageValue>(
    () => ({
      lang,
      setLang,
      toggle,
      c: lang === "tr" ? configTR : configEN,
      t: (key: UIKey) => UI[lang][key] ?? UI.en[key] ?? key,
    }),
    [lang, setLang, toggle]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export function useLang(): LanguageValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLang must be used within LanguageProvider");
  return ctx;
}
