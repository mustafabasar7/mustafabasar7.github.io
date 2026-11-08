import "./styles/Career.css";
import { useLang } from "../i18n/LanguageProvider";

const Career = () => {
  const { c, t } = useLang();

  return (
    <section className="career-section section-container" id="career">
      <div className="career-header">
        <h2>
          {t("career.my")} <span>{t("career.amp")}</span> {t("career.experience")}
        </h2>
      </div>

      <div className="career-grid">
        {c.experiences.map((exp, index) => (
          <article key={index} className="career-card">
            <div className="career-card-top">
              <div>
                <h3 className="career-role">{exp.position}</h3>
                <p className="career-company">{exp.company}</p>
              </div>
              <span className="career-period">{exp.period}</span>
            </div>

            <p className="career-desc">{exp.description}</p>

            <div className="career-tags">
              {exp.technologies.map((tech) => (
                <span key={tech} className="career-tag">
                  {tech}
                </span>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};

export default Career;
