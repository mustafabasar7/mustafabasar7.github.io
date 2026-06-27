import "./styles/About.css";
import { useLang } from "../i18n/LanguageProvider";

const About = () => {
  const { c, t } = useLang();
  return (
    <div className="about-section" id="about">
      <div className="about-portrait">
        <img src="/images/about-mustafa.jpg" alt={c.developer.fullName} />
        <span className="about-portrait-caption">{t("about.caption")}</span>
      </div>
      <div className="about-me">
        <h3 className="title">{c.about.title}</h3>
        <p className="para">
          {c.about.description}
        </p>
      </div>
    </div>
  );
};

export default About;
