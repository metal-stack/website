import Link from '@docusaurus/Link';
import {ArticleTeaserProps} from "@site/src/types/ArticleTeaserProps";

export default function ArticleTeaser(props: ArticleTeaserProps) {
  return (
    <article>
      <Link to={props.slug} className="bg-white/50 group dark:bg-neutral-900 border border-neutral-200 dark:border-white/5 filter backdrop-blur-xl rounded-lg block p-8 h-full">
        <div className=" relative">
          <h3 className="mt-0 text-lg font-semibold leading-6  group-hover:text-amber-500 !line-clamp-2 h-12">
            {props.title}
          </h3>
          <hr className="mt-4 border-neutral-200 dark:border-neutral-800" />
          <p className="mt-5 line-clamp-3 text-sm leading-6">{props.description}</p>
        </div>
        <div className="relative mt-8 flex items-center gap-x-4">
          { props.firstAuthor.url &&
            <img
              src={props.firstAuthor.url}
              alt="Author image"
              className="h-10 w-10 rounded-full bg-neutral-50"
            /> }
          <div className="text-sm leading-tight">
            <p className="font-semibold text-black dark:text-white mb-0">
              <span className="absolute inset-0"></span>
              {props.firstAuthor.name}
            </p>
            <time dateTime={props.date.toString()} className="text-neutral-500">
              {new Date(props.date).toLocaleDateString()}
            </time>
          </div>
        </div>
      </Link>
    </article>
  );
}
