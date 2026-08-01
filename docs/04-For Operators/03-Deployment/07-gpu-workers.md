---
slug: /deployment/gpu-workers
title: GPU Workers
sidebar_position: 7
---

# GPU Workers

For workloads that require the assistance of GPUs, support for GPUs in bare metal servers was added in metal-stack v0.18.0.

## Prerequisites

Offering GPU worker nodes is a cooperation between the operator and the cluster owner. As an **operator**, you have to make GPU machines and the matching operating system available:

1. **Register machines with GPUs** — The machine sizes must be known to the metal-api and be reported with their GPUs. Check with `metalctl size ls` and `metalctl machine ls`.
2. **Provide an `nvidia` image** — Add one of the `debian-nvidia` images from [metal-images](../../08-References/Deployment/metal-images/metal-images.md) to `metal_api_images` as described in [Providing Images](./03_control-plane.mdx#providing-images).
3. **Offer it through your KCLM** — With Gardener, keep `nvidia` in `gardener_extension_os_metal_types` (it is part of the default) _and_ add an `nvidia` entry to `gardener_cloud_profile_os_cri_mapping`. The mapping only covers `ubuntu` and `debian` by default, so without that entry the image is silently dropped from the `CloudProfile` and the size cannot be selected. See [extensions.yaml](./05_gardener.md#extensionsyaml--provider-and-shoot-extensions) and [cloud_profile.yaml](./05_gardener.md#cloud_profileyaml--defining-your-metal-stack-infrastructure).

Everything below is then done by the **cluster owner** inside their own cluster.

## GPU Operator installation

With the `nvidia` image a worker has basic GPU support. This means that the required kernel driver, the containerd shim and the required containerd configuration are already installed and configured.

To enable `Pods` that require GPU support to be scheduled on a worker node with a GPU, a `gpu-operator` must be installed.
This has to be done by the cluster owner after the cluster is up and running.

The simplest way to install this operator is as follows:

```bash
helm repo add nvidia https://helm.ngc.nvidia.com/nvidia
helm repo update

kubectl create ns gpu-operator
kubectl label --overwrite ns gpu-operator pod-security.kubernetes.io/enforce=privileged

helm install --wait \
  --generate-name \
  --namespace gpu-operator \
  --create-namespace \
    nvidia/gpu-operator \
    --set driver.enabled=false \
    --set toolkit.enabled=true
```

Note `driver.enabled=false`: the NVIDIA kernel driver already ships with the `nvidia` machine image, so the operator must not attempt to install its own.

After that, `kubectl describe node` must show the GPU in the node capacity like so:

```plain
...
Capacity:
  cpu:                64
  ephemeral-storage:  100205640Ki
  hugepages-1Gi:      0
  hugepages-2Mi:      0
  memory:             263802860Ki
  nvidia.com/gpu:     1
  pods:               510
...
```

With this basic installation, the worker node is ready to process GPU workloads.

:::warning
There is a caveat: with this basic configuration only **one** `Pod` can access the GPU. If that is all you need, no additional configuration is required.
If you plan to deploy multiple applications that require GPU support and there are not that many GPUs available, you have to configure the `gpu-operator` so that a GPU can be shared between multiple `Pods`.
:::

There are several approaches to sharing GPUs — time-slicing, MPS and MIG. Please consult the official NVIDIA documentation for further reference:

- [Improving GPU utilization in Kubernetes](https://developer.nvidia.com/blog/improving-gpu-utilization-in-kubernetes)
- [GPU Operator with MIG](https://docs.nvidia.com/datacenter/cloud-native/gpu-operator/latest/gpu-operator-mig.html)
- [GPU sharing](https://docs.nvidia.com/datacenter/cloud-native/gpu-operator/latest/gpu-sharing.html)

:::info
GPU machines are only offered in the partitions where the corresponding hardware is racked. Model this through your `CloudProfile` regions and zones (zones map to metal-stack partitions), so that end-users can only request GPU worker groups where GPUs actually exist. See [cloud_profile.yaml](./05_gardener.md#cloud_profileyaml--defining-your-metal-stack-infrastructure).
:::

With this, happy AI processing.
