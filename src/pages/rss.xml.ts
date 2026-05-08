import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { site } from '@/config';
import type { APIContext } from 'astro';

export async function GET(context: APIContext) {
	const articles = await getCollection('articles', ({ data }) => !data.draft);
	const sorted = articles.sort((a, b) => b.data.pubDate.getTime() - a.data.pubDate.getTime());

	return rss({
		title: `${site.author} — Articles`,
		description: site.description,
		site: context.site!,
		items: sorted.map(article => ({
			title: article.data.title,
			pubDate: article.data.pubDate,
			description: article.data.description,
			link: `/articles/${article.id}/`,
			categories: [article.data.category, ...article.data.tags],
		})),
		customData: `<language>en-gb</language>`,
	});
}
