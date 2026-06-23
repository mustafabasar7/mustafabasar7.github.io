import { lazy, Suspense, useEffect, useRef, useState } from "react";
import "./RobotSection.css";

const RobotScene = lazy(() => import("./RobotScene"));

// A titled mid-page section showcasing the multi-agent orchestration scene.
// Desktop-only (the 3D scene is heavy); mobile sees nothing here.
const RobotSection = () => {
  const [isDesktop] = useState(() => window.innerWidth > 1024);
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);

  // Mount the canvas only once the section approaches the viewport.
  useEffect(() => {
    if (!isDesktop || !ref.current) return;
    const el = ref.current;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      },
      { rootMargin: "300px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [isDesktop]);

  if (!isDesktop) return null;

  return (
    <section className="robot-section" ref={ref}>
      <div className="robot-section-head">
        <h2>
          How I <span>orchestrate</span>
        </h2>
        <p>A supervisor agent delegating to specialized workers — security, document analysis, and code.</p>
      </div>
      <div className="robot-section-stage">
        {visible && (
          <Suspense fallback={null}>
            <RobotScene />
          </Suspense>
        )}
      </div>
    </section>
  );
};

export default RobotSection;
