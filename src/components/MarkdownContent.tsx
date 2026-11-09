import type { ReactNode } from 'react';

function renderInline(text: string): ReactNode[] {
	const nodes: ReactNode[] = [];
	const tokenRegex =
		/(\*\*([^*]+)\*\*|`([^`]+)`|\[([^\]]+)\]\((https?:\/\/[^\s)]+|mailto:[^\s)]+)\)|(?<![\w/])(https?:\/\/[^\s,)]+))/g;
	let lastIndex = 0;
	let match: RegExpExecArray | null = null;
	let key = 0;

	// biome-ignore lint/suspicious/noAssignInExpressions: Standard regex loop
	while ((match = tokenRegex.exec(text)) !== null) {
		if (match.index > lastIndex) {
			nodes.push(text.slice(lastIndex, match.index));
		}
		if (match[2] !== undefined) {
			nodes.push(<strong key={`b-${key++}`}>{match[2]}</strong>);
		} else if (match[3] !== undefined) {
			nodes.push(
				<code key={`c-${key++}`} className="chat-md-inline-code">
					{match[3]}
				</code>
			);
		} else if (match[4] !== undefined && match[5] !== undefined) {
			nodes.push(
				<a
					key={`a-${key++}`}
					href={match[5]}
					target="_blank"
					rel="noreferrer"
					className="chat-md-link"
				>
					{match[4]}
				</a>
			);
		} else if (match[6] !== undefined) {
			nodes.push(
				<a
					key={`u-${key++}`}
					href={match[6]}
					target="_blank"
					rel="noreferrer"
					className="chat-md-link"
				>
					{match[6]}
				</a>
			);
		}
		lastIndex = tokenRegex.lastIndex;
	}

	if (lastIndex < text.length) {
		nodes.push(text.slice(lastIndex));
	}

	return nodes;
}

function isTableSeparator(line: string): boolean {
	const trimmed = line.trim();
	if (!trimmed.startsWith('|') || !trimmed.endsWith('|')) return false;
	const cells = trimmed
		.slice(1, -1)
		.split('|')
		.map(c => c.trim());
	return cells.length > 0 && cells.every(c => /^:?-{2,}:?$/.test(c));
}

function parseTableRow(line: string): string[] {
	const trimmed = line.trim();
	const inner = trimmed.startsWith('|') ? trimmed.slice(1) : trimmed;
	const clean = inner.endsWith('|') ? inner.slice(0, -1) : inner;
	return clean.split('|').map(c => c.trim());
}

export function MarkdownContent({ content }: { content: string }) {
	const lines = content.replace(/\r\n/g, '\n').split('\n');
	const blocks: ReactNode[] = [];
	let i = 0;
	let blockKey = 0;

	while (i < lines.length) {
		const line = lines[i];
		const trimmed = line.trim();

		if (!trimmed) {
			i++;
			continue;
		}

		// Horizontal rule
		if (/^(-{3,}|\*{3,})$/.test(trimmed)) {
			blocks.push(<hr key={`hr-${blockKey++}`} className="chat-md-hr" />);
			i++;
			continue;
		}

		// Fenced code block
		if (trimmed.startsWith('```')) {
			const lang = trimmed.slice(3).trim();
			const codeLines: string[] = [];
			i++;
			while (i < lines.length && !lines[i].trim().startsWith('```')) {
				codeLines.push(lines[i]);
				i++;
			}
			if (i < lines.length) i++;
			blocks.push(
				<div key={`code-${blockKey++}`} className="chat-md-code-wrap">
					{lang ? <div className="chat-md-code-lang">{lang}</div> : null}
					<pre className="chat-md-pre">
						<code>{codeLines.join('\n')}</code>
					</pre>
				</div>
			);
			continue;
		}

		// Markdown table
		if (
			trimmed.startsWith('|') &&
			i + 1 < lines.length &&
			isTableSeparator(lines[i + 1])
		) {
			const headers = parseTableRow(lines[i]);
			i += 2;
			const rows: string[][] = [];
			while (i < lines.length && lines[i].trim().startsWith('|')) {
				if (!isTableSeparator(lines[i])) {
					rows.push(parseTableRow(lines[i]));
				}
				i++;
			}
			blocks.push(
				<div key={`tbl-${blockKey++}`} className="chat-md-table-wrap">
					<table className="chat-md-table">
						<thead>
							<tr>
								{headers.map((h, idx) => (
									// biome-ignore lint/suspicious/noArrayIndexKey: static markdown table header
									<th key={idx}>{renderInline(h)}</th>
								))}
							</tr>
						</thead>
						<tbody>
							{rows.map((r, rIdx) => (
								// biome-ignore lint/suspicious/noArrayIndexKey: static markdown table row
								<tr key={rIdx}>
									{r.map((cell, cIdx) => (
										// biome-ignore lint/suspicious/noArrayIndexKey: static markdown table cell
										<td key={cIdx}>{renderInline(cell)}</td>
									))}
								</tr>
							))}
						</tbody>
					</table>
				</div>
			);
			continue;
		}

		// Headings
		const headingMatch = /^(#{1,4})\s+(.+)$/.exec(trimmed);
		if (headingMatch) {
			const level = headingMatch[1].length;
			const text = headingMatch[2];
			if (level <= 2) {
				blocks.push(
					<h3 key={`h-${blockKey++}`} className="chat-md-h3">
						{renderInline(text)}
					</h3>
				);
			} else {
				blocks.push(
					<h4 key={`h-${blockKey++}`} className="chat-md-h4">
						{renderInline(text)}
					</h4>
				);
			}
			i++;
			continue;
		}

		// Unordered list
		if (/^([*-]|•)\s+/.test(trimmed)) {
			const items: string[] = [];
			while (i < lines.length && /^([*-]|•)\s+/.test(lines[i].trim())) {
				items.push(lines[i].trim().replace(/^([*-]|•)\s+/, ''));
				i++;
			}
			blocks.push(
				<ul key={`ul-${blockKey++}`} className="chat-md-list">
					{items.map((item, idx) => (
						// biome-ignore lint/suspicious/noArrayIndexKey: static markdown list
						<li key={idx}>{renderInline(item)}</li>
					))}
				</ul>
			);
			continue;
		}

		// Ordered list
		if (/^\d+\.\s+/.test(trimmed)) {
			const items: string[] = [];
			while (i < lines.length && /^\d+\.\s+/.test(lines[i].trim())) {
				items.push(lines[i].trim().replace(/^\d+\.\s+/, ''));
				i++;
			}
			blocks.push(
				<ol key={`ol-${blockKey++}`} className="chat-md-list ordered">
					{items.map((item, idx) => (
						// biome-ignore lint/suspicious/noArrayIndexKey: static markdown list
						<li key={idx}>{renderInline(item)}</li>
					))}
				</ol>
			);
			continue;
		}

		// Paragraph
		const paraLines: string[] = [];
		while (
			i < lines.length &&
			lines[i].trim() &&
			!lines[i].trim().startsWith('```') &&
			!lines[i].trim().startsWith('#') &&
			!lines[i].trim().startsWith('|') &&
			!/^([*-]|•)\s+/.test(lines[i].trim()) &&
			!/^\d+\.\s+/.test(lines[i].trim()) &&
			!/^(-{3,}|\*{3,})$/.test(lines[i].trim())
		) {
			paraLines.push(lines[i].trim());
			i++;
		}
		blocks.push(
			<p key={`p-${blockKey++}`} className="chat-md-p">
				{paraLines.map((pLine, idx) => (
					// biome-ignore lint/suspicious/noArrayIndexKey: paragraph line break
					<span key={idx}>
						{idx > 0 ? <br /> : null}
						{renderInline(pLine)}
					</span>
				))}
			</p>
		);
	}

	return <div className="chat-md-root">{blocks}</div>;
}
