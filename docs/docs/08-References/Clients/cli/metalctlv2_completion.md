---
slug: /references/metalctlv2_completion
title: metalctlv2_completion
sidebar_position: 1
---

## metalctlv2 completion

Generate the autocompletion script for the specified shell

### Synopsis

Generate the autocompletion script for metalctlv2 for the specified shell.
See each sub-command's help for details on how to use the generated script.


### Options

```
  -h, --help   help for completion
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
* [metalctlv2 completion bash](./metalctlv2_completion_bash.md)	 - Generate the autocompletion script for bash
* [metalctlv2 completion fish](./metalctlv2_completion_fish.md)	 - Generate the autocompletion script for fish
* [metalctlv2 completion powershell](./metalctlv2_completion_powershell.md)	 - Generate the autocompletion script for powershell
* [metalctlv2 completion zsh](./metalctlv2_completion_zsh.md)	 - Generate the autocompletion script for zsh

