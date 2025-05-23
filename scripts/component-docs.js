const storageComponents = [
  {
    name: "csi-lvm",
    repo: "metal-stack/csi-lvm",
    tag: "v0.9.0",
    position: 1,
    withDocs: false,
  },
  {
    name: "csi-driver-lvm",
    repo: "metal-stack/csi-driver-lvm",
    tag: "v0.6.1",
    position: 2,
    withDocs: false,
  },
  {
    name: "duros-controller",
    repo: "metal-stack/duros-controller",
    tag: "v0.11.4",
    position: 3,
    withDocs: false,
  },
];

const networkComponents = [
  {
    name: "metal-core",
    repo: "metal-stack/metal-core",
    tag: "v0.12.5",
    position: 1,
    withDocs: false,
  },
  {
    name: "metal-bmc",
    repo: "metal-stack/metal-bmc",
    tag: "v0.5.8",
    position: 2,
    withDocs: false,
  },
  {
    name: "firewall-controller",
    repo: "metal-stack/firewall-controller",
    tag: "v2.3.8",
    position: 3,
    withDocs: false,
  },
  {
    name: "go-ipam",
    repo: "metal-stack/go-ipam",
    tag: "v1.14.11",
    position: 4,
    withDocs: false,
  },
];

const apiComponents = [
  {
    name: "metalctl",
    repo: "metal-stack/metalctl",
    tag: "v0.18.1",
    position: 1,
    withDocs: true,
  },
  {
    name: "metal-api",
    repo: "metal-stack/metal-api",
    tag: "v0.41.2",
    position: 2,
    withDocs: false,
  },
  {
    name: "masterdata-api",
    repo: "metal-stack/masterdata-api",
    tag: "v0.11.11",
    position: 3,
    withDocs: false,
  },
];

const hwComponents = [
  {
    name: "metal-console",
    repo: "metal-stack/metal-console",
    tag: "v0.7.4",
    position: 1,
    withDocs: false,
  },
  {
    name: "metal-hammer",
    repo: "metal-stack/metal-hammer",
    tag: "v0.13.11",
    position: 1,
    withDocs: false,
  }
];

const sections = [
  {
    name: "API",
    components: apiComponents
  },
  {
    name: "Partition Management",
    components: hwComponents
  },
  {
    name: "Network",
    components: networkComponents
  },
  {
    name: "Storage",
    components: storageComponents
  },
]

module.exports = { sections };
