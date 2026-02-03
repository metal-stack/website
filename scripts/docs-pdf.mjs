import { spawnSync } from "node:child_process";
import { resolve } from "node:path";
import { readFileSync } from "node:fs";

import version from '../src/version.json' with { type: 'json' };

function env(name, fallback) {
  return process.env[name] ?? fallback;
}

const DOC_URL = env("DOC_URL", "http://localhost:3000/docs/next/home");
const DOC_VERSION = env("DOC_VERSION", "3");
const COVER_IMAGE = env("COVER_IMAGE", "https://metal-stack.io/img/metal-stack.png");
const COVER_TITLE = env("COVER_TITLE", "metal-stack.io");
const COVER_SUB = env("COVER_SUB", "Documentation Version " + version.version);

if (process.env.CI && DOC_URL.includes("localhost")) {
  console.error(
    `Refusing to run in CI with DOC_URL=${DOC_URL}. Set DOC_URL to your deployed preview URL or start a server in CI.`
  );
  process.exit(1);
}

const logoPath = resolve(__dirname, "../static/img/metal-stack.png");
const logoBase64 = readFileSync(logoPath).toString("base64");
const logoDataUri = `data:image/png;base64,${logoBase64}`;

const headerTemplate = `
  <style>
    .header {
      width: 100%;
      font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      font-size: 9px;
      color: #111;
      padding: 0 10mm;
      display: flex;
      align-items: center;
      justify-content: space-between;
      box-sizing: border-box;
    }
    .left { display: flex; align-items: center; gap: 8px; }
    .logo { height: 14px; width: auto; display: block; }
    .docs { font-weight: 600; font-size: 10px; }
    .version { color: #525252; white-space: nowrap; }
  </style>

  <div class="header">
    <div class="left">
      <img class="logo" src="${logoDataUri}" />
      <span class="docs">metal-stack.io | Documentation</span>
    </div>
    <div class="version">${version.version}</div>
  </div>
`;

const footerTemplate = `
  <style>
    .footer {
      width: 100%;
      font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      font-size: 9px;
      color: #525252;
      padding: 0 10mm;
      box-sizing: border-box;
      display: flex;
      justify-content: flex-end;
    }
  </style>

  <div class="footer">
    <span class="pageNumber"></span> / <span class="totalPages"></span>
  </div>
`;

const args = [
  "docs-to-pdf",
  "docusaurus",
  `--initialDocURLs=${DOC_URL}`,
  `--version=${DOC_VERSION}`,
  `--coverImage=${COVER_IMAGE}`,
  `--coverTitle=${COVER_TITLE}`,
  `--coverSub=${COVER_SUB}`,
  `--excludeSelectors=".margin-vert--xl a,[class^='tocCollapsible']"`,
  `--contentSelector="main"`,
  `--outputPDFFilename=./docs/pdfs/metal-stack-docs.pdf`,
  `--headerTemplate=${headerTemplate}`,
  `--footerTemplate=${footerTemplate}`,
];

const res = spawnSync("npx", args, { stdio: "inherit", shell: process.platform === "win32" });
process.exit(res.status ?? 1);
