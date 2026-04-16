# Web CMS Design

**Date:** 2026-04-16  
**Status:** Approved

## Summary

Transform the personal website into a self-hosted CMS: content moves from MDX files in `/app` to plain Markdown files in `/content`, a password-protected `/admin` page provides full CRUD via a raw markdown editor, and saves commit directly to GitHub (triggering a Vercel redeploy). No database, no cost.

---

## 1. Content Structure

All content moves from `/app/**/*.mdx` to a top-level `/content` directory as plain `.md` files. No custom MDX components — pure markdown only.

```
/content
  home.md
  /work
    inflect-labs.md
    relevance-ai.md
    vng-corporation.md
  /writings
    how-i-picked-my-cofounder.md
    how-to-get-what-you-want.md
    life-lately.md
    my-first-10k-month.md
    so-im-starting-over.md
```

- The first `# H1` in each file is the page title (same convention as today).
- Internal links use standard markdown: `[Work →](/work)`.
- External links use standard markdown: `[GitHub](https://github.com/...)`.
- No frontmatter required (kept optional for future metadata like dates).

---

## 2. Routing & Rendering

Existing `.mdx` pages in `/app` are replaced with dynamic TypeScript routes that read from `/content` at build time.

### Routes

| Route | Reads from |
|-------|-----------|
| `/app/page.tsx` | `content/home.md` |
| `/app/work/page.tsx` | lists all files in `content/work/` |
| `/app/work/[slug]/page.tsx` | `content/work/[slug].md` |
| `/app/writings/page.tsx` | lists all files in `content/writings/` |
| `/app/writings/[slug]/page.tsx` | `content/writings/[slug].md` |

### Rendering

- `react-markdown` replaces MDX for rendering plain `.md` content.
- A shared `<MarkdownRenderer />` component wraps `react-markdown` with custom element renderers:
  - Internal links → styled navigation card (replaces `<PageItem />`)
  - External links → inline styled link (replaces `<LinkItem />`)
  - Headings, paragraphs → existing Tailwind prose styles
- Pages use `generateStaticParams` for slug-based routes (statically generated at build time).
- `lib/content-utils.ts` is simplified to read from `/content` instead of scanning `/app`.

### Update flow

Save in admin → GitHub API commit → Vercel webhook → redeploy → live in ~1-2 minutes.

---

## 3. Admin & Auth

### Routes

```
/app/admin/page.tsx                  Login page (if unauthenticated) or file list dashboard
/app/admin/edit/[...path]/page.tsx   Markdown editor for a specific file
/app/api/admin/login/route.ts        POST: validates password, sets signed httpOnly cookie
/app/api/admin/files/route.ts        CRUD: GET (fetch content), PUT (create/update), DELETE
/middleware.ts                       Protects all /admin/* routes, redirects to /admin if no valid cookie
```

### Authentication

- Single password stored as env var `ADMIN_PASSWORD`.
- On login: password checked server-side, a signed session token set as `httpOnly` cookie (signed with `ADMIN_SECRET` env var using `crypto.createHmac`).
- Next.js middleware validates the cookie on every `/admin/*` request — no third-party auth library.

### GitHub API integration

- GitHub Personal Access Token stored as env var `GITHUB_TOKEN`.
- Repo owner/name stored as env vars `GITHUB_OWNER` and `GITHUB_REPO`.
- All reads/writes go through `GET/PUT/DELETE /repos/{owner}/{repo}/contents/{path}` (GitHub Contents API).
- Every write auto-commits with a message like `"Update writings/my-post.md"`.
- File SHA is fetched before each update/delete (required by GitHub API for conflict detection).

### Admin UI layout

```
┌─────────────────┬──────────────────────────────────────┐
│ SIDEBAR         │ EDITOR                               │
│                 │                                      │
│ home.md         │  [textarea — raw markdown]           │
│                 │                                      │
│ work/           │                                      │
│   inflect-labs  │                                      │
│   relevance-ai  │                                      │
│   [+ New]       │                                      │
│                 │                                      │
│ writings/       │  [Save]  [Delete]                    │
│   my-post       │                                      │
│   [+ New]       │                                      │
└─────────────────┴──────────────────────────────────────┘
```

- Clicking a file loads its content into the editor via `GET /api/admin/files?path=...`.
- **Save** → `PUT /api/admin/files` with path + content → GitHub commit.
- **Delete** → `DELETE /api/admin/files` with path → GitHub commit removing the file.
- **+ New** → prompt for a slug → blank editor opens → first Save creates the file.
- `home.md` is shown in the sidebar but has no Delete button — the homepage cannot be deleted.

---

## 4. Environment Variables Required

| Variable | Purpose |
|----------|---------|
| `ADMIN_PASSWORD` | Admin login password |
| `ADMIN_SECRET` | Secret for signing session cookie |
| `GITHUB_TOKEN` | GitHub Personal Access Token (repo write scope) |
| `GITHUB_OWNER` | GitHub username (e.g. `ethantrang`) |
| `GITHUB_REPO` | Repo name (e.g. `ethantrang`) |

---

## 5. Packages to Add

| Package | Purpose |
|---------|---------|
| `react-markdown` | Render plain `.md` content (replaces MDX) |
| `remark-gfm` | Already installed — keep for GitHub Flavored Markdown |

No other new dependencies needed. The GitHub API is called via `fetch` (native). Auth uses Node's built-in `crypto`.

---

## 6. Files to Remove

- `app/page.mdx`
- `app/work/*/page.mdx` (all work entry MDX files)
- `app/writings/*/page.mdx` (all writing MDX files)
- `components/page-item.tsx` (replaced by MarkdownRenderer link handling)
- `components/link-item.tsx` (replaced by MarkdownRenderer link handling)
- `mdx-components.tsx` (no longer needed)
- MDX-related next.config entries (`@next/mdx` config)

---

## 7. Out of Scope

- Image uploads (images stay in `/public`, referenced by path in markdown)
- Draft/publish workflow (all saves go live on next redeploy)
- Multi-user access (single password, personal site only)
- Instant updates without redeploy
