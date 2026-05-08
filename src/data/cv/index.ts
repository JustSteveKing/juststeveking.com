import type {
	Resume,
	ResumeBasics,
	ResumeWork,
	ResumeVolunteer,
	ResumeEducation,
	ResumeAward,
	ResumeCertificate,
	ResumePublication,
	ResumeSkill,
	ResumeReference,
	ResumeProject,
	PageMeta,
} from '@/types';
import resumeRaw from './resume.json';

const resume = resumeRaw as Resume;

// ——— Raw sections ———

export const basics: ResumeBasics = resume.basics;
export const workHistory: ResumeWork[] = resume.work ?? [];
export const volunteer: ResumeVolunteer[] = resume.volunteer ?? [];
export const education: ResumeEducation[] = resume.education ?? [];
export const awards: ResumeAward[] = resume.awards ?? [];
export const certificates: ResumeCertificate[] = resume.certificates ?? [];
export const publications: ResumePublication[] = resume.publications ?? [];
export const skills: ResumeSkill[] = resume.skills ?? [];
export const references: ResumeReference[] = resume.references ?? [];
export const cvProjects: ResumeProject[] = resume.projects ?? [];

// ——— Filtered helpers ———

export function currentRoles(): ResumeWork[] {
	return workHistory.filter(w => !w.endDate);
}

export function pastRoles(): ResumeWork[] {
	return workHistory.filter(w => !!w.endDate);
}

export function skillByName(name: string): ResumeSkill | undefined {
	return skills.find(s => s.name.toLowerCase() === name.toLowerCase());
}

// ——— Date / duration helpers ———

export function formatDate(dateStr: string): string {
	const parts = dateStr.split('-');
	if (parts.length < 2) return parts[0];
	const date = new Date(Number(parts[0]), Number(parts[1]) - 1);
	return date.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' });
}

export function duration(startDate: string, endDate?: string): string {
	const start = new Date(startDate);
	const end = endDate ? new Date(endDate) : new Date();
	const months =
		(end.getFullYear() - start.getFullYear()) * 12 +
		(end.getMonth() - start.getMonth());
	if (months < 12) return `${months}mo`;
	const years = Math.floor(months / 12);
	const rem = months % 12;
	return rem > 0 ? `${years}y ${rem}mo` : `${years}y`;
}

// ——— Page display meta ———

export const workPageMeta: PageMeta = {
	prompt: "$ git log --author='Steve' --oneline",
	title: 'Work',
	subtitle:
		'15+ years building, leading, and shipping software — from combat engineer to technical director.',
};
