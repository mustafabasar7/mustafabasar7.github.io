import Career from "./Career";
import Contact from "./Contact";
import Landing from "./Landing";
import Navbar from "./Navbar";
import Work from "./Work";
import RobotSection from "./Robot/RobotSection";

const MainContainer = () => {
  return (
    <div className="container-main">
      <Navbar />
      <Landing />
      <RobotSection />
      <Work />
      <Career />
      <Contact />
    </div>
  );
};

export default MainContainer;
