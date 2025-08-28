---
slug: /references/metalctlv2_token
title: metalctlv2_token
sidebar_position: 1
---

## metalctlv2 token

manage token entities

### Synopsis

manage api tokens for accessing the metal-stack.io api

### Options

```
  -h, --help   help for token
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
* [metalctlv2 token apply](./metalctlv2_token_apply.md)	 - applies one or more tokens from a given file
* [metalctlv2 token create](./metalctlv2_token_create.md)	 - creates the token
* [metalctlv2 token delete](./metalctlv2_token_delete.md)	 - deletes the token
* [metalctlv2 token describe](./metalctlv2_token_describe.md)	 - describes the token
* [metalctlv2 token edit](./metalctlv2_token_edit.md)	 - edit the token through an editor and update
* [metalctlv2 token list](./metalctlv2_token_list.md)	 - list all tokens
* [metalctlv2 token update](./metalctlv2_token_update.md)	 - updates the token

