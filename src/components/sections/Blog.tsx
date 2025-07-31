import { useEffect, useState } from "react";
import Container from "../../components/Container";
import Row from "../../components/Row";
import Section from "../../components/Section";
import SectionIntro from "../../components/SectionIntro";
import ArticleTeaser from "../../components/ArticleTeaser";

export default function Blog() {
  const [feed, setFeed] = useState<Record<string, any>[] | null>([]);

  useEffect(function fetchFeed() {
    fetch(`http://localhost:3000/blog/feed.json`)
      .then((resp) => resp.json())
      .catch((err) => console.log(err))
      .then((object) => {
        console.log(object.items);

        setFeed(object.items);
      })
      .catch((err) => console.log(err));
  }, []);

  const testObjects = [
    {
      id: "https://your-docusaurus-site.example.com/blog/2025/03-metal-stack-v0.21.0/article",
      url: "https://your-docusaurus-site.example.com/blog/2025/03-metal-stack-v0.21.0/article",
      title: "metal-stack v0.21.0 🙄",
      summary:
        "Sorry, but there are no new features in this release! Just a breaking change that operators need to be aware of.",
      date_modified: "2025-03-21T09:00:00.000Z",
      author: {
        name: "Gerrit Schwerthelm",
        url: "https://github.com/Gerrit91",
      },
      tags: [],
    },
    {
      id: "https://your-docusaurus-site.example.com/blog/2025/02-metal-stack-v0.20.0/article",
      url: "https://your-docusaurus-site.example.com/blog/2025/02-metal-stack-v0.20.0/article",
      title: "metal-stack v0.20.0 💯",
      summary:
        "Finally IPv6 made it into the metal-api. This and more interesting features of the latest release can be read in this blog article.",
      date_modified: "2025-02-26T09:00:00.000Z",
      author: {
        name: "Gerrit Schwerthelm",
        url: "https://github.com/Gerrit91",
      },
      tags: [],
    },
    {
      id: "https://your-docusaurus-site.example.com/blog/2025/01-fosdem/article",
      url: "https://your-docusaurus-site.example.com/blog/2025/01-fosdem/article",
      title: "FOSDEM 2025 ️❤️",
      summary:
        "For the first time metal-stack was part of the biggest Open Source conference in Europe.",
      date_modified: "2025-02-03T08:00:00.000Z",
      author: {
        name: "Gerrit Schwerthelm",
        url: "https://github.com/Gerrit91",
      },
      tags: [],
    },
  ];

  return (
    <Section
      id="blog"
      className="relative dark:bg-neutral-950 bg-transparent sm:!py-0 sm:!pb-20  py-0"
    >
      <SectionIntro title="From our blog"></SectionIntro>
      <Row>
        <Container>
          <div className="mx-auto grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 lg:mx-0 lg:max-w-none lg:grid-cols-3 items-start">
            {testObjects.map((post) => (
              <ArticleTeaser {...post} key={post.id}/>
            ))}
          </div>
        </Container>
      </Row>
    </Section>
  );
}
