---
slug: /references/metalctlv2_completion_bash
title: metalctlv2_completion_bash
sidebar_position: 1
---

## metalctlv2 completion bash

Generate the autocompletion script for bash

### Synopsis

Generate the autocompletion script for the bash shell.

This script depends on the 'bash-completion' package.
If it is not installed already, you can install it via your OS's package manager.

To load completions in your current shell session:

	source <(metalctlv2 completion bash)

To load completions for every new session, execute once:

#### Linux:

	metalctlv2 completion bash > /etc/bash_completion.d/metalctlv2

#### macOS:

	metalctlv2 completion bash > $(brew --prefix)/etc/bash_completion.d/metalctlv2

You will need to start a new shell for this setup to take effect.


```
metalctlv2 completion bash
```

### Options

```
  -h, --help              help for bash
      --no-descriptions   disable completion descriptions
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

* [metalctlv2 completion](./metalctlv2_completion.md)	 - Generate the autocompletion script for the specified shell

