import type { EvidenceKind, ReviewTone } from './types';

// Catppuccin Latte (light) / Mocha (dark) tones
export const tonePalette: Record<ReviewTone, { solid: string; soft: string }> = {
	green: { solid: '#40a02b', soft: 'rgba(64, 160, 43, 0.12)' },
	amber: { solid: '#df8e1d', soft: 'rgba(223, 142, 29, 0.12)' },
	red: { solid: '#d20f39', soft: 'rgba(210, 15, 57, 0.10)' },
};

export const evidencePalette: Record<EvidenceKind, { label: string; solid: string; soft: string }> =
	{
		strength: { label: 'Strength', solid: '#40a02b', soft: 'rgba(64, 160, 43, 0.12)' },
		gap: { label: 'Gap', solid: '#d20f39', soft: 'rgba(210, 15, 57, 0.10)' },
		opportunity: { label: 'Opportunity', solid: '#df8e1d', soft: 'rgba(223, 142, 29, 0.12)' },
	};
