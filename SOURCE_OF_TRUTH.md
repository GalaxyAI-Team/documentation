# Customer documentation source of truth

## Purpose

This repository is the public customer help center for Magica. It should explain product usage, billing, account access, credits, tools, privacy, and support in customer-facing language.

The developer API documentation lives in `/Users/rajatgupta/Downloads/g-repo/app.galaxy.ai/api-docs` and is published separately at `https://magica.com/docs`.

The canonical editable customer-help articles live in `content/customer-help`. The Mintlify help center and the Crisp helpdesk are both generated from that folder.

## Canonical sources

Use these sources in order when updating canonical customer-help articles:

1. Production app links and routes in the latest code.
2. `/Users/rajatgupta/Downloads/g-repo/app.galaxy.ai/api-docs` for API names, API URLs, API logos, and developer-doc links.
3. Current Crisp helpdesk wording for short customer-support answers and chatbot language.
4. Generated files in this repository only to inspect output. Do not edit generated pages directly.

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

Maintain one canonical article inventory in `content/customer-help`:

- Source: `content/customer-help/{Category}/{slug}.md`.
- Mintlify output: generated `help/{category-slug}/{slug}.mdx`.
- Crisp output: generated `/Users/rajatgupta/Downloads/g-repo/work/crisp/helpdesk/{Category}/{slug}.md`.
- API docs remain separate developer references in `/Users/rajatgupta/Downloads/g-repo/app.galaxy.ai/api-docs`.

For shared customer knowledge, canonical facts are represented once in the source Markdown, then rendered into both destinations:

- Mintlify gets MDX pages and navigation.
- Crisp gets Markdown articles optimized for support search and chatbot training.

Current layout:

```text
content/customer-help/
+-- Account & Platform Features/
+-- Billing & Subscription/
+-- Credits & Usage Tracking/
+-- Data Privacy & Security/
+-- Getting Started/
+-- Integrations & API/
+-- Troubleshooting & Technical Issues/
help/
+-- account-and-platform-features/
+-- billing-and-subscription/
+-- credits-and-usage-tracking/
```

Each source article uses the Crisp-compatible title header:

```markdown
<!--
title: How do credits work?
-->
Magica uses a credits-based system...
```

The sync pipeline should:

1. Edit only `content/customer-help`.
2. Run `node scripts/render-customer-help.mjs`.
3. Review generated Mintlify pages under `help/`.
4. Run `mint broken-links` for customer docs when Mintlify is available.
5. Run `python3 sync.py` in `/Users/rajatgupta/Downloads/g-repo/work/crisp` to preview Crisp changes.
6. Run `python3 sync.py --push` only when intentionally publishing to Crisp.

This keeps customer docs and Crisp aligned while preserving the different formats each destination needs.
