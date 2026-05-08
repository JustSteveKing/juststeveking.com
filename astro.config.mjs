// @ts-check
import tailwindcss from '@tailwindcss/vite';
import { defineConfig, envField } from 'astro/config';
import mdx from '@astrojs/mdx';
import svelte from '@astrojs/svelte';
import astroExpressiveCode from 'astro-expressive-code'
import sitemap from '@astrojs/sitemap';


// https://astro.build/config
export default defineConfig({
    integrations: [svelte(), astroExpressiveCode({
        styleOverrides: {
            borderRadius: '0.5rem',
            frames: {
                shadowColor: '#124',
            },
        },
        themes: ['catppuccin-macchiato', 'catppuccin-latte'],
    }), mdx(), sitemap()],

    site: 'https://www.juststeveking.com',

    env: {
        schema: {
            // Client-side search
            PUBLIC_ALGOLIA_APP_ID: envField.string({ context: 'client', access: 'public' }),
            PUBLIC_ALGOLIA_SEARCH_API_KEY: envField.string({ context: 'client', access: 'public' }),
            PUBLIC_ALGOLIA_INDEX_NAME: envField.string({ context: 'client', access: 'public' }),
            // Server-side indexing
            ALGOLIA_APP_ID: envField.string({ context: 'server', access: 'secret' }),
            ALGOLIA_ADMIN_API_KEY: envField.string({ context: 'server', access: 'secret' }),
            ALGOLIA_INDEX_NAME: envField.string({ context: 'server', access: 'public' }),
        },
    },

    vite: {
        plugins: [tailwindcss()]
    }
});