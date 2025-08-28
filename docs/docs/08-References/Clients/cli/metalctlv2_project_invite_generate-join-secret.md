---
slug: /references/metalctlv2_project_invite_generate-join-secret
title: metalctlv2_project_invite_generate-join-secret
sidebar_position: 1
---

## metalctlv2 project invite generate-join-secret

generate an invite secret to share with the new member

```
metalctlv2 project invite generate-join-secret [flags]
```

### Options

```
  -h, --help             help for generate-join-secret
  -p, --project string   the project for which to generate the invite
      --role string      the role that the new member will assume when joining through the invite secret (default "PROJECT_ROLE_VIEWER")
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

* [metalctlv2 project invite](./metalctlv2_project_invite.md)	 - manage project invites

