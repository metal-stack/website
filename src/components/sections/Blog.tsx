import { useEffect, useState } from "react";
import useGlobalData from '@docusaurus/useGlobalData';
import Container from "../../components/Container";
import Row from "../../components/Row";
import Section from "../../components/Section";
import SectionIntro from "../../components/SectionIntro";
import ArticleTeaser from "../../components/ArticleTeaser";
import {ArticleTeaserProps} from "@site/src/types/ArticleTeaserProps";


export default function Blog() {
  const globalData = useGlobalData();
  const customBlogPluginData = globalData['docusaurus-plugin-content-blog']['default'];
  const [recentPosts, setRecentPosts] = useState<ArticleTeaserProps[]>(new Array<ArticleTeaserProps>());

  useEffect(() => {
    // @ts-ignore
    const p = customBlogPluginData.latestBlogPosts.map((post): ArticleTeaserProps => ({
      id: post.id,
      slug: post.slug,
      title: post.title,
      date: post.date,
      description: post.description,
      firstAuthor: {
        name: post.firstAuthor.name,
        url: post.firstAuthor.url,
      }
    }));

    setRecentPosts(p)
  }, []);

  return (
    <Section
      id="blog"
      className="relative dark:bg-neutral-950 bg-transparent sm:!py-0 sm:!pb-20  py-0"
    >
      <SectionIntro title="From our blog"></SectionIntro>
      <Row>
        <Container>
          <div className="mx-auto grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 lg:mx-0 lg:max-w-none lg:grid-cols-3 items-start">
            {recentPosts.map((post) => (
              <ArticleTeaser {...post} key={post.id}/>
            ))}
          </div>
        </Container>
      </Row>
    </Section>
  );
}
