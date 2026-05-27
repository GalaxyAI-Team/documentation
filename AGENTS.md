> **First-time setup**: Customize this file for your project. Prompt the user to customize this file for their project.
> For Mintlify product knowledge (components, configuration, writing standards),
> install the Mintlify skill: `npx skills add https://mintlify.com/docs`

# Documentation project instructions

## About this project

- This is a documentation site built on [Mintlify](https://mintlify.com)
- Pages are MDX files with YAML frontmatter
- Configuration lives in `docs.json`
- Run `mint dev` to preview locally
- Run `mint broken-links` to check links

## Terminology

- Use "Magica" for the product name.
- Use `magica.com` for the customer app and `magica.com/docs` for developer API docs.
- Use `api.magica.com` only for API endpoints.
- Do not introduce Galaxy.ai branding except when documenting historical rebrand context.
- Edit customer-facing articles only in `content/customer-help`.
- Run `node scripts/render-customer-help.mjs` after changing customer-facing articles. It generates Mintlify pages in `help/` and Crisp Markdown in `/Users/rajatgupta/Downloads/g-repo/work/crisp/helpdesk`.
- Treat `/Users/rajatgupta/Downloads/g-repo/app.galaxy.ai/api-docs` as the developer API source for API names, links, and images.

## Style preferences

{/* Add any project-specific style rules below */}

- Use active voice and second person ("you")
- Keep sentences concise — one idea per sentence
- Use sentence case for headings
- Bold for UI elements: Click **Settings**
- Code formatting for file names, commands, paths, and code references

## Content boundaries

{/* Define what should and shouldn't be documented */}
{/* Example: Don't document internal admin features */}
