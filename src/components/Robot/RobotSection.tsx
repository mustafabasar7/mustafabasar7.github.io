import { lazy, Suspense, useCallback, useEffect, useRef, useState } from "react";
import "./RobotSection.css";
import type { RobotController } from "./RobotScene";
import { AGENTS, streamAgent, type RunStatus } from "../../lib/agents";

const RobotScene = lazy(() => import("./RobotScene"));

interface Msg {
  id: number;
  agent: number;
  task: string;
  text: string;
  streaming: boolean;
  status: RunStatus;
}

const STATUS_LABEL: Record<RunStatus, string> = {
  live: "● live · DeepSeek",
  cached: "⚡ cached · 0 new tokens",
  demo: "◷ demo",
};

// A titled, interactive mid-page section showcasing multi-agent orchestration.
// Each agent, when dispatched, explains live (DeepSeek-backed, doc-grounded) how
// Mustafa actually built that capability. Desktop-only — the 3D scene is heavy.
const RobotSection = () => {
  const [isDesktop] = useState(() => window.innerWidth > 1024);
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);
  const controllerRef = useRef<RobotController | null>(null);
  const [messages, setMessages] = useState<Msg[]>([]);
  const chatRef = useRef<HTMLDivElement | null>(null);
  const idRef = useRef(0);
  const abortRef = useRef<AbortController | null>(null);

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

  const onReady = useCallback((c: RobotController) => {
    controllerRef.current = c;
  }, []);

  // Dispatch an agent: animate the robot, then stream its live explanation.
  const runAgent = useCallback((i: number) => {
    controllerRef.current?.dispatch(i);
    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;

    const id = idRef.current++;
    setMessages((prev) => [
      ...prev,
      { id, agent: i, task: AGENTS[i].defaultTask, text: "", streaming: true, status: "live" },
    ]);

    streamAgent(
      "agent",
      i,
      "",
      (chunk) =>
        setMessages((prev) =>
          prev.map((m) => (m.id === id ? { ...m, text: m.text + chunk } : m))
        ),
      ac.signal
    ).then((status) =>
      setMessages((prev) =>
        prev.map((m) => (m.id === id ? { ...m, streaming: false, status } : m))
      )
    );
  }, []);

  // Clicking a robot in the 3D scene dispatches that agent.
  const onWorkerClick = useCallback((i: number) => runAgent(i), [runAgent]);

  // keep the transcript scrolled to the latest token
  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [messages]);

  useEffect(() => () => abortRef.current?.abort(), []);

  if (!isDesktop) return null;

  return (
    <section className="robot-section" ref={ref}>
      <div className="robot-section-head">
        <h2>
          How I <span>orchestrate</span>
        </h2>
        <p>
          A supervisor delegating to specialized agents. Click a robot — or a chip — and the
          agent explains, live, how it works. Run the same one twice to see it served from cache.
        </p>
      </div>

      <div className="robot-section-stage">
        {visible && (
          <Suspense fallback={null}>
            <RobotScene onReady={onReady} onWorkerClick={onWorkerClick} />
          </Suspense>
        )}
      </div>

      <div className="robot-controls">
        <div className="robot-chips">
          {AGENTS.map((a, i) => (
            <button key={a.short} className="robot-chip" onClick={() => runAgent(i)} data-cursor="disable">
              {a.short}
            </button>
          ))}
        </div>
        <div className="robot-chat" ref={chatRef}>
          {messages.length === 0 ? (
            <div className="robot-chat-empty">
              Dispatch an agent — it explains, live, how that capability is built.
            </div>
          ) : (
            messages.map((m) => (
              <div className="robot-msg" key={m.id}>
                <div className="robot-msg-head">
                  <span className="robot-msg-name">{AGENTS[m.agent].name}</span>
                  <span className={`robot-status robot-status-${m.status}`}>
                    {m.streaming ? "● live · DeepSeek" : STATUS_LABEL[m.status]}
                  </span>
                </div>
                <div className="robot-msg-metrics">
                  {AGENTS[m.agent].metrics.map((metric, k) => (
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
