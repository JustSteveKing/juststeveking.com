<script lang="ts">
	import { onMount } from 'svelte';
	import ReviewSection from './ReviewSection.svelte';
	import ScoreGaugeRow from './ScoreGaugeRow.svelte';
	import type { ReviewExperienceProps } from './types';

	export let scores: ReviewExperienceProps['scores'];
	export let sections: ReviewExperienceProps['sections'];
	export let footerNote: ReviewExperienceProps['footerNote'];

	let activeSectionId = sections[0]?.id ?? '';

	onMount(() => {
		if (!sections.length) return;

		activeSectionId = sections[0].id;

		const sectionElements = sections
			.map((section) => document.getElementById(section.id))
			.filter((el): el is HTMLElement => Boolean(el));

		const topOffset = 140;
		const switchThreshold = 24;
		let rafId = 0;

		const updateActiveSection = () => {
			let crossedIndex = 0;
			for (let i = 0; i < sectionElements.length; i++) {
				const top = sectionElements[i].getBoundingClientRect().top;
				if (top - topOffset <= 0) crossedIndex = i;
				else break;
			}

			const activeIndex = Math.max(
				0,
				sectionElements.findIndex((el) => el.id === activeSectionId),
			);

			if (crossedIndex > activeIndex) {
				if (
					sectionElements[crossedIndex].getBoundingClientRect().top - topOffset <=
					-switchThreshold
				) {
					activeSectionId = sectionElements[crossedIndex].id;
				}
			} else if (crossedIndex < activeIndex) {
				if (
					sectionElements[activeIndex].getBoundingClientRect().top - topOffset >=
					switchThreshold
				) {
					activeSectionId = sectionElements[crossedIndex].id;
				}
			}
			rafId = 0;
		};

		const onScroll = () => {
			if (!rafId) rafId = window.requestAnimationFrame(updateActiveSection);
		};

		updateActiveSection();
		window.addEventListener('scroll', onScroll, { passive: true });
		window.addEventListener('resize', onScroll);

		return () => {
			if (rafId) window.cancelAnimationFrame(rafId);
			window.removeEventListener('scroll', onScroll);
			window.removeEventListener('resize', onScroll);
		};
	});

	function scrollToSection(sectionId: string) {
		const el = document.getElementById(sectionId);
		if (!el) return;
		const offset = 100;
		const top = el.getBoundingClientRect().top - document.body.getBoundingClientRect().top - offset;
		window.scrollTo({ top, behavior: 'smooth' });
	}
</script>

<div class="review-shell">
	<ScoreGaugeRow {scores} onSelect={scrollToSection} />

	<div class="review-content-wrap">
		<aside class="section-nav" aria-label="Section navigation">
			<p>Contents</p>
			<ul>
				{#each sections as section}
					<li>
						<button
							class:active={activeSectionId === section.id}
							type="button"
							on:click={() => scrollToSection(section.id)}
						>
							<span class="nav-num">{section.number}</span>
							<span class="nav-title">{section.title}</span>
						</button>
					</li>
				{/each}
			</ul>
		</aside>

		<div class="review-sections">
			{#each sections as section}
				<div class="section-divider" aria-hidden="true"><hr /></div>
				<ReviewSection {section} />
			{/each}
		</div>
	</div>

	<footer class="review-footer">
		<p>{footerNote}</p>
	</footer>
</div>

<style>
	.review-shell {
		--review-accent: var(--color-accent);
		--review-ink: var(--color-text-strong);
		--review-ink-muted: var(--color-text-weak);
		--review-border: var(--color-border);
		--review-bg: var(--color-bg);
		--review-bg-weak: var(--color-bg-weak);
		--review-mono: var(--font-mono);

		margin: 0 auto 80px;
		border: 1px solid var(--review-border);
		border-radius: 12px;
		background: var(--review-bg);
	}

	.review-content-wrap {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		gap: 28px;
		padding-top: 40px;
	}

	.review-sections {
		min-width: 0;
	}

	.section-nav {
		display: none;
	}

	.section-nav p {
		margin: 0 0 16px;
		font-family: var(--review-mono);
		font-size: 10px;
		font-weight: 700;
		letter-spacing: 0.15em;
		text-transform: uppercase;
		color: var(--review-accent);
	}

	.section-nav ul {
		margin: 0;
		padding: 0;
		list-style: none;
	}
	.section-nav li + li {
		margin-top: 4px;
	}

	.section-nav button {
		display: flex;
		align-items: center;
		gap: 10px;
		width: 100%;
		border: 1px solid transparent;
		border-radius: 6px;
		background: transparent;
		padding: 8px 12px;
		font-size: 13px;
		line-height: 1.4;
		text-align: left;
		color: var(--review-ink-muted);
		cursor: pointer;
		transition: all 0.15s;
	}

	.section-nav button:hover {
		color: var(--review-ink);
		background: var(--review-bg-weak);
	}

	.section-nav button.active {
		border-color: var(--review-border);
		background: var(--review-bg-weak);
		color: var(--review-accent);
	}

	.nav-num {
		font-family: var(--review-mono);
		font-size: 11px;
		opacity: 0.5;
	}

	.section-divider {
		max-width: 100%;
		margin: 0;
		padding: 0 40px;
	}

	.section-divider hr {
		margin: 0 0 48px;
		border: 0;
		border-top: 1px solid var(--review-border);
	}

	.review-footer {
		max-width: 900px;
		margin: 0 auto;
		padding: 40px 40px 60px;
		border-top: 1px solid var(--review-border);
	}

	.review-footer p {
		margin: 0;
		font-size: 14px;
		font-style: italic;
		line-height: 1.7;
		color: var(--review-ink-muted);
	}

	@media (max-width: 720px) {
		.review-shell {
			margin: 0 -16px 64px;
			border-radius: 0;
			border-left: 0;
			border-right: 0;
		}

		.section-divider {
			padding: 0 20px;
		}
		.review-footer {
			padding: 32px 20px 48px;
		}
	}

	@media (min-width: 1160px) {
		.review-content-wrap {
			grid-template-columns: 240px minmax(0, 1fr);
			align-items: start;
			padding-right: 40px;
		}

		.section-nav {
			position: sticky;
			top: 100px;
			max-height: calc(100vh - 140px);
			overflow: auto;
			display: block;
			margin-left: 32px;
			border: 1px solid var(--review-border);
			border-radius: 8px;
			background: var(--review-bg-weak);
			padding: 20px;
		}
	}
</style>
