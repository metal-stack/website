import Layout from "@theme/Layout";
import Api from "../components/Api";
import BrowserOnly from "@docusaurus/BrowserOnly";

export default function () {
  return (
    <Layout>
      <BrowserOnly>{() => <Api />}</BrowserOnly>
    </Layout>
  );
}
