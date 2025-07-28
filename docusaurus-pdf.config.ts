import { themes as prismThemes } from "prism-react-renderer";
import type { Config } from "@docusaurus/types";
import type * as Preset from "@docusaurus/preset-classic";

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const commonDocsOptions = {
  breadcrumbs: false,
  showLastUpdateAuthor: false,
  showLastUpdateTime: true,
};

const image_url = {
  "Gerrit Schwerthelm": "https://github.com/gerrit91.png",
  valentin: "https://github.com/vknabel.png",
  stefan: "https://github.com/majst01.png",
  markus: "https://github.com/mwindower.png",
  grigoriy: "https://github.com/GrigoriyMikhalkin.png",
};

const config: Config = {
  title: "metal-stack docs",
  tagline: "Docs for metal-stack.",
  favicon: "img/favicon.ico",

  // Set the production url of your site here
  url: "https://your-docusaurus-site.example.com",
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: "/",

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: "metal-stack", // Usually your GitHub org/user name.
  projectName: "docs-new", // Usually your repo name.

  onBrokenLinks: "warn",
  onBrokenMarkdownLinks: "warn",

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: "en",
    locales: ["en"],
  },

  markdown: {
    format: "detect",
  },

  plugins: [["./src/plugins/tailwind-config.js", {}]],

  presets: [
    [
      "classic",
      {
        docs: {
          // sidebarPath: "./sidebars.ts",
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          // editUrl:
          //  "https://github.com/metal-stack/docs-new/tree/main/",
        },
        theme: {
          customCss: "./src/css/custom.css",
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    colorMode: {
      respectPrefersColorScheme: true,
    },
    // Replace with your project's social card
    image: "img/metal-stack.png",
    navbar: {
      title: "metal-stack",
      logo: {
        alt: "metal-stack-log",
        src: "img/metal-stack.png",
      },
      items: [
        { type: "docsVersionDropdown" },
        {
          type: "doc",
          label: "Docs",
          position: "left",
          docId: "docs/introduction",
        }
      ],
    },
    footer: {
      style: "dark",
      links: []
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
