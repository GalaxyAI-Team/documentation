#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const repoRoot = path.resolve(import.meta.dirname, "..");
const sourceDir = path.join(repoRoot, "content", "customer-help");
const docsOutDir = path.join(repoRoot, "help");
const crispOutDir = path.resolve(repoRoot, "..", "crisp", "helpdesk");
const docsJsonPath = path.join(repoRoot, "docs.json");
const indexPath = path.join(repoRoot, "index.mdx");

const categoryIcons = new Map([
  ["Getting Started", "rocket"],
  ["Account & Platform Features", "settings"],
  ["Billing & Subscription", "credit-card"],
  ["Credits & Usage Tracking", "coins"],
  ["Data Privacy & Security", "shield-check"],
  ["Integrations & API", "plug"],
  ["Troubleshooting & Technical Issues", "wrench"],
  ["Affiliate Program", "share-2"],
]);

function assertDirectory(dir, label) {
  if (!fs.existsSync(dir) || !fs.statSync(dir).isDirectory())
    throw new Error(`${label} directory does not exist: ${dir}`);
}

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function readArticle(filePath) {
  const text = fs.readFileSync(filePath, "utf8").replace(/\r\n/g, "\n");
  const match = text.match(/^<!--\s*\n([\s\S]*?)\n-->\s*\n?([\s\S]*)$/);
  if (!match) throw new Error(`Missing Crisp title frontmatter: ${filePath}`);

  const titleLine = match[1]
    .split("\n")
    .map((line) => line.trim())
    .find((line) => line.startsWith("title:"));

  if (!titleLine) throw new Error(`Missing title in frontmatter: ${filePath}`);

  return {
    title: titleLine.slice("title:".length).trim(),
    body: match[2].trim(),
  };
}

function writeFileIfChanged(filePath, content) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  if (fs.existsSync(filePath) && fs.readFileSync(filePath, "utf8") === content)
    return false;
  fs.writeFileSync(filePath, content);
  return true;
}

function cleanGeneratedDocs() {
  fs.rmSync(docsOutDir, { force: true, recursive: true });
}

function toDescription(body) {
  const plain = body
    .replace(/```[\s\S]*?```/g, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[*_`>#-]/g, "")
    .split("\n")
    .map((line) => line.trim())
    .find(Boolean);

  if (!plain) return "Customer support article for Magica.";
  return plain.length > 155 ? `${plain.slice(0, 152).trim()}...` : plain;
}

function escapeYaml(value) {
  return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

function toMdx(article, sourcePath) {
  return `---\ntitle: "${escapeYaml(article.title)}"\ndescription: "${escapeYaml(toDescription(article.body))}"\n---\n\n{/* Generated from ${sourcePath}. Edit that source file, then run scripts/render-customer-help.mjs. */}\n\n${article.body}\n`;
}

function toCrispMarkdown(article) {
  return `<!--\ntitle: ${article.title}\n-->\n${article.body}\n`;
}

function renderDocsJson(categories) {
  const docsJson = JSON.parse(fs.readFileSync(docsJsonPath, "utf8"));
  docsJson.name = "Magica Help Center";
  docsJson.description =
    "Guides and answers for Magica customers, generated from the canonical customer-help source.";
  docsJson.logo = {
    dark: "/logo/logo_dark_theme.svg",
    light: "/logo/logo_light_theme.svg",
  };
  docsJson.favicon = "/logo/icon.png";
  docsJson.colors = {
    primary: "#6366f1",
    light: "#818cf8",
    dark: "#4f46e5",
  };
  docsJson.navigation = {
    directory: "card",
    products: [
      {
        product: "Help Center",
        description:
          "Customer support articles for account access, billing, credits, tools, privacy, and troubleshooting.",
        icon: "life-buoy",
        groups: categories.map((category) => ({
          group: category.name,
          icon: categoryIcons.get(category.name) ?? "file-text",
          expanded: true,
          root: category.pages[0],
          pages: category.pages.slice(1),
        })),
      },
    ],
  };
  docsJson.navbar = {
    links: [{ label: "Contact Support", href: "https://magica.com/support" }],
    primary: {
      type: "button",
      label: "Go to Magica",
      href: "https://magica.com",
    },
  };

  return `${JSON.stringify(docsJson, null, 2)}\n`;
}

function renderIndex(categories) {
  const cards = categories
    .map((category) => {
      const href = `/${category.pages[0]}`;
      const icon = categoryIcons.get(category.name) ?? "file-text";
      return `  <Card title="${category.name}" icon="${icon}" href="${href}">\n    ${category.count} customer support articles.\n  </Card>`;
    })
    .join("\n");

  return `---\ntitle: "Magica Help Center"\ndescription: "Customer support articles for Magica account access, billing, credits, tools, privacy, and troubleshooting."\n---\n\nSearch or browse Magica customer support articles. This Mintlify help center and the Crisp helpdesk are generated from the same canonical files in \`content/customer-help\`.\n\n<CardGroup cols={2}>\n${cards}\n</CardGroup>\n`;
}

function main() {
  assertDirectory(sourceDir, "Canonical customer-help source");
  assertDirectory(crispOutDir, "Crisp helpdesk output");

  const categories = [];
  cleanGeneratedDocs();

  for (const categoryName of fs.readdirSync(sourceDir).sort()) {
    const categorySourceDir = path.join(sourceDir, categoryName);
    if (!fs.statSync(categorySourceDir).isDirectory()) continue;

    const categorySlug = slugify(categoryName);
    const pages = [];
    let count = 0;

    for (const fileName of fs.readdirSync(categorySourceDir).sort()) {
      if (!fileName.endsWith(".md")) continue;

      const sourcePath = path.join(categorySourceDir, fileName);
      const article = readArticle(sourcePath);
      const articleSlug = fileName.replace(/\.md$/, "");
      const docsPage = `help/${categorySlug}/${articleSlug}`;
      const relativeSourcePath = path
        .relative(repoRoot, sourcePath)
        .split(path.sep)
        .join("/");

      writeFileIfChanged(
        path.join(repoRoot, `${docsPage}.mdx`),
        toMdx(article, relativeSourcePath),
      );
      writeFileIfChanged(
        path.join(crispOutDir, categoryName, fileName),
        toCrispMarkdown(article),
      );

      pages.push(docsPage);
      count += 1;
    }

    if (pages.length) categories.push({ name: categoryName, pages, count });
  }

  writeFileIfChanged(docsJsonPath, renderDocsJson(categories));
  writeFileIfChanged(indexPath, renderIndex(categories));

  console.log(
    `Rendered ${categories.reduce((sum, category) => sum + category.count, 0)} articles from content/customer-help.`,
  );
}

main();
