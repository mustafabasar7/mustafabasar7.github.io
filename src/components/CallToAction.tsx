import { useLang } from "../i18n/LanguageProvider";
import "./styles/CallToAction.css";

const CallToAction = () => {
  const { c, t } = useLang();
  return (
    <div className="cta-section">
      <div className="cta-buttons">
        <a
          href={c.contact.linkedin}
          target="_blank"
          rel="noopener noreferrer"
          className="cta-btn cta-btn-hire"
          data-cursor="disable"
        >
          {t("cta.hireMe")}
        </a>
      </div>
    </div>
  );
};

export default CallToAction;
