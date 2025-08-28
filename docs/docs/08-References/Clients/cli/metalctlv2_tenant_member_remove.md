---
slug: /references/metalctlv2_tenant_member_remove
title: metalctlv2_tenant_member_remove
sidebar_position: 1
---

## metalctlv2 tenant member remove

remove member from a tenant

```
metalctlv2 tenant member remove <member> [flags]
```

### Options

```
  -h, --help            help for remove
      --tenant string   the tenant in which to remove the member
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

* [metalctlv2 tenant member](./metalctlv2_tenant_member.md)	 - manage tenant members

