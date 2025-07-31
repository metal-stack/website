import { type ReactNode } from "react";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import Layout from "@theme/Layout";
import Header from "../components/sections/Header";
import Blog from "../components/sections/Blog";
import Benefits from "../components/sections/Benefits";
import Features from "../components/sections/Features";
import Offering from "../components/sections/Offering";
import Partners from "../components/sections/Partners";
import GetStarted from "../components/sections/GetStarted";

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
