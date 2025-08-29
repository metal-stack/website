# website

[![Netlify Status](https://api.netlify.com/api/v1/badges/f42ce2b4-45f8-4a11-9555-5a25f7a5e2aa/deploy-status)](https://app.netlify.com/projects/docs-new/deploys)

This repository contains the website including the documentation of [metal-stack.io](https://metal-stack.io).

The used framework to generate docs is [docusaurus](https://docusaurus.io).

## Structure

```plain
├── blog                    # blogs folder structured by year
│   ├── 2019
│   ├── 2021
│   ├── 2022
│   ├── 2023
│   ├── 2024
│   └── 2025
├── docs                    # docs folder split by different scopes
│   ├── contributing        # guidelines for contributors
│   ├── docs                # documentation pages
│   ├── references          # auto-generated references of components and apis
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

### How to Organize the Docs?

- Prioritize the `concept` section. If this is about a MEP, you likely already have the contents for this.
- Use the `general` section to distribute users to their sections or to the deeper concept.
- user, operator or developer specific sections would be nice, but are optional.

#### Example

- Roles and Permissions
  - Concept: explains all roles, permissions and sessions
  - For operators: OIDC, creation in CI, ... How to / Explanation
  - For users: how to guide to create tokens and edit permissions
  - General: base concept, links to How to guides and deeper Concept
  - CISO / Compliance: minimal need to know Principle Explanation / Concept

## Backwards-Compatibility

In order to not break links of posts, blog articles and shared documents we want to provide full backwards-compatibility.
This means we need to ensure existing links still work with the new documentation.

The file /static/_redirects contains a list of all paths of the old docs-sites. The file is formatted to create server-side-redirects on netlify, following the documentation here: https://docs.netlify.com/routing/redirects/

## Docs

In order to add new docs you need to be aware of 2 cases:

### Root-Dir Doc

If you want to have your new document in the root-folder of the scope just add it with the following format:

```yaml
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

## Embedding drawio images

> ⚠️ referenced `.drawio.svg` images throw **warnings** because of unsupported file-types. We save `.drawio` files separatly and export them as `svg`. Issue is also known in [docusaurus](https://github.com/facebook/docusaurus/issues/9715)

Some svgs still can have problems e.g:

- `drawio.svg` files pulled by references
- too large svg

For this we have a pre-commit hook, which optimizes them with [svgo](https://github.com/svg/svgo)

## Blog

In order to add a blog-post follow this template. If a new author is referenced you have to add the author to the `authors.yaml`.

```yaml
---
title: Your Title
watermark: "Blog"
date: 2025-02-03T10:00:00+02:00
description: short description of the post
authors: [gerrit91]
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

Requires Bun as .js runtime.

Run the following command to install dependencies:

```bash
bun install
```

To generate a local preview use:

```bash
bun run start
```

To update the dependencies for the Reference pages:

```bash
bun run fetch-readmes
```

## Component References

Ensure first, that all files in the docs folder are updated and ready to freeze. Also execute `bun run fetch-readmes` to update files from components and apis with the release-vector file from the main branch.
It is also possible to use `bun run fetch-readmes v0.20.8` to use the release-vector file with a specific tag (i.E. v0.20.8).
All components are referenced in the `/scripts/components.json` file. Use this minimal template to add a new component:

```jsonc
{
        "name": "metalctl", // name of the component, will appear in the navigation
        "releasePath": "binaries.metal-stack.metalctl.version", // json-path of the version or tag in the release-vector
        "branch": "main", // branch name. Some old repositories use 'master'
        "repo": "metal-stack/metalctl", // component repository,
        "tag": "v0.18.1", // latest release tag of the component repository
        "position": 1, // use this property to sort the navigation subdirectories
        "withDocs": true // set to true to retrieve further .md files from a /docs folder. With false, only the README.md will be retrieved.
}
```

The `tag` property will be updated automatically from the release-vector file.

## Document Versioning

You create a new version with:

```bash
bun run docusaurus docs:version v0.21.6
```

Now, the new version will be create and the latest files will be copied to the "`versioned`" folders.

This, however, is usually done by the metal-robot through an automatically generated pull request.

## Release Notes

The release notes can be synced from GitHub with the GitHub API. Therefore, ensure that a valid access token is created and set on the GitHub Runner or local machine with the name `GITHUB_TOKEN`.

To run the synchronization, run the following command:

```bash
bun run create-release-notes
```
If you run this before the build step, also the release notes get indexed.
