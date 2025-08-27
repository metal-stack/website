import { themes as prismThemes } from "prism-react-renderer";
import type { Config } from "@docusaurus/types";
import type * as Preset from "@docusaurus/preset-classic";

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

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

  plugins: [[require.resolve('./blogPluginEnhanced'), {
    showReadingTime: true,
    blogSidebarTitle: 'All posts',
    blogSidebarCount: 'ALL',
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
    editUrl: "https://github.com/metal-stack/docs-new/tree/main/",
    // Useful options to enforce blogging best practices
    onInlineTags: "warn",
    onInlineAuthors: "ignore",
    onUntruncatedBlogPosts: "warn",
  }], ["./src/plugins/tailwind-config.js", {}],
  [require.resolve('docusaurus-lunr-search'), {
    languages: ['en']
  }]],

  presets: [
    [
      "classic",
      {
        docs: {
          sidebarPath: "./sidebars.ts",
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl:
            "https://github.com/metal-stack/docs-new/tree/main/",
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
      title: "metal-stack",
      logo: {
        alt: "metal-stack-log",
        src: "img/metal-stack.png",
      },
      items: [
        { type: "docsVersionDropdown", dropdownItemsAfter: [
              {
                type: 'html',
                value: '<hr class="dropdown-separator">',
              },
              {
                label: "Archived: v0.1 - v0.21.8",
                //! TODO: change to archived dns
                href: "https://docs.metal-stack.io/stable/"
              }
            ],
           },
        {
          type: "doc",
          label: "Docs",
          position: "left",
          docId: "docs/home",
        },
        {
          label: "Contributing",
          type: "doc",
          docId: "contributing/Proposals/index",
        },
        { to: "/blog", label: "Blog", position: "left" },
        {
          href: "https://metalstack.cloud/de/on-premises",
          label: "Services",
          position: "right",
        },
        {
          href: "https://github.com/metal-stack",
          "aria-label": "GitHub repository",
          position: "right",
          className: "header-github-link",
        },
        {
          href: "https://metal-stack.slack.com",
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
        {
          title: "About",
          items: [
            {
              label: "Benefits",
              to: "/",
            },
            {
              label: "Features",
              to: "/",
            },
            {
              label: "metalstack.cloud",
              to: "/",
            },
          ],
        },
        {
          title: "Contribute",
          items: [
            {
              label: "Connect on Slack",
              href: "https://metal-stack.slack.com",
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
          title: "Blog",
          items: [
            {
              label: "Blog",
              to: "/blog",
            },
          ],
        },
      ],
      // copyright: `Copyright © ${new Date().getFullYear()} metal-stack.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
