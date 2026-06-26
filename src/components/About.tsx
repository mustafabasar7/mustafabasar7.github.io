import "./styles/About.css";
import { useLang } from "../i18n/LanguageProvider";

const About = () => {
  const { c } = useLang();
  return (
    <div className="about-section" id="about">
      <div className="about-portrait">
        <img src="/images/mustafa-portrait.png" alt={c.developer.fullName} />
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
