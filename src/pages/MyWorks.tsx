import { Link } from "react-router-dom";
import { config } from "../config";
import { PROJECTS } from "../lib/agents";
import "./MyWorks.css";

const MyWorks = () => {
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
          agents with 3D animations playing alongside. Click any card to run it.
        </p>
      </div>

      <div className="myworks-grid">
        {config.projects.map((project, index) => {
          const demo = PROJECTS[index];
          const card = (
            <>
              <div className="myworks-card-number">0{index + 1}</div>
              <div className="myworks-card-image">
                <img src={project.image} alt={project.title} />
              </div>
              <div className="myworks-card-info">
                <h3>{project.title}</h3>
                <p className="myworks-card-category">{project.category}</p>
                <p className="myworks-card-description">{project.description}</p>
                <p className="myworks-card-tech">{project.technologies}</p>
                {demo && (
                  <span className="myworks-card-cta">▶ Run live demo · AI + 3D</span>
                )}
              </div>
            </>
          );
          return demo ? (
            <Link
              to={`/myworks/${demo.slug}`}
              className="myworks-card myworks-card-link"
              key={project.id}
              data-cursor="disable"
            >
              {card}
            </Link>
          ) : (
            <div className="myworks-card" key={project.id} data-cursor="disable">
              {card}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MyWorks;
