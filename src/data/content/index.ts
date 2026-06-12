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
	DesignKitColor,
	TypographyVariant,
	VisualLanguageItem,
} from '@/types';

import homeRaw from './home.json';
import aboutRaw from './about.json';
import blogRaw from './blog.json';
import projectsRaw from './projects.json';
import usesRaw from './uses.json';
import servicesRaw from './services.json';
import talksRaw from './talks.json';
import podcastsRaw from './podcasts.json';
import designKitRaw from './design-kit.json';

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

// ======= Talks =======

export const talksMeta: PageMeta = talksRaw.meta;

// ======= Podcasts =======

export const podcastsMeta: PageMeta = podcastsRaw.meta;

// ======= Home =======

export const heroContent = homeRaw.hero;
export const whatContent = homeRaw.what;
export const features: Feature[] = homeRaw.features;
export const packageCommands: PackageCommand[] = homeRaw.packages;

export const homeStats = homeRaw.stats;
export const homeProblems = homeRaw.problems;
export const homeFramework = homeRaw.framework;
export const homeServicesPreview = homeRaw.servicesPreview;
export const homeFinalCta = homeRaw.finalCta;

// ======= Services =======

export const servicesOfferings = servicesRaw.offerings;
export const servicesProcess = servicesRaw.process;

// ======= Design Kit =======

export const designKitMeta: PageMeta = designKitRaw.meta;
export const designKitColors: DesignKitColor[] = designKitRaw.colors;
export const designKitTypography: { primary: TypographyVariant; technical: TypographyVariant } =
	designKitRaw.typography as any;
export const designKitVisualLanguage: VisualLanguageItem[] = designKitRaw.visualLanguage;

// Re-export type so callers can import it from here if convenient
export type { PageMeta };
