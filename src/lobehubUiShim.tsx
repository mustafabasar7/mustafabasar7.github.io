import { CpuBoltBoldDuotoneIcon } from '@solar-icons/react';
import type { ComponentType, CSSProperties, HTMLAttributes, ReactNode } from 'react';

export const cssVar = {
	colorTextDescription: '#94a3b8',
	colorFillSecondary: 'rgba(16, 185, 129, 0.14)'
};

export function ProviderIcon(props: { size?: number; color?: string; style?: CSSProperties }) {
	return <CpuBoltBoldDuotoneIcon size={props.size ?? 16} color={props.color} style={props.style} />;
}

export function Icon({
	icon: IconComp,
	size = 16,
	color,
	style,
	...rest
}: HTMLAttributes<HTMLSpanElement> & {
	icon?: ComponentType<{ size?: number; color?: string; style?: CSSProperties }>;
	size?: number;
	color?: string;
}) {
	if (!IconComp) return null;
	return (
		<span
			style={{
				display: 'inline-flex',
				alignItems: 'center',
				justifyContent: 'center',
				color,
				...style
			}}
			{...rest}
		>
			<IconComp size={size} color={color} />
		</span>
	);
}

export function useThemeMode() {
	const isDarkMode =
		typeof document === 'undefined' || document.documentElement.dataset.theme !== 'light';
	return { isDarkMode, themeMode: isDarkMode ? 'dark' : 'light' };
}

export function Center({
	children,
	style,
	flex,
	height,
	width,
	...rest
}: HTMLAttributes<HTMLSpanElement> & {
	flex?: string | number;
	height?: string | number;
	width?: string | number;
	children?: ReactNode;
}) {
	return (
		<span
			style={{
				display: 'inline-flex',
				alignItems: 'center',
				justifyContent: 'center',
				flex,
				height,
				width,
				...style
			}}
			{...rest}
		>
			{children}
		</span>
	);
}

export function Flexbox({
	children,
	style,
	horizontal,
	align,
	justify,
	flex,
	height,
	width,
	gap,
	...rest
}: HTMLAttributes<HTMLSpanElement> & {
	horizontal?: boolean;
	align?: CSSProperties['alignItems'];
	justify?: CSSProperties['justifyContent'];
	flex?: string | number;
	height?: string | number;
	width?: string | number;
	gap?: string | number;
	children?: ReactNode;
}) {
	return (
		<span
			style={{
				display: 'inline-flex',
				flexDirection: horizontal ? 'row' : 'column',
				alignItems: align,
				justifyContent: justify,
				flex,
				height,
				width,
				gap,
				...style
			}}
			{...rest}
		>
			{children}
		</span>
	);
}

export function Tag({
	icon,
	children,
	style,
	...rest
}: HTMLAttributes<HTMLSpanElement> & {
	icon?: ReactNode;
	children?: ReactNode;
}) {
	return (
		<span
			style={{
				display: 'inline-flex',
				alignItems: 'center',
				gap: 6,
				...style
			}}
			{...rest}
		>
			{icon}
			{children}
		</span>
	);
}
