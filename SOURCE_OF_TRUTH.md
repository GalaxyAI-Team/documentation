# Customer documentation source of truth

## Purpose

This repository is the public customer help center for Magica. It should explain product usage, billing, account access, credits, tools, privacy, and support in customer-facing language.

The developer API documentation lives in `/Users/rajatgupta/Downloads/g-repo/app.galaxy.ai/api-docs` and is published separately at `https://magica.com/docs`.

The Crisp helpdesk source lives in `/Users/rajatgupta/Downloads/g-repo/work/crisp/helpdesk`. Crisp is operational support content and directly trains the AI chatbot.

## Canonical sources

Use these sources in order when updating customer docs:

1. Production app links and routes in the latest code.
2. `/Users/rajatgupta/Downloads/g-repo/app.galaxy.ai/api-docs` for API names, API URLs, API logos, and developer-doc links.
3. `/Users/rajatgupta/Downloads/g-repo/work/crisp/helpdesk` for short customer-support answers and chatbot language.
4. Existing files in this repository only when the content is still aligned with the sources above.

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

Maintain a canonical article inventory with stable article IDs, audiences, and destinations:

- `customer-docs`: long-form Mintlify pages in this repository.
- `crisp`: concise FAQ articles in `/Users/rajatgupta/Downloads/g-repo/work/crisp/helpdesk`.
- `api-docs`: developer references in `/Users/rajatgupta/Downloads/g-repo/app.galaxy.ai/api-docs`.

For shared customer knowledge, the canonical facts should be represented once as structured article metadata and reusable Markdown sections, then rendered into both destinations:

- Mintlify gets expanded guides, cross-links, cards, accordions, and navigation.
- Crisp gets short answers optimized for support search and chatbot training.

Recommended repo layout for the shared layer:

```text
work/knowledge/customer-support/
+-- articles/
|   +-- billing.cancel-subscription.md
|   +-- credits.how-credits-work.md
|   +-- troubleshooting.login-issues.md
+-- snippets/
|   +-- brand.md
|   +-- support-links.md
|   +-- api-links.md
+-- registry.json
```

Each article should declare:

```yaml
id: billing.cancel-subscription
title: Cancel your Magica subscription
audiences: [customer]
destinations: [customer-docs, crisp]
sourcePriority: [app-routes, api-docs, crisp]
owner: support
```

The sync pipeline should:

1. Validate registry IDs, titles, links, and destination paths.
2. Render Mintlify MDX into this repository.
3. Render plain Markdown into `/Users/rajatgupta/Downloads/g-repo/work/crisp/helpdesk`.
4. Run `mint broken-links` for customer docs when Mintlify is available.
5. Run `python3 sync.py` in `/Users/rajatgupta/Downloads/g-repo/work/crisp` to preview Crisp changes.
6. Require `python3 sync.py --push` only when intentionally publishing to Crisp.

This keeps customer docs and Crisp aligned while preserving the different formats each destination needs.
