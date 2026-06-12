import { join } from 'path';
import { Glob } from 'bun';
import matter from 'gray-matter';
import { BaseCommand } from './base-command';
import type { CrustCommandContext } from '@crustjs/core';

type CrossPostArticle = {
	path: string;
	slug: string;
	title: string;
	description: string;
	body: string;
	tags: string[];
	canonical: string;
	series?: string;
	order?: number;
	pubDate: Date;
	sourceIndex: number;
};

export class CrossPostDevtoCommand extends BaseCommand<any, any, any> {
	public name = 'cross-post:devto';
	public description = 'Cross-post articles to dev.to';

	public override flags = {
		'dry-run': { type: 'boolean', description: 'No API calls will be made.' },
	} as const;

	private readonly API_KEY = process.env.DEVTO_API_KEY;
	private readonly ARTICLES_DIR = join(process.cwd(), 'src', 'content', 'articles');
	private readonly REQUEST_DELAY_MS = parseInt(process.env.DEVTO_REQUEST_DELAY_MS ?? '1000');
	private readonly MAX_RETRIES = parseInt(process.env.DEVTO_MAX_RETRIES ?? '5');

	public async handle(ctx: CrustCommandContext<any, typeof this.flags>) {
		const { flags } = ctx;
		const DRY_RUN = flags['dry-run'];

		if (!this.API_KEY && !DRY_RUN) {
			console.error('Error: DEVTO_API_KEY environment variable is required.');
			process.exit(1);
		}

		if (DRY_RUN) console.log('[dry-run] No API calls will be made.\n');

		const articles = await this.getArticlesToCrossPost();

		if (articles.length === 0) {
			console.log('No articles found with shouldCrossPost: true.');
			return;
		}

		console.log(`Found ${articles.length} article(s) to cross-post.\n`);

		for (const article of articles) {
			console.log(`🚀 Processing: ${article.title}`);

			if (DRY_RUN) {
				console.log(`   [dry-run] Would cross-post to dev.to`);
				continue;
			}

			try {
				const res = await this.postToDevto(article);
				const devToUrl = res.url;

				let content = await Bun.file(article.path).text();

				content = content
					.replace(/^shouldCrossPost:\s*true\s*$/m, `devTo: "${devToUrl}"`)
					.replace(/^shouldCrossPost:\s*"true"\s*$/m, `devTo: "${devToUrl}"`);

				await Bun.write(article.path, content);
				console.log(`   ✅ Successfully cross-posted to ${devToUrl}`);
			} catch (e: any) {
				console.error(`   ❌ Error: ${e.message}`);
			}

			if (this.REQUEST_DELAY_MS > 0) {
				await this.sleep(this.REQUEST_DELAY_MS);
			}
		}

		console.log('\nDone.');
	}

	private async getArticlesToCrossPost() {
		const glob = new Glob('*.mdx');
		const articles: CrossPostArticle[] = [];
		let sourceIndex = 0;

		for await (const file of glob.scan(this.ARTICLES_DIR)) {
			const path = join(this.ARTICLES_DIR, file);
			const content = await Bun.file(path).text();
			const { data, content: body } = matter(content);

			if (data.shouldCrossPost === true && !data.devTo) {
				articles.push({
					path,
					slug: file.replace(/\.mdx$/, ''),
					title: data.title,
					description: data.description,
					body,
					tags: data.tags ?? [],
					canonical:
						data.canonical ??
						`https://www.juststeveking.com/articles/${file.replace(/\.mdx$/, '')}`,
					series: data.series,
					order: this.normalizeNumber(data.order),
					pubDate: this.normalizeDate(data.pubDate),
					sourceIndex: sourceIndex++,
				});
			}
		}

		return articles.sort((left, right) => this.compareArticlesForPosting(left, right));
	}

	private compareArticlesForPosting(left: CrossPostArticle, right: CrossPostArticle): number {
		if (left.series && right.series && left.series === right.series) {
			const orderComparison = this.compareSeriesOrder(left, right);
			if (orderComparison !== 0) return orderComparison;

			const dateComparison = left.pubDate.getTime() - right.pubDate.getTime();
			if (dateComparison !== 0) return dateComparison;

			const titleComparison = left.title.localeCompare(right.title);
			if (titleComparison !== 0) return titleComparison;
		}

		return left.sourceIndex - right.sourceIndex;
	}

	private compareSeriesOrder(left: CrossPostArticle, right: CrossPostArticle): number {
		const leftHasOrder = Number.isFinite(left.order);
		const rightHasOrder = Number.isFinite(right.order);

		if (leftHasOrder && rightHasOrder) {
			const orderComparison = (left.order ?? 0) - (right.order ?? 0);
			if (orderComparison !== 0) return orderComparison;
		}

		if (leftHasOrder !== rightHasOrder) {
			return leftHasOrder ? -1 : 1;
		}

		return 0;
	}

	private normalizeNumber(value: unknown): number | undefined {
		if (typeof value === 'number' && Number.isFinite(value)) {
			return value;
		}

		if (typeof value === 'string' && value.trim() !== '') {
			const parsed = Number(value);
			if (Number.isFinite(parsed)) {
				return parsed;
			}
		}

		return undefined;
	}

	private normalizeDate(value: unknown): Date {
		if (value instanceof Date) {
			return value;
		}

		if (typeof value === 'string' || typeof value === 'number') {
			const parsed = new Date(value);
			if (!Number.isNaN(parsed.getTime())) {
				return parsed;
			}
		}

		return new Date(0);
	}

	private async postToDevto(article: any) {
		const lines = article.body.trim().split('\n');
		if (lines[0] && lines[0].startsWith('# ')) {
			lines.shift();
		}
		const body = lines.join('\n').trim();

		const payload: any = {
			article: {
				title: article.title,
				published: true,
				body_markdown: body,
				tags: article.tags
					.slice(0, 4)
					.map((t: string) => t.toLowerCase().replace(/[^a-z0-9]/g, '')),
				canonical_url: article.canonical,
				description: article.description,
			},
		};

		if (article.series && typeof article.series === 'string') {
			payload.article.series = article.series;
		}

		for (let attempt = 1; attempt <= this.MAX_RETRIES; attempt++) {
			const res = await fetch('https://dev.to/api/articles', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'api-key': this.API_KEY!,
				},
				body: JSON.stringify(payload),
			});

			if (res.ok) {
				return res.json();
			}

			const bodyText = await res.text();

			if (res.status !== 429 || attempt === this.MAX_RETRIES) {
				throw new Error(`dev.to API ${res.status}: ${bodyText}`);
			}

			const retryAfterMs = this.parseRetryAfterMs(res.headers.get('retry-after'));
			const backoffMs = Math.max(retryAfterMs, 1000 * Math.pow(2, attempt - 1));

			console.warn(
				`   ⏳ Rate limited by dev.to, retrying in ${Math.ceil(backoffMs / 1000)}s (attempt ${attempt}/${this.MAX_RETRIES})`,
			);
			await this.sleep(backoffMs);
		}

		throw new Error('dev.to API request failed after retries.');
	}

	private parseRetryAfterMs(value: string | null): number {
		if (!value) return 0;

		const seconds = Number(value);
		if (!Number.isNaN(seconds)) {
			return Math.max(0, seconds * 1000);
		}

		const retryAfterDate = Date.parse(value);
		if (!Number.isNaN(retryAfterDate)) {
			return Math.max(0, retryAfterDate - Date.now());
		}

		return 0;
	}

	private async sleep(ms: number) {
		await new Promise((resolve) => setTimeout(resolve, ms));
	}
}
