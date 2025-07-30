import Container from "../components/Container";
import Row from "../components/Row";
import Terminal from "../components/Terminal";

export default function Header() {
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
      <Row>
        <Container>
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
                <Terminal />
                <a
                  href="https://docs.metal-stack.io/stable/external/metalctl/docs/metalctl/"
                  className="inline-flex items-center mt-8 rounded-full dark:bg-neutral-900/50 bg-white/50 border border-neutral-200 hover:border-neutral-300 text-neutral-800 dark:border-neutral-800 dark:hover:border-neutral-700 transition-all dark:text-white hover:dark:text-amber-500 py-2 px-4 font-medium text-sm filter backdrop-blur-sm"
                >
                  See all commands to manage your metal-stack data center
                </a>
              </div>
            </div>
          </div>
        </Container>
      </Row>
    </header>
  );
}
