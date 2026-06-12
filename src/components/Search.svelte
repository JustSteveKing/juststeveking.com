<script lang="ts">
	import { onMount } from 'svelte';
	import { liteClient as algoliasearch } from 'algoliasearch/lite';
	import {
		PUBLIC_ALGOLIA_APP_ID,
		PUBLIC_ALGOLIA_SEARCH_API_KEY,
		PUBLIC_ALGOLIA_INDEX_NAME,
	} from 'astro:env/client';

	const client = algoliasearch(PUBLIC_ALGOLIA_APP_ID, PUBLIC_ALGOLIA_SEARCH_API_KEY);

	type Hit = {
		objectID: string;
		title: string;
		description?: string;
		category?: string;
		slug?: string;
		url?: string;
	};

	let open = $state(false);
	let query = $state('');
	let hits = $state<Hit[]>([]);
	let loading = $state(false);
	let selectedIndex = $state(-1);
	let inputEl = $state<HTMLInputElement | undefined>(undefined);
	let dialogEl = $state<HTMLDivElement | undefined>(undefined);
	let triggerEl = $state<HTMLButtonElement | undefined>(undefined);
	let statusMsg = $state('');
	let debounce: ReturnType<typeof setTimeout>;

	const activeDescendantId = $derived(
		selectedIndex >= 0 ? `search-hit-${selectedIndex}` : undefined,
	);

	function show() {
		open = true;
		selectedIndex = -1;
		setTimeout(() => inputEl?.focus(), 50);
	}

	function hide() {
		open = false;
		query = '';
		hits = [];
		selectedIndex = -1;
		statusMsg = '';
		triggerEl?.focus();
	}

	async function search(q: string) {
		if (!q.trim()) {
			hits = [];
			statusMsg = '';
			return;
		}
		loading = true;
		try {
			const { results } = await client.search<Hit>([
				{
					indexName: PUBLIC_ALGOLIA_INDEX_NAME,
					query: q,
					params: { hitsPerPage: 8 },
				},
			]);
			hits = (results[0] as any).hits ?? [];
			statusMsg = hits.length
				? `${hits.length} result${hits.length === 1 ? '' : 's'} found`
				: 'No results found';
			window.posthog?.capture('search_performed', {
				search_query: q,
				search_result_count: hits.length,
			});
		} finally {
			loading = false;
		}
	}

	function getUrl(hit: Hit): string {
		if (hit.url) return hit.url;
		if (hit.slug) return `/articles/${hit.slug}/`;
		return `/articles/${hit.objectID}/`;
	}

	function navigate(hit: Hit) {
		window.posthog?.capture('search_result_clicked', {
			search_result_title: hit.title,
			search_result_category: hit.category ?? null,
			search_result_url: getUrl(hit),
		});
		window.location.href = getUrl(hit);
	}

	function handleResultClick(hit: Hit) {
		window.posthog?.capture('search_result_clicked', {
			search_result_title: hit.title,
			search_result_category: hit.category ?? null,
			search_result_url: getUrl(hit),
		});
		hide();
	}

	function trapFocus(e: KeyboardEvent) {
		if (e.key !== 'Tab' || !dialogEl) return;
		const focusable = Array.from(
			dialogEl.querySelectorAll<HTMLElement>(
				'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])',
			),
		);
		if (!focusable.length) return;
		const first = focusable[0];
		const last = focusable[focusable.length - 1];
		if (e.shiftKey) {
			if (document.activeElement === first) {
				e.preventDefault();
				last.focus();
			}
		} else {
			if (document.activeElement === last) {
				e.preventDefault();
				first.focus();
			}
		}
	}

	function onKeydown(e: KeyboardEvent) {
		if (!open) return;
		if (e.key === 'ArrowDown') {
			e.preventDefault();
			selectedIndex = Math.min(selectedIndex + 1, hits.length - 1);
		} else if (e.key === 'ArrowUp') {
			e.preventDefault();
			selectedIndex = Math.max(selectedIndex - 1, -1);
		} else if (e.key === 'Enter' && selectedIndex >= 0 && hits[selectedIndex])
			navigate(hits[selectedIndex]);
		else if (e.key === 'Escape') hide();
		else trapFocus(e);
	}

	function onQuery(e: Event) {
		query = (e.target as HTMLInputElement).value;
		clearTimeout(debounce);
		debounce = setTimeout(() => search(query), 200);
	}

	function onGlobalKeydown(e: KeyboardEvent) {
		if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
			e.preventDefault();
			open ? hide() : show();
		}
		if (
			e.key === '/' &&
			!open &&
			document.activeElement?.tagName !== 'INPUT' &&
			document.activeElement?.tagName !== 'TEXTAREA'
		) {
			e.preventDefault();
			show();
		}
	}

	onMount(() => {
		document.addEventListener('keydown', onGlobalKeydown);
		return () => document.removeEventListener('keydown', onGlobalKeydown);
	});
</script>

<button
	bind:this={triggerEl}
	onclick={show}
	aria-label="Search site (press / or Ctrl+K)"
	class="font-mono text-[14px] fg-strong border-b border-b-transparent transition-[border-color] hover:border-b-current cursor-pointer bg-transparent p-0"
>
	<span aria-hidden="true">⌘K</span>
</button>

<!-- Screen-reader live status -->
<div aria-live="polite" aria-atomic="true" class="visually-hidden">{statusMsg}</div>

{#if open}
	<!-- Overlay -->
	<div class="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4">
		<!-- Backdrop -->
		<div
			class="absolute inset-0 bg-black/50 backdrop-blur-sm"
			onclick={hide}
			aria-hidden="true"
		></div>

		<!-- Dialog -->
		<div
			bind:this={dialogEl}
			role="dialog"
			aria-modal="true"
			aria-label="Site search"
			tabindex="-1"
			class="relative w-full max-w-xl rounded-2xl border border-edge bg-surface shadow-2xl overflow-hidden"
			onkeydown={onKeydown}
		>
			<!-- Input row -->
			<div class="flex items-center gap-3 px-4 py-3 border-b border-edge">
				<svg
					viewBox="0 0 16 16"
					fill="none"
					stroke="currentColor"
					stroke-width="1.5"
					class="w-4 h-4 shrink-0 fg-weak"
					aria-hidden="true"
				>
					<circle cx="6.5" cy="6.5" r="4" />
					<path d="M11 11l3 3" stroke-linecap="round" />
				</svg>
				<input
					bind:this={inputEl}
					id="search-input"
					type="search"
					role="combobox"
					aria-label="Search site content"
					aria-autocomplete="list"
					aria-controls="search-results"
					aria-activedescendant={activeDescendantId}
					aria-expanded={hits.length > 0}
					placeholder="Search articles, reviews, talks…"
					value={query}
					oninput={onQuery}
					class="flex-1 bg-transparent font-mono text-sm fg-strong placeholder:fg-weak outline-none border-none"
					autocomplete="off"
					spellcheck={false}
				/>
				{#if loading}
					<span aria-live="polite" class="visually-hidden">Loading results…</span>
					<svg
						class="w-4 h-4 fg-weak animate-spin"
						viewBox="0 0 24 24"
						fill="none"
						aria-hidden="true"
					>
						<circle
							cx="12"
							cy="12"
							r="10"
							stroke="currentColor"
							stroke-width="2"
							stroke-dasharray="32"
							stroke-dashoffset="12"
						/>
					</svg>
				{/if}
				<button
					onclick={hide}
					aria-label="Close search"
					class="font-mono text-[10px] fg-weak border border-edge rounded px-1.5 py-0.5 transition-colors hover:fg-accent hover:border-accent"
				>
					<span aria-hidden="true">ESC</span>
				</button>
			</div>

			<!-- Results -->
			<ul
				id="search-results"
				aria-label="Search results"
				class="list-none p-0 m-0 max-h-[50vh] overflow-y-auto"
			>
				{#if hits.length > 0}
					{#each hits as hit, i}
						<li id="search-hit-{i}">
							<a
								href={getUrl(hit)}
								class="flex flex-col gap-0.5 px-4 py-3 border-b border-edge-weak last:border-b-0 no-underline transition-colors"
								class:bg-surface-weak={selectedIndex === i}
								aria-current={selectedIndex === i ? 'true' : undefined}
								onmouseenter={() => (selectedIndex = i)}
								onclick={() => handleResultClick(hit)}
							>
								<div class="flex items-center gap-2">
									{#if hit.category}
										<span
											class="font-mono text-[10px] fg-accent uppercase tracking-[0.06em] font-semibold"
											>{hit.category}</span
										>
									{/if}
									<span class="text-[14px] font-medium fg-strong leading-snug">{hit.title}</span>
								</div>
								{#if hit.description}
									<span class="text-[12px] fg leading-relaxed line-clamp-1">{hit.description}</span>
								{/if}
							</a>
						</li>
					{/each}
				{:else if query.trim() && !loading}
					<li>
						<div class="px-4 py-8 text-center">
							<p class="font-mono text-[13px] fg-weak">
								No results for <span class="fg-strong">"{query}"</span>
							</p>
						</div>
					</li>
				{:else if !query.trim()}
					<li>
						<div class="px-4 py-6">
							<p class="font-mono text-[11px] fg-weak uppercase tracking-[0.08em] mb-3">
								Quick navigation
							</p>
							<div class="flex flex-wrap gap-2">
								{#each ['/articles', '/talks', '/videos', '/services', '/about'] as href}
									<a
										{href}
										onclick={hide}
										class="font-mono text-[11px] fg-weak border border-edge rounded-[3px] px-2 py-1 no-underline transition-colors hover:border-accent hover:fg-accent"
									>
										{href}
									</a>
								{/each}
							</div>
						</div>
					</li>
				{/if}
			</ul>

			<!-- Footer -->
			<div
				class="flex items-center gap-4 px-4 py-2 border-t border-edge-weak bg-surface-weak"
				aria-hidden="true"
			>
				<span class="font-mono text-[10px] fg-weak">↑↓ navigate</span>
				<span class="font-mono text-[10px] fg-weak">↵ open</span>
				<span class="font-mono text-[10px] fg-weak">esc close</span>
				<span class="ml-auto font-mono text-[10px] fg-weak">Algolia</span>
			</div>
		</div>
	</div>
{/if}
