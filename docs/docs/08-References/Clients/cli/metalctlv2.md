---
slug: /references/metalctlv2
title: metalctlv2
sidebar_position: 1
---

## metalctlv2

cli for managing entities in metal-stack

### Options

```
      --api-token string       the token used for api requests
      --api-url string         the url to the metal-stack.io api (default "https://api.metal-stack.io")
  -c, --config string          alternative config file path, (default is ~/.metal-stack/config.yaml)
      --debug                  debug output
      --force-color            force colored output even without tty
  -h, --help                   help for metalctlv2
  -o, --output-format string   output format (table|wide|markdown|json|yaml|template|jsonraw|yamlraw), wide is a table with more columns, jsonraw and yamlraw do not translate proto enums into string types but leave the original int32 values intact. (default "table")
      --template string        output template for template output-format, go template format. For property names inspect the output of -o json or -o yaml for reference.
      --timeout duration       request timeout used for api requests
```

### SEE ALSO

* [metalctlv2 api-methods](./metalctlv2_api-methods.md)	 - show available api-methods of the metal-stack.io api
* [metalctlv2 completion](./metalctlv2_completion.md)	 - Generate the autocompletion script for the specified shell
* [metalctlv2 context](./metalctlv2_context.md)	 - manage cli contexts
* [metalctlv2 health](./metalctlv2_health.md)	 - print the client and server health information
* [metalctlv2 image](./metalctlv2_image.md)	 - manage image entities
* [metalctlv2 ip](./metalctlv2_ip.md)	 - manage ip entities
* [metalctlv2 login](./metalctlv2_login.md)	 - login
* [metalctlv2 logout](./metalctlv2_logout.md)	 - logout
* [metalctlv2 markdown](./metalctlv2_markdown.md)	 - create markdown documentation
* [metalctlv2 project](./metalctlv2_project.md)	 - manage project entities
* [metalctlv2 tenant](./metalctlv2_tenant.md)	 - manage tenant entities
* [metalctlv2 token](./metalctlv2_token.md)	 - manage token entities
* [metalctlv2 user](./metalctlv2_user.md)	 - manage user entities
* [metalctlv2 version](./metalctlv2_version.md)	 - print the client and server version information

