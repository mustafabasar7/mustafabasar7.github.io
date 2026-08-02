import { PropsWithChildren, useEffect, useState } from "react";
import "./styles/Landing.css";
import { useLang } from "../i18n/LanguageProvider";

const Landing = ({ children }: PropsWithChildren) => {
  const { c, lang, t } = useLang();
  const [isMobile, setIsMobile] = useState(() => window.innerWidth <= 768);
  const nameParts = c.developer.fullName.split(" ");
  const firstName = nameParts[0] || c.developer.name;
  const lastName = nameParts.slice(1).join(" ") || "";

  useEffect(() => {
    const media = window.matchMedia("(max-width: 768px)");
    const update = () => setIsMobile(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  return (
    <>
      <div className="landing-section" id="landingDiv">
        <div className="landing-container">
          <div className="landing-intro">
            <h2>{t("hero.hello")}</h2>
            <h1>
              {firstName.toUpperCase()}
              {' '}
              <br />
              {lastName && <span>{lastName.toUpperCase()}</span>}
            </h1>
          </div>
          {isMobile && children && (
            <div className="landing-mobile-3d">
              <div className="landing-mobile-3d-badge">
                <span className="landing-mobile-3d-dot" />
                {t("hero.interactive3d")}
              </div>
              <div className="landing-mobile-3d-hint">↔ {t("hero.control3d")}</div>
              {children}
            </div>
          )}
          <div className="landing-info">
            <h3>{t("hero.an")}</h3>
            <h2 className="landing-info-h2">
              {(() => {
                const words = t("hero.role").split(" ");
                const lead = words.slice(0, -1).join(" ");
                const last = words[words.length - 1];
                return (
                  <>
                    <div className="landing-h2-1">{lead}</div>
                    <div className="landing-h2-1 landing-h2-line2">{last}</div>
                  </>
                );
              })()}
            </h2>
          </div>
          {isMobile && (
            <div className="landing-mobile-actions">
              <a className="landing-mobile-primary" href={`/${lang}/myworks`}>
                {t("hero.viewWork")}
              </a>
              <a className="landing-mobile-secondary" href="/Mustafa-Basar-CV.pdf" download>
                CV ↓
              </a>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Landing;
