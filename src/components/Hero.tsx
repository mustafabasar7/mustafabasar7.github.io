import { HERO } from "./heroConfig";
import CharacterModel from "./Character";
import RobotScene from "./Robot/RobotScene";

const Hero = () => (HERO === "robot" ? <RobotScene /> : <CharacterModel />);

export default Hero;
