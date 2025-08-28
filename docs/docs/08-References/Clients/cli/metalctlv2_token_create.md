---
slug: /references/metalctlv2_token_create
title: metalctlv2_token_create
sidebar_position: 1
---

## metalctlv2 token create

creates the token

```
metalctlv2 token create [flags]
```

### Options

```
      --admin-role string       the admin role to associate with the api token
      --bulk-output             when used with --file (bulk operation): prints results at the end as a list. default is printing results intermediately during the operation, which causes single entities to be printed in a row.
      --description string      a short description for the intention to use this token for
      --expires duration        the duration how long the api token is valid (default 8h0m0s)
  -f, --file string             filename of the create or update request in yaml format, or - for stdin.
                                
                                Example:
                                $ metalctlv2 token describe token-1 -o yaml > token.yaml
                                $ vi token.yaml
                                $ # either via stdin
                                $ cat token.yaml | metalctlv2 token create -f -
                                $ # or via file
                                $ metalctlv2 token create -f token.yaml
                                
                                the file can also contain multiple documents and perform a bulk operation.
                                	
  -h, --help                    help for create
      --permissions strings     the permissions to associate with the api token in the form <project>=<methods-colon-separated>
      --project-roles strings   the project roles to associate with the api token in the form <subject>=<role>
      --skip-security-prompts   skips security prompt for bulk operations
      --tenant-roles strings    the tenant roles to associate with the api token in the form <subject>=<role>
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

* [metalctlv2 token](./metalctlv2_token.md)	 - manage token entities

