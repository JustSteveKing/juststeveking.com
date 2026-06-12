import { defineCollection, reference } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const series = defineCollection({
	loader: glob({ base: 'src/content/series', pattern: '**/*.{md,mdx}' }),
	schema: z.object({
		title: z.string(),
		description: z.string().optional(),
	}),
});

const apiGuides = defineCollection({
	loader: glob({ base: 'src/content/api-guides', pattern: '**/*.{md,mdx}' }),
	schema: z.object({
		title: z.string(),
		slug: z.string().optional(),
		description: z.string().max(220),
		category: z.string(),
		complexity: z.enum(['intro', 'intermediate', 'advanced']).default('intro'),
		apiStyles: z.array(z.string()).default([]),
		useWhen: z.string(),
		avoidWhen: z.string(),
		tags: z.array(z.string()).default([]),
		related: z.array(z.string()).default([]),
		featured: z.boolean().default(false),
		order: z.number().optional(),
		publishedDate: z.coerce.date().optional(),
	}),
});

const articles = defineCollection({
	loader: glob({ base: 'src/content/articles', pattern: '**/*.{md,mdx}' }),
	schema: z.object({
		title: z.string(),
		description: z.string().max(200),
		category: z.string().default('Uncategorized'),
		tags: z.array(z.string()).default([]),
		pubDate: z.coerce.date(),
		updatedDate: z.coerce.date().optional(),
		image: z.string().optional(),
		minRead: z.number().optional(),
		draft: z.boolean().default(false).optional(),
		featured: z.boolean().default(false).optional(),
		readingTime: z.number().optional(),
		canonical: z.string().url().optional(),
		series: reference('series').optional(),
		order: z.number().optional(),
		sponsor: z
			.object({
				name: z.string(),
				url: z.string().url(),
				logo: z.string().url(),
			})
			.optional(),
		crossPost: z
			.object({
				originalUrl: z.string().url(),
				originalSite: z.string(),
				publishedDate: z.coerce.date(),
				permission: z.boolean(),
			})
			.optional(),
	}),
});

const testimonials = defineCollection({
	loader: glob({ base: 'src/content/testimonials', pattern: '**/*.{md,mdx}' }),
	schema: z.object({
		quote: z.string(),
		author: z.object({
			name: z.string(),
			role: z.string(),
			company: z.string(),
			avatar: z
				.object({
					src: z.string().url(),
				})
				.optional(),
		}),
	}),
});

const videos = defineCollection({
	loader: glob({ base: 'src/content/videos', pattern: '**/*.{md,mdx}' }),
	schema: z.object({
		title: z.string(),
		description: z.string(),
		videoId: z.string(),
		publishedDate: z.coerce.date(),
		duration: z.string(),
		views: z.string().optional(),
		thumbnail: z.string().optional(),
		tags: z.array(z.string()).default([]),
		categories: z.array(z.string()).default([]),
		type: z.enum(['video', 'shorts', 'livestream']).default('video'),
		featured: z.boolean().default(false),
		difficulty: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
		transcript: z.boolean().default(false),
		series: reference('series').optional(),
	}),
});

const packages = defineCollection({
	loader: glob({ base: 'src/content/packages', pattern: '**/*.{md,mdx}' }),
	schema: z.object({
		name: z.string(),
		description: z.string(),
		packagist: z.string().url().optional(),
		github: z.string().url().optional(),
		link: z.string().url().optional(),
		tech: z.array(z.string()).optional(),
		order: z.number().optional(),
		featured: z.boolean().default(false),
		downloads: z.number().optional(),
		monthlyDownloads: z.number().optional(),
		stars: z.number().optional(),
		version: z.string().optional(),
		updatedAt: z.coerce.date().optional(),
	}),
});

const talks = defineCollection({
	loader: glob({ base: 'src/content/talks', pattern: '**/*.{md,mdx}' }),
	schema: z.object({
		title: z.string(),
		event: z.string(),
		location: z.string(),
		date: z.coerce.date(),
		category: z.enum(['conference', 'workshop', 'meetup', 'webinar', 'panel']),
		description: z.string().optional(),
		url: z.string().url().optional(),
		slides: z.string().url().optional(),
		video: z.string().url().optional(),
		tags: z.array(z.string()).default([]),
		featured: z.boolean().default(false),
		upcoming: z.boolean().default(false),
		order: z.number().optional(),
	}),
});

const podcasts = defineCollection({
	loader: glob({ base: 'src/content/podcasts', pattern: '**/*.{md,mdx}' }),
	schema: z.object({
		title: z.string(),
		episode: z.string(),
		date: z.coerce.date(),
		url: z.string().url().optional(),
		description: z.string().optional(),
	}),
});

const tools = defineCollection({
	loader: glob({ base: 'src/content/tools', pattern: '**/*.json' }),
	schema: z.object({
		title: z.string(),
		icon: z.string(),
		items: z
			.array(
				z.object({
					name: z.string(),
					description: z.string().optional(),
					url: z.string().url().optional(),
				}),
			)
			.min(1),
	}),
});

const contributions = defineCollection({
	loader: glob({ base: 'src/content/contributions', pattern: '**/*.{md,mdx}' }),
	schema: z.object({
		project: z.string(),
		description: z.string(),
		url: z.string().url().optional(),
		order: z.number().optional(),
	}),
});

const reviews = defineCollection({
	loader: glob({
		base: 'src/content/reviews',
		pattern: '**/*.{md,mdx}',
	}),
	schema: z.object({
		title: z.string(),
		description: z.string().max(220),
		pubDate: z.coerce.date(),
		updatedDate: z.coerce.date().optional(),
		subject: z.string(),
		subjectUrl: z.string().url().optional(),
		badge: z.string().default('In Review'),
		meta: z.array(z.string()).default([]),
		tags: z.array(z.string()).default([]),
		featured: z.boolean().default(false),
	}),
});

export const collections = {
	apiGuides,
	articles,
	contributions,
	packages,
	podcasts,
	reviews,
	series,
	talks,
	testimonials,
	tools,
	videos,
};
