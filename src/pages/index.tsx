import { type ReactNode } from "react";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import Layout from "@theme/Layout";
import Benefits from "./sections/Benefits";
import Features from "./sections/Features";
import Offering from "./sections/Offering";
import Partners from "./sections/Partners";
import GetStarted from "./sections/GetStarted";
import Header from "./sections/Header";
import Blog from "./sections/Blog";

export default function Home(): ReactNode {
  const { siteConfig } = useDocusaurusContext();
  return (
    <Layout title={`${siteConfig.title}`} description="">
      <Header />
      <Blog />
      <Benefits />
      <Features />
      <Offering />
      <Partners />
      <GetStarted />
    </Layout>
  );
}
