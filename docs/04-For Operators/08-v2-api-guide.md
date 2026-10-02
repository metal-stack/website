---
slug: /v2-api-guide
title: Operator guide for the metal-stack V2 API
sidebar_position: 8
---

# The metal-stack V2 API

With [MEP-4](/community/04-Proposals/MEP4/README.md), we defined a new metal-stack V2 API definition based on proto.

This guide is meant for operators to become familiar with the concepts of the new V2 API. This includes design pattern how V2 services are getting deployed and how to initially bootstrap the solution.

With the V2 API, the `metal-apiserver` derives the effective permissions of a request from the presented token and the memberships stored in the database. The following sections explain the resulting permission model, how operators get admin access, and how the components in the infrastructure are bootstrapped with infra tokens. All examples use [metalctlv2](https://github.com/metal-stack/cli), the CLI for the V2 API.

## Basic Permission Principles

The V2 API defines an own permission model that can be used to create fine-grained API tokens that allow only minimal privileges to server methods for consumers. In this section we will go through the basic idea behind the permission model and explain the relevant terms.

The V2 API server implements the login flow through OIDC. We recommend [Zitadel](https://zitadel.com/) as the OIDC provider, which can be federated with a company-wide OIDC, so that operators log in with their company identity. After successful authentication the API server derives the user's permissions and issues its own JWT token for the user.

```bash
$ metalctlv2 login
Starting server at http://127.0.0.1:44351...
✔ login successful! Updated and activated context "demo"
```

The login stores the issued user token in the CLI context, which can be named with the `--context` flag.

Note that the resulting token contains only very minimal information (not the permissions itself). The effective permissions are stored in the backend only.

### User Permission Scopes

For regular users, the V2 API defines the following three scopes: `Tenant`, `Project` and `Self`.

**Tenants** are the top-level scoping entity and represent a user or an organization on the platform (or maybe we can just call it a "namespace" for resources). A *default tenant* is created automatically for every user after the first successful login: the OIDC callback creates a tenant with the user's login as its ID and adds the user as an owner. Because every user owns their default tenant, every user is able to create user-scoped resources such as projects immediately after login, without any operator intervention. A user cannot leave or delete his own default tenant. Tenant-scoped service methods require the `login` field in their request payload.

**Projects** group the resources belonging to a tenant. A tenant can own many projects. Projects are the primary scope for resources such as machines, IPs and child networks, which is why project-scoped service methods require the `project` field in their request payload. Before acting on a project, select it as the default project for the CLI with `metalctlv2 context set-project <project-id>` (this value can be overwritten if the `--project` flag is explicitly provided).

The **Self** scope provides users access to server methods that every valid token owner can access. These methods are for example managing their own tokens, listing global resources such as partitions, images and sizes or other basic methods like listing the permissions currently hold by the token.

### Memberships

Project and tenant memberships are how users gain permissions on project and tenant scopes. They can be established by using **invites**. Invites are used to onboard a user to a tenant or project. A member with sufficient permissions creates an invite that contains a secret and the role the user will hold after accepting it. The invited user accepts the invite to gain the membership. Pending invites can be listed and deleted, and every invite expires after a defined time.

As an alternative to invites, it is also possible to declare memberships statically such that they can be applied through automation. This functionality is provided by the `AddMember` methods for tenants and projects. For this, it is necessary that the users were created already (either through deployment automation or through login).

Each membership associates a user with a role, either on a tenant (`OWNER`, `EDITOR`, `VIEWER`, `GUEST`) or on a project (`OWNER`, `EDITOR`, `VIEWER`).

Tenant memberships inherit permissions on projects. For example, a tenant `EDITOR` is automatically the `EDITOR` for all projects of this tenant. With project invites it is possible to give a user only permissions on a particular project of a tenant. We call this _direct project membership_. A direct project membership creates an implicit `GUEST` membership in the tenant. A tenant `GUEST` has a minimum amount of permissions on a tenant.

```bash
$ metalctlv2 project invite generate-join-secret
You can share this secret with the member to join, it expires in 6 days from now:

<invite-secret>

$ metalctlv2 project invite list
SECRET           PROJECT                                ROLE                 EXPIRES IN
<invite-secret>  11111111-1111-1111-1111-111111111111   PROJECT_ROLE_VIEWER  6 days from now

$ metalctlv2 project invite delete <invite-secret>

# the invited user accepts with
$ metalctlv2 project join <invite-secret>
✔ successfully joined project "example-project"
```

Memberships can also be removed again, however, a default tenant user cannot leave his own tenant namespace and a tenant must always have at least one owner (to prevent orphanage).

### Tokens Types and Validation

Tokens authenticate requests to the API. There are two distinct kinds of tokens: **user** tokens and **API** tokens.

User tokens are created automatically after a successful login. A user token contains no explicit permissions or roles. Instead, the `metal-apiserver` expands its effective permissions on every request from the user's current project and tenant memberships in the database. As a consequence, removing a membership takes effect immediately, even for tokens that were issued earlier.

Scoped API tokens are created by users or services for CI/CD and other technical use cases. An API token references explicit project and tenant roles, optional admin, infra and machine roles, and individual method permissions. For access checks, the roles and individual permissions are flattened into a set of method permissions. The server refuses to create or update a token that would grant more than the calling token and the user's memberships already allow, so a token cannot be used to elevate privileges. API tokens are always validated against the effective user permission, too, such that requests are declined in case the token holds more permissions than the user has at the point of the request.

:::info
Note that roles internally are flattened to method permissions for request validation. In other words, roles are grouping method permissions. The current API defines roles statically directly in the API. It is currently not possible to dynamically create own roles. Dynamically composable roles could be implemented in the future if there is demand for this functionality.
:::

The API server validates the token's signature and expiration against its signing keys, and then looks the token up in the token store by subject and JWT id. If the token is no longer present, it has been revoked or deleted and the request is rejected as unauthenticated. This way a token can be revoked at any time and stops working immediately, regardless of its remaining JWT lifetime.

Rate limiting is applied to every request by an interceptor. Authenticated requests are limited per token and unauthenticated requests per client IP address. If a client exceeds the configured limit, the request is rejected with a `RESOURCE_EXHAUSTED` error. Please make sure in your deployment that the real client IP addresses are passed to the metal-apiserver as otherwise unauthenticated requests cannot be rate-limited properly.

```bash
$ metalctlv2 token create \
    --description "Project scoped" \
    --project-roles 11111111-1111-1111-1111-111111111111=PROJECT_ROLE_EDITOR \
    --expires 8h
Make sure to copy your personal access token now as you will not be able to see this again.

eyJhbGciOiJFUzUxMiIs...<redacted>

uuid: 22222222-2222-2222-2222-222222222222
user: user@example.com@openid-connect
description: Project scoped
expires: "2026-09-28T19:08:15.175078586Z"
issuedAt: "2026-09-28T11:08:15.175078586Z"
tokenType: TOKEN_TYPE_API
projectRoles:
    11111111-1111-1111-1111-111111111111: PROJECT_ROLE_EDITOR

$ metalctlv2 token revoke 22222222-2222-2222-2222-222222222222
uuid: 22222222-2222-2222-2222-222222222222
```

`revoke` is an alias of `token delete`. The token stops working immediately afterwards.

## Admin and Infra API

The V2 API defines additional scopes that are not intended for regular users. These are the `Admin`, `Infra` and `Machine` API.

On startup, the metal-apiserver creates a so-called _provider tenant_. This tenant is special because every member of this tenant is allowed to gain permissions for the admin API. The `metal-apiserver` (respectively its deployment) creates an admin API token for the provider tenant and writes its secret back into a Kubernetes secret in the control-plane namespace. This token has the highest privileges possible and should in general not be used by operators. Its purpose is to provide emergency access and allow deployment bootstrapping. It is rotated automatically every eight hours. Another reason why operators should not use this token is that it will not audit their actual username, which is usually undesirable.

Platform operators can become tenant members of the provider tenant after their first login (creates the user) and then by adding the provider tenant membership `metalctlv2 admin tenant add-member` (e.g. by another provider tenant user or with the provider tenant secret through deployment). The role the user holds in the provider tenant is mapped to an admin role: an `OWNER` maps to the admin `EDITOR` role, and an `EDITOR` or `VIEWER` maps to the admin `VIEWER` role.

```bash
$ metalctlv2 tenant member list --tenant metal-stack
ID                                     ROLE                SINCE
operator-a@example.com@openid-connect  TENANT_ROLE_OWNER   7 months ago
operator-b@example.com@openid-connect  TENANT_ROLE_OWNER   2 months ago
metal-stack                            TENANT_ROLE_OWNER   7 months ago

$ metalctlv2 admin tenant add-member \
    --tenant-id metal-stack \
    --member-id operator-c@example.com@openid-connect \
    --role TENANT_ROLE_OWNER
```

The provider tenant is named `metal-stack` by default and can be configured on initial deployment. Operators can issue an admin token for their own context with the hidden `--admin-role` flag of the login command. The CLI then creates a short-lived admin API token from the login token and stores it in the context.

```bash
$ metalctlv2 login --admin-role ADMIN_ROLE_EDITOR
```

### Infra Components

As metal-stack consists of microservices, these individual services require API tokens. The components of the infrastructure do not use user credentials but their own dedicated tenant tokens, which are bootstrapped with a deployment token.

The deployment (Ansible) might use the provider tenant token from the Kubernetes secret, for example through the `metal-deployment-token` role. Note that the deployment admin token is only used to bootstrap the environment and is capable of creating tokens **for other tenants**. The deployment creates dedicated tenants per service for which it issues individual API tokens. Each of these sub-tokens only has only those roles and permissions that the component actually needs, for example `metal-core`, `pixiecore`, `metal-bmc`, or the `metal-hammer`. The sub-token is written to the target host's filesystem with restrictive permissions and used by the component from there, following the principle of least privilege.

:::info
For deployments inside the partition it might not be desired that the partition runner has access to the control plane Kubernetes cluster. In this case, we recommend issuing a long-lived provider tenant admin token (maximum is 365 days) and provide this in the partition deployment (e.g. through the `defaults_partition_metal_apiserver_admin_token` variable or the `METAL_APIV2_TOKEN` env variable). This way it is not necessary to read the secret from the Kubernetes cluster for deploying partition components. Currently, this token needs to be renewed manually.

As every token is associated with the user who issued the token, the audit log will contain this user name, too. Hence, if you create a dedicated deployment token for a partition, you might consider issuing the token usiung provider tenant secret and not from your own user login. This avoids embedding your own user identity, which would then associate the deployment actions with your user and show up in the audit logs with your user name. This is one of the few use-cases where you would need the provider tenant secret because in general you always want an audit log to show a real user account.
:::

Every service that talks to the API calls the `/metalstack.infra.v2.ComponentService/Ping` method periodically at a configurable interval. Each ping is stored and registers the component with its type, identifier, version, start time and the token it uses. This gives operators a global overview over which services are currently connected to the infrastructure API and which token each of them uses, which is available through the admin component endpoints.

```bash
$ metalctlv2 admin component ls --type COMPONENT_TYPE_METAL_CORE
ID                                    TYPE        IDENTIFIER  STARTED  AGE     VERSION  TOKEN                                 TOKEN EXPIRES IN
55555555-5555-5555-5555-555555555555  metal-core  leaf01      7d 1h    2m 22s  v0.20.0  33333333-3333-3333-3333-333333333333  2d 14h
66666666-6666-6666-6666-666666666666  metal-core  leaf02      7d 1h    2m 40s  v0.20.0  44444444-4444-4444-4444-444444444444  2d 14h
```

Components use the API client with token renewal enabled. On every request the client checks whether the token has passed three quarters of its lifetime, and once that is the case it calls the `/metalstack.api.v2.TokenService/Refresh` endpoint to obtain a new token with exactly the same permissions, roles and lifetime. The check happens lazily on the next request, which for a component is typically its periodic ping, so no separate rotation job is required. The refresh endpoint is what makes this possible, and the same mechanism is used by the [metal-token-refresher](https://github.com/metal-stack/metal-token-refresher) to keep tokens that are stored in Kubernetes secrets up to date.

The API server also rotates its own token signing certificate automatically before it expires, so that rotation never interrupts running services.

## Tasks API

Non-atomic operations in the V2 API are wrapped in tasks. In the V1 implementation this was an opaque design implemented by NSQ. Now, in V2, the backend handles this functionality through [asynq](https://github.com/hibiken/asynq). A task has an idempotent handle function that can get retried in case of runtime execution failure. Examples for a task are:

- Machine decommission (cleans up a machine and its associated resources, configures it back to a state where it can re-register again through the metal-hammer)
- Machine BMC command (not retried, waits for a [metal-bmc](https://github.com/metal-stack/metal-bmc) to pickup the requested BMC task and waits for the execution result)
- ...

Tasks can be observed by operators through the admin API. Usually, a task id is returned in the response payload for operations that enqueue tasks.

```
❯ metalctlv2 admin task list
ID                                    QUEUE    WHEN         TYPE                 STATE
01a08afd-80c2-7629-8f7c-e886c7f18961  default  18d 2h ago   machine:delete       completed
```

Describing a task shows the last error in case it occurred and the amount of retries that were necessary for the task to execute. Operators should inspect tasks in the state `archived` as these tasks were not able to be executed successfully. In these cases, a manual cleanup or investigation of the environment might be necessary.
