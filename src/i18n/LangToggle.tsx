import { useLang } from "./LanguageProvider";
import "./LangToggle.css";

// EN/TR pill. Reused in the home navbar and on the /myworks pages (which have no
// navbar of their own), so the language is switchable everywhere.
const LangToggle = ({ className = "" }: { className?: string }) => {
  const { lang, toggle } = useLang();
  return (
    <button
      className={`lang-toggle ${className}`.trim()}
      onClick={toggle}
      data-cursor="disable"
      aria-label="Toggle language"
    >
      <span className={lang === "en" ? "is-active" : ""}>EN</span>
      <span className="lang-toggle-sep">/</span>
      <span className={lang === "tr" ? "is-active" : ""}>TR</span>
    </button>
  );
};

export default LangToggle;
