---
slug: /references/metalctlv2_context
title: metalctlv2_context
sidebar_position: 1
---

## metalctlv2 context

manage cli contexts

### Synopsis

you can switch back and forth contexts with "-"

```
metalctlv2 context [flags]
```

### Examples

```
Here is how an template configuration looks like:
~/.metal-stack/config.yaml
---
current: dev
previous: prod
contexts:
    - name: dev
    api-token: <dev-token>
    default-project: dev-project
    - name: prod
    api-token: <prod-token>
        default-project: prod-project

```

### Options

```
  -h, --help   help for context
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
* [metalctlv2 context add](./metalctlv2_context_add.md)	 - add a cli context
* [metalctlv2 context list](./metalctlv2_context_list.md)	 - list the configured cli contexts
* [metalctlv2 context remove](./metalctlv2_context_remove.md)	 - remove a cli context
* [metalctlv2 context set-project](./metalctlv2_context_set-project.md)	 - sets the default project to act on for cli commands
* [metalctlv2 context show-current](./metalctlv2_context_show-current.md)	 - prints the current context name
* [metalctlv2 context switch](./metalctlv2_context_switch.md)	 - switch the cli context
* [metalctlv2 context update](./metalctlv2_context_update.md)	 - update a cli context

