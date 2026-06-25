import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { config } from "../config";
import { PROJECTS, type ProjectMeta } from "../lib/agents";
import "./MyWorks.css";

type Project = (typeof config.projects)[number];

// A live "peek" over the card image: on hover, the agent's first command types
// itself out and the metric chips animate in — a taste of the detail page.
const WorkCard = ({ project, demo }: { project: Project; demo?: ProjectMeta }) => {
  const [hover, setHover] = useState(false);
  const [typed, setTyped] = useState("");
  const line = demo?.terminal[1] ?? demo?.terminal[0] ?? "";

  useEffect(() => {
    if (!hover || !line) { setTyped(""); return; }
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
      <div className="myworks-card-image">
        <img src={project.image} alt={project.title} />
        {demo && (
          <div className="myworks-peek" aria-hidden={!hover}>
            <div className="myworks-peek-scan" />
            <code className="myworks-peek-line">
              {typed}
              <span className="myworks-peek-caret" />
            </code>
            <div className="myworks-peek-chips">
              {demo.metrics.map((m, k) => (
                <span className="myworks-peek-chip" key={m} style={{ transitionDelay: `${k * 70}ms` }}>
                  {m}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
      <div className="myworks-card-info">
        <h3>{project.title}</h3>
        <p className="myworks-card-category">{project.category}</p>
        <p className="myworks-card-description">{project.description}</p>
        <p className="myworks-card-tech">{project.technologies}</p>
        {demo && <span className="myworks-card-cta">▶ Run live demo · AI + 3D</span>}
      </div>
    </>
  );

  const handlers = {
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
  };

  return demo ? (
    <Link
      to={`/myworks/${demo.slug}`}
      className={`myworks-card myworks-card-link${hover ? " is-peeking" : ""}`}
      data-cursor="disable"
      {...handlers}
    >
      {inner}
    </Link>
  ) : (
    <div className="myworks-card" data-cursor="disable">
      {inner}
    </div>
  );
};

const MyWorks = () => {
  // The home page locks `body { overflow: hidden }` for its own scroller; this
  // grid is taller than the viewport, so re-enable native scrolling here.
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "auto";
    return () => { document.body.style.overflow = prev; };
  }, []);

  return (
    <div className="myworks-page">
      <div className="myworks-header">
        <Link to="/" className="back-button" data-cursor="disable">
          ← Back to Home
        </Link>
        <h1>
          All <span>Works</span>
        </h1>
        <p>
          Every project is a live, interactive demo — real DeepSeek-powered LangGraph
          agents with playable 3D animations alongside. Hover to peek, click to run it.
        </p>
      </div>

      <div className="myworks-grid">
        {config.projects.map((project, index) => (
          <WorkCard key={project.id} project={project} demo={PROJECTS[index]} />
        ))}
      </div>
    </div>
  );
};

export default MyWorks;
