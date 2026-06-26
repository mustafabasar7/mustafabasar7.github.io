import { useEffect, useState, type CSSProperties } from "react";
import "./styles/Loading.css";
import { useLoading } from "../context/LoadingProvider";
import { useLang } from "../i18n/LanguageProvider";

import Marquee from "react-fast-marquee";

const MARQUEE_TERMS = ["Agentic AI", "LangGraph", "Multi-Agent Systems", "HITL Governance", "State Machines"];

const Loading = ({ percent }: { percent: number }) => {
  const { setIsLoading } = useLoading();
  const { t } = useLang();
  const [loaded, setLoaded] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [clicked, setClicked] = useState(false);

  useEffect(() => {
    if (percent < 100) return;
    const timers = [
      window.setTimeout(() => setLoaded(true), 300),
      window.setTimeout(() => setIsLoaded(true), 900),
    ];
    return () => timers.forEach(clearTimeout);
  }, [percent]);

  useEffect(() => {
    import("./utils/initialFX").then((module) => {
      if (isLoaded) {
        setClicked(true);
        setTimeout(() => {
          if (module.initialFX) {
            module.initialFX();
          }
          setIsLoading(false);
        }, 600);
      }
    });
  }, [isLoaded]);

  return (
    <>
      <div className="loading-header">
        <a href="/#" className="loader-title" data-cursor="disable">
          Mustafa Başar
        </a>
        <span className="loader-tag">{t("hero.role")}</span>
      </div>

      <div className="loading-screen">
        <div className="loading-marquee">
          <Marquee speed={45} gradient={false} autoFill>
            {MARQUEE_TERMS.map((term, i) => (
              <span key={i}>{term}</span>
            ))}
          </Marquee>
        </div>

        <div
          className={`loading-wrap ${clicked ? "loading-clicked" : ""}`}
          style={{ "--p": Math.min(100, Math.max(0, percent)) } as CSSProperties}
        >
          <div className={`loading-button ${loaded ? "loading-complete" : ""}`}>
            <div className="loading-ring" />
            <div className="loading-core">
              <span className="loading-pct">
                {Math.round(percent)}
                <i>%</i>
              </span>
              <span className="loading-status">
                {loaded ? t("loading.welcome") : t("loading.loading")}
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Loading;
