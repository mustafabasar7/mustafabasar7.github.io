import { useState } from "react";
import type Lenis from "lenis";
import { useLang } from "../i18n/LanguageProvider";
import LangToggle from "../i18n/LangToggle";
import "./styles/Navbar.css";

export const lenis: Lenis | null = null;

const Navbar = () => {
  const { c, t } = useLang();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="site-header">
      <div className="site-header-inner">
        <a href="#landingDiv" className="navbar-brand" data-cursor="disable">
          <span className="navbar-brand-mark">MB</span>
          <span className="navbar-brand-name">{c.developer.fullName}</span>
        </a>

        <nav
          id="mobile-navigation"
          className={mobileMenuOpen ? "site-nav site-nav-open" : "site-nav"}
        >
          <a href="#work" onClick={() => setMobileMenuOpen(false)}>
            {t("nav.work")}
          </a>
          <a href="#career" onClick={() => setMobileMenuOpen(false)}>
            {t("nav.career")}
          </a>
          <a href="#contact" onClick={() => setMobileMenuOpen(false)}>
            {t("nav.contact")}
          </a>
        </nav>

        <div className="site-header-actions">
          <a
            href="/Mustafa-Basar-CV.pdf"
            className="navbar-cv"
            data-cursor="disable"
            download
          >
            CV ↓
          </a>
          <LangToggle />
          <button
            type="button"
            className={mobileMenuOpen ? "mobile-menu-toggle is-open" : "mobile-menu-toggle"}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-navigation"
            aria-label={mobileMenuOpen ? t("nav.closeMenu") : t("nav.openMenu")}
            onClick={() => setMobileMenuOpen((open) => !open)}
          >
            <span />
            <span />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
