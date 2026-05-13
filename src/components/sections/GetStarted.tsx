import { Catalog, LogoSlack } from "@carbon/icons-react";
import { Button } from "../../components/Button";
import Container from "../../components/Container";
import Row from "../../components/Row";
import Section from "../../components/Section";
import Link from "@docusaurus/Link";

export default function GetStarted() {
  return (
    <Section
      id="get-started"
      className="from-amber-500 to-amber-600 bg-gradient-to-br"
    >
      <Row>
        <Container className=" block rounded-lg drop-shadow-xl text-white text-center">
          <h2 className="!text-white">Ready to get started?</h2>
          <p className="!text-white mt-3 md:w-4/5 lg:w-2/3 mx-auto">
            Although metal-stack is developed for large deployment environments,
            for demo-purposes, you may also run it on your local machine. Try
            our{" "}
            <Link to="/docs/references/mini-lab" className="font-mono bg-neutral-900 text-white text-sm py-1 px-2 rounded-md">
              mini-lab
            </Link>
            {" "}
            on Github to explore the API and the core functionality of the
            software on your own. If you are considering metal-stack, feel free
            to let us know, – we love seeing what you build and are willing to
            support you. Please reach out to us at any time.
          </p>
          <div className="flex gap-4 mt-8 justify-center">
            <Button
              variant="black"
              className="group flex items-center gap-2"
              href="https://join.slack.com/t/metal-stack/shared_invite/zt-3eqheaymr-obQueWBLOMkhbEWTZZyDRg"
              target="_blank"
            >
              <LogoSlack className="w-5 h-5 group-hover:translate-x-0.5 transition-all" />{" "}
              Join our Slack
            </Button>
            <Button
              variant="black"
              className="flex items-center gap-2"
              href="/docs/references/mini-lab"
            >
              <Catalog className="w-6 h-6" />
              See docs
            </Button>
          </div>
        </Container>
      </Row>
    </Section>
  );
}
