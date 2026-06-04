import type { AstroIntegration } from 'astro';
import { spawn } from 'node:child_process';

export default function algoliaIntegration(): AstroIntegration {
	return {
		name: 'algolia-indexing',
		hooks: {
			'astro:build:done': async ({ logger }) => {
				// Only run in production builds (not during preview or dev)
				if (process.env.NODE_ENV !== 'production') {
					logger.info('Skipping Algolia indexing (not a production build)');
					return;
				}

				if (!process.env.ALGOLIA_ADMIN_API_KEY) {
					logger.warn('Skipping Algolia indexing: ALGOLIA_ADMIN_API_KEY not found');
					return;
				}

				logger.info('Starting Algolia indexing...');

				return new Promise((resolve, reject) => {
					const child = spawn('bun', ['run', 'scripts/index-algolia.ts'], {
						stdio: 'inherit',
						env: process.env,
					});

					child.on('close', (code) => {
						if (code === 0) {
							logger.info('Algolia indexing completed successfully');
							resolve();
						} else {
							logger.error(`Algolia indexing failed with code ${code}`);
							reject(new Error(`Algolia indexing failed with code ${code}`));
						}
					});

					child.on('error', (err) => {
						logger.error(`Failed to start Algolia indexing script: ${err.message}`);
						reject(err);
					});
				});
			},
		},
	};
}
