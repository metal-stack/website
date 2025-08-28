---
slug: /references/metalctlv2_project_invite
title: metalctlv2_project_invite
sidebar_position: 1
---

## metalctlv2 project invite

manage project invites

### Options

```
  -h, --help   help for invite
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
* [metalctlv2 project invite delete](./metalctlv2_project_invite_delete.md)	 - deletes a pending invite
* [metalctlv2 project invite generate-join-secret](./metalctlv2_project_invite_generate-join-secret.md)	 - generate an invite secret to share with the new member
* [metalctlv2 project invite join](./metalctlv2_project_invite_join.md)	 - join a project of someone who shared an invite secret with you
* [metalctlv2 project invite list](./metalctlv2_project_invite_list.md)	 - lists the currently pending invites

