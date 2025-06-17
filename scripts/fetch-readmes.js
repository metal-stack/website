const fs = require("fs");
const path = require("path");
const axios = require("axios");

import YAML from 'yaml'

const outputBase = path.resolve(__dirname, "../docs/docs/07-References");

const releaseVectorPath = "https://raw.githubusercontent.com/metal-stack/releases/refs/heads/master/release.yaml"

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
    const assetPaths = [...content.matchAll(assetRegex)]
      .map((m) => m[1])
      .filter((p) => !/^https?:\/\//.test(p) && !p.startsWith("/"));

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
        console.warn(`⚠️  Failed to fetch asset: ${relPath}`);
      }
    }

    const mdLinkRegex = /\[([^\]]+)\]\(([^)]+\.md)\)/g;
    const mdLinks = [...content.matchAll(mdLinkRegex)].map((m) => ({
      text: m[1],
      href: m[2],
    }));

    for (const link of mdLinks) {
      const mdFileName = path.basename(link.href);
      const linkedFilePath = path.join(outputDir, mdFileName);

      if (!fs.existsSync(linkedFilePath)) {
        const linkedFileUrl = `${baseurl}/${link.href}`;
        try {
          await downloadDoc(
            linkedFileUrl,
            baseurl,
            outputDir,
            component,
            mdFileName
          );
          console.log(`📄 Fetched linked markdown: ${link.href}`);
        } catch (e) {
          console.warn(`⚠️  Failed to fetch linked markdown: ${link.href}`);
        }
      }

      // Update link in current content
      content = content.replace(link.href, `./${mdFileName}`);
    }

    const frontmatter = `---
slug: /references/${name.replace(".md", "")}
title: ${name.replace(".md", "")}
sidebar_position: ${component.position}
---

`;

    const finalContent = frontmatter + content;

    const filePath = path.join(outputDir, name);
    fs.writeFileSync(filePath, finalContent, "utf8");

    console.log(`✅ Fetched and processed from ${component.name}: ${name}`);
  } catch (err) {
    console.error(`❌ Failed to fetch from ${component.name}: ${name}`, err.message);
  }
}

async function resolveDocs(baseurl, outputDir, component) {
  const apiUrl = `https://api.github.com/repos/${component.repo}/contents/docs?ref=${component.tag}`;
  const docsOutputDir = outputDir

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

const findPath = (object, path) => {
    const keys = path.split('.');
    let temp = object;
    for (let i = 0; i < keys.length; i++) {
        try {
            if(!temp.hasOwnProperty(keys[i])) { return undefined; } 
            temp = temp[keys[i]];
        } catch {
            return undefined;
        }
    }
    return temp;
};

async function fetchComponentDocs() {
  if (!fs.existsSync(outputBase)) {
    fs.mkdirSync(outputBase, { recursive: true });
  }
  
  const releaseVectorFile = await axios.get(releaseVectorPath);
  let releaseVector = YAML.parse(releaseVectorFile.data);

  let componentDocs = require("./components.json");

  for (const section of componentDocs) {
    for (const component of section.components) {
      let docsVersion = component.tag
      let releaseVersion = findPath(releaseVector,component.releasePath)

      if(releaseVersion === undefined) {
        console.error("Path for release version for component " + component.name + " not found or incorrect")
        continue
      }

      if(docsVersion !== releaseVersion) {
        component.tag = releaseVersion
        console.log("Update Component " + component.name + " from " + docsVersion + " to " + releaseVersion)
      }
    }
  }

  fs.writeFileSync('./scripts/components.json', JSON.stringify(componentDocs,null,2));

  for (const section of componentDocs) {
    for (const component of section.components) {
      const outputDir = path.join(outputBase, section.name, component.name);
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
}

fetchComponentDocs();
