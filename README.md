# Docs-New

This repository contains a PoC of how the documentation of [metal-stack.io](https://metal-stack.io) can be refactored to meet new requirements.

The used framework to generate docs is [docusaurus](https://docusaurus.io).

## Structure

```
├── blog                    # blogs folder structured by year
│   ├── 2019
│   ├── 2021
│   ├── 2022
│   ├── 2023
│   ├── 2024
│   └── 2025
├── docs                    # docs folder split by different scopes
│   ├── contributing        # guidlines for contributors
│   ├── docs                # documentation pages
│   ├── references          # auto-genereted references of componets and apis
├── scripts                 # custom scripts (e.g: resolving component documentation)
├── src                     # custom routes and react
│   ├── components
│   ├── css
│   ├── pages
│   └── plugins
├── versioned_docs          # versioned docs (full copy of docs-folder)
│   ├── version-v0.21.4
│   └── version-v0.21.5
├── versioned_sidebars      # versioned sidebars
├── docusaurus.config.ts    # main docusaurus config
├── sidebars.ts             # handle sidebar navigation structure
└── versions.json           # list of versions
```

## Backwards-Compatibility

In order to not break links of posts, blog articles and shared documents we want to provide full backwards-compatibility.
This means we need to ensure existing links still work with the new documentation.

The file /static/\_redirects contains a list of all paths of the old docs-sites. The file is formatted to create server-side-redirects on netlify, following the documentation here: https://docs.netlify.com/routing/redirects/

## Docs

In order to add new docs you need to be aware of 2 cases:

### Root-Dir Doc

If you want to have your new document in the root-folder of the scope just add it with the following format:

```
---
slug: /your-doc-url
title: Title of document
position: <Position in sidebar as number>
---

<HERE YOUR DOCS>
```

### Sub-Dir Doc

If you want to have a new document in the sub-folder of the scope just add it the same as before, but make sure you have a `_category_.json`.
This file is used to generate the sidebar.

```json
{
  "position": 2,
  "label": "Overview"
}
```

## Blog

In order to add a blog-post follow this template. If a new author is referenced you have to add the author to the `authors.yaml`.

```
---
title: Your Title
watermark: "Blog"
date: 2025-02-03T10:00:00+02:00
description: short description of the post
authors: [gerrit]
type: "blog"
categories:
  - "Conferences"
tags:
  - 'News'
  - 'Conferences'
---

<SOME PREVIEW TEXT FOR BLOG LIST VIEW>

<!-- truncate -->

<YOUR ARTICLE>
```

## Setup & Build

Reqires Bun as .js runtime.

Run the following command to install dependencies:

```
bun install
```

To generate a local preview use:

```
bun run start
```

To update the dependencies for the Reference pages:

```
bun run fetch-readmes
```

## Component references

Ensure first, that all files in the docs folder are updated and ready to freeze. Also execute `bun run fetch-readmes` to update files from components and apis.
All components are referenced in the `/scripts/components.json` file. Use this minimal template to add a new component:

```json
{
        "name": "metalctl", // name of the component, will appear in the navigation
        "releasePath": "binaries.metal-stack.metalctl.version", // json-path of the version or tag in the release-vector
        "repo": "metal-stack/metalctl", // component repository,
        "position": 1, // use this property to sort the navigation subdirectories
        "withDocs": true // set to true to retrieve further .md files from a /docs folder. With false, only the README.md will be retrieved.
},
```

The `tag` property will be updated automatically from the release-vector file.

## Document Versioning

You create a new version with:

```
bun run docusaurus docs:version v0.21.6
```

Now, the new version will be create and the latest files will be copied to the "`versioned`" folders.

## PDF Generation

For now we have different pdf-generation approaches:

- typst
- pupeteer
- [docusuraus-plugin](https://github.com/jean-humann/docs-to-pdf)

### Docusaurus Plugin

The approach:

- reference first doc-page
- plugin crawls through docs by using "Next"-Button
- gathers all rendered pages
- generates based on this a html and then a pdf

In order to stop split the pdf we have two options:

- `excludePaths` parameter: still every sub-url gets visited
- disable "Next"-Button on last section of page/pdf

Command to test:

```sh
npx docs-to-pdf --initialDocURLs="http://localhost:3000/docs/introduction" --contentSelector="article" --paginationSelector="a.pagination-nav__link.pagination-nav__link--next" --excludeSelectors=".margin-vert--xl a,[class^='tocCollapsible'],.breadcrumbs,.theme-edit-this-page" --coverImage="https://metal-stack.io/v1.0_metalstack_io_logo_RGB_combination_mark_for_black.svg" --coverTitle="Metal-Stack Documentation" --cssStyle="body{font-size: 10px}"
```

## Comparison

### Benefits

**Core** features:

- md, mdx based documentation
- simple and flexible file structure
- versioning
- blog integration

**Nice** to have:

- completely in typescript
- highly customizable
- custom page routing
- custom styling and theming
- possibility for translations

### Disadvantages

- new framework
- copies of versions can explode the size of the repository
