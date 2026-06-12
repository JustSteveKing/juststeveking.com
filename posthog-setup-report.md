<wizard-report>
# PostHog post-wizard report

The wizard has completed a deep integration of PostHog analytics into your Astro static site. A reusable `PostHog.astro` component was created and mounted in the main `Layout.astro` so that every page initialises PostHog from environment variables. Event capture scripts were added across nine pages and components covering conversion CTAs, content engagement, and search behavior.

| Event                           | Description                                                                              | File                               |
| ------------------------------- | ---------------------------------------------------------------------------------------- | ---------------------------------- |
| `discovery_call_clicked`        | User clicked a "Book a call" / "Book a discovery call" CTA                               | `src/pages/index.astro`            |
| `discovery_call_clicked`        | User clicked "Book a discovery call" on the services page                                | `src/pages/services/index.astro`   |
| `discovery_call_clicked`        | User clicked "Book a discovery call" in the post-article CTA                             | `src/pages/articles/[slug].astro`  |
| `discovery_call_clicked`        | User clicked "Book a discovery call" in the post-project CTA                             | `src/pages/projects/[id].astro`    |
| `discovery_call_clicked`        | User clicked "Book a discovery call" in the post-video CTA                               | `src/pages/videos/[id].astro`      |
| `article_read`                  | User landed on a full article page (title, category, tags, read time captured)           | `src/pages/articles/[slug].astro`  |
| `project_viewed`                | User opened a package/project detail page (name, tech stack captured)                   | `src/pages/projects/[id].astro`    |
| `project_link_clicked`          | User clicked a GitHub or Packagist link on a project page (link type captured)           | `src/pages/projects/[id].astro`    |
| `talk_resource_clicked`         | User clicked a slides or video link on the talks page (type, talk title captured)        | `src/pages/talks/index.astro`      |
| `video_viewed`                  | User loaded a video detail page (title, type, difficulty, duration, video ID captured)   | `src/pages/videos/[id].astro`      |
| `video_watch_on_youtube_clicked`| User clicked "Watch on YouTube" from a video page                                       | `src/pages/videos/[id].astro`      |
| `youtube_subscribe_clicked`     | User clicked the YouTube Subscribe link on a video page                                  | `src/pages/videos/[id].astro`      |
| `review_read`                   | User loaded a review detail page (subject, badge, tags captured)                         | `src/pages/reviews/[slug].astro`   |
| `review_subject_clicked`        | User clicked the external link to a reviewed product/tool                                | `src/pages/reviews/[slug].astro`   |
| `search_performed`              | User ran a search query (query string, result count captured)                            | `src/components/Search.svelte`     |
| `search_result_clicked`         | User clicked a search result (title, category, destination URL captured)                 | `src/components/Search.svelte`     |
| `api_guide_read`                | User loaded an API guide page (title, category, complexity, API styles captured)         | `src/pages/api-guides/[id].astro`  |

## Next steps

We've built some insights and a dashboard for you to keep an eye on user behavior, based on the events we just instrumented:

- [Analytics basics (wizard) — Dashboard](https://eu.posthog.com/project/49852/dashboard/743976)
- [Discovery call clicks — line chart over time](https://eu.posthog.com/project/49852/insights/zmb8ZEO2)
- [Discovery call clicks by location — bar chart by page](https://eu.posthog.com/project/49852/insights/S4EMNGzT)
- [Article reads — area chart over time](https://eu.posthog.com/project/49852/insights/hVaUDinF)
- [Project views — line chart over time](https://eu.posthog.com/project/49852/insights/LV2mt8EP)
- [Talk resource clicks — bar chart by slides/video](https://eu.posthog.com/project/49852/insights/Duwx1ZJD)
- [Video views — area chart over time](https://eu.posthog.com/project/49852/insights/8Mz8JAbQ)
- [Search usage — line chart over time](https://eu.posthog.com/project/49852/insights/RHJyWDxY)
- [Review reads — area chart over time](https://eu.posthog.com/project/49852/insights/sDRoq09R)
- [API guide reads by complexity — bar chart by complexity level](https://eu.posthog.com/project/49852/insights/AGMo4wtW)

### Agent skill

We've left an agent skill folder in your project at `.claude/skills/integration-astro-static/`. You can use this context for further agent development when using Claude Code. This will help ensure the model provides the most up-to-date approaches for integrating PostHog.

</wizard-report>
