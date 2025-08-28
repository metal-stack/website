import React, {type ReactNode} from 'react';
import {BlogPostProvider, useBlogPost} from '@docusaurus/plugin-content-blog/client';
import BlogPostItem from '@theme/BlogPostItem';
import type {Props} from '@theme/BlogPostItems';
import type {Props as BlogPostItemProps} from '@theme/BlogPostItem';
import ArticleTeaser from '@site/src/components/ArticleTeaser';
import { ArticleTeaserProps } from '@site/src/types/ArticleTeaserProps';
import Section from '@site/src/components/Section';
import SectionIntro from '@site/src/components/SectionIntro';
import Row from '@site/src/components/Row';
import Container from '@site/src/components/Container';

function BlogPostItemTeaser({children,className}:BlogPostItemProps): ReactNode {
  const {metadata} = useBlogPost();

  const article: ArticleTeaserProps = {
      id: metadata.permalink,
      slug: metadata.permalink,
      title: metadata.title,
      description: metadata.description,
      date: new Date(),
      firstAuthor: {
          name: metadata.authors[0]?.name || "",
          url: metadata.authors[0]?.imageURL || "",
      }
  }
  return (
    <ArticleTeaser {...article} />
  )
}

export default function BlogPostItems({
  items,
  component: BlogPostItemComponent = BlogPostItemTeaser,
}: Props): ReactNode {
  return (
    <Section
      id="blog"
      className="relative dark:bg-neutral-950 bg-transparent sm:!py-0 sm:!pb-20  py-0"
    >
      <SectionIntro title="From our blog"></SectionIntro>
        <Container>
          <div className="mx-auto grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 lg:mx-0 lg:max-w-none lg:grid-cols-3">
          {items.map(({content: BlogPostContent}) => (
            <BlogPostProvider
              key={BlogPostContent.metadata.permalink}
              content={BlogPostContent}>
              <BlogPostItemComponent>
                <BlogPostContent />
              </BlogPostItemComponent>
            </BlogPostProvider>
          ))}
          </div>
        </Container>
    </Section>
  );
}


