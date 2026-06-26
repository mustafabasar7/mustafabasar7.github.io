import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { PROJECTS, streamAgent, type RunStatus, type Telemetry } from "../lib/agents";
import { PROJECTS_TR } from "../lib/agents.tr";
import { useLang } from "../i18n/LanguageProvider";
import LangToggle from "../i18n/LangToggle";
import ProjectGraph from "../components/Robot/ProjectGraph";
import "./ProjectDetail.css";

// Base pace of the terminal sim - divided by the chosen speed.
const STEP_MS = 1200;
const SPEEDS = [0.5, 1, 2];

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
  const { lang, c, t, p } = useLang();
  const index = PROJECTS.findIndex((p) => p.slug === slug);
  const base = index >= 0 ? PROJECTS[index] : null;
  // Overlay Turkish prose (name/capability/metrics/flow/subtitles/suggestions)
  // when in TR; terminal + document stay as-is (CLI/code). Keeps base shape.
  const project =
    base && lang === "tr" && PROJECTS_TR[base.slug] ? { ...base, ...PROJECTS_TR[base.slug] } : base;
  const cfg = project ? c.projects.find((p) => p.id === project.configId) : null;

  // --- terminal sim (scrubber-controlled) ---
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false); // was true - page is calm until a task runs
  const [speed, setSpeed] = useState(1);

  // --- agent answer (live / cached / demo) ---
  const [text, setText] = useState("");
  const [task, setTask] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [status, setStatus] = useState<RunStatus | null>(null);
  const [telemetry, setTelemetry] = useState<Telemetry | null>(null);
  const acRef = useRef<AbortController | null>(null);

  const stepCount = project?.terminal.length ?? 0;
  const atEnd = step >= stepCount;

  const runAgent = useCallback(
    async (taskText: string) => {
      if (index < 0) return;
      acRef.current?.abort();
      const ac = new AbortController();
      acRef.current = ac;
      setStreaming(true);
      setStatus(null);
      setTelemetry(null);
      setText("");
      // Replay the terminal alongside so the whole panel comes alive.
      setStep(0);
      setPlaying(true);

      let acc = "";
      const res = await streamAgent(
        "project",
        index,
        taskText,
        (chunk) => {
          if (ac.signal.aborted) return;
          acc += chunk;
          setText(acc);
        },
        ac.signal,
        lang
      );
      if (ac.signal.aborted) return;
      setStatus(res.status);
      setTelemetry(res.telemetry);
      setStreaming(false);
    },
    [index, lang]
  );

  // The home page locks `body { overflow: hidden }` for its own scroller; this
  // is a normal long page, so re-enable native scrolling while it's mounted.
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "auto";
    return () => { document.body.style.overflow = prev; };
  }, []);

  // Reset to a calm, empty state when the project changes - nothing runs until
  // the visitor clicks a chip or hits Run.
  useEffect(() => {
    acRef.current?.abort();
    setTask("");
    setText("");
    setStatus(null);
    setTelemetry(null);
    setStreaming(false);
    setStep(0);
    setPlaying(false);
    return () => acRef.current?.abort();
  }, [slug]);

  // Drive the terminal sim one step at a time, honoring pause + speed.
  useEffect(() => {
    if (!playing || atEnd) return;
    const id = setTimeout(() => setStep((s) => Math.min(s + 1, stepCount)), STEP_MS / speed);
    return () => clearTimeout(id);
  }, [playing, step, speed, atEnd, stepCount]);

  if (!project) {
    return (
      <div className="pd-page">
        <div className="pd-notfound">
          <h1>{t("pd.notFound")}</h1>
          <Link to={p("/myworks")} className="pd-back" data-cursor="disable">{t("pd.back")}</Link>
        </div>
      </div>
    );
  }

  const docCount = atEnd ? project.document.lines.length : Math.min(step, project.document.lines.length);
  const submit = () => runAgent(task.trim());

  const badge = streaming
    ? t("pd.badge.running")
    : status === "live"
    ? t("pd.badge.live")
    : status === "cached"
    ? t("pd.badge.cached")
    : status === "demo"
    ? t("pd.badge.demo")
    : t("pd.badge.ready");
  const badgeClass = streaming
    ? "pd-badge-sim"
    : status === "live"
    ? "pd-badge-live"
    : status === "cached"
    ? "pd-badge-cached"
    : "pd-badge-demo";

  const toggle = () => {
    if (atEnd) {
      setStep(0);
      setPlaying(true);
    } else {
      setPlaying((p) => !p);
    }
  };
  const stepBack = () => { setPlaying(false); setStep((s) => Math.max(0, s - 1)); };
  const stepFwd = () => { setPlaying(false); setStep((s) => Math.min(stepCount, s + 1)); };
  const cycleSpeed = () => setSpeed((sp) => SPEEDS[(SPEEDS.indexOf(sp) + 1) % SPEEDS.length]);

  return (
    <div className="pd-page">
      <div className="pd-topbar">
        <Link to={p("/myworks")} className="pd-back" data-cursor="disable">{t("pd.back")}</Link>
        <span className="pd-tag">{t("pd.tag")}</span>
        <LangToggle />
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

      <ol className="pd-flow" aria-label="agent pipeline">
        {project.flow.map((label, i) => (
          <li className="pd-flow-step" key={i}>
            <span className="pd-flow-num">{i + 1}</span>
            <span className="pd-flow-label">{label}</span>
          </li>
        ))}
      </ol>

      <div className="pd-grid">
        {/* HERO ROW: live chat (dominant) + 3D scene (supporting) */}
        <div className="pd-hero">
          <div className="pd-panel pd-chat pd-hero-chat">
            <div className="pd-panel-bar">
              <span className="pd-panel-name">{t("pd.panel.chat")}</span>
              <span className="pd-panel-sub">{project.subtitles.chat}</span>
              <span className={`pd-badge ${badgeClass}`}>{badge}</span>
            </div>
            <div className="pd-chat-body">
              {text}
              {streaming && <span className="pd-caret" />}
            </div>

            {telemetry && status && (
              <div className="pd-telemetry">
                {telemetry.promptTokens != null && <><b>{telemetry.promptTokens}</b> prompt · </>}
                {telemetry.completionTokens != null && <><b>{telemetry.completionTokens}</b> completion · </>}
                {telemetry.cacheHitTokens ? <>⚡<b>{telemetry.cacheHitTokens}</b> cached · </> : null}
                <b>{telemetry.ms}</b> ms · {status}
              </div>
            )}

            {project.suggestions && project.suggestions.length > 0 && (
              <div className={`pd-suggest${!text && !streaming ? " is-inviting" : ""}`}>
                {project.suggestions.map((s) => (
                  <button
                    key={s}
                    className="pd-chip"
                    onClick={() => { setTask(s); runAgent(s); }}
                    disabled={streaming}
                    data-cursor="disable"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            <div className="pd-chat-foot">
              <textarea
                className="pd-input"
                value={task}
                onChange={(e) => setTask(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submit(); }
                }}
                placeholder={`${t("pd.placeholder")} "${project.defaultTask}"`}
                rows={2}
                data-cursor="disable"
              />
              <button className="pd-run" onClick={submit} disabled={streaming} data-cursor="disable">
                {streaming ? t("pd.running") : t("pd.run")}
              </button>
            </div>
            <p className="pd-hint">
              {status === "live"
                ? t("pd.hint.live")
                : status === "cached"
                ? t("pd.hint.cached")
                : status === "demo"
                ? t("pd.hint.demo")
                : t("pd.hint.ready")}
            </p>
          </div>
          <div className="pd-stage pd-hero-stage">
            <div className="pd-panel-bar">
              <span className="pd-panel-name">{t("pd.panel.graph")}</span>
              <span className="pd-panel-sub">{project.subtitles.scene}</span>
              <span className="pd-badge pd-badge-real">{t("pd.badge.liveFlow")}</span>
            </div>
            <ProjectGraph variant={project.slug} running={streaming || playing} />
          </div>
        </div>

        {/* EVIDENCE STRIP: representational terminal + document */}
        <div className="pd-evidence">
          <div className="pd-panel pd-terminal">
            <div className="pd-panel-bar">
              <span className="pd-panel-name">{t("pd.panel.terminal")}</span>
              <span className="pd-panel-sub">{project.subtitles.terminal}</span>
              <span className="pd-badge pd-badge-sim">
                {atEnd ? t("pd.badge.exampleFlowDone") : `${t("pd.badge.exampleFlow")} · ${step}/${stepCount}`}
              </span>
            </div>
            <div className="pd-term-body">
              {project.terminal.slice(0, step).map((line, i) => (
                <div className="pd-term-line" key={i}>
                  {line}
                  {playing && !atEnd && i === step - 1 && <span className="pd-caret" />}
                </div>
              ))}
            </div>
            <div className="pd-scrub">
              <button className="pd-scrub-btn" onClick={stepBack} disabled={step === 0} data-cursor="disable" aria-label="step back">◀</button>
              <button className="pd-scrub-btn" onClick={toggle} data-cursor="disable" aria-label="play/pause">
                {atEnd ? "↻" : playing ? "❚❚" : "▶"}
              </button>
              <button className="pd-scrub-btn" onClick={stepFwd} disabled={atEnd} data-cursor="disable" aria-label="step forward">▶</button>
              <div className="pd-scrub-track">
                <div className="pd-scrub-fill" style={{ width: `${stepCount ? (step / stepCount) * 100 : 0}%` }} />
              </div>
              <button className="pd-scrub-speed" onClick={cycleSpeed} data-cursor="disable">{speed}×</button>
            </div>
          </div>

          <div className="pd-panel pd-document">
            <div className="pd-panel-bar">
              <span className="pd-panel-name">{project.document.title}</span>
              <span className="pd-panel-sub">{project.subtitles.spec}</span>
              <span className="pd-badge pd-badge-sim">{t("pd.badge.exampleFlow")}</span>
            </div>
            <div className="pd-doc-body">
              {project.document.lines.slice(0, docCount).map((line, i) => (
                <DocLine line={line} key={i} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetail;
