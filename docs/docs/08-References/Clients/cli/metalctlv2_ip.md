---
slug: /references/metalctlv2_ip
title: metalctlv2_ip
sidebar_position: 1
---

## metalctlv2 ip

manage ip entities

### Synopsis

an ip address of metal-stack.io

### Options

```
  -h, --help   help for ip
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
* [metalctlv2 ip apply](./metalctlv2_ip_apply.md)	 - applies one or more ips from a given file
* [metalctlv2 ip create](./metalctlv2_ip_create.md)	 - creates the ip
* [metalctlv2 ip delete](./metalctlv2_ip_delete.md)	 - deletes the ip
* [metalctlv2 ip describe](./metalctlv2_ip_describe.md)	 - describes the ip
* [metalctlv2 ip edit](./metalctlv2_ip_edit.md)	 - edit the ip through an editor and update
* [metalctlv2 ip list](./metalctlv2_ip_list.md)	 - list all ips
* [metalctlv2 ip update](./metalctlv2_ip_update.md)	 - updates the ip

