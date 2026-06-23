import "./styles/AgentGraph.css";

// Lightweight animated LangGraph-style agent graph (pure SVG/CSS, no three.js).
// Used as the mobile hero where the 3D character is hidden.
const AgentGraph = () => {
  return (
    <div className="agent-graph" aria-hidden="true">
      <svg viewBox="0 0 320 380" xmlns="http://www.w3.org/2000/svg">
        {/* edges */}
        <g className="ag-edges">
          <path id="eStart" d="M160,64 L160,108" />
          <path id="eA" d="M142,150 L88,228" />
          <path id="eTool" d="M160,160 L160,224" />
          <path id="eB" d="M178,150 L232,228" />
          <path id="eAEnd" d="M86,260 L146,322" />
          <path id="eToolEnd" d="M160,264 L160,320" />
          <path id="eBEnd" d="M234,260 L174,322" />
          <path id="eCycle" className="ag-cycle" d="M264,236 C306,184 300,150 184,128" />
        </g>

        {/* flowing pulses */}
        <g className="ag-pulses">
          {[
            { p: "#eStart", d: "1.4s", b: "0s" },
            { p: "#eA", d: "1.6s", b: "0.3s" },
            { p: "#eTool", d: "1.6s", b: "0.5s" },
            { p: "#eB", d: "1.6s", b: "0.7s" },
            { p: "#eAEnd", d: "1.6s", b: "1.1s" },
            { p: "#eToolEnd", d: "1.6s", b: "1.3s" },
            { p: "#eBEnd", d: "1.6s", b: "1.5s" },
            { p: "#eCycle", d: "2.6s", b: "0.9s" },
          ].map((e, i) => (
            <circle key={i} r="3.4" className="ag-pulse">
              <animateMotion dur={e.d} begin={e.b} repeatCount="indefinite" rotate="auto">
                <mpath href={e.p} />
              </animateMotion>
            </circle>
          ))}
        </g>

        {/* nodes */}
        <g className="ag-nodes">
          <g className="ag-node n1">
            <circle cx="160" cy="46" r="18" />
            <text x="160" y="50">START</text>
          </g>
          <g className="ag-node n2 sup">
            <circle cx="160" cy="134" r="26" />
            <text x="160" y="138">SUP</text>
          </g>
          <g className="ag-node n3">
            <circle cx="74" cy="244" r="20" />
            <text x="74" y="248">agent</text>
          </g>
          <g className="ag-node n4">
            <circle cx="160" cy="244" r="20" />
            <text x="160" y="248">tool</text>
          </g>
          <g className="ag-node n5">
            <circle cx="246" cy="244" r="20" />
            <text x="246" y="248">agent</text>
          </g>
          <g className="ag-node n6">
            <circle cx="160" cy="338" r="18" />
            <text x="160" y="342">END</text>
          </g>
        </g>
      </svg>
      <span className="ag-caption">multi-agent orchestration</span>
    </div>
  );
};

export default AgentGraph;
