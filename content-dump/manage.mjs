#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const managerDir = import.meta.dirname;
const repoRoot = path.resolve(managerDir, "..");
const sourceDir = repoRoot;
const docsJsonPath = path.join(repoRoot, "docs.json");
const indexPath = path.join(repoRoot, "index.mdx");
const envPath = path.join(repoRoot, ".env");
const mintlifyProjectId = "69fc4d9bd752271a22466d00";
const shouldDeploy = process.argv.includes("--deploy");
const ignoredRootDirs = new Set([
  ".git",
  ".mintlify",
  ".next",
  "content-dump",
  "logo",
  "node_modules",
]);

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

function parseFrontmatter(filePath) {
  const text = fs.readFileSync(filePath, "utf8").replace(/\r\n/g, "\n");
  const match = text.match(/^---\n([\s\S]*?)\n---\s*\n?([\s\S]*)$/);
  if (!match) throw new Error(`Missing YAML frontmatter: ${filePath}`);

  const data = {};
  for (const line of match[1].split("\n")) {
    const separator = line.indexOf(":");
    if (separator === -1) continue;
    const key = line.slice(0, separator).trim();
    let value = line.slice(separator + 1).trim();
    if (value.startsWith('"') && value.endsWith('"'))
      value = value.slice(1, -1).replace(/\\"/g, '"').replace(/\\\\/g, "\\");
    data[key] = value;
  }

  for (const key of ["title", "category", "crispSlug"]) {
    if (!data[key]) throw new Error(`Missing ${key} in ${filePath}`);
  }

  return { data, body: match[2].trim() };
}

function writeFileIfChanged(filePath, content) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  if (fs.existsSync(filePath) && fs.readFileSync(filePath, "utf8") === content)
    return false;
  fs.writeFileSync(filePath, content);
  return true;
}

function loadEnvFile() {
  if (!fs.existsSync(envPath)) return;

  const lines = fs.readFileSync(envPath, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) continue;

    const separator = trimmed.indexOf("=");
    const key = trimmed.slice(0, separator).trim();
    let value = trimmed.slice(separator + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (!process.env[key]) process.env[key] = value;
  }
}

function renderDocsJson(categories) {
  const docsJson = JSON.parse(fs.readFileSync(docsJsonPath, "utf8"));
  docsJson.name = "Magica Help Center";
  docsJson.description =
    "Guides and answers for Magica account access, billing, credits, tools, privacy, and troubleshooting.";
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
  docsJson.appearance = {
    default: "light",
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
      {
        product: "API/MCP Docs",
        description: "Developer API, MCP, and automation documentation.",
        icon: "terminal",
        href: "https://magica.com/docs",
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
      const icon = categoryIcons.get(category.name) ?? "file-text";
      return `  <Card title="${category.name}" icon="${icon}" href="/${category.pages[0]}">\n    ${category.count} customer support articles.\n  </Card>`;
    })
    .join("\n");

  return `---\ntitle: "Magica Help Center"\ndescription: "Customer support articles for Magica account access, billing, credits, tools, privacy, and troubleshooting."\n---\n\nSearch or browse Magica customer support articles.\n\n<CardGroup cols={2}>\n${cards}\n</CardGroup>\n`;
}

function main() {
  assertDirectory(managerDir, "content-dump");

  const categories = [];

  for (const categorySlug of fs.readdirSync(sourceDir).sort()) {
    if (categorySlug.startsWith(".") || ignoredRootDirs.has(categorySlug)) continue;
    const categoryDir = path.join(sourceDir, categorySlug);
    if (!fs.statSync(categoryDir).isDirectory()) continue;

    const pages = [];
    let categoryName = "";

    for (const fileName of fs.readdirSync(categoryDir).sort()) {
      if (!fileName.endsWith(".mdx")) continue;

      const article = parseFrontmatter(path.join(categoryDir, fileName));
      categoryName = article.data.category;
      const page = `${categorySlug}/${fileName.replace(/\.mdx$/, "")}`;

      pages.push(page);
    }

    if (pages.length) {
      categories.push({ name: categoryName, pages, count: pages.length });
    }
  }

  categories.sort((a, b) => a.name.localeCompare(b.name));
  writeFileIfChanged(docsJsonPath, renderDocsJson(categories));
  writeFileIfChanged(indexPath, renderIndex(categories));

  const count = categories.reduce((sum, category) => sum + category.count, 0);
  console.log(`Rendered Mintlify navigation from ${count} customer articles.`);
  console.log("Run `cd ../crisp && python3 sync.py` to preview Crisp publishing from the same articles.");
}

async function triggerMintlifyDeploy() {
  loadEnvFile();

  const token = process.env.MINTLIFY_API_KEY;
  if (!token) {
    throw new Error(
      "Missing MINTLIFY_API_KEY. Add it to .env or export it before running with --deploy.",
    );
  }

  const response = await fetch(
    `https://api.mintlify.com/v1/project/update/${mintlifyProjectId}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  const body = await response.text();
  if (!response.ok) {
    throw new Error(
      `Mintlify deployment trigger failed (${response.status}): ${body}`,
    );
  }

  console.log(`Triggered Mintlify deployment: ${body}`);
}

main();

if (shouldDeploy) {
  await triggerMintlifyDeploy();
}
