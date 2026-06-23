import { lazy, Suspense, useCallback, useEffect, useRef, useState } from "react";
import "./RobotSection.css";
import type { RobotController } from "./RobotScene";
import { ROLES } from "./RobotScene";

const RobotScene = lazy(() => import("./RobotScene"));

// Route a free-text task to the most relevant worker by simple keyword match.
const ROLE_KEYWORDS: string[][] = [
  ["secure", "security", "auth", "threat", "attack", "vuln", "protect"],
  ["doc", "document", "read", "summar", "analyz", "analyse", "extract", "pdf"],
  ["test", "qa", "verify", "check", "bug", "lint", "code", "build"],
];

function routeTask(text: string): number {
  const t = text.toLowerCase();
  for (let i = 0; i < ROLE_KEYWORDS.length; i++) {
    if (ROLE_KEYWORDS[i].some((k) => t.includes(k))) return i;
  }
  return Math.floor(Math.random() * ROLES.length);
}

// A titled, interactive mid-page section showcasing multi-agent orchestration.
// Desktop-only (the 3D scene is heavy); mobile sees nothing here.
const RobotSection = () => {
  const [isDesktop] = useState(() => window.innerWidth > 1024);
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);
  const controllerRef = useRef<RobotController | null>(null);
  const [task, setTask] = useState("");
  const [chat, setChat] = useState<string[]>([]);
  const chatRef = useRef<HTMLDivElement | null>(null);

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

  // Default task phrasing per role when no text is typed.
  const DEFAULT_TASKS = ["lock down the perimeter", "analyze the documents", "run the test suite"];

  const logTask = useCallback((i: number, taskText: string) => {
    const msg = `Supervisor → ${ROLES[i]}: ${taskText || DEFAULT_TASKS[i]}`;
    setChat((prev) => [...prev, msg]);
  }, []);

  // Clicking a robot in the scene already triggers its action; just log it.
  const onWorkerClick = useCallback((i: number) => logTask(i, ""), [logTask]);

  const dispatch = (i: number, taskText: string) => {
    controllerRef.current?.dispatch(i);
    logTask(i, taskText);
  };

  // keep the chat scrolled to the latest message
  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [chat]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = task.trim();
    if (!text) return;
    dispatch(routeTask(text), text);
    setTask("");
  };

  if (!isDesktop) return null;

  return (
    <section className="robot-section" ref={ref}>
      <div className="robot-section-head">
        <h2>
          How I <span>orchestrate</span>
        </h2>
        <p>A supervisor agent delegating to specialized workers. Click a robot — or type a task — to dispatch it.</p>
      </div>

      <div className="robot-section-stage">
        {visible && (
          <Suspense fallback={null}>
            <RobotScene onReady={onReady} onWorkerClick={onWorkerClick} />
          </Suspense>
        )}
      </div>

      <div className="robot-controls">
        <form className="robot-task-form" onSubmit={onSubmit}>
          <input
            type="text"
            value={task}
            onChange={(e) => setTask(e.target.value)}
            placeholder="Give the team a task…  e.g. ‘scan the API for vulnerabilities’"
            data-cursor="disable"
            aria-label="Assign a task"
          />
          <button type="submit" data-cursor="disable">Dispatch →</button>
        </form>
        <div className="robot-chips">
          {ROLES.map((role, i) => (
            <button key={role} className="robot-chip" onClick={() => dispatch(i, "")} data-cursor="disable">
              {role}
            </button>
          ))}
        </div>
        <div className="robot-chat" ref={chatRef}>
          {chat.length === 0 ? (
            <div className="robot-chat-empty">Dispatch a task — the conversation log builds here.</div>
          ) : (
            chat.map((line, i) => (
              <div className="robot-chat-line" key={i}>
                <span className="robot-chat-arrow">▸</span> {line}
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
};

export default RobotSection;
