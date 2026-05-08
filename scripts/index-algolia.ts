#!/usr/bin/env bun
/**
 * Indexes all site content to Algolia.
 * Run: bun scripts/index-algolia.ts
 * Requires ALGOLIA_APP_ID, ALGOLIA_ADMIN_API_KEY, ALGOLIA_INDEX_NAME in .env
 */
import { algoliasearch } from 'algoliasearch';
import matter from 'gray-matter';
import { readFileSync, readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';

const APP_ID = process.env.ALGOLIA_APP_ID;
const ADMIN_KEY = process.env.ALGOLIA_ADMIN_API_KEY;
const INDEX_NAME = process.env.ALGOLIA_INDEX_NAME ?? 'articles';

if (!APP_ID || !ADMIN_KEY) {
	console.error('Missing ALGOLIA_APP_ID or ALGOLIA_ADMIN_API_KEY in environment');
	process.exit(1);
}

const client = algoliasearch(APP_ID, ADMIN_KEY);
const CONTENT_DIR = resolve('./src/content');

interface ContentEntry {
	id: string;
	data: Record<string, unknown>;
	body: string;
}

function readCollection(dir: string): ContentEntry[] {
	const base = join(CONTENT_DIR, dir);
	const files = readdirSync(base).filter(
		(f) => f.endsWith('.md') || f.endsWith('.mdx')
	);
	return files.map((file) => {
		const raw = readFileSync(join(base, file), 'utf-8');
		const { data, content } = matter(raw);
		return {
			id: file.replace(/\.(md|mdx)$/, ''),
			data,
			body: content,
		};
	});
}

function excerpt(body: string, maxLen = 250): string {
	return body
		.replace(/^import\s.+$/gm, '')           // strip MDX imports
		.replace(/<[^>]+>/g, ' ')                 // strip JSX/HTML tags
		.replace(/```[\s\S]*?```/g, '')            // strip code blocks
		.replace(/`[^`\n]+`/g, (m) => m.slice(1, -1)) // inline code → plain
		.replace(/#{1,6}\s+/g, '')                 // strip headings
		.replace(/\*{1,2}([^*\n]+)\*{1,2}/g, '$1') // bold/italic → plain
		.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')  // links → label
		.replace(/\s+/g, ' ')
		.trim()
		.slice(0, maxLen);
}

interface AlgoliaRecord {
	objectID: string;
	type: string;
	title: string;
	description: string;
	excerpt: string;
	url: string;
	date?: number;
	tags?: string[];
	category?: string;
}

const records: AlgoliaRecord[] = [];

// --- Articles ---
for (const { id, data, body } of readCollection('articles')) {
	if (data.draft) continue;
	records.push({
		objectID: `article:${id}`,
		type: 'article',
		title: String(data.title ?? ''),
		description: String(data.description ?? ''),
		excerpt: excerpt(body),
		url: `/articles/${id}`,
		date: data.pubDate ? new Date(String(data.pubDate)).getTime() : undefined,
		tags: Array.isArray(data.tags) ? data.tags : [],
		category: String(data.category ?? ''),
	});
}
console.log(`  articles: ${records.length}`);

const articlesCount = records.length;

// --- Reviews ---
for (const { id, data, body } of readCollection('reviews')) {
	records.push({
		objectID: `review:${id}`,
		type: 'review',
		title: String(data.title ?? ''),
		description: String(data.description ?? ''),
		excerpt: excerpt(body),
		url: `/reviews/${id}`,
		date: data.pubDate ? new Date(String(data.pubDate)).getTime() : undefined,
		tags: Array.isArray(data.tags) ? data.tags : [],
		category: String(data.subject ?? ''),
	});
}
console.log(`  reviews: ${records.length - articlesCount}`);

const reviewsEnd = records.length;

// --- API Guides ---
for (const { id, data, body } of readCollection('api-guides')) {
	records.push({
		objectID: `api-guide:${id}`,
		type: 'api-guide',
		title: String(data.title ?? ''),
		description: String(data.description ?? ''),
		excerpt: excerpt(body),
		url: `/api-guides/${data.slug ?? id}`,
		tags: Array.isArray(data.tags) ? data.tags : [],
		category: String(data.category ?? ''),
	});
}
console.log(`  api-guides: ${records.length - reviewsEnd}`);

const guidesEnd = records.length;

// --- Talks ---
for (const { id, data } of readCollection('talks')) {
	records.push({
		objectID: `talk:${id}`,
		type: 'talk',
		title: String(data.title ?? ''),
		description: String(data.event ?? ''),
		excerpt: [data.event, data.location].filter(Boolean).join(' — '),
		url: String(data.url ?? '/talks'),
		date: data.date ? new Date(String(data.date)).getTime() : undefined,
		category: String(data.category ?? ''),
	});
}
console.log(`  talks: ${records.length - guidesEnd}`);

const talksEnd = records.length;

// --- Videos ---
for (const { id, data } of readCollection('videos')) {
	records.push({
		objectID: `video:${id}`,
		type: 'video',
		title: String(data.title ?? ''),
		description: String(data.description ?? ''),
		excerpt: String(data.description ?? ''),
		url: `/videos/${id}`,
		date: data.publishedDate ? new Date(String(data.publishedDate)).getTime() : undefined,
		tags: Array.isArray(data.tags) ? data.tags : [],
		category: String(data.type ?? 'video'),
	});
}
console.log(`  videos: ${records.length - talksEnd}`);

// --- Push to Algolia ---
console.log(`\nPushing ${records.length} records to index "${INDEX_NAME}"...`);

await client.saveObjects({
	indexName: INDEX_NAME,
	objects: records,
});

console.log(`Done.`);
