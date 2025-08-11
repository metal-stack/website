# Docs-New

[![Netlify Status](https://api.netlify.com/api/v1/badges/f42ce2b4-45f8-4a11-9555-5a25f7a5e2aa/deploy-status)](https://app.netlify.com/projects/docs-new/deploys)

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

The file /static/_redirects contains a list of all paths of the old docs-sites. The file is formatted to create server-side-redirects on netlify, following the documentation here: https://docs.netlify.com/routing/redirects/

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
Ensure first, that all files in the docs folder are updated and ready to freeze. Also execute `bun run fetch-readmes` to update files from components and apis with the release-vector file from the main branch.
It is also possible to use `bun run fetch-readmes v0.20.8` to use the release-vector file with a specific tag (i.E. v0.20.8).
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

## Release Notes
The release notes can be synced from GitHub with the GitHub API. Therefore, ensure that a valid access token is created and set on the GitHub Runner or local machine with the name `GH_RELEASE_TOKEN`.

To run the synchronization, run the following commmand:
```
bun run create-release-notes
```
If you run this before the build step, also the release notes get indexed.