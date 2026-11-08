import "./styles/Landing.css";
import { useLang } from "../i18n/LanguageProvider";

const Landing = () => {
  const { c, t } = useLang();

  return (
    <section className="landing-section" id="landingDiv">
      <div className="landing-glow" aria-hidden="true" />
      <div className="landing-container">
        <div className="landing-role-pill">
          <span className="landing-role-dot" />
          <span>{t("hero.role")} · LangGraph &amp; Multi-Agent Systems</span>
        </div>

        <h1 className="landing-title">{c.developer.fullName}</h1>

        <p className="landing-subtitle">{c.about.description}</p>

        <div className="landing-actions">
          <a className="landing-btn-primary" href="#work" data-cursor="disable">
            {t("work.tryLive")}
          </a>
          <a
            className="landing-btn-secondary"
            href="/Mustafa-Basar-CV.pdf"
            download
            data-cursor="disable"
          >
            CV ↓
          </a>
          <a
            className="landing-btn-secondary"
            href={c.contact.github}
            target="_blank"
            rel="noopener noreferrer"
            data-cursor="disable"
          >
            GitHub ↗
          </a>
        </div>
      </div>
    </section>
  );
};

export default Landing;
