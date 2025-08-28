---
slug: /references/metalctlv2_completion_zsh
title: metalctlv2_completion_zsh
sidebar_position: 1
---

## metalctlv2 completion zsh

Generate the autocompletion script for zsh

### Synopsis

Generate the autocompletion script for the zsh shell.

If shell completion is not already enabled in your environment you will need
to enable it.  You can execute the following once:

	echo "autoload -U compinit; compinit" >> ~/.zshrc

To load completions in your current shell session:

	source <(metalctlv2 completion zsh)

To load completions for every new session, execute once:

#### Linux:

	metalctlv2 completion zsh > "${fpath[1]}/_metalctlv2"

#### macOS:

	metalctlv2 completion zsh > $(brew --prefix)/share/zsh/site-functions/_metalctlv2

You will need to start a new shell for this setup to take effect.


```
metalctlv2 completion zsh [flags]
```

### Options

```
  -h, --help              help for zsh
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

