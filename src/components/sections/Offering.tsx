import { ArrowRight, Link } from "@carbon/icons-react";
import Container from "../../components/Container";
import Row from "../../components/Row";
import Section from "../../components/Section";
import SectionIntro from "../../components/SectionIntro";
import { Button } from "../../components/Button";
import { useColorMode } from "@docusaurus/theme-common";

let cloudFeatures = [
  { src: "/img/icons8-gdpr.svg", title: "Fully DSGVO and GDPR compliant" },
  { src: "/img/icons8-cloud.svg", title: "Hosted in Germany" },
  { src: "/img/icons8-cpu.svg", title: "Up to 24 cores per compute node" },
  { src: "/img/icons8-link.svg", title: "10Gb/s uplink capabilities" },
  { src: "/img/icons8-m2-ssd.svg", title: "Lightning fast NVMe storage" },
  { src: "/img/icons8-update.svg", title: "Fully managed & always patched" },
];

export default function Offering() {
  const colorMode = useColorMode();
  return (
    <Section id="cloud-offering" className="pb-0 sm:pb-20 dark:bg-neutral-900 ">
      <Row className=" overflow-clip">
        <Container className="grid grid-cols-12 gap-4 md:gap-8 lg:gap-12 items-center">
          <div className="col-span-12 sm:col-span-6 lg:col-span-5">
            <SectionIntro
              fullWidth
              strapline="metalstack.cloud"
              title="Our cloud offering for metal-stack"
              description="metalstack.cloud is our own cloud offering based on metal-stack. It is built on top of metal-stack, is fully managed and provides a ready-made bare-metal cloud solution for running Kubernetes clusters."
            />
            <div className="grid grid-cols-2 gap-4">
              {cloudFeatures.map((feature) => (
                <div className="flex items-center gap-4 py-3 px-4 bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg justify-start sm:justify-center">
                  <img src={feature.src} className="w-8 h-8" alt="" />
                  <p className="dark:!text-white text-xs">{feature.title}</p>
                </div>
              ))}
            </div>
            <div className="flex gap-4">
              <Button
                target="_blank"
                href="https://console.metalstack.cloud/login?intent=signup&utm_source=metal-stack.io&utm_medium=website&utm_campaign=cloud-cta"
                className="flex gap-2 items-center mt-10 group"
                variant="primary"
                size="md"
              >
                Register now{" "}
                <ArrowRight className="group-hover:translate-x-0.5 transition-all" />
              </Button>
              <Button
                target="_blank"
                href="https://metalstack.cloud/on-premises"
                className="flex gap-2 items-center mt-10"
                variant="neutral"
                size="md"
              >
                On Premises{" "}
                <Link
                  size="16"
                  className="group-hover:translate-x-0.5 transition-all"
                />
              </Button>
            </div>
          </div>
          <div className="col-span-12 sm:col-span-6 lg:col-span-7 -mb-10 sm:mb-0 mt-10 sm:mt-0 -ml-4 -mr-4">
            <div className="aspect-w-16 aspect-h-9 relative sm:ml-10 rounded-lg overflow-clip sm:-mr-96">
              <img
                className="w-full object-cover h-full"
                src={
                  colorMode.isDarkTheme
                    ? "/img/browser-mockup-dark.png"
                    : "/img/browser-mockup-light.png"
                }
                alt="Screenshot of the user interface of the metalstack.cloud management console."
              />
            </div>
          </div>
        </Container>
      </Row>
    </Section>
  );
}
