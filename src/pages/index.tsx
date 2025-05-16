import { useEffect, useState, type ReactNode } from "react";
import clsx from "clsx";
import Link from "@docusaurus/Link";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import Layout from "@theme/Layout";
import Heading from "@theme/Heading";

import styles from "./index.module.css";
import { useBlogPost } from "@docusaurus/plugin-content-blog/lib/client/contexts.js";
import { useBlogListPageStructuredData } from "@docusaurus/plugin-content-blog/lib/client/structuredDataUtils.js";

function HomepageHeader() {
  const { siteConfig } = useDocusaurusContext();
  return (
    <header className={clsx("hero hero--primary", styles.heroBanner)}>
      <div className="container">
        <Heading as="h1" className="hero__title">
          {siteConfig.title}
        </Heading>
        <p className="hero__subtitle">{siteConfig.tagline}</p>
        <div className={styles.buttons}>
          <Link
            className="button button--secondary button--lg"
            to="/docs/introduction"
          >
            Metal-Stack test ⏱️
          </Link>
        </div>
      </div>
    </header>
  );
}

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
      content_html:
        '<p>In this release we do not have any new features to present but a rather unfortunate breaking change in one of our dependencies we use for semantic versioning. If you are an operator of metal-stack, please read this article.</p>\n<ul>\n<li><a href="https://your-docusaurus-site.example.com/blog/2025/03-metal-stack-v0.21.0/article#breaking-change-in-semantic-versioning-for-os-images">Breaking Change in Semantic Versioning for OS Images</a>\n<ul>\n<li><a href="https://your-docusaurus-site.example.com/blog/2025/03-metal-stack-v0.21.0/article#naming-of-os-image-releases">Naming of OS Image Releases</a></li>\n</ul>\n</li>\n<li><a href="https://your-docusaurus-site.example.com/blog/2025/03-metal-stack-v0.21.0/article#more-information">More Information</a></li>\n</ul>\n<p>Check out the direct link to the release <a href="https://github.com/metal-stack/releases/releases/tag/v0.21.0" target="_blank" rel="noopener noreferrer">here</a>.</p>\n<h2 class="anchor anchorWithStickyNavbar_LWe7" id="breaking-change-in-semantic-versioning-for-os-images">Breaking Change in Semantic Versioning for OS Images<a href="https://your-docusaurus-site.example.com/blog/2025/03-metal-stack-v0.21.0/article#breaking-change-in-semantic-versioning-for-os-images" class="hash-link" aria-label="Direct link to Breaking Change in Semantic Versioning for OS Images" title="Direct link to Breaking Change in Semantic Versioning for OS Images">​</a></h2>\n<p>A <a href="https://github.com/Masterminds/semver/issues/258" target="_blank" rel="noopener noreferrer">change in the semver library</a> that is used by metal-stack and in the Gardener project forces us to rename the identifiers that we typically use for OS images like Ubuntu 24.04. The library now requires stricter semantic versions, not allow leading zeroes in version segments.</p>\n<p>In case you use for example <code>ubuntu-24.04.20250228</code> as an ID for an <code>image</code> in the metal-api, this needs to become <code>ubuntu-24.4.20250228</code>.</p>\n<p>In order to introduce the new identifier-format, before updating to this release of metal-stack, an image has to be created according to the new version format. This image then co-exists with the old image format. After this, all machines referencing the old image must be reprovisioned with the new image ID format.</p>\n<p>After all the references were migrated to the new image format, the old versions must be removed from the metal-api before upgrading to this release. Please adapt your deployments accordingly.</p>\n<p>Unfortunately, there is no better way to migrate this ID. Another option was to fork the Gardener project, which we did not want to do. If you encounter bigger issues during this step, please contact us in our Slack channel.</p>\n<h3 class="anchor anchorWithStickyNavbar_LWe7" id="naming-of-os-image-releases">Naming of OS Image Releases<a href="https://your-docusaurus-site.example.com/blog/2025/03-metal-stack-v0.21.0/article#naming-of-os-image-releases" class="hash-link" aria-label="Direct link to Naming of OS Image Releases" title="Direct link to Naming of OS Image Releases">​</a></h3>\n<p>The Ubuntu OS images we release through <a href="https://github.com/metal-stack/metal-images" target="_blank" rel="noopener noreferrer">metal-images</a> will continue to use the existing naming scheme. The download paths for our OS images will still contain leading zeros for Ubuntu LTS versions.</p>\n<h2 class="anchor anchorWithStickyNavbar_LWe7" id="more-information">More Information<a href="https://your-docusaurus-site.example.com/blog/2025/03-metal-stack-v0.21.0/article#more-information" class="hash-link" aria-label="Direct link to More Information" title="Direct link to More Information">​</a></h2>\n<p>Please check out the <a href="https://github.com/metal-stack/releases/releases/tag/v0.21.0" target="_blank" rel="noopener noreferrer">release notes</a> to find a full overview over every change that went part of this release.</p>\n<p>As always, feel free to visit our Slack channel and ask if there are any questions. 😄</p>',
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
      content_html:
        '<p>Admittedly, we planned supporting IPv6 for metal-stack years ago. 😅</p>\n<p>As we all know, good things take time, and that time has finally come! In this release, IPv6 addresses can be provisioned to machines through the metal-api. Read on to learn how it works.</p>\n<ul>\n<li><a href="https://your-docusaurus-site.example.com/blog/2025/02-metal-stack-v0.20.0/article#basic-ipv6-support">Basic IPv6 Support</a></li>\n<li><a href="https://your-docusaurus-site.example.com/blog/2025/02-metal-stack-v0.20.0/article#gardener-support-to-v1106">Gardener Support to v1.106</a></li>\n<li><a href="https://your-docusaurus-site.example.com/blog/2025/02-metal-stack-v0.20.0/article#audit-backend-based-on-timescaledb">Audit Backend Based on TimescaleDB</a></li>\n<li><a href="https://your-docusaurus-site.example.com/blog/2025/02-metal-stack-v0.20.0/article#metal-core-reporting-bgp-states">metal-core Reporting BGP States</a></li>\n<li><a href="https://your-docusaurus-site.example.com/blog/2025/02-metal-stack-v0.20.0/article#relaunch-of-cluster-api-provider">Relaunch of Cluster API Provider</a></li>\n<li><a href="https://your-docusaurus-site.example.com/blog/2025/02-metal-stack-v0.20.0/article#more-information">More Information</a></li>\n</ul>\n<p>Check out the direct link to the release <a href="https://github.com/metal-stack/releases/releases/tag/v0.20.0" target="_blank" rel="noopener noreferrer">here</a>.</p>\n<h2 class="anchor anchorWithStickyNavbar_LWe7" id="basic-ipv6-support">Basic IPv6 Support<a href="https://your-docusaurus-site.example.com/blog/2025/02-metal-stack-v0.20.0/article#basic-ipv6-support" class="hash-link" aria-label="Direct link to Basic IPv6 Support" title="Direct link to Basic IPv6 Support">​</a></h2>\n<p>Back in 2021 we published a <a href="https://metal-stack.io/blog/2021/02/ipv6-part1" target="_blank" rel="noopener noreferrer">first blog article</a> talking specifically about IPv6. However, work on the topic was frequently interrupted and postponed. As IPv6 has become a recurring track in the Gardener Hackathons, this year we finally gained enough confidence to merge our first version of basic IPv6 support in the <a href="https://github.com/metal-stack/metal-api" target="_blank" rel="noopener noreferrer">metal-api</a>.</p>\n<p>A really big bunch of the work was done by <a href="https://github.com/majst01" target="_blank" rel="noopener noreferrer">@majst01</a>, who also wrote the corresponding enhancement proposal <a href="https://docs.metal-stack.io/dev/development/proposals/MEP13/README/" target="_blank" rel="noopener noreferrer">MEP-13</a>. Thanks for the effort and the never-ending will to finish this up. 😌</p>\n<p>With the new API, operators can add a list of prefixes containing both IPv4 and IPv6 addresses, which looks like this:</p>\n<div class="language-yaml codeBlockContainer_Ckt0 theme-code-block" style="--prism-color:#393A34;--prism-background-color:#f6f8fa"><div class="codeBlockContent_biex"><pre tabindex="0" class="prism-code language-yaml codeBlock_bY9V thin-scrollbar" style="color:#393A34;background-color:#f6f8fa"><code class="codeBlockLines_e6Vv"><span class="token-line" style="color:#393A34"><span class="token punctuation" style="color:#393A34">---</span><span class="token plain"></span><br></span><span class="token-line" style="color:#393A34"><span class="token plain"></span><span class="token key atrule" style="color:#00a4db">id</span><span class="token punctuation" style="color:#393A34">:</span><span class="token plain"> tenant</span><span class="token punctuation" style="color:#393A34">-</span><span class="token plain">super</span><span class="token punctuation" style="color:#393A34">-</span><span class="token plain">network</span><span class="token punctuation" style="color:#393A34">-</span><span class="token plain">mini</span><span class="token punctuation" style="color:#393A34">-</span><span class="token plain">lab</span><br></span><span class="token-line" style="color:#393A34"><span class="token plain"></span><span class="token key atrule" style="color:#00a4db">name</span><span class="token punctuation" style="color:#393A34">:</span><span class="token plain"> Project Super Network</span><br></span><span class="token-line" style="color:#393A34"><span class="token plain"></span><span class="token key atrule" style="color:#00a4db">description</span><span class="token punctuation" style="color:#393A34">:</span><span class="token plain"> Super network of all project networks</span><br></span><span class="token-line" style="color:#393A34"><span class="token plain"></span><span class="token key atrule" style="color:#00a4db">partitionid</span><span class="token punctuation" style="color:#393A34">:</span><span class="token plain"> mini</span><span class="token punctuation" style="color:#393A34">-</span><span class="token plain">lab</span><br></span><span class="token-line" style="color:#393A34"><span class="token plain"></span><span class="token key atrule" style="color:#00a4db">prefixes</span><span class="token punctuation" style="color:#393A34">:</span><span class="token plain"></span><br></span><span class="token-line" style="color:#393A34"><span class="token plain">  </span><span class="token punctuation" style="color:#393A34">-</span><span class="token plain"> 10.0.0.0/16</span><br></span><span class="token-line" style="color:#393A34"><span class="token plain">  </span><span class="token punctuation" style="color:#393A34">-</span><span class="token plain"> 2001</span><span class="token punctuation" style="color:#393A34">:</span><span class="token plain">db8</span><span class="token punctuation" style="color:#393A34">:</span><span class="token plain">0</span><span class="token punctuation" style="color:#393A34">:</span><span class="token plain">10</span><span class="token punctuation" style="color:#393A34">:</span><span class="token punctuation" style="color:#393A34">:</span><span class="token plain">/64</span><br></span><span class="token-line" style="color:#393A34"><span class="token plain"></span><span class="token key atrule" style="color:#00a4db">defaultchildprefixlength</span><span class="token punctuation" style="color:#393A34">:</span><span class="token plain"></span><br></span><span class="token-line" style="color:#393A34"><span class="token plain">  </span><span class="token key atrule" style="color:#00a4db">IPv4</span><span class="token punctuation" style="color:#393A34">:</span><span class="token plain"> </span><span class="token number" style="color:#36acaa">22</span><span class="token plain"></span><br></span><span class="token-line" style="color:#393A34"><span class="token plain">  </span><span class="token key atrule" style="color:#00a4db">IPv6</span><span class="token punctuation" style="color:#393A34">:</span><span class="token plain"> </span><span class="token number" style="color:#36acaa">96</span><span class="token plain"></span><br></span><span class="token-line" style="color:#393A34"><span class="token plain"></span><span class="token key atrule" style="color:#00a4db">privatesuper</span><span class="token punctuation" style="color:#393A34">:</span><span class="token plain"> </span><span class="token boolean important" style="color:#36acaa">true</span><span class="token plain"></span><br></span><span class="token-line" style="color:#393A34"><span class="token plain"></span><span class="token key atrule" style="color:#00a4db">consumption</span><span class="token punctuation" style="color:#393A34">:</span><span class="token plain"></span><br></span><span class="token-line" style="color:#393A34"><span class="token plain">  </span><span class="token key atrule" style="color:#00a4db">ipv4</span><span class="token punctuation" style="color:#393A34">:</span><span class="token plain"></span><br></span><span class="token-line" style="color:#393A34"><span class="token plain">    </span><span class="token key atrule" style="color:#00a4db">available_ips</span><span class="token punctuation" style="color:#393A34">:</span><span class="token plain"> </span><span class="token number" style="color:#36acaa">65536</span><span class="token plain"></span><br></span><span class="token-line" style="color:#393A34"><span class="token plain">    </span><span class="token key atrule" style="color:#00a4db">available_prefixes</span><span class="token punctuation" style="color:#393A34">:</span><span class="token plain"> </span><span class="token number" style="color:#36acaa">16384</span><span class="token plain"></span><br></span><span class="token-line" style="color:#393A34"><span class="token plain">    </span><span class="token key atrule" style="color:#00a4db">used_ips</span><span class="token punctuation" style="color:#393A34">:</span><span class="token plain"> </span><span class="token number" style="color:#36acaa">2</span><span class="token plain"></span><br></span><span class="token-line" style="color:#393A34"><span class="token plain">    </span><span class="token key atrule" style="color:#00a4db">used_prefixes</span><span class="token punctuation" style="color:#393A34">:</span><span class="token plain"> </span><span class="token number" style="color:#36acaa">0</span><span class="token plain"></span><br></span><span class="token-line" style="color:#393A34"><span class="token plain">  </span><span class="token key atrule" style="color:#00a4db">ipv6</span><span class="token punctuation" style="color:#393A34">:</span><span class="token plain"></span><br></span><span class="token-line" style="color:#393A34"><span class="token plain">    </span><span class="token key atrule" style="color:#00a4db">available_ips</span><span class="token punctuation" style="color:#393A34">:</span><span class="token plain"> </span><span class="token number" style="color:#36acaa">2147483647</span><span class="token plain"></span><br></span><span class="token-line" style="color:#393A34"><span class="token plain">    </span><span class="token key atrule" style="color:#00a4db">available_prefixes</span><span class="token punctuation" style="color:#393A34">:</span><span class="token plain"> </span><span class="token number" style="color:#36acaa">2147483647</span><span class="token plain"></span><br></span><span class="token-line" style="color:#393A34"><span class="token plain">    </span><span class="token key atrule" style="color:#00a4db">used_ips</span><span class="token punctuation" style="color:#393A34">:</span><span class="token plain"> </span><span class="token number" style="color:#36acaa">1</span><span class="token plain"></span><br></span><span class="token-line" style="color:#393A34"><span class="token plain">    </span><span class="token key atrule" style="color:#00a4db">used_prefixes</span><span class="token punctuation" style="color:#393A34">:</span><span class="token plain"> </span><span class="token number" style="color:#36acaa">0</span><br></span></code></pre><div class="buttonGroup__atx"><button type="button" aria-label="Copy code to clipboard" title="Copy" class="clean-btn"><span class="copyButtonIcons_eSgA" aria-hidden="true"><svg viewBox="0 0 24 24" class="copyButtonIcon_y97N"><path fill="currentColor" d="M19,21H8V7H19M19,5H8A2,2 0 0,0 6,7V21A2,2 0 0,0 8,23H19A2,2 0 0,0 21,21V7A2,2 0 0,0 19,5M16,1H4A2,2 0 0,0 2,3V17H4V3H16V1Z"></path></svg><svg viewBox="0 0 24 24" class="copyButtonSuccessIcon_LjdS"><path fill="currentColor" d="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z"></path></svg></span></button></div></div></div>\n<p>Both families have specific default prefix lengths that are used for child network allocation. Also there is dedicated usage reporting per IP address family. The consumption of IPv6 address families is only an approximation, as counting free addresses would otherwise be costly.</p>\n<p>By default, <code>metalctl</code> users allocating a child network automatically inherit the prefixes from the address families defined by the parent network:</p>\n<div class="language-bash codeBlockContainer_Ckt0 theme-code-block" style="--prism-color:#393A34;--prism-background-color:#f6f8fa"><div class="codeBlockContent_biex"><pre tabindex="0" class="prism-code language-bash codeBlock_bY9V thin-scrollbar" style="color:#393A34;background-color:#f6f8fa"><code class="codeBlockLines_e6Vv"><span class="token-line" style="color:#393A34"><span class="token plain">❯ metalctl network allocate --name my-node-network --partition mini-lab --project 4b9b17c4-2d7c-4190-ae95-dda44e430fa6</span><br></span><span class="token-line" style="color:#393A34"><span class="token plain">---</span><br></span><span class="token-line" style="color:#393A34"><span class="token plain">id: 2d2c0350-3f66-4597-ae97-ef6797232212</span><br></span><span class="token-line" style="color:#393A34"><span class="token plain">name: my-node-network</span><br></span><span class="token-line" style="color:#393A34"><span class="token plain">parentnetworkid: tenant-super-network-mini-lab</span><br></span><span class="token-line" style="color:#393A34"><span class="token plain">partitionid: mini-lab</span><br></span><span class="token-line" style="color:#393A34"><span class="token plain">prefixes:</span><br></span><span class="token-line" style="color:#393A34"><span class="token plain">- 10.0.0.0/22</span><br></span><span class="token-line" style="color:#393A34"><span class="token plain">- 2001:db8:0:10::/96</span><br></span><span class="token-line" style="color:#393A34"><span class="token plain">projectid: 4b9b17c4-2d7c-4190-ae95-dda44e430fa6</span><br></span><span class="token-line" style="color:#393A34"><span class="token plain">vrf: 20</span><br></span><span class="token-line" style="color:#393A34"><span class="token plain">consumption:</span><br></span><span class="token-line" style="color:#393A34"><span class="token plain">  ipv4:</span><br></span><span class="token-line" style="color:#393A34"><span class="token plain">    available_ips: 1024</span><br></span><span class="token-line" style="color:#393A34"><span class="token plain">    available_prefixes: 256</span><br></span><span class="token-line" style="color:#393A34"><span class="token plain">    used_ips: 2</span><br></span><span class="token-line" style="color:#393A34"><span class="token plain">    used_prefixes: 0</span><br></span><span class="token-line" style="color:#393A34"><span class="token plain">  ipv6:</span><br></span><span class="token-line" style="color:#393A34"><span class="token plain">    available_ips: 2147483647</span><br></span><span class="token-line" style="color:#393A34"><span class="token plain">    available_prefixes: 1073741824</span><br></span><span class="token-line" style="color:#393A34"><span class="token plain">    used_ips: 1</span><br></span><span class="token-line" style="color:#393A34"><span class="token plain">    used_prefixes: 0</span><br></span><span class="token-line" style="color:#393A34"><span class="token plain">privatesuper: false</span><br></span><span class="token-line" style="color:#393A34"><span class="token plain">...</span><br></span></code></pre><div class="buttonGroup__atx"><button type="button" aria-label="Copy code to clipboard" title="Copy" class="clean-btn"><span class="copyButtonIcons_eSgA" aria-hidden="true"><svg viewBox="0 0 24 24" class="copyButtonIcon_y97N"><path fill="currentColor" d="M19,21H8V7H19M19,5H8A2,2 0 0,0 6,7V21A2,2 0 0,0 8,23H19A2,2 0 0,0 21,21V7A2,2 0 0,0 19,5M16,1H4A2,2 0 0,0 2,3V17H4V3H16V1Z"></path></svg><svg viewBox="0 0 24 24" class="copyButtonSuccessIcon_LjdS"><path fill="currentColor" d="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z"></path></svg></span></button></div></div></div>\n<p>With the <code>--addressfamily</code> flag it is also possible to extract only child prefixes from the given address family. However, this release also introduces the ability for users to create child networks with a custom prefix length, so it is also possible to allocate smaller or larger prefixes.</p>\n<p>When an IP address is allocated from a network without explicitly specifying an address family, a user acquires an IPv4 address, unless the network consists only of IPv6 prefixes. In the latter case, a user gets an IPv6 address by default.</p>\n<div class="language-bash codeBlockContainer_Ckt0 theme-code-block" style="--prism-color:#393A34;--prism-background-color:#f6f8fa"><div class="codeBlockContent_biex"><pre tabindex="0" class="prism-code language-bash codeBlock_bY9V thin-scrollbar" style="color:#393A34;background-color:#f6f8fa"><code class="codeBlockLines_e6Vv"><span class="token-line" style="color:#393A34"><span class="token plain">❯ metalctl network ip create --network 2d2c0350-3f66-4597-ae97-ef6797232212 --project 4b9b17c4-2d7c-4190-ae95-dda44e430fa6</span><br></span><span class="token-line" style="color:#393A34"><span class="token plain">---</span><br></span><span class="token-line" style="color:#393A34"><span class="token plain">allocationuuid: 2dde5c08-78b4-4765-9862-c24dc073b64f</span><br></span><span class="token-line" style="color:#393A34"><span class="token plain">ipaddress: 10.0.0.1</span><br></span><span class="token-line" style="color:#393A34"><span class="token plain">networkid: 2d2c0350-3f66-4597-ae97-ef6797232212</span><br></span><span class="token-line" style="color:#393A34"><span class="token plain">projectid: 4b9b17c4-2d7c-4190-ae95-dda44e430fa6</span><br></span><span class="token-line" style="color:#393A34"><span class="token plain">tags: []</span><br></span><span class="token-line" style="color:#393A34"><span class="token plain">type: ephemeral</span><br></span><span class="token-line" style="color:#393A34"><span class="token plain">...</span><br></span></code></pre><div class="buttonGroup__atx"><button type="button" aria-label="Copy code to clipboard" title="Copy" class="clean-btn"><span class="copyButtonIcons_eSgA" aria-hidden="true"><svg viewBox="0 0 24 24" class="copyButtonIcon_y97N"><path fill="currentColor" d="M19,21H8V7H19M19,5H8A2,2 0 0,0 6,7V21A2,2 0 0,0 8,23H19A2,2 0 0,0 21,21V7A2,2 0 0,0 19,5M16,1H4A2,2 0 0,0 2,3V17H4V3H16V1Z"></path></svg><svg viewBox="0 0 24 24" class="copyButtonSuccessIcon_LjdS"><path fill="currentColor" d="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z"></path></svg></span></button></div></div></div>\n<p>Again, the <code>--addressfamily</code> flag can be used to explicitly specify the kind of IP address to obtain:</p>\n<div class="language-bash codeBlockContainer_Ckt0 theme-code-block" style="--prism-color:#393A34;--prism-background-color:#f6f8fa"><div class="codeBlockContent_biex"><pre tabindex="0" class="prism-code language-bash codeBlock_bY9V thin-scrollbar" style="color:#393A34;background-color:#f6f8fa"><code class="codeBlockLines_e6Vv"><span class="token-line" style="color:#393A34"><span class="token plain">metalctl network ip create --network 2d2c0350-3f66-4597-ae97-ef6797232212 --project 4b9b17c4-2d7c-4190-ae95-dda44e430fa6 --addressfamily IPv6</span><br></span><span class="token-line" style="color:#393A34"><span class="token plain">---</span><br></span><span class="token-line" style="color:#393A34"><span class="token plain">allocationuuid: 0312f0b7-2a87-460f-95dd-7b67fdfcddd7</span><br></span><span class="token-line" style="color:#393A34"><span class="token plain">ipaddress: 2001:db8:0:10::1</span><br></span><span class="token-line" style="color:#393A34"><span class="token plain">networkid: 2d2c0350-3f66-4597-ae97-ef6797232212</span><br></span><span class="token-line" style="color:#393A34"><span class="token plain">projectid: 4b9b17c4-2d7c-4190-ae95-dda44e430fa6</span><br></span><span class="token-line" style="color:#393A34"><span class="token plain">tags: []</span><br></span><span class="token-line" style="color:#393A34"><span class="token plain">type: ephemeral</span><br></span></code></pre><div class="buttonGroup__atx"><button type="button" aria-label="Copy code to clipboard" title="Copy" class="clean-btn"><span class="copyButtonIcons_eSgA" aria-hidden="true"><svg viewBox="0 0 24 24" class="copyButtonIcon_y97N"><path fill="currentColor" d="M19,21H8V7H19M19,5H8A2,2 0 0,0 6,7V21A2,2 0 0,0 8,23H19A2,2 0 0,0 21,21V7A2,2 0 0,0 19,5M16,1H4A2,2 0 0,0 2,3V17H4V3H16V1Z"></path></svg><svg viewBox="0 0 24 24" class="copyButtonSuccessIcon_LjdS"><path fill="currentColor" d="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z"></path></svg></span></button></div></div></div>\n<p>IPs and networks can be associated with machines and firewalls as usual. In case network IP auto-acquisition is used, a machine or firewall retrieves an IP from all available IP address families of the corresponding network.</p>\n<p>At this stage, the implementation works for metal-stack without the integration of the Gardener. These parts will require adaption as well. However, it is required to run Gardener with at least version v1.109 in order to support dual-stack thoroughly.</p>\n<h2 class="anchor anchorWithStickyNavbar_LWe7" id="gardener-support-to-v1106">Gardener Support to v1.106<a href="https://your-docusaurus-site.example.com/blog/2025/02-metal-stack-v0.20.0/article#gardener-support-to-v1106" class="hash-link" aria-label="Direct link to Gardener Support to v1.106" title="Direct link to Gardener Support to v1.106">​</a></h2>\n<p>With this release, metal-stack supports Gardener to version <code>v1.106</code>, which offers shoot clusters running on Kubernetes version 1.31.</p>\n<p>In addition to this, the mini-lab release integration now has a new <code>gardener</code> flavor, which uses our Gardener deployment role from the <a href="https://github.com/metal-stack/metal-roles" target="_blank" rel="noopener noreferrer">metal-roles</a> repository. With this flavor, the mini-lab spins up the Gardener Control Plane while the release integration checks that all components are running and report readiness. Shoot creation was not yet tried out but we are keen to support this in the mini-lab for one of the future releases.</p>\n<p>One upcoming topic will also be the migration of the Gardener installation using Helm charts to the Gardener Operator. This requires thorough testing and hopefully we can integrate the migration into one of our next releases.</p>\n<h2 class="anchor anchorWithStickyNavbar_LWe7" id="audit-backend-based-on-timescaledb">Audit Backend Based on TimescaleDB<a href="https://your-docusaurus-site.example.com/blog/2025/02-metal-stack-v0.20.0/article#audit-backend-based-on-timescaledb" class="hash-link" aria-label="Direct link to Audit Backend Based on TimescaleDB" title="Direct link to Audit Backend Based on TimescaleDB">​</a></h2>\n<p>As an alternative to the Meilisearch backend, it is now possible to use <a href="https://www.timescale.com/" target="_blank" rel="noopener noreferrer">TimescaleDB</a> as the audit backend for the metal-api audit traces. It has useful features like fast inserts and searches in hypertable chunks, data retention and compression. As this is built as an extension to Postgres, we have good experience maintaining this integration and can reuse our integration with the <a href="https://github.com/metal-stack/backup-restore-sidecar" target="_blank" rel="noopener noreferrer">backup-restore-sidecar</a> including its database update capabilities.</p>\n<p>The interface of querying the backend is identical to what it was with Meilisearch. So, users do not feel any difference.</p>\n<p>In the future, we plan to offer at one more audit backend for Splunk.</p>\n<h2 class="anchor anchorWithStickyNavbar_LWe7" id="metal-core-reporting-bgp-states">metal-core Reporting BGP States<a href="https://your-docusaurus-site.example.com/blog/2025/02-metal-stack-v0.20.0/article#metal-core-reporting-bgp-states" class="hash-link" aria-label="Direct link to metal-core Reporting BGP States" title="Direct link to metal-core Reporting BGP States">​</a></h2>\n<p>In order to keep track of the BGP connections between the leaf switches and the provisioned machines for operators there is now a way to see the connection state directly through the metal-api.</p>\n<p>For instance, this can be observed through the <code>switch connected-machines</code> command in combination with <code>-o wide</code>:</p>\n<div class="language-bash codeBlockContainer_Ckt0 theme-code-block" style="--prism-color:#393A34;--prism-background-color:#f6f8fa"><div class="codeBlockContent_biex"><pre tabindex="0" class="prism-code language-bash codeBlock_bY9V thin-scrollbar" style="color:#393A34;background-color:#f6f8fa"><code class="codeBlockLines_e6Vv"><span class="token-line" style="color:#393A34"><span class="token plain">❯ metalctl switch connected-machines -o wide</span><br></span><span class="token-line" style="color:#393A34"><span class="token plain">ID                                           NIC NAME                           IDENTIFIER   PARTITION   RACK        SIZE           HOSTNAME   PRODUCT SERIAL</span><br></span><span class="token-line" style="color:#393A34"><span class="token plain">leaf01                                                                                       mini-lab    test-rack</span><br></span><span class="token-line" style="color:#393A34"><span class="token plain">├─╴00000000-0000-0000-0000-000000000001      Ethernet0 (BGP:Established(54s))   Eth1/1       mini-lab    test-rack   v1-small-x86   test</span><br></span><span class="token-line" style="color:#393A34"><span class="token plain">└─╴00000000-0000-0000-0000-000000000002      Ethernet1                          Eth1/2       mini-lab    test-rack   v1-small-x86</span><br></span><span class="token-line" style="color:#393A34"><span class="token plain">leaf02                                                                                       mini-lab    test-rack</span><br></span><span class="token-line" style="color:#393A34"><span class="token plain">├─╴00000000-0000-0000-0000-000000000001      Ethernet0 (BGP:Established(58s))   Eth1/1       mini-lab    test-rack   v1-small-x86   test</span><br></span><span class="token-line" style="color:#393A34"><span class="token plain">└─╴00000000-0000-0000-0000-000000000002      Ethernet1                          Eth1/2       mini-lab    test-rack   v1-small-x86</span><br></span></code></pre><div class="buttonGroup__atx"><button type="button" aria-label="Copy code to clipboard" title="Copy" class="clean-btn"><span class="copyButtonIcons_eSgA" aria-hidden="true"><svg viewBox="0 0 24 24" class="copyButtonIcon_y97N"><path fill="currentColor" d="M19,21H8V7H19M19,5H8A2,2 0 0,0 6,7V21A2,2 0 0,0 8,23H19A2,2 0 0,0 21,21V7A2,2 0 0,0 19,5M16,1H4A2,2 0 0,0 2,3V17H4V3H16V1Z"></path></svg><svg viewBox="0 0 24 24" class="copyButtonSuccessIcon_LjdS"><path fill="currentColor" d="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z"></path></svg></span></button></div></div></div>\n<p>Mainly, <a href="https://github.com/mwennrich" target="_blank" rel="noopener noreferrer">@mwennrich</a> was responsible for this handy addition. Thanks! 🐕</p>\n<h2 class="anchor anchorWithStickyNavbar_LWe7" id="relaunch-of-cluster-api-provider">Relaunch of Cluster API Provider<a href="https://your-docusaurus-site.example.com/blog/2025/02-metal-stack-v0.20.0/article#relaunch-of-cluster-api-provider" class="hash-link" aria-label="Direct link to Relaunch of Cluster API Provider" title="Direct link to Relaunch of Cluster API Provider">​</a></h2>\n<p>As time went on, we decided to give our <a href="https://github.com/metal-stack/cluster-api-provider-metal-stack" target="_blank" rel="noopener noreferrer">cluster-api-provider-metal-stack</a> another try and rebuild it from scratch. So from a broken state we are back: It works again!</p>\n<p>Over time, the Cluster API has added experimental support for the ignition file format, which we now use for machine provisioning. We also support installing the provider using <code>clusterctl</code>. Commands like <code>clusterctl move</code> also work.</p>\n<p>The entire solution can be fully developed in the mini-lab, which simulates the entire stack from the API down to the switches and machines.</p>\n<p>If you are interested, feel free to check out the local setup of the cluster-api provider by following our <a href="https://github.com/metal-stack/cluster-api-provider-metal-stack/blob/main/DEVELOPMENT.md#getting-started-locally" target="_blank" rel="noopener noreferrer">developer guide</a>.</p>\n<h2 class="anchor anchorWithStickyNavbar_LWe7" id="more-information">More Information<a href="https://your-docusaurus-site.example.com/blog/2025/02-metal-stack-v0.20.0/article#more-information" class="hash-link" aria-label="Direct link to More Information" title="Direct link to More Information">​</a></h2>\n<p>This is only a small extract of what went into our v0.20.0 release.</p>\n<p>Please check out the <a href="https://github.com/metal-stack/releases/releases/tag/v0.20.0" target="_blank" rel="noopener noreferrer">release notes</a> to find a full overview over every change that went part of this release.</p>\n<p>As always, feel free to visit our Slack channel and ask if there are any questions. 😄</p>',
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
      content_html:
        '<p>Without high expectations, we submitted an application to <a href="https://fosdem.org/" target="_blank" rel="noopener noreferrer">FOSDEM</a> at the end of last year. So we were very excited when we heard that metal-stack had been accepted with a stand and a presentation at FOSDEM 2025. It was a sign for us. It proved to us that there is a demand for solutions that provide highly scalable infrastructure in on-premises data centers.</p>\n<p>FOSDEM is an open source conference held in the heart of Europe in Brussels, Belgium. It is one of the largest, if not the largest, open source software conference in the world. As a visitor we have been there in the past and enjoyed the high amount of technical talks and the diversity of the conference. In fact, it is a melting pot of people from all kinds of areas - from project maintainers to decision makers, from eminent authorities to hobbyists, from computer enthusiasts to the press.</p>\n<p>All in all, we are very grateful for the opportunity to present our project to a wider audience. We have never met so many new faces and people to talk to about this project in such a short time. It was great to be able to talk about the software and the ideas and concepts that we have come up with with metal-stack - to exchange thoughts with others, get new inspiration and identify potential partners for future collaborations.</p>\n<p>You can find our talk <a href="https://fosdem.org/2025/schedule/event/fosdem-2025-4665-on-prem-kubernetes-at-scale-with-metal-stack-io/" target="_blank" rel="noopener noreferrer">here</a>. At the time of writing the video has not become publicly available yet, but we are sure it will be available soon.</p>\n<p>In the meantime, we would like to thank everyone who came and showed interest. And of course a big thank you to the organizers of FOSDEM, the Virtualization and Cloud Infrastructure Dev Room, for their trust. We had a great time and hope to stay in touch with all of you! See you soon!</p>\n<p><img decoding="async" loading="lazy" src="https://your-docusaurus-site.example.com/assets/images/IMG_5353-872dbe6c0a95384ddacd883349c6fad5.jpeg" width="800" height="600" class="img_ev3q"></p>',
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
        <div className="w-full mx-auto">
          <div className="mx-auto grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 lg:mx-0 lg:max-w-none lg:grid-cols-3 items-start">
            {testObjects.map((post) => (
              <article>
                <a
                  className="bg-white/50 group dark:bg-neutral-900 border border-neutral-200 dark:border-white/5 filter backdrop-blur-xl rounded-lg block p-8 h-full"
                  href={post.url}
                >
                  <div className=" relative">
                    <h3 className="mt-0 text-lg font-semibold leading-6 text-neutral-900 group-hover:text-amber-500 !line-clamp-2 h-12">
                      {post.title}
                    </h3>
                    <hr className="mt-4 border-neutral-200 dark:border-neutral-800" />
                    <p className="mt-5 line-clamp-3 text-sm leading-6 text-neutral-600">
                      {post.summary}
                    </p>
                  </div>
                  <div className="relative mt-8 flex items-center gap-x-4">
                    {/* <img
                      src={author.avatar}
                      alt=""
                      className="h-10 w-10 rounded-full bg-neutral-50"
                    /> */}
                    <div className="text-sm leading-tight">
                      <p className="font-semibold !text-white">
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
