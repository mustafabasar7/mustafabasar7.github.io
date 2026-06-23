import { PropsWithChildren } from "react";
import "./styles/Landing.css";
import { config } from "../config";
import AgentGraph from "./AgentGraph";

const Landing = ({ children }: PropsWithChildren) => {
  const nameParts = config.developer.fullName.split(" ");
  const firstName = nameParts[0] || config.developer.name;
  const lastName = nameParts.slice(1).join(" ") || "";

  return (
    <>
      <div className="landing-section" id="landingDiv">
        <div className="landing-container">
          <div className="landing-intro">
            <h2>Hello! I'm</h2>
            <h1>
              {firstName.toUpperCase()}
              {' '}
              <br />
              {lastName && <span>{lastName.toUpperCase()}</span>}
            </h1>
          </div>
          <div className="landing-info">
            <h3>An</h3>
            <h2 className="landing-info-h2">
              <div className="landing-h2-1">AI Solutions Engineer</div>
            </h2>
            <h2>
              <div className="landing-h2-info">Agentic AI Architect</div>
            </h2>
          </div>
          {/* Mobile hero - animated agent graph, shows only where the 3D character is hidden */}
          <AgentGraph />
        </div>
        {children}
      </div>
    </>
  );
};

export default Landing;
