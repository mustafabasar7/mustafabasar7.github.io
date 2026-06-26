import { createContext, useCallback, useContext, useEffect, useMemo, type PropsWithChildren } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { config as configEN } from "../config";
import { configTR } from "../config.tr";
import { UI, type Lang, type UIKey } from "./strings";

interface LanguageValue {
  lang: Lang;
  setLang: (l: Lang) => void;
  toggle: () => void;
  /** Build an in-app path with the current language prefix, e.g. p("/myworks"). */
  p: (path: string) => string;
  /** Localized `config` (same shape for both languages). */
  c: typeof configEN;
  /** Translate a UI string key. */
  t: (key: UIKey) => string;
}

const LanguageContext = createContext<LanguageValue | null>(null);

const STORAGE_KEY = "site-lang";

export function storedLang(): Lang {
  if (typeof window === "undefined") return "en";
  const saved = window.localStorage.getItem(STORAGE_KEY);
  return saved === "tr" ? "tr" : "en"; // EN default
}

// The language is the first path segment (/en/... or /tr/...). For any path
// without a valid prefix we fall back to the stored preference.
function langFromPath(pathname: string): Lang {
  const seg = pathname.split("/")[1];
  return seg === "tr" || seg === "en" ? seg : storedLang();
}

export const LanguageProvider = ({ children }: PropsWithChildren) => {
  const location = useLocation();
  const navigate = useNavigate();
  const lang = langFromPath(location.pathname);

  // Keep the stored preference in sync with the URL.
  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      /* ignore storage failures */
    }
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = useCallback(
    (l: Lang) => {
      const parts = location.pathname.split("/");
      if (parts[1] === "en" || parts[1] === "tr") parts[1] = l;
      else parts.splice(1, 0, l); // no prefix yet -> insert one
      const next = parts.join("/") || `/${l}`;
      navigate(next + location.search + location.hash);
    },
    [location, navigate]
  );

  const toggle = useCallback(() => setLang(lang === "en" ? "tr" : "en"), [lang, setLang]);

  const value = useMemo<LanguageValue>(
    () => ({
      lang,
      setLang,
      toggle,
      p: (path: string) => `/${lang}${path === "/" ? "" : path}`,
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
