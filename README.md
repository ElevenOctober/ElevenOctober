# 11 October

The official site for 11 October, an open engineering collective. The homepage is a continuous scroll story carried by a small, procedural Three.js eclipse scene. Its content remains semantic HTML and readable when WebGL is unavailable.

## Run locally

Use Node.js 22.6 or newer.

```sh
npm install
npm run dev
```

The site opens at `http://localhost:3000`. The homepage and content indexes work without environment variables. Problem proposals go directly to [GitHub Issues](https://github.com/ElevenOctober/ElevenOctober/issues/new); issues are public.

## Checks

```sh
npm run lint
npm run typecheck
npm run build
```

## Vercel

Connect this repository to Vercel and use its Next.js preset. Add the canonical site URL in Vercel Project Settings:

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Canonical site origin for metadata, robots, and sitemap. |

Copy `.env.example` to `.env.local` for local configuration. The GitHub issue link points to the repository remote configured for 11 October.

Opening an issue starts a review; it does not mean 11 October accepted the problem. Do not post private or sensitive information in public issues.

## Content

Nothing in the site is presented as a real community problem or completed project unless its source and evidence are recorded. The problem and project indexes are intentionally empty until verified records exist.

- Add a problem to `content/problems/index.ts` only after its external source URL and attribution preference are verified. The `ProblemRecord` type includes status, constraints, acceptance details, research, validation, results, repository, licensing, and limitations.
- Add a completed project to `content/projects/index.ts` after its source problem, repository, testing, failures, and limitations are documented. The homepage creates additional orbit traces from these published project slugs.
- Add one published article as `content/articles/<slug>.mdx`. Export an `article` object matching `types/article.ts`, followed by the MDX body. It supports figures/React diagrams, GFM tables and footnotes, fenced code, and KaTeX math. Dynamic routes and metadata are built from the MDX filenames.

## Structure

- `app/`: homepage, problem/project/article routes, metadata, and sitemap.
- `components/`: navigation, the WebGL stage, and reveal motion.
- `content/`: local, pull-request-friendly records; no external CMS.
- `lib/orbit-scene.ts`: custom Three.js eclipse, scroll-linked camera, pointer response, and WebGL fallback.
- `types/`: problem, project, and article content models.

The WebGL scene uses no model downloads or image textures. It caps pixel ratio, simplifies particles and antialiasing on mobile, pauses when the tab is hidden, and respects reduced motion. The page keeps all core copy and links in HTML; a CSS eclipse remains visible if WebGL initialization fails. IBM Plex Sans is bundled locally under the SIL Open Font License; its notice is in `app/fonts/OFL.txt`.
