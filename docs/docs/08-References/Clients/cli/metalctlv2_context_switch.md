---
slug: /references/metalctlv2_context_switch
title: metalctlv2_context_switch
sidebar_position: 1
---

## metalctlv2 context switch

switch the cli context

### Synopsis

you can switch back and forth contexts with "-"

```
metalctlv2 context switch <context-name> [flags]
```

### Options

```
  -h, --help   help for switch
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

* [metalctlv2 context](./metalctlv2_context.md)	 - manage cli contexts

