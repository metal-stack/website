import React, { type ReactNode } from 'react';
import clsx from 'clsx';
import { useBlogPost } from '@docusaurus/plugin-content-blog/client';
import BlogAuthor from '@theme/Blog/Components/Author';
import { Props as BlogAuthorProps } from '@theme/Blog/Components/Author';
import type { Props } from '@theme/BlogPostItem/Header/Authors';
import Link, { type Props as LinkProps } from '@docusaurus/Link';
import styles from './styles.module.css';

// Component responsible for the authors layout
export default function BlogPostItemHeaderAuthors({
  className,
}: Props): ReactNode {
  const {
    metadata: { authors },
    assets,
  } = useBlogPost();
  const authorsCount = authors.length;
  if (authorsCount === 0) {
    return null;
  }
  const imageOnly = authors.every(({ name }) => !name);
  const singleAuthor = authors.length === 1;
  return (
    <div
      className={clsx(
        'margin-top--md margin-bottom--sm',
        imageOnly ? styles.imageOnlyAuthorRow : 'row',
        className,
      )}>
      {authors.map((author, idx) => (
        <div
          className={clsx(
            !imageOnly && (singleAuthor ? 'col col--12' : 'col col--6'),
            imageOnly ? styles.imageOnlyAuthorCol : styles.authorCol,
          )}
          key={idx}>
          <div className="">
          </div>
          <CompactAuthor author={{...author, imageURL: assets.authorsImageUrls[idx] ?? author.imageURL}} />
        </div>
      ))}
    </div>
  );
}

function CompactAuthor({ author, className, count }: BlogAuthorProps): ReactNode {
  const { name, title, url, imageURL, email, page } = author;
  const link =
    page?.permalink || url || (email && `mailto:${email}`) || undefined;
  return (
    <div
      className={clsx(
        'avatar margin-bottom--sm',
        className,
      )}>
      {imageURL && (
        <MaybeLink href={link} className="avatar__photo-link">
          <img
            className={clsx('avatar__photo h-10 w-10', styles.authorImage)}
            src={imageURL}
            alt={name}
          />
        </MaybeLink>
      )}

      {(name || title) && (
        <div className={clsx('avatar__intro', styles.authorDetails)}>
          <div className="avatar__name">
            {name && (
              <MaybeLink href={link}>
                <AuthorName name={name} />
              </MaybeLink>
            )}
          </div>
          {!!title && <AuthorTitle title={title} />}
        </div>
      )}
    </div>
  );
}

function MaybeLink(props: LinkProps): ReactNode {
  if (props.href) {
    return <Link {...props} />;
  }
  return <>{props.children}</>;
}

function AuthorTitle({ title }: { title: string }) {
  return (
    <small className={styles.authorTitle} title={title}>
      {title}
    </small>
  );
}

function AuthorName({ name }: { name: string; }) {
  return (
    <span className={styles.authorName} translate="no">
      {name}
    </span>
  );
}
