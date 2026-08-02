import { PropsWithChildren, useEffect, useState } from "react";
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
import setSplitText from "./utils/splitText";

const MainContainer = ({ children }: PropsWithChildren) => {
  const [isDesktopView, setIsDesktopView] = useState<boolean>(
    window.innerWidth > 1024
  );
  const [isMobile, setIsMobile] = useState<boolean>(window.innerWidth <= 768);

  useEffect(() => {
    const resizeHandler = () => {
      setSplitText();
      setIsDesktopView(window.innerWidth > 1024);
      setIsMobile(window.innerWidth <= 768);
    };
    resizeHandler();
    window.addEventListener("resize", resizeHandler);
    return () => {
      window.removeEventListener("resize", resizeHandler);
    };
  }, [isDesktopView]);

  return (
    <div className="container-main">
      <Navbar />
      <SocialIcons />
      {isDesktopView && children}
      <div className="container-main">
        <Landing>{isMobile ? children : null}</Landing>
        {isMobile ? (
          <>
            <Work />
            <RobotSection />
            <About />
            <WhatIDo />
            <Career />
          </>
        ) : (
          <>
            <About />
            <WhatIDo />
            <Career />
            <RobotSection />
            <Work />
          </>
        )}
        <TechStackNew />
        <CallToAction />
        <Contact />
      </div>
    </div>
  );
};

export default MainContainer;
