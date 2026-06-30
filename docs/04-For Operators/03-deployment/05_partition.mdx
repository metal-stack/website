---
slug: /deployment/partition
title: Deployment - Partition
sidebar_position: 5
---

# Partition Deployment

## Gardener with metal-stack

If you want to deploy metal-stack as a cloud provider for [Gardener](https://gardener.cloud/), you should follow the regular Gardener installation instructions and setup a Gardener cluster first. It's perfectly fine to setup the Gardener cluster in the same cluster that you use for hosting metal-stack.

You can find installation instructions for Gardener on the Gardener website beneath [docs](https://gardener.cloud/docs/). metal-stack is an out-of-tree provider and therefore you will not find example files for metal-stack resources in the Gardener repositories. The following list describes the resources and components that you need to deploy into the Gardener cluster in order to make Gardener work with metal-stack:

:::warning
The following list assumes you have Gardener installed in a Kubernetes cluster and that you have a basic understanding of how Gardener works. If you need further help with the following steps, you can also come and ask in our Slack channel.
:::

1. Deploy the [validator](https://github.com/metal-stack/gardener-extension-provider-metal/tree/v0.9.1/charts/validator-metal) from the [gardener-extension-provider-metal](https://github.com/metal-stack/gardener-extension-provider-metal) repository to your cluster via Helm
1. Add a [cloud profile](https://github.com/gardener/gardener/blob/v1.3.3/example/30-cloudprofile.yaml) called `metal` containing all your machine images, machine types and regions (region names can be chosen freely, the zone names need to match your partition names) together with our metal-stack-specific provider config as defined [here](https://github.com/metal-stack/gardener-extension-provider-metal/blob/v0.9.1/pkg/apis/metal/v1alpha1/types_cloudprofile.go)
1. Register the [gardener-extension-provider-metal](https://github.com/metal-stack/gardener-extension-provider-metal) controller by deploying the [controller-registration](https://github.com/metal-stack/gardener-extension-provider-metal/blob/v0.9.1/example/controller-registration.yaml) into your Gardener cluster, parametrize the embedded chart in the controller registration's values section if necessary ([this](https://github.com/metal-stack/gardener-extension-provider-metal/tree/v0.9.1/charts/provider-metal) is the corresponding values file)
1. metal-stack does not provide an own backup storage infrastructure for now. If you want to enable ETCD backups (which you should do because metal-stack also does not have persistent storage out of the box, which makes these backups even more valuable), you should deploy an extension-provider of another cloud provider and configure it to only reconcile the backup buckets (you can reference this backup infrastructure used for the metal shoot in the shoot spec)
1. Register the [os-extension-provider-metal](https://github.com/metal-stack/os-metal-extension) controller by deploying the [controller-registration](https://github.com/metal-stack/os-metal-extension/blob/v0.4.1/example/controller-registration.yaml) into your Gardener cluster, this controller can transform the operating system configuration from Gardener into Ignition user data
1. You need to use the Gardener's [networking-calico](https://github.com/gardener/gardener-extension-networking-calico) controller for setting up shoot CNI, you will have to put specific provider configuration into the shoot spec to make it work with metal-stack:
   ```yaml
   networking:
     type: calico
     # we can peer with the frr within 10.244.0.0/16, which we do with the metallb
     # the networks for the shoot need to be disjunct with the networks of the seed, otherwise the VPN connection will not work properly
     # the seeds are typically deployed with podCIDR 10.244.128.0/18 and serviceCIDR 10.244.192.0/18
     # the shoots are typically deployed with podCIDR 10.244.0.0/18 and serviceCIDR 10.244.64.0/18
     pods: 10.244.0.0/18
     services: 10.244.64.0/18
     providerConfig:
       apiVersion: calico.networking.extensions.gardener.cloud/v1alpha1
       kind: NetworkConfig
       backend: vxlan
       ipv4:
         pool: vxlan
         mode: Always
         autoDetectionMethod: interface=lo
       typha:
         enabled: false
   ```
1. For your seed cluster you will need to provide the provider secret for metal-stack containing the key `metalAPIHMac`, which is the API HMAC to grant editor access to the metal-api
1. Checkout our current provider configuration for [infrastructure](https://github.com/metal-stack/gardener-extension-provider-metal/blob/master/pkg/apis/metal/v1alpha1/types_infrastructure.go) and [control-plane](https://github.com/metal-stack/gardener-extension-provider-metal/blob/master/pkg/apis/metal/v1alpha1/types_controlplane.go) before deploying your shoot

:::tip
We are officially supported by [Gardener dashboard](https://github.com/gardener/dashboard). The dashboard can also help you setting up some of the resources mentioned above.
:::
