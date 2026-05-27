# Documentation project instructions

## About this project

- This is the Magica customer-facing help center built on Mintlify.
- This repo must not contain duplicate customer article bodies outside `content-dump`.
- `content-dump` is the single editable source of truth for customer-facing articles.
- Mintlify reads `content-dump/**/*.mdx` directly.
- Crisp sync reads `content-dump/**/*.mdx` directly through `/Users/rajatgupta/Downloads/g-repo/work/crisp/sync.py`.
- `docs.json` and `index.mdx` are maintained by `content-dump/manage.mjs`.
- Developer/API docs are separate and live at `/Users/rajatgupta/Downloads/g-repo/app.galaxy.ai/api-docs`.

## Terminology

- Use "Magica" for the product name.
- Use `magica.com` for the customer app and `magica.com/docs` for developer API docs.
- Use `api.magica.com` only for API endpoints.
- Do not introduce Galaxy.ai branding except when documenting historical rebrand context.
- Edit customer-facing articles only in `content-dump`.
- Treat `/Users/rajatgupta/Downloads/g-repo/app.galaxy.ai/api-docs` as the developer API source for API names, links, and images.

## Source-of-truth system

The overall customer-docs system has one content source and two publishing surfaces:

- Single source: `content-dump/{category-slug}/{article-slug}.mdx`
- Mintlify surface: this documentation repo uses those same `content-dump` files as pages.
- Crisp surface: `/Users/rajatgupta/Downloads/g-repo/work/crisp/sync.py` reads `content-dump` and pushes the same article bodies to Crisp.

Do not recreate `help/`, `content/customer-help/`, `crisp/helpdesk/`, or any other article-copy folder. Those folders would duplicate content and break the single-source model.

Each article must have this frontmatter:

```mdx
---
title: "How do credits work?"
description: "Short customer-facing summary."
category: "Credits & Usage Tracking"
crispSlug: "how-do-credits-work"
---
```

- `title` is used by Mintlify and Crisp.
- `description` is used by Mintlify.
- `category` must exactly match an existing Crisp category.
- `crispSlug` preserves the Crisp manifest key and remote article mapping.

## Commands

Run from `/Users/rajatgupta/Downloads/g-repo/work/documentation` unless noted.

After editing, adding, moving, or deleting an article:

```bash
node content-dump/manage.mjs
```

Validate Mintlify navigation resolves every article:

```bash
node - <<'NODE'
const fs = require('fs');
const d = JSON.parse(fs.readFileSync('docs.json', 'utf8'));
function pages(n, out = []) {
  if (Array.isArray(n)) n.forEach((x) => pages(x, out));
  else if (n && typeof n === 'object') {
    if (n.root) out.push(n.root);
    if (n.pages) pages(n.pages, out);
    if (n.groups) pages(n.groups, out);
    if (n.products) pages(n.products, out);
    if (n.tabs) pages(n.tabs, out);
  } else if (typeof n === 'string') out.push(n);
  return out;
}
const missing = pages(d.navigation).filter((p) => !fs.existsSync(`${p}.mdx`));
if (missing.length) {
  console.error(missing.join('\n'));
  process.exit(1);
}
console.log('navigation ok');
NODE
```

Preview Crisp changes without pushing:

```bash
cd /Users/rajatgupta/Downloads/g-repo/work/crisp
python3 sync.py
```

Publish to Crisp only when explicitly intended:

```bash
cd /Users/rajatgupta/Downloads/g-repo/work/crisp
python3 sync.py --push
```

If Mintlify CLI is installed, also run:

```bash
mint broken-links
```

Do not run package-manager installs or builds for this docs workflow unless explicitly asked.

## Maintenance rules

- Use the latest production code links, `/Users/rajatgupta/Downloads/g-repo/app.galaxy.ai/api-docs`, and current Crisp article intent as the facts to reconcile into `content-dump`.
- Treat old documentation pages outside `content-dump` as disposable unless there is a specific reason to preserve a fact.
- Never edit generated or remote-facing outputs directly. If Crisp needs a change, edit `content-dump`, run `node content-dump/manage.mjs`, then run `python3 sync.py`.
- Keep customer help concise and support-oriented. Put developer API detail in the API docs repo and link to `https://magica.com/docs`.
- When adding a new Crisp category, confirm it exists remotely before setting `category`; `sync.py` aborts if the category is missing.
- If changing `category` or `crispSlug`, understand it changes the Crisp manifest key and may create a new remote article unless the manifest is intentionally updated.

## Style preferences

- Use active voice and second person ("you")
- Keep sentences concise — one idea per sentence
- Use sentence case for headings
- Bold for UI elements: Click **Settings**
- Code formatting for file names, commands, paths, and code references

## Content boundaries

- Customer billing, account, credits, tools, privacy, troubleshooting, affiliate, and getting-started content belongs in `content-dump`.
- Developer API reference, MCP docs, endpoint examples, and OpenAPI content belong in `/Users/rajatgupta/Downloads/g-repo/app.galaxy.ai/api-docs`, not here.
