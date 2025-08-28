---
slug: /references/metalctlv2_tenant_member
title: metalctlv2_tenant_member
sidebar_position: 1
---

## metalctlv2 tenant member

manage tenant members

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

* [metalctlv2 tenant](./metalctlv2_tenant.md)	 - manage tenant entities
* [metalctlv2 tenant member list](./metalctlv2_tenant_member_list.md)	 - lists members of a tenant
* [metalctlv2 tenant member remove](./metalctlv2_tenant_member_remove.md)	 - remove member from a tenant
* [metalctlv2 tenant member update](./metalctlv2_tenant_member_update.md)	 - update member from a tenant

