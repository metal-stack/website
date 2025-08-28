---
slug: /references/metalctlv2_project
title: metalctlv2_project
sidebar_position: 1
---

## metalctlv2 project

manage project entities

### Synopsis

manage api projects

### Options

```
  -h, --help   help for project
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

* [metalctlv2](./metalctlv2.md)	 - cli for managing entities in metal-stack
* [metalctlv2 project apply](./metalctlv2_project_apply.md)	 - applies one or more projects from a given file
* [metalctlv2 project create](./metalctlv2_project_create.md)	 - creates the project
* [metalctlv2 project delete](./metalctlv2_project_delete.md)	 - deletes the project
* [metalctlv2 project describe](./metalctlv2_project_describe.md)	 - describes the project
* [metalctlv2 project edit](./metalctlv2_project_edit.md)	 - edit the project through an editor and update
* [metalctlv2 project invite](./metalctlv2_project_invite.md)	 - manage project invites
* [metalctlv2 project join](./metalctlv2_project_join.md)	 - join a project of someone who shared an invite secret with you
* [metalctlv2 project list](./metalctlv2_project_list.md)	 - list all projects
* [metalctlv2 project member](./metalctlv2_project_member.md)	 - manage project members
* [metalctlv2 project update](./metalctlv2_project_update.md)	 - updates the project

