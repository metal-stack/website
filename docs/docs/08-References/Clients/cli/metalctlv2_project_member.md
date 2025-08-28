---
slug: /references/metalctlv2_project_member
title: metalctlv2_project_member
sidebar_position: 1
---

## metalctlv2 project member

manage project members

### Options

```
  -h, --help   help for member
```

### Options inherited from parent commands

```
      --api-token string       the token used for api requests
      --api-url string         the url to the metal-stack.io api (default "https://api.metal-stack.io")
  -c, --config string          alternative config file path, (default is ~/.metal-stack/config.yaml)
      --debug                  debug output
      --force-color            force colored output even without tty
  -o, --output-format string   output format (table|wide|markdown|json|yaml|template|jsonraw|yamlraw), wide is a table with more columns, jsonraw and yamlraw do not translate proto enums into string types but leave the original int32 values intact. (default "table")
      --template string        output template for template output-format, go template format. For property names inspect the output of -o json or -o yaml for reference.
      --timeout duration       request timeout used for api requests
```

### SEE ALSO

* [metalctlv2 project](./metalctlv2_project.md)	 - manage project entities
* [metalctlv2 project member delete](./metalctlv2_project_member_delete.md)	 - remove member from a project
* [metalctlv2 project member list](./metalctlv2_project_member_list.md)	 - lists members of a project
* [metalctlv2 project member update](./metalctlv2_project_member_update.md)	 - update member from a project

