import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';

const TOUR_STORAGE_KEY = 'mb_control_panel_tour_seen_v2';

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
		overlayOpacity: 0.74,
		stagePadding: 8,
		stageRadius: 10,
		popoverClass: 'cp-tour-popover',
		nextBtnText: 'Next →',
		prevBtnText: '← Back',
		doneBtnText: 'Start Exploring',
		steps: [
			{
				element: '#tour-welcome-banner',
				popover: {
					title: 'Welcome — You Can Freely Use This Live Chat!',
					description:
						'This is not a static portfolio mockup. You are inside a <strong>live AI Control Panel</strong> connected to <strong>NVIDIA NIM (Nemotron 3.5 Super 120B)</strong>.<br/><br/><strong>What you can access &amp; ask:</strong><br/>• Ask anything about <strong>Mustafa Başar</strong> (projects, AI engineering stack, contact)<br/>• Test live <strong>A2A Agent Delegation</strong> &amp; <strong>MCP Tool Calls</strong><br/>• Write your own custom prompts or try to break the <strong>Guardrails</strong>!',
					side: 'bottom',
					align: 'start'
				}
			},
			{
				element: '#tour-presets',
				popover: {
					title: 'Step 1: 1-Click Educational Scenarios',
					description:
						'Not sure what to type first? Click any preset:<br/>• <strong>Ask About Mustafa Başar:</strong> Query engineering experience &amp; architecture<br/>• <strong>A2A Delegation:</strong> Coordinate multi-agent workflows via <code>/.well-known/agent.json</code><br/>• <strong>MCP Tool Call:</strong> Query enterprise RAG &amp; knowledge graphs via JSON-RPC<br/>• <strong>Try Jailbreak / PII Leak:</strong> Watch ingress guardrails block attacks in <code>&lt;10ms</code>',
					side: 'top',
					align: 'start'
				}
			},
			{
				element: '#tour-send-row',
				popover: {
					title: 'Step 2: Send or Write Your Own Prompt',
					description:
						'Click <strong>Send</strong> to execute the loaded prompt, or type any question in the box above. Safe prompts route to <strong>NVIDIA NIM</strong>; policy violations return an instant <code>HTTP 403</code>.',
					side: 'top',
					align: 'start'
				}
			},
			{
				element: '#tour-mcp-toggle',
				popover: {
					title: 'Step 3: How MCP (Model Context Protocol) Works',
					description:
						'When checked, the Control Panel attaches <strong>8 live tools</strong> from <strong>6 official MCP servers</strong> (<code>memory</code>, <code>sequential-thinking</code>, <code>git</code>, <code>fetch</code>, <code>enterprise-rag</code>, <code>a2a-bridge</code>) so the LLM can fetch grounded data autonomously.',
					side: 'bottom',
					align: 'start'
				}
			},
			{
				element: '[data-tour="nav-mcp-inspector"]',
				popover: {
					title: 'Step 4: Inspect Protocols & Security Policies',
					description:
						'Want to look under the hood? Open <strong>MCP Inspector</strong> to fire raw JSON-RPC <code>tools/call</code> requests, <strong>A2A Agent Mesh</strong> to inspect agent routes, or <strong>AI Guardrails</strong> to edit regex &amp; PII rules.',
					side: 'right',
					align: 'center'
				}
			},
			{
				element: '[data-tour="nav-logs"]',
				popover: {
					title: 'Step 5: Audit Live Traces & SLM Cost Savings',
					description:
						'Every message you send is logged in <strong>Live Trace Logs</strong> and <strong>Spend Analytics</strong> — inspect the full prompt/response JSON, latency, and how <strong>SLM routing</strong> cuts token costs by 60%+.',
					side: 'right',
					align: 'center'
				}
			}
		]
	});

	drv.drive();
}
