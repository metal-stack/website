import { useEffect, useState, type ReactNode } from "react";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import Layout from "@theme/Layout";

const image_url = {
  "Gerrit Schwerthelm": "https://github.com/gerrit91.png",
  valentin: "https://github.com/vknabel.png",
  stefan: "https://github.com/majst01.png",
  markus: "https://github.com/mwindower.png",
  grigoriy: "https://github.com/GrigoriyMikhalkin.png",
};

function CustomHeader() {
  return (
    <header className="overflow-clip relative">
      <svg
        className="absolute inset-0 -z-10 h-full w-full stroke-black/10 dark:stroke-white/10 [mask-image:radial-gradient(100%_100%_at_top_right,white,transparent)]"
        aria-hidden="true"
      >
        <defs>
          <pattern
            id="983e3e4c-de6d-4c3f-8d64-b9761d1534cc"
            width="200"
            height="200"
            x="50%"
            y="-1"
            patternUnits="userSpaceOnUse"
          >
            <path d="M.5 200V.5H200" fill="none" />
          </pattern>
        </defs>
        <svg
          x="50%"
          y="-1"
          className="overflow-visible fill-neutral-200/50 dark:fill-neutral-800/20"
        >
          <path
            d="M-200 0h201v201h-201Z M600 0h201v201h-201Z M-400 600h201v201h-201Z M200 800h201v201h-201Z"
            stroke-width="0"
          />
        </svg>
        <rect
          width="100%"
          height="100%"
          stroke-width="0"
          fill="url(#983e3e4c-de6d-4c3f-8d64-b9761d1534cc)"
        />
      </svg>
      <div
        className="absolute left-[calc(50%-4rem)] top-10 -z-10 transform-gpu blur-3xl sm:left-[calc(50%-18rem)] lg:left-48 lg:top-[calc(50%-30rem)] xl:left-[calc(50%-24rem)]"
        aria-hidden="true"
      >
        <div
          className="aspect-[1108/632] w-[69.25rem] bg-gradient-to-r from-amber-400 to-amber-600 opacity-20"
          style={{
            clipPath:
              "polygon(73.6% 51.7%, 91.7% 11.8%, 100% 46.4%, 97.4% 82.2%, 92.5% 84.9%, 75.7% 64%, 55.3% 47.5%, 46.5% 49.4%, 45% 62.9%, 50.3% 87.2%, 21.3% 64.1%, 0.1% 100%, 5.4% 51.1%, 21.4% 63.9%, 58.9% 0.2%, 73.6% 51.7%)",
          }}
        ></div>
      </div>
      <div className="relative">
        <div className="max-w-screen-lg  min-[1040px]:px-0 px-8 sm:px-6 w-full mx-auto">
          <div className="flex gap-4">
            <div className="pt-52 sm:pt-80 pb-20 sm:flex items-end gap-8 relative isolate">
              <div className="sm:w-2/3 md:w-1/2">
                <a
                  href={""}
                  className="rounded-full inline-flex items-center gap-1 py-1 px-2 border-2 border-sky-500 text-sm bg-sky-500/20 hover:bg-sky-600/20 transition-all hover:text-sky-400 text-sky-400 font-bold"
                >
                  v.0.21.4
                  <span className="whitespace-nowrap dark:text-white text-neutral-700 flex items-center gap-0.5 font-normal">
                    release notes
                  </span>
                </a>
                <h1 className="mt-4 mb-8 text-5xl">
                  Bring the{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-br from-amber-400 to-amber-600">
                    cloud{" "}
                  </span>
                  to your{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-br from-amber-400 to-amber-600">
                    data center.
                  </span>
                </h1>
                <p>
                  metal-stack® is a set of microservices implementing Metal as a
                  Service (MaaS), turning a bunch of hardware into elastic cloud
                  infrastructure. It is built to manage the lifecycles for
                  hundreds and thousands of servers inside your on-premise data
                  center.
                </p>
              </div>
              <div className="flex-1 sm:w-1/3 md:w-1/2 sm:-mr-20 sm:ml-20 mt-20 sm:mt-0">
                <div className="border rounded-sm bg-neutral-900 border-neutral-800 b">
                  <div className="p-4 font-bold text-sm font-mono text-amber-500 bg-neutral-800">
                    &gt; create new machine
                    <br />
                  </div>
                  <pre className="p-4 text-white text-xs bg-neutral-900">
                    <span className="text-sky-200">
                      metalctl machine create
                    </span>{" "}
                    \
                    <br />
                    <span className="text-sky-500">--hostname</span> worker01 \
                    <br />
                    <span className="text-sky-500">--name</span> worker \
                    <br />
                    <span className="text-sky-500">--image</span> debian-12.0 \
                    <br />
                    <span className="text-sky-500">--size</span> t1-small-x86 \
                    <br />
                    <span className="text-sky-500">--partition</span>{" "}
                    frankfurt-3a \
                    <br />
                    <span className="text-sky-500">--project</span> cluster01 \
                    <br />
                    <span className="text-sky-500">--sshpublickey</span>{" "}
                    "@~/.ssh/id_rsa.pub"
                  </pre>
                </div>
                <a
                  href="https://docs.metal-stack.io/stable/external/metalctl/docs/metalctl/"
                  className="inline-flex items-center mt-8 rounded-full dark:bg-neutral-900/50 bg-white/50 border border-neutral-200 hover:border-neutral-300 text-neutral-800 dark:border-neutral-800 dark:hover:border-neutral-700 transition-all dark:text-white hover:dark:text-amber-500 py-2 px-4 font-medium text-sm filter backdrop-blur-sm"
                >
                  See all commands to manage your metal-stack data center
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

function Blog() {
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
    <section
      id="blog"
      className="relative dark:bg-neutral-950 bg-transparent sm:!py-0 sm:!pb-20  py-0"
    >
      <div className="relative">
        <div className="max-w-screen-lg  min-[1040px]:px-0 px-8 sm:px-6 w-full mx-auto">
          <div className="flex gap-4">
            <h2 className="font-bold">From our Blog</h2>
          </div>
        </div>
      </div>
      <div className="relative z-10">
        <div className="max-w-screen-lg  min-[1040px]:px-0 px-8 sm:px-6 w-full mx-auto">
          <div className="mx-auto grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 lg:mx-0 lg:max-w-none lg:grid-cols-3 items-start">
            {testObjects.map((post) => (
              <article>
                <a
                  className="bg-white/50 group dark:bg-neutral-900 border border-neutral-200 dark:border-white/5 filter backdrop-blur-xl rounded-lg block p-8 h-full"
                  href={post.url}
                >
                  <div className=" relative">
                    <h3 className="mt-0 text-lg font-semibold leading-6  group-hover:text-amber-500 !line-clamp-2 h-12">
                      {post.title}
                    </h3>
                    <hr className="mt-4 border-neutral-200 dark:border-neutral-800" />
                    {/* <p className="mt-5 line-clamp-3 text-sm leading-6 text-neutral-600"> */}
                    <p className="mt-5 line-clamp-3 text-sm leading-6">
                      {post.summary}
                    </p>
                  </div>
                  <div className="relative mt-8 flex items-center gap-x-4">
                    <img
                      src={image_url[post.author.name]}
                      alt=""
                      className="h-10 w-10 rounded-full bg-neutral-50"
                    />
                    <div className="text-sm leading-tight">
                      <p className="font-semibold text-black dark:text-white">
                        <span className="absolute inset-0"></span>
                        {post.author.name}
                      </p>
                      <time
                        dateTime={post.date_modified}
                        className="text-neutral-500"
                      >
                        {new Date(post.date_modified).toLocaleDateString()}
                      </time>
                    </div>
                  </div>
                </a>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default function Home(): ReactNode {
  const { siteConfig } = useDocusaurusContext();
  return (
    <Layout title={`${siteConfig.title}`} description="">
      <CustomHeader />
      <Blog />
    </Layout>
  );
}
