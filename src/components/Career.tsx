import "./styles/Career.css";
import { useLang } from "../i18n/LanguageProvider";

const Career = () => {
  const { c, t } = useLang();

  const getDisplayYear = (period: string) => {
    if (period.includes("Present") || period.includes("Günümüz")) return t("career.now");
    if (period.includes(" - ")) {
      return period.split(" - ")[0]; // Show start year for ranges
    }
    return period; // Single year like "2021"
  };

  return (
    <div className="career-section section-container">
      <div className="career-container">
        <h2>
          {t("career.my")} <span>{t("career.amp")}</span>
          <br /> {t("career.experience")}
        </h2>
        <div className="career-info">
          <div className="career-timeline">
            <div className="career-dot"></div>
          </div>
          {c.experiences.map((exp, index) => (
            <div key={index} className="career-info-box">
              <div className="career-info-in">
                <div className="career-role">
                  <h4>{exp.position}</h4>
                  <h5>{exp.company}</h5>
                </div>
                <h3>{getDisplayYear(exp.period)}</h3>
              </div>
              <p>{exp.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Career;
