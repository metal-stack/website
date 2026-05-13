import { themes as prismThemes } from "prism-react-renderer";
import type { Config } from "@docusaurus/types";
import type * as Preset from "@docusaurus/preset-classic";

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const config: Config = {
  title: "metal-stack.io",
  tagline:
    "Bring the cloud to your data center. metal-stack is an open source software that provides an API for provisioning and managing physical servers in the data center.",
  favicon: "img/favicon.ico",

  staticDirectories: ['static'],

  // Set the production url of your site here
  url: "https://metal-stack.io",
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: "/",

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: "metal-stack", // Usually your GitHub org/user name.
  projectName: "website", // Usually your repo name.

  onBrokenLinks: "warn",

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: "en",
    locales: ["en"],
  },

  markdown: {
    format: "detect",
    hooks: {
      onBrokenMarkdownLinks: "warn",
    },
  },

  plugins: [
    [
      "docusaurus-plugin-llms",
      {
        id: "docs-llms-txt",
        includeBlog: false,
        generateLLMsTxt: true,
        generateLLMsFullTxt: true,
        docsDir: "docs",
        llmsTxtFilename: "llms.txt",
        llmsFullTxtFilename: "llms-full.txt",
        rootContent: `This file does not contain Community resources, blog posts and metal-stack enhancement proposals (MEP). These can be found in the [Community](https://metal-stack.io/community) tab.

For this, there are dedicated files following the llmstxt.org standard:
- [llms-community.txt](https://metal-stack.io/llms-community.txt) contains links to community sections
- [llms-community-full.txt](https://metal-stack.io/llms-community-full.txt) contains all community content in a single document
        `,
      },
    ],
    [
      "docusaurus-plugin-llms",
      {
        id: "community-llms-txt",
        title: "metal-stack Community Documentation",
        description:
          "Community resources and metal-stack enhancement proposals (MEP)",
        includeBlog: true,
        generateLLMsTxt: true,
        generateLLMsFullTxt: true,
        docsDir: "community",
        llmsTxtFilename: "llms-community.txt",
        llmsFullTxtFilename: "llms-community-full.txt",
        rootContent: `This file does not contain general documentation. This can be found in the [Documentation](https://metal-stack.io/docs) tab.

For this, there are dedicated files following the llmstxt.org standard:
- [llms.txt](https://metal-stack.io/llms.txt) contains links to documentation sections
- [llms-full.txt](https://metal-stack.io/llms-full.txt) contains all documentation content in a single document
        `,
      },
    ],
    [
      require.resolve("./blogPluginEnhanced"),
      {
        showReadingTime: true,
        blogSidebarTitle: "All posts",
        blogSidebarCount: 0,
        postsPerPage: 12,
        feedOptions: {
          type: "all",
          //copyright: `Copyright © ${new Date().getFullYear()} metal-stack`,
          createFeedItems: async (params) => {
            const { blogPosts, defaultCreateFeedItems, ...rest } = params;
            return await defaultCreateFeedItems({
              // keep only the 10 most recent blog posts in the feed
              blogPosts: blogPosts.filter((item, index) => index < 30),
              ...rest,
            });
          },
        },
        // Please change this to your repo.
        // Remove this to remove the "edit this page" links.
        editUrl: "https://github.com/metal-stack/website/tree/main/",
        // Useful options to enforce blogging best practices
        onInlineTags: "warn",
        onInlineAuthors: "ignore",
        onUntruncatedBlogPosts: "warn",
      },
    ],
    ["./src/plugins/tailwind-config.js", {}],
    [
      require.resolve("docusaurus-lunr-search"),
      {
        languages: ["en"],
      },
    ],
    [
      "@docusaurus/plugin-content-docs",
      {
        id: "community",
        path: "community",
        routeBasePath: "community",
        sidebarPath: "./sidebars-community.ts",
        editUrl: "https://github.com/metal-stack/website/tree/main/",
        includeCurrentVersion: true,
        lastVersion: undefined, // intentionally no version
      },
    ],
  ],

  presets: [
    [
      "classic",
      {
        docs: {
          sidebarPath: "./sidebars-docs.ts",
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl: "https://github.com/metal-stack/website/tree/main/",
        },
        blog: false,
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
      title: "metal-stack.io",
      logo: {
        alt: "metal-stack-log",
        src: "img/metal-stack.png",
      },
      items: [
        {
          type: "doc",
          label: "Docs",
          position: "left",
          docId: "home",
        },
        {
          label: "Community",
          to: "/community",
        },
        {
          to: "/blog",
          label: "Blog",
          position: "left",
        },
        {
          type: "docsVersionDropdown",
          id: "docs-version-dropdown",
          position: "right",
          dropdownItemsAfter: [
            {
              type: "html",
              value: '<hr class="dropdown-separator">',
            },
            {
              label: "Archived: v0.1 - v0.21.8",
              href: "https://docs.archive.metal-stack.io/",
            },
          ],
        },
        {
          href: "https://github.com/metal-stack",
          "aria-label": "GitHub repository",
          position: "right",
          className: "header-github-link",
        },
        {
          href: "https://join.slack.com/t/metal-stack/shared_invite/zt-3eqheaymr-obQueWBLOMkhbEWTZZyDRg",
          "aria-label": "Slack link",
          position: "right",
          className: "header-slack-link",
        },
      ],
    },
    footer: {
      style: "dark",
      links: [
        {
          title: "metal-stack.io",
          items: [
            {
              label: "Blog",
              to: "/blog",
            },
            {
              label: "Imprint",
              to: "/imprint",
            },
            {
              label: "Privacy policy",
              to: "/privacy",
            },
          ],
        },
        {
          title: "About",
          items: [
            {
              label: "Benefits",
              to: "/#benefits",
            },
            {
              label: "Features",
              to: "/#distinguishing-features",
            },
            {
              label: "metalstack.cloud",
              href: "https://metalstack.cloud",
            },
          ],
        },
        {
          title: "Contribute",
          items: [
            {
              label: "Join our Slack Channel",
              href: "https://join.slack.com/t/metal-stack/shared_invite/zt-3eqheaymr-obQueWBLOMkhbEWTZZyDRg",
            },
            {
              label: "Contribute on GitHub",
              href: "https://github.com/metal-stack",
            },
            {
              label: "Email us",
              href: "mailto:metal-stack.io",
            },
          ],
        },
        {
          title: "Docs",
          items: [
            {
              label: "Concepts",
              to: "/docs/architecture",
            },
            {
              label: "For Operators",
              to: "/docs/hardware",
            },
            {
              label: "For Users",
              to: "/docs/client-libraries",
            },
            {
              label: "Components",
              to: "/docs/references/metalctl",
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} metal-stack. All rights reserved.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ["bash"],
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
