---
slug: /MEP-17-declarative-switch-api
title: MEP-17
sidebar_position: 17
---

# Declarative Switch API for Every Switch in a Partition

:::important
This MEP assumes the implementation of the metal-apiserver as described by [MEP-4](../MEP4/README.md).
MEP-4 is already in a state where this MEP could be started in parallel.
:::

Currently, the metal-stack API doesn't know of any other switches than the leaf switches, which are essential for machine provisioning in metal-stack as they dynamically reconfigure the port configuration when a machine gets provisioned.
Switches register by calling `/metalstack.infra.v2.SwitchService/Register` when the [metal-core](https://github.com/metal-stack/metal-core) component starts up on the switch.
Their registration payload contains an ID (which is usually the hostname of the switch), a rack and a room identifier, which are provided through an Ansible deployment using [metal-roles](https://github.com/metal-stack/metal-roles/tree/master/partition/roles/metal-core).
Along with this static startup configuration of the metal-core, the metal-core also reports dynamically discovered information like the LLDP neighbors, the actual port status and BGP session state information.

After the switch registration, machines can register through `/metalstack.infra.v2.BootService/Register` as well.
Similarly, this request contains the LLDP neighbors from which the metal-apiserver can figure out the switches connected to the machine.
In addition to that, a `MachineConnection` is saved in the metal-db, which contains information about which switches the machine is connected to.

During runtime, the metal-core polls the switch resource at the API and writes the necessary port configuration and FRR configuration according to the allocation of the machine or some static port configuration coming from the Ansible deployment.
This happens in a defined interval (usually ~15s).

With the current state we see the following room for improvements:

- `Switch` resources should be applied declaratively at the API through deployment by the Admin API.
So, instead of the metal-core creating a switch entity at the API, it queries the already existing API entity.
The query should be in form of a stream connection to the API for a given switch ID, which is provided as a startup configuration.
metal-core then tries to reconcile the desired state.
The reconciliation status is reported back into a dedicated status table.
This approach has the following advantages:
  - A switch can be notified immediately when a configuration change takes place.
  - This approach eliminates manual operation on all the switches from operators and simplifies the Ansible deployment on the switch side.
  - We can implement API validations preventing misconfiguration.
  - The replacement / migration logic can be largely simplified (e.g. for migration, instead of registering a new switch, metal-core can just reconcile the existing switch entity).
  - We might even be able to get rid off the brittle `MachineConnection` struct and just calculate it dynamically from the current machine states.
- It would make a lot of sense if not only the leaf switches would be "reconciled" by the metal-core but also the other kinds of switches in the switch plane (e.g. spines, exits, mgmtleaf)
  - Adding all switch types to the API enhances the visibility of the switch states and allows to draw a switch plane topology.
This is great for troubleshooting connectivity issues but also for documentation purposes.
  - We could make IP announcements visible in the API such that it would be possible to detect allocated, but unused IPs.
- As we see the need for more versatile port configurations (which can already be seen in [metal-core PR #212](https://github.com/metal-stack/metal-core/pull/212)), we would like to extend the `Switch` entity to contain static port configurations.
  - Specifically, we would like admins to be able to set the desired port status (up / down) and how metal-core manages the port (statically from deployment or dynamically from machine allocations).

## API

The following changes in the API would be necessary:

- Admin API Switch CRUD
    - `SwitchServiceCreateRequest`: Allows the admin to declaratively specify a switch entity
        - Contains: switch type, ID, rack specifier, port configuration (desired state, up down, network VRF membership, ...)
    - `SwitchServiceGetRequest`, `SwitchServiceListRequest`, `SwitchServiceUpdateRequest`, `SwitchServiceDeleteRequest`: Completes the CRUD
    - Carry over existing switch connected machines
- Infra API
    - `SwitchReconcile`: metal-core method to open a stream connection to listen for configuration updates.
        - Returns entity on stream open, then pushes further reconfiguration messages on changes.
        - Utilizes the same `ReconnectingStreamRead` logic that metal-bmc and metal-hammer already use.

## Switch Types

To allow deploying the metal-core on other switches than leaves we need a way of telling it what type of switch it is running on so it can act accordingly.
Supported switch types are:

- `leaf`
- `spine`
- `exit`
- `mgmtleaf`
- `mgmtspine`

## Network Topology

All switches should periodically report their LLDP neighbors and port configuration.
This information can be used to quickly identify common network issues, like MTU mismatch or the like.
Ideally, there would be some graphical representation of the network topology containing only the most important information for a quick overview.
It should contain all switches and machines as nodes and all connections as edges of a graph.
Ports, VRFs, and maybe also IPs should be associated with a connection.

Apart from the topology graph, there should be a way to display more detailed information about both ports of a connection, like

- MTU
- speed
- IP
- UP/DOWN status
- VRF
- VLAN
- whether it participates in a BGP session

## BGP Announcements

The metal-core should collect all routes it knows about and send them to the API along with a timestamp.
Reported routes should be stored to a redis database along with the switch that reported them and the timestamp of the last time they were reported.
An expiration threshold should be defined and all expired routes should be cleaned up periodically.
Whenever new routes are reported they get merged into the existing ones by the strategy:

- when new, just add
- when existing, update `last_announced` timestamp

By querying the BGP announcements we can find out whether an allocated IP is still in use.

## TODO

- Figure out how replacement / migration would exactly work with this model (e.g. what happens when two metal-cores report state for the same switch entity?)
- Figure out what has to go into the port configuration in order to achieve FRR configuration scenarios we have on spines and exit switches
- Check what special scenarios we have for static port configuration (support tenant VRF statically on a specific port, maybe black hole configuration instead of default PXE VRF?)
- Check if we can really drop machine connections: Do we really want to always evaluate the neighbors all the time?
- Elaborate how the port reconfiguration on machine allocation can be orchestrated: The metal-hammer currently sends the `InstallationSucceeded` message to the server, but when the switch gets notified immediately through stream, it breaks the network connection prematurely such that the metal-hammer does not retrieve the response in time causing a crash.
