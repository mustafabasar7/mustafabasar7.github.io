import "./ProjectGraph.css";

// A per-project LangGraph-style topology — pure SVG/CSS, no three.js. Replaces
// the old decorative 3D character with a diagram that IS the system: nodes are
// agents/tools/gates, the moving dots are control flow. Each project gets a
// visually distinct shape so the five never feel samey. Labels sit BELOW each
// node (full readable words, no cramped abbreviations). When `running` is true
// (a task is streaming or the terminal is playing) the whole graph intensifies.

type Pulse = { path: string; dur: string; begin: string };

const Pulses = ({ pulses }: { pulses: Pulse[] }) => (
  <g className="pg-pulses">
    {pulses.map((e, i) => (
      <circle key={i} r="3.2" className="pg-pulse">
        <animateMotion dur={e.dur} begin={e.begin} repeatCount="indefinite" rotate="auto">
          <mpath href={e.path} />
        </animateMotion>
      </circle>
    ))}
  </g>
);

// A node: a glowing circle with its label centered just beneath it.
type N = { x: number; y: number; r: number; label: string; cls?: string };
const Node = ({ x, y, r, label, cls }: N) => (
  <g className={`pg-node${cls ? " " + cls : ""}`}>
    <circle cx={x} cy={y} r={r} />
    <text x={x} y={y + r + 14}>{label}</text>
  </g>
);

// --- 1. orchestration: a supervisor fans work out to three workers, then merges.
const Orchestration = () => (
  <svg viewBox="0 0 300 372" xmlns="http://www.w3.org/2000/svg">
    <g className="pg-edges">
      <path id="o-s" d="M150,58 L150,100" />
      <path id="o-a" d="M132,140 L70,212" />
      <path id="o-t" d="M150,150 L150,208" />
      <path id="o-b" d="M168,140 L230,212" />
      <path id="o-ae" d="M68,244 L138,300" />
      <path id="o-te" d="M150,248 L150,298" />
      <path id="o-be" d="M232,244 L162,300" />
      <path id="o-cyc" className="pg-cycle" d="M250,224 C292,170 286,138 172,120" />
    </g>
    <Pulses pulses={[
      { path: "#o-s", dur: "1.4s", begin: "0s" },
      { path: "#o-a", dur: "1.6s", begin: "0.3s" },
      { path: "#o-t", dur: "1.6s", begin: "0.5s" },
      { path: "#o-b", dur: "1.6s", begin: "0.7s" },
      { path: "#o-ae", dur: "1.6s", begin: "1.1s" },
      { path: "#o-te", dur: "1.6s", begin: "1.3s" },
      { path: "#o-be", dur: "1.6s", begin: "1.5s" },
      { path: "#o-cyc", dur: "2.6s", begin: "0.9s" },
    ]} />
    <g className="pg-nodes">
      <Node x={150} y={40} r={16} label="start" />
      <Node x={150} y={124} r={24} label="supervisor" cls="key" />
      <Node x={60} y={228} r={17} label="agent" />
      <Node x={150} y={228} r={17} label="tool" />
      <Node x={240} y={228} r={17} label="agent" />
      <Node x={150} y={316} r={16} label="end" />
    </g>
  </svg>
);

// --- 2. tool-routing: one router branches each request to the right tool.
const ToolRouting = () => (
  <svg viewBox="0 0 300 372" xmlns="http://www.w3.org/2000/svg">
    <g className="pg-edges">
      <path id="r-in" d="M64,170 L114,170" />
      <path id="r-1" d="M166,152 L224,100" />
      <path id="r-2" d="M174,170 L226,170" />
      <path id="r-3" d="M166,188 L224,240" />
      <path id="r-1e" d="M248,116 L168,292" />
      <path id="r-2e" d="M248,186 L160,290" />
      <path id="r-3e" d="M248,224 L162,292" />
    </g>
    <Pulses pulses={[
      { path: "#r-in", dur: "1.2s", begin: "0s" },
      { path: "#r-1", dur: "1.5s", begin: "0.4s" },
      { path: "#r-2", dur: "1.5s", begin: "0.7s" },
      { path: "#r-3", dur: "1.5s", begin: "1.0s" },
      { path: "#r-2e", dur: "1.7s", begin: "1.5s" },
    ]} />
    <g className="pg-nodes">
      <Node x={44} y={170} r={16} label="task" />
      <Node x={144} y={170} r={24} label="router" cls="key" />
      <Node x={244} y={96} r={17} label="summarize" />
      <Node x={250} y={170} r={17} label="translate" />
      <Node x={244} y={240} r={17} label="validate" />
      <Node x={150} y={308} r={15} label="end" />
    </g>
  </svg>
);

// --- 3. persistent-state: a checkpoint that can pause and resume from saved state.
const PersistentState = () => (
  <svg viewBox="0 0 300 372" xmlns="http://www.w3.org/2000/svg">
    <g className="pg-edges">
      <path id="p-1" d="M150,58 L150,96" />
      <path id="p-2" d="M150,140 L150,170" />
      <path id="p-3" d="M150,226 L150,288" />
      <path id="p-cyc" className="pg-cycle" d="M196,196 C262,176 258,118 172,114" />
    </g>
    <Pulses pulses={[
      { path: "#p-1", dur: "1.4s", begin: "0s" },
      { path: "#p-2", dur: "1.4s", begin: "0.5s" },
      { path: "#p-cyc", dur: "2.4s", begin: "0.8s" },
      { path: "#p-3", dur: "1.5s", begin: "1.4s" },
    ]} />
    <g className="pg-nodes">
      <Node x={150} y={40} r={16} label="start" />
      <Node x={150} y={118} r={21} label="step" />
      <Node x={150} y={198} r={26} label="checkpoint" cls="key" />
      <Node x={150} y={306} r={15} label="end" />
    </g>
  </svg>
);

// --- 4. swarm: many agents under sub-supervisors, crisscross dynamic handoffs.
const Swarm = () => (
  <svg viewBox="0 0 300 372" xmlns="http://www.w3.org/2000/svg">
    <g className="pg-edges">
      <path id="w-c1" d="M150,58 L96,104" />
      <path id="w-c2" d="M150,58 L210,104" />
      <path id="w-a1" d="M86,138 L60,212" />
      <path id="w-a2" d="M98,140 L132,212" />
      <path id="w-b1" d="M204,140 L172,212" />
      <path id="w-b2" d="M216,138 L244,212" />
      <path id="w-x1" className="pg-cycle" d="M104,120 L196,120" />
      <path id="w-x2" className="pg-cycle" d="M144,224 L168,224" />
    </g>
    <Pulses pulses={[
      { path: "#w-c1", dur: "1.4s", begin: "0s" },
      { path: "#w-c2", dur: "1.4s", begin: "0.2s" },
      { path: "#w-a1", dur: "1.5s", begin: "0.6s" },
      { path: "#w-b2", dur: "1.5s", begin: "0.8s" },
      { path: "#w-x1", dur: "2.0s", begin: "1.0s" },
      { path: "#w-a2", dur: "1.5s", begin: "1.2s" },
      { path: "#w-b1", dur: "1.5s", begin: "1.4s" },
    ]} />
    <g className="pg-nodes">
      <Node x={150} y={40} r={17} label="coordinator" cls="key" />
      <Node x={86} y={120} r={17} label="supervisor" />
      <Node x={214} y={120} r={17} label="supervisor" />
      <Node x={56} y={228} r={14} label="agent" cls="sm" />
      <Node x={132} y={228} r={14} label="agent" cls="sm" />
      <Node x={172} y={228} r={14} label="agent" cls="sm" />
      <Node x={248} y={228} r={14} label="agent" cls="sm" />
    </g>
  </svg>
);

// --- 5. hitl-safety: the flow hits an interrupt gate and waits for human approval.
const HitlSafety = () => (
  <svg viewBox="0 0 300 372" xmlns="http://www.w3.org/2000/svg">
    <g className="pg-edges">
      <path id="h-1" d="M150,58 L150,96" />
      <path id="h-2" d="M150,140 L150,168" />
      <path id="h-ok" d="M174,212 L226,272" />
      <path id="h-no" className="pg-cycle" d="M126,212 L74,272" />
    </g>
    <Pulses pulses={[
      { path: "#h-1", dur: "1.4s", begin: "0s" },
      { path: "#h-2", dur: "1.4s", begin: "0.5s" },
      { path: "#h-ok", dur: "1.7s", begin: "1.2s" },
    ]} />
    <g className="pg-nodes">
      <Node x={150} y={40} r={16} label="start" />
      <Node x={150} y={118} r={21} label="risky step" />
      <Node x={150} y={192} r={25} label="interrupt" cls="gate" />
      <Node x={64} y={288} r={15} label="cancel" cls="sm bad" />
      <Node x={236} y={288} r={15} label="resume" cls="sm ok" />
    </g>
  </svg>
);

const VARIANTS: Record<string, () => JSX.Element> = {
  orchestration: Orchestration,
  "tool-routing": ToolRouting,
  "persistent-state": PersistentState,
  swarm: Swarm,
  "hitl-safety": HitlSafety,
};

const ProjectGraph = ({ variant, running, caption }: { variant: string; running?: boolean; caption?: string }) => {
  const Graph = VARIANTS[variant] ?? Orchestration;
  return (
    <div className={`project-graph${running ? " is-running" : ""}`} aria-hidden="true">
      <Graph />
      {caption && <span className="pg-caption">{caption}</span>}
    </div>
  );
};

export default ProjectGraph;
