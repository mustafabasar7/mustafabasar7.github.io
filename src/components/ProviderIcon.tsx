import {
	Anthropic,
	AzureAI,
	Baseten,
	Bedrock,
	Cerebras,
	ChatGLM,
	Claude,
	Cohere,
	DeepInfra,
	DeepSeek,
	Fireworks,
	Gemini,
	GithubCopilot,
	Grok,
	Groq,
	HuggingFace,
	Kimi,
	LangGraph,
	MCP,
	Meta,
	Minimax,
	Mistral,
	Nebius,
	Nvidia,
	Ollama,
	OpenAI,
	OpenRouter,
	Perplexity,
	Qwen,
	Together,
	TypeSafeAI,
	VertexAI
} from '@lobehub/icons';
import type { ComponentType } from 'react';
import { providerDisplayName } from '@/config';
import type { ProviderName } from '@/types';

type AvatarComponent = ComponentType<{
	size?: number;
	shape?: 'circle' | 'square';
	style?: React.CSSProperties;
}>;

const lobeProviderAvatars: Record<string, AvatarComponent> = {
	openai: OpenAI.Avatar,
	openAI: OpenAI.Avatar,
	anthropic: Claude.Avatar,
	claude: Claude.Avatar,
	gemini: Gemini.Avatar,
	vertex: VertexAI.Avatar,
	bedrock: Bedrock.Avatar,
	azure: AzureAI.Avatar,
	copilot: GithubCopilot.Avatar,
	typesafe: TypeSafeAI.Avatar,
	cohere: Cohere.Avatar,
	ollama: Ollama.Avatar,
	baseten: Baseten.Avatar,
	cerebras: Cerebras.Avatar,
	deepinfra: DeepInfra.Avatar,
	deepseek: DeepSeek.Avatar,
	groq: Groq.Avatar,
	huggingface: HuggingFace.Avatar,
	mistral: Mistral.Avatar,
	openrouter: OpenRouter.Avatar,
	togetherai: Together.Avatar,
	xai: Grok.Avatar,
	fireworks: Fireworks.Avatar,
	meta: Meta.Avatar,
	perplexity: Perplexity.Avatar,
	nebius: Nebius.Avatar,
	nvidia: Nvidia.Avatar,
	'nvidia-nim-cloud': Nvidia.Avatar,
	custom: Nvidia.Avatar,
	mcp: MCP.Avatar,
	a2a: LangGraph.Avatar,
	qwen: Qwen.Avatar,
	glm: ChatGLM.Avatar,
	kimi: Kimi.Avatar,
	minimax: Minimax.Avatar,
	anthropic_raw: Anthropic.Avatar
};

export function ProviderIcon(props: { provider: ProviderName | string; size?: number }) {
	const size = props.size ?? 20;
	const key = (props.provider || '').trim();
	const lower = key.toLowerCase();

	let AvatarComp = lobeProviderAvatars[key] ?? lobeProviderAvatars[lower];
	if (!AvatarComp) {
		if (lower.includes('nvidia') || lower.includes('nemotron') || lower.includes('nim')) {
			AvatarComp = Nvidia.Avatar;
		} else if (lower.includes('deepseek')) {
			AvatarComp = DeepSeek.Avatar;
		} else if (lower.includes('mcp')) {
			AvatarComp = MCP.Avatar;
		} else if (lower.includes('a2a') || lower.includes('agent')) {
			AvatarComp = LangGraph.Avatar;
		} else if (lower.includes('claude') || lower.includes('anthropic')) {
			AvatarComp = Claude.Avatar;
		} else if (lower.includes('gpt') || lower.includes('openai')) {
			AvatarComp = OpenAI.Avatar;
		} else if (lower.includes('gemini') || lower.includes('google')) {
			AvatarComp = Gemini.Avatar;
		} else if (lower.includes('llama') || lower.includes('meta')) {
			AvatarComp = Meta.Avatar;
		} else if (lower.includes('qwen')) {
			AvatarComp = Qwen.Avatar;
		} else if (lower.includes('glm')) {
			AvatarComp = ChatGLM.Avatar;
		} else if (lower.includes('kimi') || lower.includes('moonshot')) {
			AvatarComp = Kimi.Avatar;
		} else if (lower.includes('minimax')) {
			AvatarComp = Minimax.Avatar;
		}
	}

	if (AvatarComp) {
		return (
			<span
				className="provider-icon-lobe"
				style={{
					display: 'inline-flex',
					alignItems: 'center',
					justifyContent: 'center',
					flexShrink: 0
				}}
				aria-hidden="true"
			>
				<AvatarComp size={size} shape="square" />
			</span>
		);
	}

	return (
		<span className="provider-icon provider-icon-fallback">
			{providerInitials(props.provider)}
		</span>
	);
}

function providerInitials(provider: ProviderName | string) {
	const display = providerDisplayName(provider);
	const words = display.split(/\s+/).filter(Boolean);
	if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
	return words
		.slice(0, 2)
		.map(word => word[0])
		.join('')
		.toUpperCase();
}
