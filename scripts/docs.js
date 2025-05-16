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
];

const components = {
  storageComponents,
  apiComponents,
};

// const components = [
//   {
//     name: "metalctl",
//     repo: "metal-stack/metalctl",
//     tag: "v0.18.1",
//     position: 2,
//     withDocs: true,
//   },
//   {
//     name: "mini-lab",
//     repo: "metal-stack/mini-lab",
//     tag: "v0.4.4",
//     position: 3,
//     withDocs: false,
//   },
//   storageComponents: storageComponents,
// ];

module.exports = { components };
