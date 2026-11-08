import { Fragment, PropsWithChildren, ReactNode, useEffect } from "react";
import About from "./About";
import Career from "./Career";
import Contact from "./Contact";
import Landing from "./Landing";
import Navbar from "./Navbar";
import SocialIcons from "./SocialIcons";
import WhatIDo from "./WhatIDo";
import Work from "./Work";
import TechStackNew from "./TechStackNew";
import CallToAction from "./CallToAction";
import RobotSection from "./Robot/RobotSection";
import mountTextReveals from "./utils/splitText";
import { Tier, useTier } from "../lib/viewport";

// Section manifest: the only place that knows which sections exist and in
// what order each tier shows them. Phones lead with the robot + work;
// tablet/desktop lead with the story.
const SECTIONS: Record<string, () => ReactNode> = {
  robot: () => <RobotSection />,
  work: () => <Work />,
  about: () => <About />,
  whatido: () => <WhatIDo />,
  career: () => <Career />,
};

const ORDER: Record<Tier, string[]> = {
  phone: ["robot", "work", "about", "whatido", "career"],
  tablet: ["about", "whatido", "career", "robot", "work"],
  desktop: ["about", "whatido", "career", "robot", "work"],
};

const MainContainer = ({ children }: PropsWithChildren) => {
  const tier = useTier();

  useEffect(() => {
    return mountTextReveals();
  }, []);

  return (
    <div className="container-main">
      <Navbar />
      <SocialIcons />
      {tier === "desktop" && children}
      <div className="container-main">
        <Landing>{tier === "phone" ? children : null}</Landing>
        {ORDER[tier].map((id) => (
          <Fragment key={id}>{SECTIONS[id]()}</Fragment>
        ))}
        <TechStackNew />
        <CallToAction />
        <Contact />
      </div>
    </div>
  );
};

export default MainContainer;

