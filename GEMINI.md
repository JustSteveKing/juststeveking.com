# juststeveking.com

A content-rich personal website and developer hub built with Astro, Svelte, and Tailwind CSS.

## Project Overview

This project is a modern static site generator (SSG) implementation using **Astro 6**. It serves as the primary online presence for Steve King, featuring articles, API guides, reviews, video content, and package documentation.

### Core Technologies
- **Framework:** [Astro 6.x](https://astro.build/) (using the Content Layer API)
- **UI Components:** [Svelte 5.x](https://svelte.dev/)
- **Styling:** [Tailwind CSS 4.x](https://tailwindcss.com/) (Vite-based integration)
- **Content:** MDX and Markdown with Zod-validated schemas.
- **Search:** [Algolia](https://www.algolia.com/) for client-side search functionality.
- **Runtime:** [Bun](https://bun.sh/) is used for script execution and as the primary package manager.
- **Deployment:** [Cloudflare Pages](https://pages.cloudflare.com/) (configured via `wrangler.toml`).

### Key Architecture
- **Content Layer:** Extensive use of Astro's `defineCollection` in `src/content.config.ts` to manage multiple content types (articles, videos, talk, packages, etc.).
- **Custom CLI:** A dedicated management tool in `src/cli.ts` (built with `@crustjs/core`) for automating content tasks like syncing stats, cross-posting, and verifying schemas.
- **Isomorphic Search:** Search indexing is handled via a server-side script (`scripts/index-algolia.ts`) and consumed via Svelte components.

## Building and Running

The project primarily uses `bun` for script execution.

| Command | Action |
| :--- | :--- |
| `bun install` | Installs dependencies. |
| `bun run dev` | Starts the Astro development server at `localhost:4321`. |
| `bun run build` | Builds the production site to the `./dist` directory. |
| `bun run preview` | Previews the production build locally. |
| `bun run cli` | Runs the custom content management CLI (e.g., `bun run cli stats`). |
| `bun run index` | Syncs content to the Algolia search index. |

## Development Conventions

### Content Management
- **Collections:** Always refer to `src/content.config.ts` for the latest Zod schemas when adding or modifying content in `src/content/`.
- **Slugs:** Astro handles slugs based on filenames within the content collections.
- **CLI Commands:** New management tools should be implemented as classes in `src/commands/` extending `BaseCommand` and registered in `src/cli.ts`.

### Styling & Components
- **Tailwind 4:** This project uses the newer Vite-native Tailwind 4. Utility classes are defined in-line or via CSS `@theme` tokens in `src/styles/main.css`.
- **Components:**
    - Use **Astro components** (`.astro`) for static layout and server-rendered logic.
    - Use **Svelte components** (`.svelte`) for client-side interactivity (e.g., search, dynamic gauges).

### Utility Functions
- Common logic for articles (filtering, tagging, pagination) is centralized in `src/utils/articles.ts`.
- Formatters for dates and strings are found in `src/utils/format.ts`.

### Environment Variables
The following environment variables are required (configured in `astro.config.mjs` via `env.schema`):
- `PUBLIC_ALGOLIA_APP_ID`
- `PUBLIC_ALGOLIA_SEARCH_API_KEY`
- `PUBLIC_ALGOLIA_INDEX_NAME`
- `ALGOLIA_ADMIN_API_KEY` (Secret - for indexing)
