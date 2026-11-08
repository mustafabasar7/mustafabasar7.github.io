import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { config } from "../config";
import { useLang } from "../i18n/LanguageProvider";
import { PROJECTS, type ProjectMeta } from "../lib/agents";
import "./styles/Work.css";

type Project = (typeof config.projects)[number];

const WorkCard = ({ project, demo }: { project: Project; demo?: ProjectMeta }) => {
  const { t, p } = useLang();
  const [hover, setHover] = useState(false);
  const [typed, setTyped] = useState("");
  const line = demo?.terminal[1] ?? demo?.terminal[0] ?? "";

  useEffect(() => {
    if (!hover || !line) {
      setTyped("");
      return;
    }
    let i = 0;
    const id = window.setInterval(() => {
      i += 1;
      setTyped(line.slice(0, i));
      if (i >= line.length) window.clearInterval(id);
    }, 26);
    return () => window.clearInterval(id);
  }, [hover, line]);

  const inner = (
    <>
      <div className="work-card-image">
        <img src={project.image} alt={project.title} loading="lazy" />
        {demo && (
          <div className="work-card-peek" aria-hidden={!hover}>
            <code className="work-card-peek-line">
              {typed}
              <span className="work-card-peek-caret" />
            </code>
          </div>
        )}
      </div>
      <div className="work-card-body">
        <div className="work-card-top">
          <span className="work-card-category">{project.category}</span>
          {demo?.metrics?.[0] && (
            <span className="work-card-metric">{demo.metrics[0]}</span>
          )}
        </div>
        <h3 className="work-card-title">{project.title}</h3>
        <p className="work-card-desc">{project.description}</p>
        <div className="work-card-foot">
          <span className="work-card-tech">{project.technologies}</span>
          {demo && <span className="work-card-cta">{t("myworks.cta")}</span>}
        </div>
      </div>
    </>
  );

  return demo ? (
    <Link
      to={p(`/myworks/${demo.slug}`)}
      className={`work-card${hover ? " is-peeking" : ""}`}
      data-cursor="disable"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {inner}
    </Link>
  ) : (
    <div className="work-card" data-cursor="disable">
      {inner}
    </div>
  );
};

const Work = () => {
  const { c, t } = useLang();

  return (
    <section className="work-section" id="work">
      <div className="work-container section-container">
        <div className="work-header">
          <h2>
            {t("work.my")} <span>{t("work.word")}</span>
          </h2>
          <p>{t("myworks.intro")}</p>
        </div>

        <div className="work-grid">
          {c.projects.map((project, index) => (
            <WorkCard
              key={project.id}
              project={project}
              demo={PROJECTS[index]}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Work;
