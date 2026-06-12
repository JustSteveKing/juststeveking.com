<script lang="ts">
	import { slide } from 'svelte/transition';
	import { inView } from './actions';
	import { evidencePalette, tonePalette } from './theme';
	import type { ReviewSectionData } from './types';

	type TabKey = 'findings' | 'detail' | 'recommendations';
	const tabOrder: TabKey[] = ['findings', 'detail', 'recommendations'];

	export let section: ReviewSectionData;

	let visible = false;
	let activeTab: TabKey = 'findings';
	let openEvidence = -1;

	function sanitizeHtml(input: string): string {
		return input
			.replace(/<\/?(script|style|iframe|object|embed)[^>]*>/gi, '')
			.replace(/\son[a-z]+="[^"]*"/gi, '')
			.replace(/\son[a-z]+='[^']*'/gi, '')
			.replace(/javascript:/gi, '');
	}

	function getTabId(tab: TabKey) {
		return `${section.id}-${tab}-tab`;
	}
	function getPanelId(tab: TabKey) {
		return `${section.id}-${tab}-panel`;
	}
	function activateTab(tab: TabKey) {
		activeTab = tab;
	}

	function onTabKeydown(event: KeyboardEvent) {
		const idx = tabOrder.indexOf(activeTab);
		if (idx === -1) return;
		if (event.key === 'ArrowRight') {
			event.preventDefault();
			activeTab = tabOrder[(idx + 1) % tabOrder.length];
		} else if (event.key === 'ArrowLeft') {
			event.preventDefault();
			activeTab = tabOrder[(idx - 1 + tabOrder.length) % tabOrder.length];
		} else if (event.key === 'Home') {
			event.preventDefault();
			activeTab = tabOrder[0];
		} else if (event.key === 'End') {
			event.preventDefault();
			activeTab = tabOrder[tabOrder.length - 1];
		}
	}

	function toggleEvidence(index: number) {
		openEvidence = openEvidence === index ? -1 : index;
	}

	function withRef(url: string): string {
		try {
			const hasWindow = typeof window !== 'undefined';
			const base = hasWindow ? window.location.href : 'https://juststeveking.com';
			const parsed = new URL(url, base);
			const isHttp = parsed.protocol === 'http:' || parsed.protocol === 'https:';
			const isExternal = hasWindow ? parsed.origin !== window.location.origin : true;
			if (!isHttp || !isExternal) return url;
			parsed.searchParams.set('ref', 'juststeveking');
			return parsed.toString();
		} catch {
			return url;
		}
	}
</script>

<section
	id={section.id}
	class:visible
	class="review-section"
	use:inView={{ threshold: 0.1, onEnter: () => (visible = true) }}
>
	<div class="section-header">
		<span class="section-num">{section.number}</span>
		<div class="section-titles">
			<h2>{section.title}</h2>
			<p>{section.subtitle}</p>
		</div>
	</div>

	<div
		class="tab-bar"
		role="tablist"
		tabindex="0"
		aria-label={`${section.title} tabs`}
		on:keydown={onTabKeydown}
	>
		{#each [['findings', 'Findings'], ['detail', 'Analysis'], ['recommendations', 'Action Items']] as [key, label]}
			<button
				id={getTabId(key)}
				class:active={activeTab === key}
				type="button"
				role="tab"
				aria-selected={activeTab === key}
				aria-controls={getPanelId(key)}
				tabindex={activeTab === key ? 0 : -1}
				on:click={() => activateTab(key)}>{label}</button
			>
		{/each}
	</div>

	<div class="panel-container">
		{#if activeTab === 'findings'}
			<div
				id={getPanelId('findings')}
				class="panel"
				role="tabpanel"
				aria-labelledby={getTabId('findings')}
				tabindex="0"
			>
				<div class="prose-content">
					{#each section.findings as paragraph}
						<p>{@html sanitizeHtml(paragraph)}</p>
					{/each}
				</div>

				<div class="evidence-list">
					{#each section.evidence as evidence, index}
						{@const palette = evidencePalette[evidence.kind]}
						<article class:open={openEvidence === index} class="evidence-card">
							<button
								class="evidence-header"
								type="button"
								aria-expanded={openEvidence === index}
								aria-controls={`${section.id}-evidence-${index}`}
								on:click={() => toggleEvidence(index)}
							>
								<div class="evidence-main">
									<span
										class="evidence-tag"
										style={`background:${palette.soft};color:${palette.solid}`}
									>
										{palette.label}
									</span>
									<span class="evidence-title">{evidence.title}</span>
								</div>
								<div class="evidence-toggle">
									<svg
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										stroke-width="2.5"
										stroke-linecap="round"
										stroke-linejoin="round"
									>
										<line x1="12" y1="5" x2="12" y2="19"></line>
										<line x1="5" y1="12" x2="19" y2="12"></line>
									</svg>
								</div>
							</button>
							{#if openEvidence === index}
								<div
									id={`${section.id}-evidence-${index}`}
									class="evidence-body"
									transition:slide={{ duration: 220 }}
								>
									<div class="evidence-content">
										{#each evidence.body as body}
											<p>{@html sanitizeHtml(body)}</p>
										{/each}
										{#if evidence.sourceUrl}
											<a
												class="source-url"
												href={withRef(evidence.sourceUrl)}
												target="_blank"
												rel="noreferrer noopener"
											>
												<svg
													viewBox="0 0 24 24"
													fill="none"
													stroke="currentColor"
													stroke-width="2"
													stroke-linecap="round"
													stroke-linejoin="round"
												>
													<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
													<polyline points="15 3 21 3 21 9"></polyline>
													<line x1="10" y1="14" x2="21" y2="3"></line>
												</svg>
												{evidence.sourceLabel ?? 'View Source'}
											</a>
										{/if}
									</div>
								</div>
							{/if}
						</article>
					{/each}
				</div>
			</div>
		{/if}

		{#if activeTab === 'detail'}
			<div
				id={getPanelId('detail')}
				class="panel"
				role="tabpanel"
				aria-labelledby={getTabId('detail')}
				tabindex="0"
			>
				<p class="breakdown-intro">{section.breakdownIntro}</p>
				<div class="breakdown-list">
					{#each section.breakdown as item, index}
						{@const tone = tonePalette[item.tone]}
						<div class="score-bar-row" style={`transition-delay:${index * 0.08}s`}>
							<div class="score-bar-info">
								<span class="score-bar-label">{item.label}</span>
								<span class="score-bar-value" style={`color:${tone.solid}`}>{item.value}%</span>
							</div>
							<div class="score-bar-track">
								<div
									class="score-bar-fill"
									style={`background:${tone.solid};width:${visible ? item.value : 0}%`}
								></div>
							</div>
						</div>
					{/each}
				</div>
			</div>
		{/if}

		{#if activeTab === 'recommendations'}
			<div
				id={getPanelId('recommendations')}
				class="panel"
				role="tabpanel"
				aria-labelledby={getTabId('recommendations')}
				tabindex="0"
			>
				<div class="action-items">
					<div class="action-items-title">Required Actions</div>
					{#each section.recommendations as item, index}
						<div class="action-item">
							<span class="action-item-index">{(index + 1).toString().padStart(2, '0')}</span>
							<span class="action-item-text">{@html sanitizeHtml(item)}</span>
						</div>
					{/each}
				</div>
			</div>
		{/if}
	</div>
</section>

<style>
	.review-section {
		max-width: 900px;
		margin: 0 auto;
		padding: 0 40px 80px;
		opacity: 0;
		transform: translateY(16px);
		transition:
			opacity 0.6s ease,
			transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
	}

	.review-section.visible {
		opacity: 1;
		transform: translateY(0);
	}

	.section-header {
		display: flex;
		align-items: flex-start;
		gap: 24px;
		margin-bottom: 28px;
	}

	.section-num {
		flex-shrink: 0;
		font-family: var(--font-mono);
		font-size: 44px;
		font-weight: 800;
		line-height: 0.85;
		letter-spacing: -0.05em;
		color: var(--color-border);
	}

	h2 {
		margin: 0;
		font-size: 28px;
		font-weight: 700;
		line-height: 1.15;
		letter-spacing: -0.02em;
		color: var(--color-text-strong);
	}

	.section-titles p {
		margin: 6px 0 0;
		font-size: 15px;
		line-height: 1.5;
		color: var(--color-text-weak);
	}

	.tab-bar {
		display: flex;
		gap: 4px;
		margin-bottom: 28px;
		padding: 3px;
		background: var(--color-bg-weak);
		border-radius: 6px;
		border: 1px solid var(--color-border);
	}

	.tab-bar button {
		flex: 1;
		border: 0;
		background: transparent;
		padding: 8px 14px;
		font-family: var(--font-mono);
		font-size: 11px;
		font-weight: 700;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--color-text-weak);
		border-radius: 4px;
		cursor: pointer;
		transition: all 0.15s;
	}

	.tab-bar button.active {
		background: var(--color-bg);
		color: var(--color-accent);
		border: 1px solid var(--color-border);
	}

	.prose-content p {
		margin: 0 0 18px;
		font-size: 15px;
		line-height: 1.75;
		color: var(--color-text);
	}

	.evidence-list {
		margin-top: 28px;
	}

	.evidence-card {
		margin-bottom: 8px;
		overflow: hidden;
		border: 1px solid var(--color-border-weak);
		border-radius: 8px;
		background: var(--color-bg);
		transition: border-color 0.15s;
	}

	.evidence-card.open {
		border-color: var(--color-border);
	}

	.evidence-header {
		display: flex;
		width: 100%;
		align-items: center;
		justify-content: space-between;
		gap: 16px;
		border: 0;
		background: transparent;
		padding: 14px 18px;
		text-align: left;
		cursor: pointer;
	}

	.evidence-main {
		display: flex;
		align-items: center;
		gap: 14px;
	}

	.evidence-tag {
		flex-shrink: 0;
		border-radius: 4px;
		padding: 3px 8px;
		font-family: var(--font-mono);
		font-size: 10px;
		font-weight: 700;
		letter-spacing: 0.08em;
		text-transform: uppercase;
	}

	.evidence-title {
		font-size: 14px;
		font-weight: 500;
		color: var(--color-text-strong);
	}

	.evidence-toggle {
		display: flex;
		width: 20px;
		height: 20px;
		align-items: center;
		justify-content: center;
		color: var(--color-text-weak);
		transition:
			transform 0.2s ease,
			color 0.15s;
	}

	.evidence-toggle svg {
		width: 14px;
		height: 14px;
	}
	.open .evidence-toggle {
		transform: rotate(45deg);
		color: var(--color-accent);
	}

	.evidence-content {
		border-top: 1px solid var(--color-border-weak);
		padding: 18px;
		background: var(--color-bg-weak);
	}

	.evidence-content p {
		margin: 0 0 10px;
		font-size: 14px;
		line-height: 1.65;
		color: var(--color-text);
	}

	.evidence-content p:last-of-type {
		margin-bottom: 0;
	}

	.source-url {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		margin-top: 14px;
		font-family: var(--font-mono);
		font-size: 11px;
		font-weight: 600;
		color: var(--color-accent);
		text-decoration: none;
		padding: 5px 10px;
		border: 1px solid var(--color-border);
		border-radius: 4px;
		transition: border-color 0.15s;
	}

	.source-url:hover {
		border-color: var(--color-accent);
	}
	.source-url svg {
		width: 11px;
		height: 11px;
	}

	.breakdown-intro {
		font-size: 14px;
		line-height: 1.65;
		color: var(--color-text);
		margin-bottom: 22px;
	}

	.score-bar-row {
		margin-bottom: 18px;
	}

	.score-bar-info {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 7px;
	}

	.score-bar-label {
		font-size: 13px;
		font-weight: 500;
		color: var(--color-text-strong);
	}

	.score-bar-value {
		font-family: var(--font-mono);
		font-size: 12px;
		font-weight: 700;
	}

	.score-bar-track {
		overflow: hidden;
		height: 5px;
		border-radius: 10px;
		background: var(--color-bg-weak);
		border: 1px solid var(--color-border-weak);
	}

	.score-bar-fill {
		height: 100%;
		border-radius: 10px;
		transition: width 1s cubic-bezier(0.16, 1, 0.3, 1);
	}

	.action-items {
		background: var(--color-bg-weak);
		border: 1px solid var(--color-border);
		border-radius: 8px;
		padding: 28px;
	}

	.action-items-title {
		margin-bottom: 20px;
		font-family: var(--font-mono);
		font-size: 10px;
		font-weight: 700;
		letter-spacing: 0.15em;
		text-transform: uppercase;
		color: var(--color-accent);
	}

	.action-item {
		display: flex;
		align-items: flex-start;
		gap: 14px;
		padding: 14px 0;
		border-bottom: 1px solid var(--color-border-weak);
	}

	.action-item:last-child {
		border-bottom: 0;
		padding-bottom: 0;
	}
	.action-item:first-child {
		padding-top: 0;
	}

	.action-item-index {
		flex-shrink: 0;
		font-family: var(--font-mono);
		font-size: 11px;
		font-weight: 700;
		margin-top: 2px;
		color: var(--color-accent);
	}

	.action-item-text {
		font-size: 14px;
		line-height: 1.65;
		color: var(--color-text);
	}

	@media (max-width: 720px) {
		.review-section {
			padding: 0 20px 64px;
		}
		.section-num {
			font-size: 30px;
		}
		h2 {
			font-size: 22px;
		}
		.tab-bar {
			overflow-x: auto;
		}
		.tab-bar button {
			padding: 7px 10px;
			white-space: nowrap;
		}
		.action-items {
			padding: 20px;
		}
	}
</style>
