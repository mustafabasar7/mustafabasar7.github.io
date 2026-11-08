import { Link, Outlet, useNavigate, useRouterState } from '@tanstack/react-router';
import {
	Activity,
	Binary,
	Blocks,
	ChevronDown,
	ChevronRight,
	Code2,
	Cog,
	Compass,
	Cpu,
	Fingerprint,
	GitFork,
	Globe,
	Layers,
	LineChart,
	Lock,
	LogOut,
	Menu,
	MessageSquarePlus,
	Moon,
	Plug,
	Radar,
	ShieldAlert,
	ShieldCheck,
	Sparkles,
	Sun,
	Terminal,
	UserRound,
	Wallet,
	Workflow
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import { apiBase } from '@/api/base';
import type { RuntimeUser } from '@/api/runtimeApi';
import { StatusBanner, Tooltip, useDismissiblePopover } from '@/components/Primitives';
import {
	useConfigDumpMode,
	useEffectiveGatewayConfig,
	useMcpConfigData,
	useRuntimeInfo,
	useTrafficConfigData
} from '@/hooks';

type NavItemConfig = {
	to: string;
	label: string;
	icon: React.ComponentType<{ size?: number }>;
	placeholder?: boolean;
	groupStart?: boolean;
	exact?: boolean;
};

const projectLinks = [
	{
		label: 'GitHub — mustafabasar7',
		href: 'https://github.com/mustafabasar7',
		icon: GitFork
	},
	{
		label: 'LinkedIn — Mustafa Başar',
		href: 'https://www.linkedin.com/in/mustafa-basar/',
		icon: Globe
	},
	{
		label: 'Contact — basarmustafa7@gmail.com',
		href: 'mailto:basarmustafa7@gmail.com',
		icon: MessageSquarePlus
	}
] as const;

export function Shell() {
	const router = useRouterState();
	const runtime = useRuntimeInfo();
	const mode = useConfigDumpMode();
	const dumpMode = mode.data?.mode === 'dump';
	const config = useEffectiveGatewayConfig({
		enabled: Boolean(mode.data && mode.data.mode !== 'dump')
	});
	const mcpData = useMcpConfigData({
		enabled: Boolean(mode.data && mode.data.mode !== 'dump')
	});
	const trafficData = useTrafficConfigData({
		enabled: Boolean(mode.data && mode.data.mode !== 'dump')
	});
	const [theme, setTheme] = useState(
		() => localStorage.getItem('mb_theme') ?? 'dark'
	);
	const [mobileNavOpen, setMobileNavOpen] = useState(false);
	const [mobileNavPathname, setMobileNavPathname] = useState(router.location.pathname);
	if (mobileNavPathname !== router.location.pathname) {
		setMobileNavPathname(router.location.pathname);
		setMobileNavOpen(false);
	}
	const mobileNavRef = useDismissiblePopover<HTMLDivElement>(mobileNavOpen, () =>
		setMobileNavOpen(false)
	);
	const hasLlm = dumpMode ? false : config.data ? Boolean(config.data.llm) : true;
	const hasMcp = dumpMode ? false : mcpData.data ? Boolean(mcpData.data.mcp) : true;
	const hasTraffic = dumpMode
		? true
		: trafficData.data
			? Boolean(trafficData.data.binds?.length) ||
				'gateways' in trafficData.data ||
				'routes' in trafficData.data ||
				'tcpRoutes' in trafficData.data
			: true;
	const hasBinds = dumpMode ? true : config.data ? Boolean(config.data.binds?.length) : false;
	const navGroups = navigationGroups({
		hasLlm,
		hasMcp,
		hasTraffic,
		hasBinds,
		dumpMode
	});
	const nav = navGroups.flatMap(group => group.items);
	const matchedNav = nav
		.filter(item => navItemActive(item, router.location.pathname))
		.sort((left, right) => right.to.length - left.to.length)[0];
	const currentNav = matchedNav ?? nav[0];
	const currentGroup = navGroups.find(group => group.items.includes(currentNav));
	const CurrentIcon = currentNav.icon;

	useEffect(() => {
		document.documentElement.dataset.theme = theme;
	}, [theme]);

	return (
		<div className="app-shell">
			<aside className="sidebar">
				<Link to="/" className="brand" aria-label="Mustafa Başar AI Control Plane" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
					<ShieldCheck size={22} />
					<strong style={{ fontSize: '14px', fontWeight: 600, letterSpacing: '-0.01em' }}>Mustafa Başar · AI Gateway</strong>
				</Link>
				<nav className="nav-list" aria-label="Primary">
					{navGroups.map(group => (
						<NavSection
							key={group.title}
							title={group.title}
							items={group.items}
							currentPath={router.location.pathname}
						/>
					))}
				</nav>
				<div className="sidebar-links">
					{projectLinks.map(link => {
						const Icon = link.icon;
						return (
							<Tooltip content={link.label} key={link.href} side="top">
								<a
									className="sidebar-link"
									href={link.href}
									target="_blank"
									rel="noreferrer"
									aria-label={link.label}
								>
									<Icon size={17} />
								</a>
							</Tooltip>
						);
					})}
				</div>
			</aside>
			<div className="main-area">
				<header className="topbar">
					<div className="topbar-left">
						<div className="mobile-nav" ref={mobileNavRef}>
							<button
								className="mobile-nav-trigger"
								type="button"
								aria-expanded={mobileNavOpen}
								onClick={() => setMobileNavOpen(open => !open)}
							>
								<Menu size={17} />
								<CurrentIcon size={16} />
								<span>{currentNav.label}</span>
							</button>
							{mobileNavOpen ? (
								<nav className="mobile-nav-menu" aria-label="Primary">
									{navGroups.map(group => (
										<MobileNavSection
											key={group.title}
											title={group.title}
											items={group.items}
											currentPath={router.location.pathname}
										/>
									))}
								</nav>
							) : null}
						</div>
						{matchedNav && currentGroup && (
							<nav className="breadcrumb" aria-label="Breadcrumb">
								<span>{currentGroup.title}</span>
								<ChevronRight size={14} />
								<span aria-current="page">{matchedNav.label}</span>
							</nav>
						)}
					</div>
					<div className="topbar-controls">
						{runtime.data?.user && <UserMenu user={runtime.data.user} />}
						<Tooltip content="Toggle theme">
							<button
								className="icon-button"
								type="button"
								aria-label="Toggle theme"
								onClick={() => {
									const next = theme === 'dark' ? 'light' : 'dark';
									localStorage.setItem('mb_theme', next);
									setTheme(next);
								}}
							>
								{theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
							</button>
						</Tooltip>
					</div>
				</header>
				<main className="content">
					{runtime.data?.configReload && !runtime.data.configReload.synchronized && (
						<StatusBanner state="warn" title="Configuration reload failed">
							The last configuration reload was rejected, so the gateway is still running the
							previous configuration. Fix the configuration and save it to retry.
						</StatusBanner>
					)}
					{runtime.data?.ui.configStoreMode === 'readOnly' && (
						<StatusBanner state="info" title="Read-only mode">
							The UI is configured as read-only. Editing is disabled.
						</StatusBanner>
					)}
					<Outlet />
				</main>
			</div>
		</div>
	);
}

function UserMenu({ user }: { user: RuntimeUser }) {
	const [open, setOpen] = useState(false);
	const trigger = useRef<HTMLButtonElement>(null);
	const ref = useDismissiblePopover<HTMLDivElement>(open, () => {
		setOpen(false);
		trigger.current?.focus();
	});
	const label = user.name || user.email || user.subject || 'Signed in';
	const initials = user.name
		? user.name
				.split(/\s+/)
				.slice(0, 2)
				.map(part => Array.from(part)[0])
				.join('')
				.toLocaleUpperCase()
		: Array.from(user.email || user.subject || '')
				.slice(0, 1)
				.join('')
				.toLocaleUpperCase();

	return (
		<div className="user-menu" ref={ref}>
			<button
				ref={trigger}
				className="user-menu-trigger"
				type="button"
				aria-label={`Account: ${label}`}
				aria-expanded={open}
				aria-controls="user-menu-panel"
				onClick={() => setOpen(!open)}
			>
				<span className="user-avatar" aria-hidden="true">
					{initials || <UserRound size={16} />}
				</span>
				<span className="user-menu-name">{label}</span>
				<ChevronDown size={14} aria-hidden="true" />
			</button>
			{open && (
				<section id="user-menu-panel" className="user-menu-panel" aria-label="Your account">
					<div className="user-menu-identity">
						<span className="user-menu-caption">Signed in as</span>
						<strong>{label}</strong>
						{user.email && user.email !== label && <span>{user.email}</span>}
					</div>
					{user.canLogout && (
						<form action={`${apiBase}/api/auth/logout`} method="post">
							<button className="user-menu-signout" type="submit">
								<LogOut size={16} aria-hidden="true" />
								Sign out
							</button>
						</form>
					)}
				</section>
			)}
		</div>
	);
}

function navigationGroups(options: {
	hasBinds: boolean;
	hasLlm: boolean;
	hasMcp: boolean;
	hasTraffic: boolean;
	dumpMode: boolean;
}): ReadonlyArray<{ title: string; items: readonly NavItemConfig[] }> {
	const groups: Array<{ title: string; items: readonly NavItemConfig[] }> = [
		{
			title: 'Interactive Sandbox',
			items: [
				{ to: '/', label: 'Control Plane', icon: Compass },
				{ to: '/llm/playground', label: 'Live Agent Arena', icon: Sparkles },
				{ to: '/mcp/playground', label: 'MCP Inspector', icon: Terminal }
			]
		}
	];
	if (!options.dumpMode) {
		groups.push({
			title: 'Protocols (A2A & MCP)',
			items: [
				{ to: '/traffic/routes', label: 'A2A Agent Mesh', icon: Workflow },
				{ to: '/mcp/servers', label: 'MCP Tool Servers', icon: Blocks },
				...(options.hasBinds
					? [{ to: '/traffic/listeners', label: 'Mesh Listeners', icon: Radar }]
					: []),
				{ to: '/traffic/gateways', label: 'Ingress Gateways', icon: Radar },
				{ to: '/mcp/policies', label: 'MCP Access Policy', icon: Lock }
			]
		});
		groups.push({
			title: 'Safety & Governance',
			items: [
				{ to: '/llm/guardrails', label: 'AI Guardrails', icon: ShieldAlert },
				{ to: '/llm/policies', label: 'Traffic Policies', icon: ShieldCheck },
				{ to: '/cel', label: 'CEL Rule Engine', icon: Binary }
			]
		});
		groups.push({
			title: 'Models & Cost Router',
			items: [
				{ to: '/llm/models', label: 'Model Router', icon: Cpu },
				{ to: '/llm/providers', label: 'NIM Providers', icon: Layers },
				{ to: '/llm/costs', label: 'Cost & Pricing', icon: Wallet },
				{ to: '/llm/keys', label: 'Scoped Virtual Keys', icon: Fingerprint }
			]
		});
		groups.push({
			title: 'Telemetry & Config',
			items: [
				{ to: '/llm/logs', label: 'Live Trace Logs', icon: Activity },
				{ to: '/llm/analytics', label: 'Spend Analytics', icon: LineChart },
				{ to: '/raw-config', label: 'YAML Manifest', icon: Code2, exact: true },
				{ to: '/llm/client-setup', label: 'SDK Integration', icon: Plug },
				{ to: '/settings', label: 'System Settings', icon: Cog }
			]
		});
	} else {
		groups.push({
			title: 'Protocols & Models',
			items: [
				{ to: '/llm/models', label: 'Model Router', icon: Cpu },
				{ to: '/traffic/routes', label: 'A2A Agent Mesh', icon: Workflow },
				{ to: '/traffic/listeners', label: 'Mesh Listeners', icon: Radar },
				{ to: '/traffic/policies', label: 'Traffic Policies', icon: ShieldCheck },
				{ to: '/cel', label: 'CEL Rule Engine', icon: Binary }
			]
		});
	}
	return groups;
}

function NavSection(props: {
	title: string;
	items: readonly NavItemConfig[];
	currentPath: string;
}) {
	return (
		<>
			<div className="nav-section">{props.title}</div>
			{props.items.map(item => (
				<NavItem key={item.to} {...item} currentPath={props.currentPath} />
			))}
		</>
	);
}

function MobileNavSection(props: {
	title: string;
	items: readonly NavItemConfig[];
	currentPath: string;
}) {
	return (
		<>
			<div className="mobile-nav-section">{props.title}</div>
			{props.items.map(item => (
				<MobileNavItem key={item.to} {...item} currentPath={props.currentPath} />
			))}
		</>
	);
}

function MobileNavItem(props: {
	to: string;
	label: string;
	icon: React.ComponentType<{ size?: number }>;
	currentPath: string;
	placeholder?: boolean;
	groupStart?: boolean;
	exact?: boolean;
}) {
	const Icon = props.icon;
	const navigate = useNavigate();
	const active = props.placeholder ? false : navItemActive(props, props.currentPath);
	if (props.placeholder) {
		return (
			<button
				type="button"
				className={props.groupStart ? 'mobile-nav-item nav-group-start' : 'mobile-nav-item'}
				onClick={() => void navigate({ to: props.to })}
			>
				<Icon size={16} />
				<span>{props.label}</span>
			</button>
		);
	}
	return (
		<Link
			to={props.to}
			className={`${active ? 'mobile-nav-item active' : 'mobile-nav-item'}${props.groupStart ? ' nav-group-start' : ''}`}
		>
			<Icon size={16} />
			<span>{props.label}</span>
		</Link>
	);
}

function NavItem(props: {
	to: string;
	label: string;
	icon: React.ComponentType<{ size?: number }>;
	currentPath: string;
	placeholder?: boolean;
	groupStart?: boolean;
	exact?: boolean;
}) {
	const Icon = props.icon;
	const navigate = useNavigate();
	const active = props.placeholder ? false : navItemActive(props, props.currentPath);
	if (props.placeholder) {
		return (
			<button
				type="button"
				className={props.groupStart ? 'nav-item nav-group-start' : 'nav-item'}
				onClick={() => void navigate({ to: props.to })}
			>
				<Icon size={17} />
				<span>{props.label}</span>
			</button>
		);
	}
	return (
		<Link
			to={props.to}
			className={`${active ? 'nav-item active' : 'nav-item'}${props.groupStart ? ' nav-group-start' : ''}`}
		>
			<Icon size={17} />
			<span>{props.label}</span>
		</Link>
	);
}

function navItemActive(item: { to: string; exact?: boolean }, path: string) {
	if (item.to === '/') return path === '/';
	if (item.exact) return path === item.to;
	return path === item.to || path.startsWith(`${item.to}/`);
}
