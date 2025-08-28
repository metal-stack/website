---
slug: /references/metalctlv2_completion_fish
title: metalctlv2_completion_fish
sidebar_position: 1
---

## metalctlv2 completion fish

Generate the autocompletion script for fish

### Synopsis

Generate the autocompletion script for the fish shell.

To load completions in your current shell session:

	metalctlv2 completion fish | source

To load completions for every new session, execute once:

	metalctlv2 completion fish > ~/.config/fish/completions/metalctlv2.fish

You will need to start a new shell for this setup to take effect.


```
metalctlv2 completion fish [flags]
```

### Options

```
  -h, --help              help for fish
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

