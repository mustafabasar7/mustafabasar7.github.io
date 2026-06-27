import { lazy, Suspense, useCallback, useEffect, useRef, useState } from "react";
import "./RobotSection.css";
import type { RobotController } from "./RobotScene";
import { AGENTS, streamAgent, type RunStatus } from "../../lib/agents";
import { AGENTS_TR } from "../../lib/agents.tr";
import { useLang } from "../../i18n/LanguageProvider";
import OverseerBust from "./OverseerBust";

const RobotScene = lazy(() => import("./RobotScene"));

interface Msg {
  id: number;
  agent: number;
  task: string;
  text: string;
  streaming: boolean;
  status: RunStatus;
}

// A titled, interactive mid-page section showcasing multi-agent orchestration.
// Each agent, when dispatched, explains (doc-grounded) how Mustafa actually
// built that capability. Desktop-only - the 3D scene is heavy.
const RobotSection = () => {
  const { lang, t } = useLang();
  // Localized agent roster (name/short/metrics) for display.
  const agents = lang === "tr" ? AGENTS.map((a, i) => ({ ...a, ...AGENTS_TR[i] })) : AGENTS;
  const statusLabel = (s: RunStatus) => (s === "cached" ? t("robot.status.cached") : t("robot.status.demo"));
  const [isDesktop] = useState(() => window.innerWidth > 1024);
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);
  const [dispatched, setDispatched] = useState(false); // hide the click-cue after first use
  const controllerRef = useRef<RobotController | null>(null);
  const [messages, setMessages] = useState<Msg[]>([]);
  const chatRef = useRef<HTMLDivElement | null>(null);
  const idRef = useRef(0);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!ref.current) return;
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

  const onReady = useCallback((c: RobotController) => {
    controllerRef.current = c;
  }, []);

  // Dispatch an agent: animate the robot, then stream its live explanation.
  const runAgent = useCallback((i: number) => {
    setDispatched(true);
    controllerRef.current?.dispatch(i);
    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;

    const id = idRef.current++;
    setMessages((prev) => [
      ...prev,
      { id, agent: i, task: agents[i].defaultTask, text: "", streaming: true, status: "demo" },
    ]);

    streamAgent(
      "agent",
      i,
      "",
      (chunk) =>
        setMessages((prev) =>
          prev.map((m) => (m.id === id ? { ...m, text: m.text + chunk } : m))
        ),
      ac.signal,
      lang
    ).then((res) =>
      setMessages((prev) =>
        prev.map((m) => (m.id === id ? { ...m, streaming: false, status: res.status } : m))
      )
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang]);

  // Clicking a robot in the 3D scene dispatches that agent.
  const onWorkerClick = useCallback((i: number) => runAgent(i), [runAgent]);

  // keep the transcript scrolled to the latest token
  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [messages]);

  useEffect(() => () => abortRef.current?.abort(), []);

  return (
    <section className="robot-section" ref={ref}>
      <div className="robot-section-head">
        <h2>
          {t("robot.headPre")} <span>{t("robot.headWord")}</span>
        </h2>
        <p>{t("robot.desc")}</p>
      </div>

      <div className="robot-section-stage">
        {visible && (
          <Suspense fallback={null}>
            <RobotScene onReady={onReady} onWorkerClick={onWorkerClick} />
          </Suspense>
        )}
        {/* Mustafa oversees the agent team — desktop only (heavy 11MB bust). */}
        {visible && isDesktop && (
          <div className="robot-overseer">
            <OverseerBust size={340} label="Mustafa Başar" />
          </div>
        )}
        {!dispatched && (
          <div className="robot-cue" aria-hidden="true">
            <span className="robot-cue-text">{t("robot.cue")}</span>
            <span className="robot-cue-arrow">↘</span>
          </div>
        )}
      </div>

      <div className="robot-controls">
        <div className="robot-chips">
          {agents.map((a, i) => (
            <button key={a.short} className="robot-chip" onClick={() => runAgent(i)} data-cursor="disable">
              {a.short}
            </button>
          ))}
        </div>
        <div className="robot-chat" ref={chatRef}>
          {messages.length === 0 ? (
            <div className="robot-chat-empty">
              {t("robot.empty")}
            </div>
          ) : (
            messages.map((m) => (
              <div className="robot-msg" key={m.id}>
                <div className="robot-msg-head">
                  <span className="robot-msg-name">{agents[m.agent].name}</span>
                  <span className={`robot-status robot-status-${m.status}`}>
                    {m.streaming ? t("robot.status.running") : statusLabel(m.status)}
                  </span>
                </div>
                <div className="robot-msg-metrics">
                  {agents[m.agent].metrics.map((metric, k) => (
                    <span
                      className="robot-metric"
                      key={metric}
                      style={{ animationDelay: `${k * 0.12}s` }}
                    >
                      {metric}
                    </span>
                  ))}
                </div>
                <div className="robot-msg-body">
                  {m.text}
                  {m.streaming && <span className="robot-caret" />}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
};

export default RobotSection;
