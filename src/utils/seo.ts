import { site } from '@/config';
import type { SEOProps } from '@/types';

export function getSeoMetadata(props: SEOProps) {
	const {
		title,
		description = site.description,
		ogImage = site.ogImage || '/ogpages/home.webp',
		noIndex = false,
		canonicalUrl,
	} = props;

	const pageTitle = title ? `${title} — ${site.name}` : site.title;
	const canonical = canonicalUrl ?? ''; // Layout will handle full URL if needed, or we can resolve it here

	return {
		pageTitle,
		description,
		ogImage,
		noIndex,
		canonical,
		siteName: site.name,
		author: site.author,
		twitter: site.twitter,
		locale: site.locale,
	};
}

export function getPersonSchema() {
	return {
		'@context': 'https://schema.org',
		'@type': 'Person',
		name: site.author,
		url: site.url,
		sameAs: [
			`https://github.com/${site.github}`,
			`https://twitter.com/${site.twitter.replace('@', '')}`,
			'https://www.linkedin.com/in/steve-mcdougall/',
		],
	};
}

export function formatJsonLd(jsonLd?: Record<string, unknown> | Record<string, unknown>[]) {
	if (!jsonLd) return [];
	return Array.isArray(jsonLd) ? jsonLd : [jsonLd];
}
