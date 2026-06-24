import { lazy, Suspense, useCallback, useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { PROJECTS, streamAgent, type RunStatus, type Telemetry } from "../lib/agents";
import { config } from "../config";
import "./ProjectDetail.css";

const ModelViewer = lazy(() => import("../components/Robot/ModelViewer"));

const fmt = (n?: number) => (typeof n === "number" ? n.toLocaleString("en-US") : "—");

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

  const [text, setText] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [status, setStatus] = useState<RunStatus>("live");
  const [telemetry, setTelemetry] = useState<Telemetry | null>(null);
  const [termCount, setTermCount] = useState(0);
  const abortRef = useRef<AbortController | null>(null);
  const termTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  const runDemo = useCallback(() => {
    if (!project) return;
    abortRef.current?.abort();
    if (termTimer.current) clearInterval(termTimer.current);
    const ac = new AbortController();
    abortRef.current = ac;

    setText("");
    setStreaming(true);
    setStatus("live");
    setTelemetry(null);
    setTermCount(1);
    let n = 1;
    termTimer.current = setInterval(() => {
      n = Math.min(n + 1, project.terminal.length);
      setTermCount(n);
      if (n >= project.terminal.length && termTimer.current) clearInterval(termTimer.current);
    }, 550);

    streamAgent("project", index, "", (chunk) => setText((prev) => prev + chunk), ac.signal).then(
      (res) => {
        setStreaming(false);
        setStatus(res.status);
        setTelemetry(res.telemetry);
        setTermCount(project.terminal.length);
        if (termTimer.current) clearInterval(termTimer.current);
      }
    );
  }, [project, index]);

  useEffect(() => {
    runDemo();
    return () => {
      abortRef.current?.abort();
      if (termTimer.current) clearInterval(termTimer.current);
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

  return (
    <div className="pd-page">
      <div className="pd-topbar">
        <Link to="/myworks" className="pd-back" data-cursor="disable">← All Works</Link>
        <span className="pd-tag">Interactive · live AI + 3D</span>
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
        {/* 3D — genuinely real (three.js) */}
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
          {/* Terminal — representational */}
          <div className="pd-panel pd-terminal">
            <div className="pd-panel-bar">
              <span className="pd-panel-name">terminal</span>
              <span className="pd-badge pd-badge-sim">simulated</span>
            </div>
            <div className="pd-term-body">
              {project.terminal.slice(0, termCount).map((line, i) => (
                <div className="pd-term-line" key={i}>
                  {line}
                  {streaming && i === termCount - 1 && <span className="pd-caret" />}
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
              {project.document.lines.map((line, i) => (
                <DocLine line={line} key={i} />
              ))}
            </div>
          </div>

          {/* Chat — the genuinely live, unfakeable part */}
          <div className="pd-panel pd-chat">
            <div className="pd-panel-bar">
              <span className="pd-panel-name">LangGraph action</span>
              <span className={`pd-badge pd-badge-${status}`}>
                {streaming ? "● LIVE · DeepSeek" : status === "cached" ? "⚡ cached" : status === "demo" ? "◷ demo" : "● LIVE · DeepSeek"}
              </span>
            </div>
            <div className="pd-chat-body">
              {text}
              {streaming && <span className="pd-caret" />}
            </div>
            {telemetry && (
              <div className="pd-telemetry">
                {status === "cached" ? (
                  <span>⚡ served from cache · <b>0 new tokens</b> · {telemetry.ms}ms (instant)</span>
                ) : (
                  <span>
                    DeepSeek usage · prompt <b>{fmt(telemetry.promptTokens)}</b> tok
                    {typeof telemetry.cacheHitTokens === "number" && telemetry.cacheHitTokens > 0 && (
                      <> · cache hit <b>{fmt(telemetry.cacheHitTokens)}</b> tok</>
                    )}
                    {" · "}out <b>{fmt(telemetry.completionTokens)}</b> tok · {telemetry.ms}ms
                  </span>
                )}
              </div>
            )}
            <div className="pd-chat-foot">
              <button className="pd-run" onClick={runDemo} disabled={streaming} data-cursor="disable">
                {streaming ? "Running…" : "Run again ↻"}
              </button>
              <span className="pd-hint">Run twice — the 2nd is served from cache (0 new tokens). Token counts come straight from DeepSeek.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetail;
