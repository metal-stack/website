---
slug: /references/metalctlv2_tenant
title: metalctlv2_tenant
sidebar_position: 1
---

## metalctlv2 tenant

manage tenant entities

### Synopsis

manage api tenants

### Options

```
  -h, --help   help for tenant
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
* [metalctlv2 tenant apply](./metalctlv2_tenant_apply.md)	 - applies one or more tenants from a given file
* [metalctlv2 tenant create](./metalctlv2_tenant_create.md)	 - creates the tenant
* [metalctlv2 tenant delete](./metalctlv2_tenant_delete.md)	 - deletes the tenant
* [metalctlv2 tenant describe](./metalctlv2_tenant_describe.md)	 - describes the tenant
* [metalctlv2 tenant edit](./metalctlv2_tenant_edit.md)	 - edit the tenant through an editor and update
* [metalctlv2 tenant invite](./metalctlv2_tenant_invite.md)	 - manage tenant invites
* [metalctlv2 tenant join](./metalctlv2_tenant_join.md)	 - join a tenant of someone who shared an invite secret with you
* [metalctlv2 tenant list](./metalctlv2_tenant_list.md)	 - list all tenants
* [metalctlv2 tenant member](./metalctlv2_tenant_member.md)	 - manage tenant members
* [metalctlv2 tenant update](./metalctlv2_tenant_update.md)	 - updates the tenant

