import type {
	Post,
	Package,
	UsesCategory,
	Feature,
	PackageCommand,
	Stat,
	Testimonial,
	NavLink,
	PageMeta,
	TuiResult,
} from '@/types';

import homeRaw from './home.json';
import aboutRaw from './about.json';
import blogRaw from './blog.json';
import projectsRaw from './projects.json';
import usesRaw from './uses.json';

// ======= Blog =======

export const blogMeta: PageMeta = blogRaw.meta;
export const posts: Post[] = blogRaw.posts;

// ======= Projects =======

export const projectsMeta: PageMeta = projectsRaw.meta;
export const packages: Package[] = projectsRaw.packages;

// ======= Uses =======

export const usesMeta: PageMeta = usesRaw.meta;
export const uses: UsesCategory[] = usesRaw.categories;

// ======= About =======

export const aboutMeta: PageMeta = aboutRaw.meta;
export const bio: string[] = aboutRaw.bio;
export const stats: Stat[] = aboutRaw.stats;
export const testimonials: Testimonial[] = aboutRaw.testimonials;
export const aboutLinks: NavLink[] = aboutRaw.links;

// ======= Home =======

export const heroContent = homeRaw.hero;
export const whatContent = homeRaw.what;
export const features: Feature[] = homeRaw.features;
export const packageCommands: PackageCommand[] = homeRaw.packages;
export const tuiVisual: {
	command: string;
	scanning: string;
	results: TuiResult[];
	summary: string;
} = homeRaw.tuiVisual;

// Re-export type so callers can import it from here if convenient
export type { PageMeta };
