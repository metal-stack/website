---
slug: /references/metalctlv2_ip_create
title: metalctlv2_ip_create
sidebar_position: 1
---

## metalctlv2 ip create

creates the ip

```
metalctlv2 ip create [flags]
```

### Options

```
      --addressfamily string    addressfamily, can be either IPv4|IPv6, defaults to IPv4 (optional)
      --bulk-output             when used with --file (bulk operation): prints results at the end as a list. default is printing results intermediately during the operation, which causes single entities to be printed in a row.
      --description string      description of the ip
  -f, --file string             filename of the create or update request in yaml format, or - for stdin.
                                
                                Example:
                                $ metalctlv2 ip describe ip-1 -o yaml > ip.yaml
                                $ vi ip.yaml
                                $ # either via stdin
                                $ cat ip.yaml | metalctlv2 ip create -f -
                                $ # or via file
                                $ metalctlv2 ip create -f ip.yaml
                                
                                the file can also contain multiple documents and perform a bulk operation.
                                	
  -h, --help                    help for create
      --name string             name of the ip
  -n, --network string          network from which the ip should get created
  -p, --project string          project of the ip
      --skip-security-prompts   skips security prompt for bulk operations
      --static                  make this ip static
      --tags strings            tags to add to the ip
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

* [metalctlv2 ip](./metalctlv2_ip.md)	 - manage ip entities

