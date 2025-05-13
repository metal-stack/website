const fs = require("fs");
const path = require("path");
const axios = require("axios");

const components = [
  {
    name: "metal-ctl",
    repo: "metal-stack/metalctl",
    tag: "v0.18.1",
    position: 1,
    withDocs: true,
  },
  {
    name: "mini-lab",
    repo: "metal-stack/mini-lab",
    tag: "v0.4.4",
    position: 2,
    withDocs: false,
  },
];

const outputBase = path.resolve(__dirname, "../docs/components");

async function downloadFile(url, destPath) {
  const writer = fs.createWriteStream(destPath);
  const res = await axios.get(url, { responseType: "stream" });
  res.data.pipe(writer);
  return new Promise((resolve, reject) => {
    writer.on("finish", resolve);
    writer.on("error", reject);
  });
}

async function downloadDoc(url, baseurl, outputDir, component, name) {
  try {
    const res = await axios.get(url);
    let content = res.data;

    const assetRegex = /!\[[^\]]*]\(([^)]+)\)/g;
    const assetPaths = [...content.matchAll(assetRegex)].map((m) => m[1]);

    for (const relPath of assetPaths) {
      const filename = path.basename(relPath);
      const rawAssetUrl = `${baseurl}/${relPath}`;
      const localAssetDir = path.join(outputDir, "assets");
      if (!fs.existsSync(localAssetDir)) {
        fs.mkdirSync(localAssetDir, { recursive: true });
      }
      const localAssetPath = path.join(localAssetDir, filename);

      try {
        await downloadFile(rawAssetUrl, localAssetPath);
        content = content.replace(relPath, `./assets/${filename}`);
        console.log(`🖼️  Fetched asset: ${relPath}`);
      } catch (error) {
        console.log(error);
        console.warn(`⚠️  Failed to fetch asset: ${relPath}`);
      }
    }

    const frontmatter = `---
slug: ${name.replace(".md", "")}
title: ${name.replace(".md", "")}
sidebar_position: ${component.position}
---

`;

    const finalContent = frontmatter + content;

    const filePath = path.join(outputDir, name);
    fs.writeFileSync(filePath, finalContent, "utf8");

    console.log(`✅ Fetched and processed name`);
  } catch (err) {
    console.error(`❌ Failed to fetch name:`, err.message);
  }
}

async function resolveDocs(baseurl, outputDir, component) {
  const apiUrl = `https://api.github.com/repos/${component.repo}/contents/docs?ref=${component.tag}`;
  console.log(apiUrl);
  const docsOutputDir = path.join(outputDir, "docs");

  try {
    const response = await axios.get(apiUrl, {
      headers: {
        "User-Agent": "axios-client",
      },
    });
    if (!fs.existsSync(docsOutputDir)) {
      fs.mkdirSync(docsOutputDir, { recursive: true });
    }

    for (const file of response.data) {
      if (
        file.type === "file" &&
        file.name.endsWith(".md") &&
        file.download_url
      ) {
        // const localFilePath = path.join(docsOutputDir, file.name);
        downloadDoc(
          file.download_url,
          baseurl,
          docsOutputDir,
          component,
          file.name
        );
      } else {
        console.log(`❓ Skipping no markdown files.`);
      }
    }
  } catch (err) {
    console.error(
      `❌ Failed to fetch docs for ${component.name}:`,
      err.message
    );
  }
}

async function fetchComponentDocs() {
  if (!fs.existsSync(outputBase)) {
    fs.mkdirSync(outputBase, { recursive: true });
  }
  for (const component of components) {
    const outputDir = path.join(outputBase, component.name);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const baseurl = `https://raw.githubusercontent.com/${component.repo}/${component.tag}`;
    const url = `${baseurl}/README.md`;
    const fileName = `${component.name}.md`;

    downloadDoc(url, baseurl, outputDir, component, fileName);

    if (component.withDocs) {
      resolveDocs(baseurl, outputDir, component);
    }
  }
}

fetchComponentDocs();
