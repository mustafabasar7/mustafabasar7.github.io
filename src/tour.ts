import { type Driver, driver } from 'driver.js';
import 'driver.js/dist/driver.css';

const TOUR_STORAGE_KEY = 'mb_control_panel_tour_seen_v3';

let activeDriver: Driver | null = null;
let currentActionTarget: 'preset' | 'send' | 'mcp-toggle' | 'nav-inspector' | 'nav-logs' | null =
	null;

export function notifyTourAction(
	action: 'preset' | 'send' | 'mcp-toggle' | 'nav-inspector' | 'nav-logs'
) {
	if (!activeDriver || !activeDriver.isActive()) return;
	if (currentActionTarget === action) {
		window.setTimeout(() => {
			if (activeDriver?.isActive()) {
				if (activeDriver.hasNextStep()) {
					activeDriver.moveNext();
				} else {
					activeDriver.destroy();
				}
			}
		}, 180);
	}
}

export function startGuidedTour(force = false) {
	if (!force) {
		try {
			if (localStorage.getItem(TOUR_STORAGE_KEY) === '1') return;
			localStorage.setItem(TOUR_STORAGE_KEY, '1');
		} catch {
			// Ignore storage errors
		}
	}

	if (activeDriver?.isActive()) {
		activeDriver.destroy();
	}

	const drv = driver({
		showProgress: true,
		animate: true,
		allowClose: true,
		disableActiveInteraction: false,
		overlayOpacity: 0.68,
		stagePadding: 10,
		stageRadius: 12,
		popoverClass: 'cp-tour-popover',
		nextBtnText: 'Skip / Next →',
		prevBtnText: '← Back',
		doneBtnText: 'Finish Tour',
		onDestroyed: () => {
			currentActionTarget = null;
			activeDriver = null;
		},
		steps: [
			{
				element: '#tour-presets',
				onHighlightStarted: () => {
					currentActionTarget = 'preset';
				},
				popover: {
					title: 'Step 1/5 — Click Any Scenario Button Below!',
					description:
						'You can freely use this live chat! <strong>Click any scenario button inside the highlighted box</strong> to auto-advance:<br/><br/>• <strong>Ask About Mustafa Başar:</strong> Query AI projects, stack &amp; contact info<br/>• <strong>A2A Agent Delegation:</strong> Multi-agent coordination via <code>AgentCard</code><br/>• <strong>MCP Tool Call:</strong> Live JSON-RPC tool execution<br/>• <strong>Try Jailbreak / PII Leak:</strong> Test sub-10ms Guardrail blocking',
					side: 'top',
					align: 'start'
				}
			},
			{
				element: '#tour-send-row',
				onHighlightStarted: () => {
					currentActionTarget = 'send';
				},
				popover: {
					title: 'Step 2/5 — Now Click "Send" to Run It Live!',
					description:
						'Your chosen prompt is loaded (or you can type your own question in the message box).<br/><br/><strong>Click the green "Send" button now</strong> — safe prompts run live on <strong>NVIDIA Nemotron 3.5 Super 120B</strong>, while attacks are blocked with <code>HTTP 403</code>!',
					side: 'top',
					align: 'start'
				}
			},
			{
				element: '#tour-mcp-toggle',
				onHighlightStarted: () => {
					currentActionTarget = 'mcp-toggle';
				},
				popover: {
					title: 'Step 3/5 — Toggle MCP Tool Servers',
					description:
						'When enabled, the Control Panel connects <strong>8 live tools</strong> across <strong>6 official MCP servers</strong> (<code>memory</code>, <code>sequential-thinking</code>, <code>git</code>, <code>fetch</code>, <code>enterprise-rag</code>, <code>a2a-bridge</code>).<br/><br/><strong>Click the checkbox</strong> (or press Next) to continue!',
					side: 'bottom',
					align: 'start'
				}
			},
			{
				element: '[data-tour="nav-mcp-inspector"]',
				onHighlightStarted: el => {
					currentActionTarget = 'nav-inspector';
					if (el) {
						el.addEventListener(
							'click',
							() => {
								notifyTourAction('nav-inspector');
							},
							{ once: true }
						);
					}
				},
				popover: {
					title: 'Step 4/5 — Inspect Raw MCP & Guardrail Rules',
					description:
						'Want to test raw protocol payloads? You can open <strong>MCP Inspector</strong> to fire JSON-RPC <code>tools/call</code> requests, <strong>A2A Agent Mesh</strong> for agent routing, or <strong>AI Guardrails</strong> to edit security rules.',
					side: 'right',
					align: 'center'
				}
			},
			{
				element: '[data-tour="nav-logs"]',
				onHighlightStarted: el => {
					currentActionTarget = 'nav-logs';
					if (el) {
						el.addEventListener(
							'click',
							() => {
								notifyTourAction('nav-logs');
							},
							{ once: true }
						);
					}
				},
				popover: {
					title: 'Step 5/5 — Audit Live Trace Logs & Cost Savings',
					description:
						'Every prompt you just ran is recorded in <strong>Live Trace Logs</strong> and <strong>Spend Analytics</strong>. Click <strong>Live Trace Logs</strong> (or Finish Tour) to inspect full JSON payloads, latency, and 60%+ SLM token cost savings!',
					side: 'right',
					align: 'center'
				}
			}
		]
	});

	activeDriver = drv;
	drv.drive();
}
