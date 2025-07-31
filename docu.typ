#import "@preview/cmarker:0.1.6"

#set text(
  size: 10pt,
  font: ("inter")
)

= Metal-Stack Documentation

#pagebreak()

#outline(indent: auto, depth: 2)

#pagebreak()

#cmarker.render(read("./docs/docs/01-introduction.md"))
#cmarker.render(read("./docs/docs/02-quickstart.md"))

= Concepts
#cmarker.render(read("./docs/docs/03-Concepts/architecture.md"), h1-level: 2,
  scope: (image: (path, alt: none) => image("docs/docs/03-Concepts/" + path, alt: alt)))
#cmarker.render(read("./docs/docs/03-Concepts/networking.md"), h1-level: 2,
  scope: (image: (path, alt: none) => image("docs/docs/03-Concepts/" + path, alt: alt)))
#cmarker.render(read("./docs/docs/03-Concepts/kubernetes.md"), h1-level: 2)
#cmarker.render(read("./docs/docs/03-Concepts/isolated-kubernetes.md"), h1-level: 2,
  scope: (image: (path, alt: none) => image("docs/docs/03-Concepts/" + path, alt: alt)))


#cmarker.render(read("./docs/docs/03-Concepts/comparison.md"), h1-level: 2)

= For Operators


= For Users

= Release Notes