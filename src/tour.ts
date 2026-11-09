import { type Driver, driver } from 'driver.js';
import 'driver.js/dist/driver.css';

const TOUR_STORAGE_KEY = 'mb_control_panel_tour_seen_v7';

export type TourAction =
	| 'preset'
	| 'send'
	| 'response-received'
	| 'mcp-toggle'
	| 'nav-inspector'
	| 'nav-logs';

type TourPart = 1 | 2;

let activeDriver: Driver | null = null;
let activePart: TourPart = 1;

export function notifyTourAction(action: TourAction) {
	if (!activeDriver || !activeDriver.isActive()) return;
	const idx = activeDriver.getActiveIndex() ?? 0;
	const drv = activeDriver;

	if (activePart === 1) {
		if (action === 'preset' && idx === 0) {
			window.setTimeout(() => drv.isActive() && drv.moveTo(1), 120);
		} else if (action === 'send' && idx <= 1) {
			window.setTimeout(() => drv.isActive() && drv.moveTo(2), 100);
		} else if (action === 'response-received' && idx === 2) {
			window.setTimeout(() => {
				if (!drv.isActive()) return;
				drv.refresh();
				drv.updatePopover({
					title: 'Step 3/3 · Real LLM Response Ready! 🎉',
					description:
						'The real LLM (NVIDIA Nemotron) streamed its response live through the Control Panel guardrails.<div class="tour-action-hint">✅ Done! Read the reply, then click “Part 2: Explore Advanced Features →” below to explore A2A delegation & MCP tools.</div>'
				});
			}, 150);
		}
		return;
	}

	if (action === 'mcp-toggle' && idx === 1) {
		window.setTimeout(() => drv.isActive() && drv.moveNext(), 150);
	} else if (action === 'nav-logs' && idx === 2) {
		window.setTimeout(() => drv.isActive() && drv.destroy(), 150);
	}
}

export function startPart1() {
	if (activeDriver?.isActive()) activeDriver.destroy();
	activePart = 1;

	const drv = driver({
		showProgress: true,
		progressText: 'Part 1/2 · {{current}} of {{total}}',
		animate: true,
		allowClose: true,
		disableActiveInteraction: false,
		overlayOpacity: 0.65,
		stagePadding: 8,
		stageRadius: 12,
		popoverClass: 'cp-tour-popover',
		nextBtnText: 'Next →',
		prevBtnText: '← Back',
		doneBtnText: 'Part 2: Explore →',
		onDestroyed: () => {
			if (activeDriver === drv) activeDriver = null;
		},
		steps: [
			{
				element: '#tour-preset-profile',
				popover: {
					title: 'Step 1/3 · Recommended Scenario',
					description:
						'Start here! Click <strong>Ask About Mustafa Başar</strong> to load the recommended question for the real LLM (NVIDIA Nemotron).<div class="tour-action-hint">👇 Click “Ask About Mustafa Başar”</div>',
					side: 'top',
					align: 'start',
					showButtons: ['close']
				}
			},
			{
				element: '#tour-send-btn',
				popover: {
					title: 'Step 2/3 · Send to Real LLM',
					description:
						'Prompt loaded! Click <strong>Send</strong> to run this live through the AI Guardrails and NVIDIA Nemotron.<div class="tour-action-hint">👇 Click “Send”</div>',
					side: 'top',
					align: 'start',
					showButtons: ['previous', 'close']
				}
			},
			{
				element: '#tour-chat-area',
				popover: {
					title: 'Step 3/3 · Real LLM Response Stream',
					description:
						'Watch the token-by-token stream arrive in real time! AI Guardrail checks and latency metrics appear below.<div class="tour-action-hint">⏳ Waiting for the response…</div>',
					side: 'bottom',
					align: 'start',
					showButtons: ['previous', 'next', 'close'],
					onNextClick: () => {
						drv.destroy();
						startPart2();
					}
				}
			}
		]
	});
	activeDriver = drv;
	drv.drive();
}

export function startPart2() {
	if (activeDriver?.isActive()) activeDriver.destroy();
	activePart = 2;

	const drv = driver({
		showProgress: true,
		progressText: 'Part 2/2 · {{current}} of {{total}}',
		animate: true,
		allowClose: true,
		disableActiveInteraction: false,
		overlayOpacity: 0.65,
		stagePadding: 8,
		stageRadius: 12,
		popoverClass: 'cp-tour-popover',
		nextBtnText: 'Next →',
		prevBtnText: '← Back',
		doneBtnText: 'Finish Tour ✓',
		onDestroyed: () => {
			if (activeDriver === drv) activeDriver = null;
		},
		steps: [
			{
				element: '#tour-presets',
				popover: {
					title: 'Advanced Scenarios (A2A, MCP, Attacks)',
					description:
						'Try the other scenarios: <strong>A2A Agent Delegation</strong>, <strong>MCP Tool Calls</strong>, or test safety shields with <strong>Try Jailbreak</strong> and <strong>Try PII Leak</strong> (blocked with HTTP 403).',
					side: 'top',
					align: 'start',
					showButtons: ['next', 'close']
				}
			},
			{
				element: '#tour-mcp-toggle',
				popover: {
					title: '6 Live MCP Tool Servers',
					description:
						'Toggle on live tools across 6 connected MCP servers (<code>memory</code>, <code>git</code>, <code>fetch</code>, <code>enterprise-rag</code>, <code>a2a-bridge</code>).',
					side: 'bottom',
					align: 'start',
					showButtons: ['previous', 'next', 'close']
				}
			},
			{
				element: '[data-tour="nav-logs"]',
				onHighlightStarted: el => {
					el?.addEventListener('click', () => notifyTourAction('nav-logs'), { once: true });
				},
				popover: {
					title: 'Live Trace Logs & Cost Savings',
					description:
						'Open <strong>Live Trace Logs</strong> from the menu to inspect raw JSON, latency, and 60%+ SLM cost savings.',
					side: 'right',
					align: 'center',
					showButtons: ['previous', 'close']
				}
			}
		]
	});
	activeDriver = drv;
	drv.drive();
}

export function startGuidedTour(force = false) {
	if (!force) {
		// Never interrupt mobile visitors on page load
		if (typeof window !== 'undefined' && window.innerWidth < 768) {
			return;
		}
		try {
			if (localStorage.getItem(TOUR_STORAGE_KEY) === '1') return;
			localStorage.setItem(TOUR_STORAGE_KEY, '1');
		} catch {
			// Ignore storage errors
		}
	}
	startPart1();
}
