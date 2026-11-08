import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';

const TOUR_STORAGE_KEY = 'mb_control_panel_tour_seen_v1';

export function startGuidedTour(force = false) {
	if (!force) {
		try {
			if (localStorage.getItem(TOUR_STORAGE_KEY) === '1') return;
			localStorage.setItem(TOUR_STORAGE_KEY, '1');
		} catch {
			// Ignore storage errors
		}
	}

	const drv = driver({
		showProgress: true,
		animate: true,
		allowClose: true,
		overlayOpacity: 0.72,
		stagePadding: 8,
		stageRadius: 10,
		popoverClass: 'cp-tour-popover',
		nextBtnText: 'Next →',
		prevBtnText: '← Back',
		doneBtnText: 'Start Exploring',
		steps: [
			{
				element: '#tour-presets',
				popover: {
					title: 'Mission 1: Pick a Live Scenario',
					description:
						'Click any preset chip — test <strong>A2A Agent Delegation</strong>, trigger an <strong>MCP Tool Call</strong>, or try to bypass the gateway with a <strong>Jailbreak</strong> or <strong>PII Leak</strong> attack.',
					side: 'bottom',
					align: 'start'
				}
			},
			{
				element: '#tour-send-row',
				popover: {
					title: 'Mission 2: Execute Against NVIDIA NIM 120B',
					description:
						'Press <strong>Send</strong> (or write your own prompt). Safe prompts execute live on <strong>NVIDIA Nemotron 3.5 Super 120B</strong>; attacks are intercepted in &lt;10ms with a <code>403 Policy Violation</code>.',
					side: 'top',
					align: 'start'
				}
			},
			{
				element: '#tour-mcp-toggle',
				popover: {
					title: 'Mission 3: Live MCP Tool Calling',
					description:
						'When enabled, the model automatically discovers and invokes tools across <strong>6 official MCP servers</strong> (<code>memory</code>, <code>sequential-thinking</code>, <code>git</code>, <code>rag</code>, and <code>a2a-bridge</code>).',
					side: 'bottom',
					align: 'start'
				}
			},
			{
				element: '[data-tour="nav-mcp-inspector"]',
				popover: {
					title: 'Mission 4: Inspect Raw MCP & Guardrails',
					description:
						'Jump to <strong>MCP Inspector</strong> to fire raw JSON-RPC <code>tools/call</code> payloads, or open <strong>AI Guardrails</strong> &amp; <strong>A2A Agent Mesh</strong> to edit live policies.',
					side: 'right',
					align: 'center'
				}
			},
			{
				element: '[data-tour="nav-logs"]',
				popover: {
					title: 'Mission 5: Audit Traces & SLM Cost Routing',
					description:
						'Every prompt you run is recorded in <strong>Live Trace Logs</strong> and <strong>Spend Analytics</strong> — inspect the full JSON payload, latency, and token savings.',
					side: 'right',
					align: 'center'
				}
			}
		]
	});

	drv.drive();
}
