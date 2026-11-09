import { type Driver, driver } from 'driver.js';
import 'driver.js/dist/driver.css';

const TOUR_STORAGE_KEY = 'mb_control_panel_tour_seen_v5';

export type TourAction =
	| 'preset'
	| 'send'
	| 'response-received'
	| 'mcp-toggle'
	| 'nav-inspector'
	| 'nav-logs';

let activeDriver: Driver | null = null;

export function notifyTourAction(action: TourAction) {
	if (!activeDriver || !activeDriver.isActive()) return;
	const idx = activeDriver.getActiveIndex() ?? 0;

	if (action === 'preset' && idx <= 2) {
		window.setTimeout(() => {
			if (activeDriver?.isActive()) {
				activeDriver.moveTo(3);
			}
		}, 120);
		return;
	}

	if (action === 'send' && idx <= 4) {
		window.setTimeout(() => {
			if (activeDriver?.isActive()) {
				activeDriver.moveTo(5);
			}
		}, 100);
		return;
	}

	if (action === 'response-received') {
		window.setTimeout(() => {
			if (activeDriver?.isActive()) {
				activeDriver.refresh();
				if (activeDriver.getActiveIndex() === 5) {
					activeDriver.updatePopover({
						description:
							'The Control Panel checked Guardrails, routed the request, and rendered the result above.<div class="tour-action-hint">✅ Response ready! Inspect it (or click Next →)</div>'
					});
				}
			}
		}, 120);
		return;
	}

	if (action === 'mcp-toggle' && idx === 6) {
		window.setTimeout(() => {
			if (activeDriver?.isActive()) {
				activeDriver.moveNext();
			}
		}, 150);
		return;
	}

	if (action === 'nav-logs' && idx === 7) {
		window.setTimeout(() => {
			if (activeDriver?.isActive()) {
				activeDriver.destroy();
			}
		}, 150);
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
		overlayOpacity: 0.65,
		stagePadding: 10,
		stageRadius: 12,
		popoverClass: 'cp-tour-popover',
		nextBtnText: 'Next →',
		prevBtnText: '← Back',
		doneBtnText: 'Finish Tour',
		onDestroyed: () => {
			activeDriver = null;
		},
		steps: [
			{
				element: '#tour-preset-profile',
				popover: {
					title: '1/8 — Ask About Mustafa Başar',
					description:
						'You can freely use this live chat! Click this button to query <strong>Mustafa Başar&apos;s AI projects, stack &amp; contact info</strong>.<div class="tour-action-hint">👇 Click the button to load it (or Next →)</div>',
					side: 'top',
					align: 'start',
					showButtons: ['next', 'close']
				}
			},
			{
				element: '#tour-preset-a2a',
				popover: {
					title: '2/8 — Live A2A & MCP Protocols',
					description:
						'Or test multi-agent <strong>A2A delegation</strong> (<code>AgentCard</code>) and live <strong>MCP JSON-RPC tool calls</strong>.<div class="tour-action-hint">👇 Click to load (or Next →)</div>',
					side: 'top',
					align: 'start',
					showButtons: ['previous', 'next', 'close']
				}
			},
			{
				element: '#tour-preset-jailbreak',
				popover: {
					title: '3/8 — Security Guardrail Attacks',
					description:
						'Want to test security? Try breaking the sub-10ms <strong>Prompt-Injection</strong> &amp; <strong>PII Redaction</strong> shields.<div class="tour-action-hint">👇 Click any scenario button to load a prompt</div>',
					side: 'top',
					align: 'start',
					showButtons: ['previous', 'close']
				}
			},
			{
				element: '#tour-prompt-box',
				popover: {
					title: '4/8 — Editable Prompt Box',
					description:
						'Your chosen prompt is loaded here — you can edit it or type your own question anytime.',
					side: 'top',
					align: 'start',
					showButtons: ['previous', 'next', 'close']
				}
			},
			{
				element: '#tour-send-btn',
				popover: {
					title: '5/8 — Send to Control Panel',
					description:
						'Now execute your prompt live on <strong>NVIDIA Nemotron 3.5 Super 120B</strong>.<div class="tour-action-hint">👇 Click the green "Send" button below</div>',
					side: 'top',
					align: 'start',
					showButtons: ['previous', 'close']
				}
			},
			{
				element: '#tour-chat-area',
				popover: {
					title: '6/8 — Live Execution Trace & Reply',
					description:
						'Watch the live pipeline trace and response right here! Safe prompts stream from NVIDIA NIM, while attacks are blocked with <code>HTTP 403</code>.<div class="tour-action-hint">⏳ Watching live response... Click Next → when ready</div>',
					side: 'bottom',
					align: 'start',
					showButtons: ['previous', 'next', 'close']
				}
			},
			{
				element: '#tour-mcp-toggle',
				popover: {
					title: '7/8 — 6 Connected MCP Servers',
					description:
						'Toggle <strong>8 live MCP tools</strong> (<code>memory</code>, <code>sequential-thinking</code>, <code>git</code>, <code>fetch</code>, <code>enterprise-rag</code>, <code>a2a-bridge</code>).',
					side: 'bottom',
					align: 'start',
					showButtons: ['previous', 'next', 'close']
				}
			},
			{
				element: '[data-tour="nav-logs"]',
				onHighlightStarted: el => {
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
					title: '8/8 — Trace Logs & Protocol Inspectors',
					description:
						'Open <strong>Live Trace Logs</strong>, <strong>MCP Inspector</strong>, or <strong>AI Guardrails</strong> in the sidebar to inspect raw JSON payloads and 60%+ SLM cost savings!',
					side: 'right',
					align: 'center',
					showButtons: ['previous', 'next', 'close']
				}
			}
		]
	});

	activeDriver = drv;
	drv.drive();
}
