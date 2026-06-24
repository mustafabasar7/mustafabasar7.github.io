import { lazy, Suspense, useCallback, useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { PROJECTS, streamAgent, type RunStatus } from "../lib/agents";
import { config } from "../config";
import "./ProjectDetail.css";

const RobotSolo = lazy(() => import("../components/Robot/RobotSolo"));

const STATUS_LABEL: Record<RunStatus, string> = {
  live: "● live · DeepSeek",
  cached: "⚡ cached · 0 new tokens",
  demo: "◷ demo mode",
};

const ProjectDetail = () => {
  const { slug } = useParams();
  const index = PROJECTS.findIndex((p) => p.slug === slug);
  const project = index >= 0 ? PROJECTS[index] : null;
  const cfg = project ? config.projects.find((p) => p.id === project.configId) : null;

  const [text, setText] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [status, setStatus] = useState<RunStatus>("live");
  const [activeStep, setActiveStep] = useState(-1);
  const abortRef = useRef<AbortController | null>(null);
  const stepTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  const runDemo = useCallback(() => {
    if (!project) return;
    abortRef.current?.abort();
    if (stepTimer.current) clearInterval(stepTimer.current);
    const ac = new AbortController();
    abortRef.current = ac;

    setText("");
    setStreaming(true);
    setStatus("live");
    setActiveStep(0);
    let step = 0;
    stepTimer.current = setInterval(() => {
      step = Math.min(step + 1, project.steps.length - 1);
      setActiveStep(step);
    }, 1100);

    streamAgent(
      "project",
      index,
      "",
      (chunk) => setText((prev) => prev + chunk),
      ac.signal
    ).then((s) => {
      setStreaming(false);
      setStatus(s);
      setActiveStep(project.steps.length);
      if (stepTimer.current) clearInterval(stepTimer.current);
    });
  }, [project, index]);

  useEffect(() => {
    runDemo();
    return () => {
      abortRef.current?.abort();
      if (stepTimer.current) clearInterval(stepTimer.current);
    };
    // re-run when the slug changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  if (!project) {
    return (
      <div className="pd-page">
        <div className="pd-notfound">
          <h1>Project not found</h1>
          <Link to="/myworks" className="pd-back" data-cursor="disable">← All Works</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pd-page">
      <div className="pd-topbar">
        <Link to="/myworks" className="pd-back" data-cursor="disable">← All Works</Link>
        <span className="pd-tag">Interactive · live AI + 3D</span>
      </div>

      <div className="pd-grid">
        <div className="pd-stage">
          <Suspense fallback={<div className="pd-stage-load">loading 3D…</div>}>
            <RobotSolo clips={project.clips} />
          </Suspense>
          <div className="pd-clips">
            {project.clips.map((c) => (
              <span className="pd-clip" key={c}>{c}</span>
            ))}
          </div>
        </div>

        <div className="pd-panel">
          <p className="pd-category">{project.category}</p>
          <h1 className="pd-title">{project.name}</h1>
          <p className="pd-capability">{project.capability}</p>
          {cfg && <p className="pd-tech">{cfg.technologies}</p>}

          <div className="pd-metrics">
            {project.metrics.map((m, k) => (
              <span className="pd-metric" key={m} style={{ animationDelay: `${k * 0.1}s` }}>{m}</span>
            ))}
          </div>

          <div className="pd-steps">
            {project.steps.map((s, k) => (
              <div
                className={`pd-step ${k < activeStep ? "done" : ""} ${k === activeStep ? "active" : ""}`}
                key={s}
              >
                <span className="pd-step-dot" />
                <span className="pd-step-label">{s}</span>
              </div>
            ))}
          </div>

          <div className="pd-action">
            <div className="pd-action-head">
              <span className="pd-action-title">LangGraph action — live</span>
              <span className={`pd-status pd-status-${status}`}>
                {streaming ? "● live · DeepSeek" : STATUS_LABEL[status]}
              </span>
            </div>
            <div className="pd-output">
              {text}
              {streaming && <span className="pd-caret" />}
            </div>
            <button className="pd-run" onClick={runDemo} disabled={streaming} data-cursor="disable">
              {streaming ? "Running…" : "Run again ↻"}
            </button>
            <p className="pd-hint">Run it twice — the second pass is served from cache (0 new tokens).</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetail;
