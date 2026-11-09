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
					description:
						'Guardrails checked your request. Try another scenario, or continue.<div class="tour-action-hint">✅ Done. Tap “Part 2: Explore →”</div>'
				});
			}, 150);
		}
		return;
	}

	if (action === 'mcp-toggle' && idx === 0) {
		window.setTimeout(() => drv.isActive() && drv.moveNext(), 150);
	} else if (action === 'nav-logs' && idx === 1) {
		window.setTimeout(() => drv.isActive() && drv.destroy(), 150);
	}
}

function startPart1() {
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
				element: '#tour-presets',
				popover: {
					title: '1/3 · Pick a scenario',
					description:
						'Talk to a <strong>real LLM</strong>. Start with <strong>Ask About Mustafa Başar</strong>.<div class="tour-action-hint">👇 Tap a scenario</div>',
					side: 'top',
					align: 'start',
					showButtons: ['close']
				}
			},
			{
				element: '#tour-send-btn',
				popover: {
					title: '2/3 · Send it',
					description:
						'Safe prompts run live. Attacks get <code>HTTP 403</code>.<div class="tour-action-hint">👇 Tap “Send”</div>',
					side: 'top',
					align: 'start',
					showButtons: ['previous', 'close']
				}
			},
			{
				element: '#tour-chat-area',
				popover: {
					title: '3/3 · Watch the result',
					description:
						'The trace and the streamed reply appear here.<div class="tour-action-hint">⏳ Waiting for the response…</div>',
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

function startPart2() {
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
		doneBtnText: 'Finish',
		onDestroyed: () => {
			if (activeDriver === drv) activeDriver = null;
		},
		steps: [
			{
				element: '#tour-mcp-toggle',
				popover: {
					title: 'Part 2 · Explore — MCP tool servers',
					description:
						'Optional: enable <strong>8 live tools</strong> across <strong>6 MCP servers</strong> (<code>memory</code>, <code>git</code>, <code>fetch</code>, <code>enterprise-rag</code>, <code>a2a-bridge</code> …). Then try the A2A / MCP scenarios again.',
					side: 'bottom',
					align: 'start',
					showButtons: ['next', 'close']
				}
			},
			{
				element: '[data-tour="nav-logs"]',
				onHighlightStarted: el => {
					el?.addEventListener('click', () => notifyTourAction('nav-logs'), { once: true });
				},
				popover: {
					title: 'Part 2 · Explore — Traces & inspectors',
					description:
						'Open <strong>Live Trace Logs</strong>, <strong>MCP Inspector</strong> or <strong>AI Guardrails</strong> from the menu to see raw JSON, latency and the 60%+ SLM cost savings.',
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

export function startGuidedTour(force = false) {
	if (!force) {
		try {
			if (localStorage.getItem(TOUR_STORAGE_KEY) === '1') return;
			localStorage.setItem(TOUR_STORAGE_KEY, '1');
		} catch {
			// Ignore storage errors
		}
	}
	if (activeDriver?.isActive()) activeDriver.destroy();
	startPart1();
}
