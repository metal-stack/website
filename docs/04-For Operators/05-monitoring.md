---
slug: /monitoring
title: Monitoring
sidebar_position: 5
---

# Monitoring the metal-stack

## Overview

![Monitoring Stack](monitoring-stack.drawio.svg)

The diagram above shows the full monitoring and logging stack: partition hosts ship logs to Loki and expose metrics for Prometheus scraping; control-plane and Gardener seed Alloy instances push both logs and self-metrics centrally; Grafana provides unified dashboards and alerting across all tiers.

## Logging

[Grafana Alloy](https://grafana.com/docs/alloy/latest/) collects and pushes logs to a [Loki](https://grafana.com/docs/loki/latest/) instance
running in the control plane.

Loki is deployed in [monolithic mode](https://grafana.com/docs/loki/latest/setup/install/helm/install-monolithic/) and with storage type `'filesystem'`.
You can find all logging related configuration parameters for the control plane in the [logging](https://github.com/metal-stack/metal-roles/blob/master/control-plane/roles/logging/README.md) role.

In the partitions, Alloy can be deployed inside a systemd-managed Docker container on management servers and switches.
Configuration parameters can be found in the partition's [alloy](https://github.com/metal-stack/metal-roles/blob/master/partition/roles/alloy/README.md) role.

### Control-Plane Log Sources

In the control plane, Alloy runs as a Kubernetes `DaemonSet` and collects logs from two sources:

| Source            | Description                                                                                                                           | Key labels                                                                                                |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| Pod logs          | Read from the node filesystem (`/var/log/pods`, `loki.source.file`). Each DaemonSet pod collects only pods scheduled on its own node. | `cluster`, `namespace`, `pod`, `container`, `pod_uid`, `node_name`, `app`, `instance`, `component`, `job` |
| Kubernetes events | Collected natively via `loki.source.kubernetes_events` with clustering-based leader election — no separate event-exporter required    | `cluster`, `job=events`, `namespace`                                                                      |

All control-plane log entries carry a `cluster` label (configured via `logging_alloy_cluster_label`) identifying the control-plane stage.

#### Gardener

Gardener ships with a built-in logging stack (Vali + fluent-bit per seed), that can be used as-is or replaced/complemented by the metal-stack's Alloy + Loki solution.
The metal-stack roles provide an own centralized logging stack based on Alloy and Loki — giving platform operators a single place to query infrastructure logs across all Gardener clusters.

The [gardener-logging](https://github.com/metal-stack/blob/master/control-plane/roles/gardener-logging/README.md) role deploys an Alloy instance into each Gardener shooted seed and optionally into the garden cluster itself. These instances read pod logs from the node filesystem and collect Kubernetes events, forwarding everything to the same Loki instance in the metal-stack control plane. Logs carry a `cluster` label set to the cluster name (garden name or shooted seed name), enabling per-cluster filtering in Grafana.

### Control-Plane: Querying Logs in Grafana

- `{cluster="<stage-name>"}` — all logs from a control-plane stage
- `{namespace="<namespace>"}` — all logs from a specific namespace
- `{job="<namespace>/<app>"}` — logs from a specific application
- `{job="events"}` — Kubernetes events _(recently renamed from `monitoring/event-exporter`)_
- `{cluster="<garden-or-seed-name>"}` — all logs from the Gardener garden cluster or a specific shooted seed

### Partition Log Sources

Alloy is configured through snippets that define what logs are collected. The following built-in snippets are available:

| Host type              | Snippet        | Description                                                                                                                           | Key labels                             |
| ---------------------- | -------------- | ------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------- |
| Leaves, spines, exits  | `journal`      | Collects logs from the systemd journal; auto-discovers both volatile (`/run/log/journal`) and persistent (`/var/log/journal`) storage | `job=systemd-journal`, `unit`, `level` |
| Management servers     | `journal-file` | Collects logs from the persistent systemd journal at a configurable path; supports migrating cursor position from promtail            | `job=systemd-journal`, `unit`, `level` |
| Hosts without journald | `syslog`       | Tails `/var/log/syslog`                                                                                                               | `job=syslog`                           |
| Hosts running Docker   | `docker`       | Collects logs from all Docker containers via the Docker socket                                                                        | `job=docker`, `container`              |

Custom log sources can be added without modifying the role by providing your own Jinja2 snippet templates and referencing them via `alloy_config_custom_snippets` in your inventory. See the [alloy role](https://github.com/metal-stack/metal-roles/blob/master/partition/roles/alloy/README.md#customizing-the-config) for details.

### Partition: Querying Logs in Grafana

All log entries carry the `host` and `partition` labels regardless of snippet, which makes it easy to filter logs in Grafana Explore by host or partition.

- `{partition="<partition-id>"}` — all logs from a partition
- `{host="<hostname>"}` — all logs from a specific host
- `{job="docker", container="<name>"}` — logs from a specific Docker container
- `{job="systemd-journal", unit="<unit>.service"}` — logs from a specific systemd unit
- `{job="systemd-journal", level="error"}` — error-level journal entries across all units

:::note Migrating from Promtail

The `promtail` role is deprecated and replaced by the `alloy` role. Refer to the respective migration guides for step-by-step instructions:

- [Partition](https://github.com/metal-stack/metal-roles/blob/master/partition/roles/alloy/README.md#migration-from-promtail) — partition alloy role
- [Control-plane and Gardener](https://github.com/metal-stack/metal-roles/blob/master/control-plane/roles/logging-common/README.md#migration-from-promtail) — logging-common migration guide (applies to both the logging and gardener-logging roles)

:::

## Monitoring

For monitoring we deploy the
[kube-prometheus-stack](https://github.com/prometheus-operator/kube-prometheus)
and a [Thanos](https://thanos.io/tip/thanos/getting-started.md/) instance in the
control plane.

### Control-Plane Metrics

In-cluster components are scraped by Prometheus via `ServiceMonitor` resources (pull model).

Additional metrics are supplied by

- `metal-metrics-exporter`
- `rethinkdb-exporter`
- `gardener-metrics-exporter`
- `alloy` (control-plane) — self-metrics, disabled by default; see [logging-common](https://github.com/metal-stack/metal-roles/blob/master/control-plane/roles/logging-common/README.md#meta-monitoring) for configuration
- `alloy` (gardens and seeds) — self-metrics, disabled by default, push-only (no ServiceMonitor); see [logging-common](https://github.com/metal-stack/metal-roles/blob/master/control-plane/roles/logging-common/README.md#meta-monitoring) for configuration

The following `ServiceMonitors` are deployed:

- `gardener-metrics-exporter`
- `ipam-db`
- `masterdata-api`
- `masterdata-db`
- `metal-api`
- `metal-db`
- `rethinkdb-exporter`
- `metal-metrics-exporter`

All monitoring related configuration parameters for the control plane can be
found in the control plane's
[monitoring](https://github.com/metal-stack/metal-roles/blob/master/control-plane/roles/monitoring/README.md)
role.

### Partition Metrics

Partition metrics are collected via Prometheus scraping (pull model). Exporters running on partition hosts supply the metrics:

- `node-exporter`
- `blackbox-exporter`
- `ipmi-exporter`
- `sonic-exporter`
- `metal-core`
- `alloy`

Target hosts for each exporter are defined by

- `prometheus_node_exporter_targets`
- `prometheus_blackbox_exporter_targets`
- `prometheus_ipmi_exporter_targets`
- `prometheus_sonic_exporter_targets`
- `prometheus_metal_core_targets`
- `prometheus_frr_exporter_targets`
- `prometheus_alloy_targets`

### Dashboards

To query and visualize logs, metrics and alerts we deploy several grafana
dashboards to the control plane:

- `grafana-dashboard-alertmanager`
- `grafana-dashboard-machine-capacity`
- `grafana-dashboard-metal-api`
- `grafana-dashboard-rethinkdb`
- `grafana-dashboard-sonic-exporter`

and also some Gardener related dashboards:

- `grafana-dashboard-gardener-overview`
- `grafana-dashboard-shoot-cluster`
- `grafana-dashboard-shoot-customizations`
- `grafana-dashboard-shoot-details`
- `grafana-dashboard-shoot-states`

## Alerting

In addition to Grafana, alerts can optionally be sent to a
[Slack](https://slack.com/) channel. For this to work, at least a valid
`monitoring_slack_api_url` and a `monitoring_slack_notification_channel` must be
specified. For further configuration parameters refer to the
[monitoring](https://github.com/metal-stack/metal-roles/tree/master/control-plane/roles/monitoring)
role. Alerting rules are defined in the
[rules](https://github.com/metal-stack/metal-roles/tree/master/partition/roles/monitoring/prometheus/files/rules)
directory of the partition's prometheus role.
