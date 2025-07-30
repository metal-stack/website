interface Props {
  url: string;
  title: string;
  summary: string;
  author: any;
  date_modified: string;
}

const image_url = {
  "Gerrit Schwerthelm": "https://github.com/gerrit91.png",
  valentin: "https://github.com/vknabel.png",
  stefan: "https://github.com/majst01.png",
  markus: "https://github.com/mwindower.png",
  grigoriy: "https://github.com/GrigoriyMikhalkin.png",
};

export default function ArticleTeaser(props: Props) {
  return (
    <article>
      <a
        className="bg-white/50 group dark:bg-neutral-900 border border-neutral-200 dark:border-white/5 filter backdrop-blur-xl rounded-lg block p-8 h-full"
        href={props.url}
      >
        <div className=" relative">
          <h3 className="mt-0 text-lg font-semibold leading-6  group-hover:text-amber-500 !line-clamp-2 h-12">
            {props.title}
          </h3>
          <hr className="mt-4 border-neutral-200 dark:border-neutral-800" />
          {/* <p className="mt-5 line-clamp-3 text-sm leading-6 text-neutral-600"> */}
          <p className="mt-5 line-clamp-3 text-sm leading-6">{props.summary}</p>
        </div>
        <div className="relative mt-8 flex items-center gap-x-4">
          <img
            src={image_url[props.author.name]}
            alt=""
            className="h-10 w-10 rounded-full bg-neutral-50"
          />
          <div className="text-sm leading-tight">
            <p className="font-semibold text-black dark:text-white">
              <span className="absolute inset-0"></span>
              {props.author.name}
            </p>
            <time dateTime={props.date_modified} className="text-neutral-500">
              {new Date(props.date_modified).toLocaleDateString()}
            </time>
          </div>
        </div>
      </a>
    </article>
  );
}
