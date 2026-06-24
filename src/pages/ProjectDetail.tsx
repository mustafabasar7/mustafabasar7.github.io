import { lazy, Suspense, useCallback, useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { PROJECTS } from "../lib/agents";
import { config } from "../config";
import "./ProjectDetail.css";

const ModelViewer = lazy(() => import("../components/Robot/ModelViewer"));

// Deliberately slow so a visitor can follow each stage — people focus slowly.
const STEP_MS = 1200;
const WORD_MS = 55;
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// Render a document line, highlighting any «...» spans.
const DocLine = ({ line }: { line: string }) => {
  const parts = line.split(/(«[^»]*»)/g);
  return (
    <div className="pd-doc-line">
      {parts.map((p, i) =>
        p.startsWith("«") && p.endsWith("»") ? (
          <mark key={i} className="pd-doc-hit">{p.slice(1, -1)}</mark>
        ) : (
          <span key={i}>{p}</span>
        )
      )}
    </div>
  );
};

const ProjectDetail = () => {
  const { slug } = useParams();
  const index = PROJECTS.findIndex((p) => p.slug === slug);
  const project = index >= 0 ? PROJECTS[index] : null;
  const cfg = project ? config.projects.find((p) => p.id === project.configId) : null;

  const [termCount, setTermCount] = useState(0);
  const [docCount, setDocCount] = useState(0);
  const [text, setText] = useState("");
  const [phase, setPhase] = useState<"steps" | "typing" | "done">("steps");
  const [cached, setCached] = useState(false);
  const [running, setRunning] = useState(false);
  const runRef = useRef(0);
  const playedOnce = useRef(false);

  const play = useCallback(
    async (instant: boolean) => {
      if (!project) return;
      const myRun = ++runRef.current;
      const alive = () => runRef.current === myRun;
      setRunning(true);
      setCached(instant);
      setText("");
      setTermCount(0);
      setDocCount(0);
      setPhase("steps");

      if (instant) {
        setTermCount(project.terminal.length);
        setDocCount(project.document.lines.length);
        setText(project.fallback);
        setPhase("done");
        setRunning(false);
        return;
      }

      // Stage 1 — terminal steps, one slow line at a time.
      for (let i = 0; i < project.terminal.length; i++) {
        if (!alive()) return;
        setTermCount(i + 1);
        setDocCount(Math.min(i + 1, project.document.lines.length));
        await sleep(STEP_MS);
      }
      if (!alive()) return;
      setDocCount(project.document.lines.length);

      // Stage 2 — the agent's answer types out slowly.
      setPhase("typing");
      let acc = "";
      for (const w of project.fallback.match(/\s*\S+/g) ?? []) {
        if (!alive()) return;
        acc += w;
        setText(acc);
        await sleep(WORD_MS);
      }
      if (!alive()) return;
      setPhase("done");
      setRunning(false);
      playedOnce.current = true;
    },
    [project]
  );

  useEffect(() => {
    playedOnce.current = false;
    play(false);
    return () => {
      runRef.current++;
    };
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

  const chatBadge = cached ? "⚡ cached · instant" : running ? "● simulating…" : "✓ run complete";
  const chatBadgeClass = cached ? "pd-badge-cached" : running ? "pd-badge-sim" : "pd-badge-live";

  return (
    <div className="pd-page">
      <div className="pd-topbar">
        <Link to="/myworks" className="pd-back" data-cursor="disable">← All Works</Link>
        <span className="pd-tag">Interactive · simulated run + 3D</span>
      </div>

      <div className="pd-head">
        <p className="pd-category">{project.category}</p>
        <h1 className="pd-title">{project.name}</h1>
        <p className="pd-capability">{project.capability}</p>
        {cfg && <p className="pd-tech">{cfg.technologies}</p>}
        <div className="pd-metrics">
          {project.metrics.map((m, k) => (
            <span className="pd-metric" key={m} style={{ animationDelay: `${k * 0.1}s` }}>{m}</span>
          ))}
        </div>
      </div>

      <div className="pd-grid">
        <div className="pd-stage">
          <div className="pd-panel-bar">
            <span className="pd-panel-name">3D scene</span>
            <span className="pd-badge pd-badge-real">● live 3D</span>
          </div>
          <Suspense fallback={<div className="pd-stage-load">loading 3D…</div>}>
            <ModelViewer url={project.modelUrl} scale={project.modelScale} clip={project.clip} flock={project.flock} />
          </Suspense>
        </div>

        <div className="pd-workspace">
          {/* Terminal — representational, revealed step by step */}
          <div className="pd-panel pd-terminal">
            <div className="pd-panel-bar">
              <span className="pd-panel-name">terminal</span>
              <span className="pd-badge pd-badge-sim">
                {phase === "steps" && running ? `step ${termCount} / ${project.terminal.length}` : "simulated"}
              </span>
            </div>
            <div className="pd-term-body">
              {project.terminal.slice(0, termCount).map((line, i) => (
                <div className="pd-term-line" key={i}>
                  {line}
                  {running && phase === "steps" && i === termCount - 1 && <span className="pd-caret" />}
                </div>
              ))}
            </div>
          </div>

          {/* Document — representational */}
          <div className="pd-panel pd-document">
            <div className="pd-panel-bar">
              <span className="pd-panel-name">{project.document.title}</span>
              <span className="pd-badge pd-badge-sim">simulated</span>
            </div>
            <div className="pd-doc-body">
              {project.document.lines.slice(0, docCount).map((line, i) => (
                <DocLine line={line} key={i} />
              ))}
            </div>
          </div>

          {/* Agent answer — typed out slowly */}
          <div className="pd-panel pd-chat">
            <div className="pd-panel-bar">
              <span className="pd-panel-name">LangGraph action</span>
              <span className={`pd-badge ${chatBadgeClass}`}>{chatBadge}</span>
            </div>
            <div className="pd-chat-body">
              {text}
              {running && phase === "typing" && <span className="pd-caret" />}
            </div>
            <div className="pd-chat-foot">
              <button
                className="pd-run"
                onClick={() => play(playedOnce.current)}
                disabled={running}
                data-cursor="disable"
              >
                {running ? "Running…" : playedOnce.current ? "Run again ↻ (cached)" : "Run again ↻"}
              </button>
              <span className="pd-hint">
                A step-by-step simulation of the agent run. Run again → served instantly from cache.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetail;
