// ======= Shared primitives =======

export interface NavLink {
	label: string;
	href: string;
	external?: boolean;
}

export interface FooterGroup {
	label: string;
	links: NavLink[];
}

/** SEO metadata — required fields, stored in config/pages.ts */
export interface Metadata {
	title: string;
	description: string;
	ogImage?: string;
	noIndex?: boolean;
	canonicalUrl?: string;
}

/** Layout props — all optional so Layout can apply its own defaults */
export type SEOProps = Partial<Metadata>;

/** Page header display data — prompt, h1 title, subtitle */
export interface PageMeta {
	title: string;
	prompt: string;
	subtitle: string;
}

// ======= Blog =======

export interface Post {
	title: string;
	date: string;
	slug: string;
	tag: string;
	excerpt?: string;
}

// ======= Projects =======

export interface Package {
	name: string;
	description: string;
	install: string;
	github?: string;
	docs?: string;
}

// ======= Uses =======

export interface UsesItem {
	name: string;
	description: string;
	url?: string;
}

export interface UsesCategory {
	title: string;
	items: UsesItem[];
}

// ======= About =======

export interface Stat {
	value: string;
	label: string;
}

export interface Testimonial {
	quote: string;
	author: string;
	role: string;
}

// ======= Home =======

export interface Feature {
	type: string;
	title: string;
	description: string;
	visual: {
		command: string;
		scanning: string;
		results: TuiResult[];
		summary: string;
	};
}

export interface PackageCommand {
	tab: string;
	cmd: string;
	pkg: string;
}

export interface TuiResult {
	method: string;
	path: string;
	detail: string;
	status: string;
}

// ======= CV / Resume (JSON Resume schema) =======

export interface ResumeLocation {
	address?: string;
	postalCode?: string;
	city?: string;
	region?: string;
	countryCode?: string;
}

export interface ResumeProfile {
	network: string;
	username: string;
	url: string;
}

export interface ResumeBasics {
	name: string;
	label: string;
	image?: string;
	email?: string;
	phone?: string;
	url?: string;
	summary: string;
	location?: ResumeLocation;
	profiles?: ResumeProfile[];
}

export interface ResumeWork {
	name: string;
	position: string;
	startDate: string;
	endDate?: string;
	highlights?: string[];
	summary?: string;
	url?: string;
	location?: string;
	technologies?: string[];
}

export interface ResumeVolunteer {
	organization: string;
	position: string;
	startDate: string;
	endDate?: string;
	summary?: string;
	highlights?: string[];
	url?: string;
}

export interface ResumeEducation {
	institution: string;
	area: string;
	studyType: string;
	startDate: string;
	endDate?: string;
	score?: string;
	courses?: string[];
	description?: string;
}

export interface ResumeAward {
	title: string;
	date: string;
	awarder: string;
	summary?: string;
}

export interface ResumeCertificate {
	name: string;
	date: string;
	issuer: string;
	url?: string;
}

export interface ResumePublication {
	name: string;
	publisher: string;
	releaseDate: string;
	url?: string;
	summary?: string;
}

export interface ResumeSkill {
	name: string;
	level: string;
	keywords?: string[];
}

export interface ResumeLanguage {
	language: string;
	fluency: string;
}

export interface ResumeInterest {
	name: string;
	keywords?: string[];
}

export interface ResumeReference {
	name: string;
	reference: string;
}

export interface ResumeProject {
	name: string;
	description?: string;
	highlights?: string[];
	keywords?: string[];
	startDate?: string;
	endDate?: string;
	url?: string;
	roles?: string[];
}

export interface ResumeMeta {
	version?: string;
	canonical?: string;
	lastModified?: string;
}

export interface Resume {
	basics: ResumeBasics;
	work?: ResumeWork[];
	volunteer?: ResumeVolunteer[];
	education?: ResumeEducation[];
	awards?: ResumeAward[];
	certificates?: ResumeCertificate[];
	publications?: ResumePublication[];
	skills?: ResumeSkill[];
	languages?: ResumeLanguage[];
	interests?: ResumeInterest[];
	references?: ResumeReference[];
	projects?: ResumeProject[];
	meta?: ResumeMeta;
}

// ======= Site =======

export interface SiteMeta {
	name: string;
	title: string;
	description: string;
	url: string;
	author: string;
	twitter: string;
	github: string;
	locale: string;
	ogImage?: string;
}

