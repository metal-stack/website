---
slug: /references/metalctlv2_login
title: metalctlv2_login
sidebar_position: 1
---

## metalctlv2 login

login

```
metalctlv2 login [flags]
```

### Options

```
      --context-name string   the context into which the token gets injected, if not specified it uses the current context or creates a context named default in case there is no current context set
  -h, --help                  help for login
      --provider string       the provider used to login with (default "oidc")
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

