import type { FooterGroup, NavLink } from '@/types';

export const navLinks: NavLink[] = [
	{ label: 'GitHub', href: 'https://github.com/JustSteveKing', external: true },
	{ label: 'Articles', href: '/articles' },
	{ label: 'Series', href: '/series' },
	{ label: 'Packages', href: '/projects' },
	{ label: 'Services', href: '/services' },
	{ label: 'About', href: '/about' },
];

export const footerGroups: FooterGroup[] = [
	{
		label: 'Writing',
		links: [
			{ label: 'Articles', href: '/articles' },
			{ label: 'Series', href: '/series' },
			{ label: 'Reviews', href: '/reviews' },
			{ label: 'API Guides', href: '/api-guides' },
			{ label: 'Podcasts', href: '/podcasts' },
		],
	},
	{
		label: 'Content',
		links: [
			{ label: 'Talks', href: '/talks' },
			{ label: 'Videos', href: '/videos' },
		],
	},
	{
		label: 'Work',
		links: [
			{ label: 'Services', href: '/services' },
			{ label: 'Packages', href: '/projects' },
			{ label: 'Work History', href: '/work' },
			{ label: 'Career Framework', href: '/career-framework' },
		],
	},
	{
		label: 'Connect',
		links: [
			{ label: 'About', href: '/about' },
			{ label: 'Uses', href: '/uses' },
			{ label: 'Design Kit', href: '/design-kit' },
			{ label: 'GitHub', href: 'https://github.com/JustSteveKing', external: true },
		],
	},
];
