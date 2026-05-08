import { getCollection, type CollectionEntry } from 'astro:content';

export const PAGE_SIZE = 20;

export function slugify(str: string): string {
	return str
		.toLowerCase()
		.trim()
		.replace(/[^\w\s-]/g, '')
		.replace(/[\s_]+/g, '-')
		.replace(/^-+|-+$/g, '');
}

export async function getAllArticles(): Promise<CollectionEntry<'articles'>[]> {
	const all = await getCollection('articles', ({ data }) => !data.draft);
	return all.sort((a, b) => b.data.pubDate.getTime() - a.data.pubDate.getTime());
}

export async function getAllCategories(): Promise<string[]> {
	const articles = await getAllArticles();
	return [...new Set(articles.map(a => a.data.category))].sort();
}

export async function getAllTags(): Promise<string[]> {
	const articles = await getAllArticles();
	return [...new Set(articles.flatMap(a => a.data.tags))].sort();
}

export async function getArticlesByCategory(category: string): Promise<CollectionEntry<'articles'>[]> {
	const articles = await getAllArticles();
	return articles.filter(a => slugify(a.data.category) === slugify(category));
}

export async function getArticlesByTag(tag: string): Promise<CollectionEntry<'articles'>[]> {
	const articles = await getAllArticles();
	return articles.filter(a => a.data.tags.some(t => slugify(t) === slugify(tag)));
}

export function paginateArticles(
	articles: CollectionEntry<'articles'>[],
	page: number,
	pageSize = PAGE_SIZE,
): {
	items: CollectionEntry<'articles'>[];
	currentPage: number;
	totalPages: number;
	total: number;
} {
	const total = articles.length;
	const totalPages = Math.ceil(total / pageSize);
	const items = articles.slice((page - 1) * pageSize, page * pageSize);
	return { items, currentPage: page, totalPages, total };
}
