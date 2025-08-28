---
slug: /references/metalctlv2_project_create
title: metalctlv2_project_create
sidebar_position: 1
---

## metalctlv2 project create

creates the project

```
metalctlv2 project create [flags]
```

### Options

```
      --bulk-output             when used with --file (bulk operation): prints results at the end as a list. default is printing results intermediately during the operation, which causes single entities to be printed in a row.
      --description string      the description of the project to create
  -f, --file string             filename of the create or update request in yaml format, or - for stdin.
                                
                                Example:
                                $ metalctlv2 project describe project-1 -o yaml > project.yaml
                                $ vi project.yaml
                                $ # either via stdin
                                $ cat project.yaml | metalctlv2 project create -f -
                                $ # or via file
                                $ metalctlv2 project create -f project.yaml
                                
                                the file can also contain multiple documents and perform a bulk operation.
                                	
  -h, --help                    help for create
      --name string             the name of the project to create
      --skip-security-prompts   skips security prompt for bulk operations
      --tenant string           the tenant of this project, defaults to tenant of the default project
      --timestamps              when used with --file (bulk operation): prints timestamps in-between the operations
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

* [metalctlv2 project](./metalctlv2_project.md)	 - manage project entities

