---
slug: /references/cli
title: cli
sidebar_position: 1
---

# metal-stack CLI V2

[![Markdown Docs](https://img.shields.io/badge/markdown-docs-blue?link=https%3A%2F%2Fgithub.com%2Fmetal-stack%2Fcli%2Fdocs)](./docs/metalctlv2.md)
![Go Version](https://img.shields.io/github/go-mod/go-version/metal-stack/cli)
[![Go Report Card](https://goreportcard.com/badge/github.com/metal-stack/cli)](https://goreportcard.com/report/github.com/metal-stack/cli)

This is the official V2 CLI for accessing the API of [metal-stack.io](https://metal-stack.io).

***WORK IN PROGRESS, not compatible with current metal-api***

## Installation

Download locations:

- [metalctlv2-linux-amd64](https://github.com/metal-stack/cli/releases/latest/download/metalctlv2-linux-amd64)
- [metalctlv2-darwin-amd64](https://github.com/metal-stack/cli/releases/latest/download/metalctlv2-darwin-amd64)
- [metalctlv2-darwin-arm64](https://github.com/metal-stack/cli/releases/latest/download/metalctlv2-darwin-arm64)
- [metalctlv2-windows-amd64](https://github.com/metal-stack/cli/releases/latest/download/metalctlv2-windows-amd64)

### Installation on Linux

```bash
curl -LO https://github.com/metal-stack/cli/releases/latest/download/metalctlv2-linux-amd64
chmod +x metalctlv2-linux-amd64
sudo mv metalctlv2-linux-amd64 /usr/local/bin/metalctlv2
```

### Installation on MacOS

For x86 based Macs:

```bash
curl -LO https://github.com/metal-stack/cli/releases/latest/download/metalctlv2-darwin-amd64
chmod +x metalctlv2-darwin-amd64
sudo mv metalctlv2-darwin-amd64 /usr/local/bin/metalctlv2
```

For Apple Silicon (M1) based Macs:

```bash
curl -LO https://github.com/metal-stack/cli/releases/latest/download/metalctlv2-darwin-arm64
chmod +x metalctlv2-darwin-arm64
sudo mv metalctlv2-darwin-arm64 /usr/local/bin/metalctlv2
```

### Installation on Windows

```bash
curl -LO https://github.com/metal-stack/cli/releases/latest/download/metalctlv2-windows-amd64
copy metalctlv2-windows-amd64 metalctlv2.exe
```

## Usage

All commands follow a general form:

```bash
metalctlv2 <entity> [<category>] <command> <argument> [<flags>]
```

For example:

```bash
metalctlv2 tenant member list --api-token <your-token> --api-url <api-url>
metalctlv2 ctx add <context-name>
```

The `api-token`, `api-url` and `project-id` are defaulted by the context, if one exists, and can be omitted.

In addition to the standard API services, there are also admin services that require an admin token for execution.

You can access help for every service and command by using `--help` or `-h`. If you encounter any issues not covered in the help prompt, or if you have suggestions for improvement, please feel free to [contact us](mailto:support@metal-stack.io) or open an issue in this repository. Your feedback is greatly appreciated!

A list of all available services (excluding admin topics). For their associated commands, arguments and flags visit the correct [documentation](./metal.md).

| Entity        | Description                                                | Documentation                                         |
|---------------|------------------------------------------------------------|-------------------------------------------------------|
| `api-methods` | show available api-methods of the metal-stack.io api       | [metal api-methods](./metalctlv2_api-methods.md) |
| `completion`  | generate the autocompletion script for the specified shell | [metal completion](./metalctlv2_completion.md)   |
| `context`     | manage cli contexts                                        | [metal context](./metalctlv2_context.md)         |
| `health`      | print the client and server health information             | [metal health](./metalctlv2_health.md)           |
| `ip`          | manage ip entities                                         | [metal ip](./metalctlv2_ip.md)                   |
| `markdown`    | create markdown documentation                              | [metal completion](./metalctlv2_completion.md)   |
| `project`     | manage project entities                                    | [metal project](./metalctlv2_project.md)         |
| `tenant`      | manage tenant entities                                     | [metal tenant](./metalctlv2_tenant.md)           |
| `token`       | manage token entities                                      | [metal token](./metalctlv2_token.md)             |
| `user`        | manage user entities                                       | [metal user](./metalctlv2_user.md)               |
| `version`     | print the client and server version information            | [metal version](./metalctlv2_version.md)         |
| `login`       | login with oidc and write api-token to the configuration   | [metal login](./metalctlv2_login.md)             |

### Autocompletion

To successfully set up autocompletion follow this [guide](./metalctlv2_completion.md).

## Authentication and Configuration

To work with this CLI, it's necessary to create an api-token, this can be done with the login command.

```bash
$ metalctlv2 login
Starting server at http://127.0.0.1:35287...
✔ login successful! Updated and activated context "local"
```

The project's ID can be copied from the UI, the button is located right next to the project title in the project dashboard. The default API-URL of metal-stack is https://api.metal-stack.io.

```bash
$ metalctlv2 ctx add <context-name> --activate --default-project <project-uuid> --api-token <your-token>
✔ added context "<context-name>"
```

The configuration file is by default written to `~/.metal-stack/config.yaml`.
