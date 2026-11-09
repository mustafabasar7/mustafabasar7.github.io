import {
	AddCircleBoldDuotoneIcon,
	AltArrowDownBoldDuotoneIcon,
	AltArrowRightBoldDuotoneIcon,
	ArrowLeftBoldDuotoneIcon,
	ArrowRightBoldDuotoneIcon,
	BotBoldDuotoneIcon,
	BracesBoldDuotoneIcon,
	BrainBoldDuotoneIcon,
	BranchingPathsUpBoldDuotoneIcon,
	CalendarDateBoldDuotoneIcon,
	ChatRoundDotsBoldDuotoneIcon,
	CheckCircleBoldDuotoneIcon,
	ChecklistMinimalisticBoldDuotoneIcon,
	ClipboardListBoldDuotoneIcon,
	ClipboardTextBoldDuotoneIcon,
	ClockCircleBoldDuotoneIcon,
	CloseCircleBoldDuotoneIcon,
	CloseSquareBoldDuotoneIcon,
	CloudDownloadBoldDuotoneIcon,
	CodeCircleBoldDuotoneIcon,
	CodeSquareBoldDuotoneIcon,
	CopyBoldDuotoneIcon,
	CpuBoltBoldDuotoneIcon,
	DangerTriangleBoldDuotoneIcon,
	DatabaseBoldDuotoneIcon,
	DisketteBoldDuotoneIcon,
	DocumentTextBoldDuotoneIcon,
	DollarBoldDuotoneIcon,
	EyeClosedBoldDuotoneIcon,
	EyeScanBoldDuotoneIcon,
	FileCodeBoldDuotoneIcon,
	FileLockBoldDuotoneIcon,
	FileTerminalBoldDuotoneIcon,
	FilterBoldDuotoneIcon,
	GlobalBoldDuotoneIcon,
	HashtagCircleBoldDuotoneIcon,
	type IconProps,
	InfoCircleBoldDuotoneIcon,
	KeyMinimalisticSquare2BoldDuotoneIcon,
	KeySquare2BoldDuotoneIcon,
	LayersBoldDuotoneIcon,
	MenuDotsCircleBoldDuotoneIcon,
	PenNewSquareBoldDuotoneIcon,
	PlayCircleBoldDuotoneIcon,
	PlugCircleBoldDuotoneIcon,
	Pulse2BoldDuotoneIcon,
	QuestionCircleBoldDuotoneIcon,
	RefreshCircleBoldDuotoneIcon,
	RestartCircleBoldDuotoneIcon,
	RoundedMagnifierBoldDuotoneIcon,
	Routing2BoldDuotoneIcon,
	Routing3BoldDuotoneIcon,
	SendSquareBoldDuotoneIcon,
	ServerSquareCloudBoldDuotoneIcon,
	ServerSquareUpdateBoldDuotoneIcon,
	SettingsBoldDuotoneIcon,
	ShieldCheckBoldDuotoneIcon,
	ShieldCrossBoldDuotoneIcon,
	ShieldKeyholeBoldDuotoneIcon,
	ShieldMinimalisticBoldDuotoneIcon,
	ShieldNetworkBoldDuotoneIcon,
	SpeedometerMaxBoldDuotoneIcon,
	SquareTopDownBoldDuotoneIcon,
	StopwatchPlayBoldDuotoneIcon,
	StructureBoldDuotoneIcon,
	TagHorizontalBoldDuotoneIcon,
	TextFieldFocusBoldDuotoneIcon,
	TrashBinTrashBoldDuotoneIcon,
	Tuning2BoldDuotoneIcon,
	TuningSquare2BoldDuotoneIcon,
	UndoLeftRoundSquareBoldDuotoneIcon,
	UserCircleBoldDuotoneIcon,
	VerifiedCheckBoldDuotoneIcon
} from '@solar-icons/react';
import type { ComponentType } from 'react';

function withSolarStyle(SolarComp: ComponentType<IconProps>, accentColor?: string) {
	const Wrapped = (props: IconProps) => {
		const { size = 17, style, secondaryOpacity = 0.42, ...rest } = props;
		return (
			<SolarComp
				size={size}
				secondaryOpacity={secondaryOpacity}
				style={{
					...(accentColor ? { color: accentColor } : {}),
					...style
				}}
				{...rest}
			/>
		);
	};
	return Wrapped;
}

export const Activity = withSolarStyle(Pulse2BoldDuotoneIcon, '#10b981');
export const AlertTriangle = withSolarStyle(DangerTriangleBoldDuotoneIcon, '#f59e0b');
export const ArrowLeft = withSolarStyle(ArrowLeftBoldDuotoneIcon);
export const ArrowRight = withSolarStyle(ArrowRightBoldDuotoneIcon);
export const Bot = withSolarStyle(BotBoldDuotoneIcon, '#10b981');
export const Braces = withSolarStyle(BracesBoldDuotoneIcon, '#38bdf8');
export const Brain = withSolarStyle(BrainBoldDuotoneIcon, '#a78bfa');
export const Cable = withSolarStyle(PlugCircleBoldDuotoneIcon, '#38bdf8');
export const CalendarDays = withSolarStyle(CalendarDateBoldDuotoneIcon, '#38bdf8');
export const Check = withSolarStyle(CheckCircleBoldDuotoneIcon, '#10b981');
export const CheckCircle2 = withSolarStyle(VerifiedCheckBoldDuotoneIcon, '#10b981');
export const ChevronDown = withSolarStyle(AltArrowDownBoldDuotoneIcon);
export const ChevronRight = withSolarStyle(AltArrowRightBoldDuotoneIcon);
export const CircleDollarSign = withSolarStyle(DollarBoldDuotoneIcon, '#fbbf24');
export const CircuitBoard = withSolarStyle(CpuBoltBoldDuotoneIcon, '#38bdf8');
export const Clipboard = withSolarStyle(ClipboardTextBoldDuotoneIcon);
export const Clock3 = withSolarStyle(ClockCircleBoldDuotoneIcon, '#38bdf8');
export const Code = withSolarStyle(CodeSquareBoldDuotoneIcon, '#a78bfa');
export const Code2 = withSolarStyle(CodeCircleBoldDuotoneIcon, '#a78bfa');
export const Copy = withSolarStyle(CopyBoldDuotoneIcon);
export const Database = withSolarStyle(DatabaseBoldDuotoneIcon, '#38bdf8');
export const DatabaseZap = withSolarStyle(ServerSquareUpdateBoldDuotoneIcon, '#10b981');
export const Download = withSolarStyle(CloudDownloadBoldDuotoneIcon, '#38bdf8');
export const Ellipsis = withSolarStyle(MenuDotsCircleBoldDuotoneIcon);
export const ExternalLink = withSolarStyle(SquareTopDownBoldDuotoneIcon);
export const Eye = withSolarStyle(EyeScanBoldDuotoneIcon, '#38bdf8');
export const EyeOff = withSolarStyle(EyeClosedBoldDuotoneIcon);
export const FileCode2 = withSolarStyle(FileCodeBoldDuotoneIcon, '#fbbf24');
export const FileKey2 = withSolarStyle(FileLockBoldDuotoneIcon, '#ec4899');
export const FileText = withSolarStyle(DocumentTextBoldDuotoneIcon, '#38bdf8');
export const Fingerprint = withSolarStyle(KeySquare2BoldDuotoneIcon, '#ec4899');
export const Funnel = withSolarStyle(FilterBoldDuotoneIcon, '#38bdf8');
export const Gauge = withSolarStyle(SpeedometerMaxBoldDuotoneIcon, '#10b981');
export const GitBranch = withSolarStyle(BranchingPathsUpBoldDuotoneIcon, '#a78bfa');
export const Globe2 = withSolarStyle(GlobalBoldDuotoneIcon, '#38bdf8');
export const Hash = withSolarStyle(HashtagCircleBoldDuotoneIcon, '#10b981');
export const HelpCircle = withSolarStyle(QuestionCircleBoldDuotoneIcon, '#38bdf8');
export const Info = withSolarStyle(InfoCircleBoldDuotoneIcon, '#38bdf8');
export const KeyRound = withSolarStyle(KeyMinimalisticSquare2BoldDuotoneIcon, '#fbbf24');
export const Layers3 = withSolarStyle(LayersBoldDuotoneIcon, '#a78bfa');
export const ListChecks = withSolarStyle(ChecklistMinimalisticBoldDuotoneIcon, '#10b981');
export const Loader2 = withSolarStyle(RefreshCircleBoldDuotoneIcon, '#10b981');
export const LockKeyhole = withSolarStyle(ShieldKeyholeBoldDuotoneIcon, '#f59e0b');
export const MessageSquare = withSolarStyle(ChatRoundDotsBoldDuotoneIcon, '#38bdf8');
export const Network = withSolarStyle(StructureBoldDuotoneIcon, '#38bdf8');
export const Pencil = withSolarStyle(PenNewSquareBoldDuotoneIcon, '#38bdf8');
export const Play = withSolarStyle(PlayCircleBoldDuotoneIcon, '#10b981');
export const Plus = withSolarStyle(AddCircleBoldDuotoneIcon, '#10b981');
export const RefreshCw = withSolarStyle(RestartCircleBoldDuotoneIcon, '#38bdf8');
export const RotateCcw = withSolarStyle(UndoLeftRoundSquareBoldDuotoneIcon, '#f59e0b');
export const Route = withSolarStyle(Routing2BoldDuotoneIcon, '#38bdf8');
export const Save = withSolarStyle(DisketteBoldDuotoneIcon, '#10b981');
export const ScrollText = withSolarStyle(ClipboardListBoldDuotoneIcon, '#38bdf8');
export const Search = withSolarStyle(RoundedMagnifierBoldDuotoneIcon, '#38bdf8');
export const Send = withSolarStyle(SendSquareBoldDuotoneIcon, '#10b981');
export const Server = withSolarStyle(ServerSquareCloudBoldDuotoneIcon, '#10b981');
export const Settings = withSolarStyle(SettingsBoldDuotoneIcon, '#94a3b8');
export const Shield = withSolarStyle(ShieldMinimalisticBoldDuotoneIcon, '#10b981');
export const ShieldBan = withSolarStyle(ShieldCrossBoldDuotoneIcon, '#f43f5e');
export const ShieldCheck = withSolarStyle(ShieldCheckBoldDuotoneIcon, '#10b981');
export const ShieldEllipsis = withSolarStyle(ShieldNetworkBoldDuotoneIcon, '#f59e0b');
export const SlidersHorizontal = withSolarStyle(TuningSquare2BoldDuotoneIcon, '#a78bfa');
export const Tags = withSolarStyle(TagHorizontalBoldDuotoneIcon, '#38bdf8');
export const Terminal = withSolarStyle(FileTerminalBoldDuotoneIcon, '#38bdf8');
export const TextCursorInput = withSolarStyle(TextFieldFocusBoldDuotoneIcon, '#10b981');
export const Timer = withSolarStyle(StopwatchPlayBoldDuotoneIcon, '#fbbf24');
export const Trash2 = withSolarStyle(TrashBinTrashBoldDuotoneIcon, '#f43f5e');
export const User = withSolarStyle(UserCircleBoldDuotoneIcon, '#38bdf8');
export const Workflow = withSolarStyle(Routing3BoldDuotoneIcon, '#10b981');
export const Wrench = withSolarStyle(Tuning2BoldDuotoneIcon, '#f59e0b');
export const X = withSolarStyle(CloseCircleBoldDuotoneIcon);
export const XCircle = withSolarStyle(CloseSquareBoldDuotoneIcon, '#f43f5e');
export type LucideIcon = ComponentType<IconProps>;
