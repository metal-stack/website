---
slug: /references/metalctlv2_ip_list
title: metalctlv2_ip_list
sidebar_position: 1
---

## metalctlv2 ip list

list all ips

```
metalctlv2 ip list [flags]
```

### Options

```
  -h, --help              help for list
  -p, --project string    project from where ips should be listed
      --sort-by strings   sort by (comma separated) column(s), sort direction can be changed by appending :asc or :desc behind the column identifier. possible values: ip|name|network|project|type|uuid
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

