import { PropsWithChildren } from "react";
import "./styles/Landing.css";
import { useLang } from "../i18n/LanguageProvider";

const Landing = ({ children }: PropsWithChildren) => {
  const { c, t } = useLang();
  const nameParts = c.developer.fullName.split(" ");
  const firstName = nameParts[0] || c.developer.name;
  const lastName = nameParts.slice(1).join(" ") || "";

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
        </div>
        {children}
      </div>
    </>
  );
};

export default Landing;
