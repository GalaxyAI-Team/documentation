# Customer documentation source of truth

## Purpose

This repository is the public customer help center for Magica. It should explain product usage, billing, account access, credits, tools, privacy, and support in customer-facing language.

The developer API documentation lives in `/Users/rajatgupta/Downloads/g-repo/app.galaxy.ai/api-docs` and is published separately at `https://magica.com/docs`.

The canonical editable customer-help articles live in `content-dump`. Mintlify reads those files directly, and Crisp sync reads the same folder directly.

## Canonical sources

Use these sources in order when updating canonical customer-help articles:

1. Production app links and routes in the latest code.
2. `/Users/rajatgupta/Downloads/g-repo/app.galaxy.ai/api-docs` for API names, API URLs, API logos, and developer-doc links.
3. Current Crisp helpdesk wording for short customer-support answers and chatbot language.
4. Existing generated outputs only to inspect publication output. Do not edit generated Crisp files directly.

## Brand and URL rules

- Product name: Magica.
- Customer app: `https://magica.com`.
- API docs: `https://magica.com/docs`.
- API server: `https://api.magica.com`.
- Mobile and utility links: `https://go.magica.com/...`.
- Customer support: `https://magica.com/support`.
- Email domains: `@magica.com` and `humans@mail.magica.com`.

Do not use Galaxy.ai branding except in a dedicated rebrand article or migration note.

## Single-source system design

Maintain one canonical article inventory in `content-dump`:

- Source and Mintlify page: `content-dump/{category-slug}/{slug}.mdx`.
- Crisp output: no local article copy. `/Users/rajatgupta/Downloads/g-repo/work/crisp/sync.py` reads `content-dump` directly and pushes to Crisp.
- API docs remain separate developer references in `/Users/rajatgupta/Downloads/g-repo/app.galaxy.ai/api-docs`.

For shared customer knowledge, canonical facts are represented once in `content-dump`:

- Mintlify uses the same MDX pages directly.
- Crisp receives the same content through `/Users/rajatgupta/Downloads/g-repo/work/crisp/sync.py`.

Current layout:

```text
content-dump/
+-- account-and-platform-features/
+-- billing-and-subscription/
+-- credits-and-usage-tracking/
+-- data-privacy-and-security/
+-- getting-started/
+-- integrations-and-api/
+-- troubleshooting-and-technical-issues/
```

Each source article uses Mintlify frontmatter plus Crisp export metadata:

```markdown
---
title: "How do credits work?"
description: "Magica uses a credits-based system..."
category: "Credits & Usage Tracking"
crispSlug: "how-do-credits-work"
---

Magica uses a credits-based system...
```

The sync pipeline should:

1. Edit only `content-dump`.
2. Run `node content-dump/manage.mjs`.
3. Review Mintlify navigation in `docs.json`.
4. Run `mint broken-links` for customer docs when Mintlify is available.
5. Run `python3 sync.py` in `/Users/rajatgupta/Downloads/g-repo/work/crisp` to preview Crisp changes directly from `content-dump`.
6. Run `python3 sync.py --push` only when intentionally publishing to Crisp.
7. After committing and pushing documentation changes, run `node content-dump/manage.mjs --deploy` to trigger Mintlify. The API key must come from `.env` or `MINTLIFY_API_KEY`; never commit it.

This keeps customer docs and Crisp aligned while preserving the different formats each destination needs.
