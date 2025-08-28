---
slug: /references/metalctlv2_tenant_create
title: metalctlv2_tenant_create
sidebar_position: 1
---

## metalctlv2 tenant create

creates the tenant

```
metalctlv2 tenant create [flags]
```

### Options

```
      --avatar-url string       the avatar url of the tenant to create
      --bulk-output             when used with --file (bulk operation): prints results at the end as a list. default is printing results intermediately during the operation, which causes single entities to be printed in a row.
      --description string      the description of the tenant to create
      --email string            the email of the tenant to create
  -f, --file string             filename of the create or update request in yaml format, or - for stdin.
                                
                                Example:
                                $ metalctlv2 tenant describe tenant-1 -o yaml > tenant.yaml
                                $ vi tenant.yaml
                                $ # either via stdin
                                $ cat tenant.yaml | metalctlv2 tenant create -f -
                                $ # or via file
                                $ metalctlv2 tenant create -f tenant.yaml
                                
                                the file can also contain multiple documents and perform a bulk operation.
                                	
  -h, --help                    help for create
      --name string             the name of the tenant to create
      --phone string            the phone number of the tenant to create
      --skip-security-prompts   skips security prompt for bulk operations
      --timestamps              when used with --file (bulk operation): prints timestamps in-between the operations
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

