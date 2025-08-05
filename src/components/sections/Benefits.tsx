import {
  BareMetalServer,
  ChevronRight,
  DataCenter,
  Security,
  LogoKubernetes,
  NetworkPublic,
  Network_4,
} from "@carbon/icons-react";
import Section from "../../components/Section";
import SectionIntro from "../../components/SectionIntro";
import Usp from "../../components/Usp";
import Container from "../../components/Container";
import Row from "../../components/Row";
import Link from "@docusaurus/Link";

export default function Benefits() {
  return (
    <Section
      id="benefits"
      className="bg-white dark:bg-gradient-to-b dark:from-neutral-900 dark:to-neutral-900"
    >
      <SectionIntro
        title="Cloud superpowers for your servers."
        description="metal-stack enables you to operate your own cloud infrastructure
              on bare-metal servers, making you independent from hyperscalers
              and cloud providers."
      />
      <Row>
        <Container className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
          <Usp
            icon={BareMetalServer}
            title="Bare-Metal"
            description="Manage your servers, switches and firewalling with native hardware performance."
          >
            <p className="flex items-center font-medium mt-4 text-black dark:text-white">
              Find out more{" "}
              <Link to="/docs/why-bare-metal" className="mx-1">
                here
              </Link>
              <ChevronRight />
            </p>
          </Usp>
          <Usp
            icon={DataCenter}
            title="On-Premise"
            description="Maintain data sovereignty and establish connectivity to existing company-internal networks."
          />
          <Usp
            icon={Security}
            title="Security"
            description="With only one cluster per machine, metal-stack offers physical tenant-isolation, reducing the number of attack vectors and eliminating noisy neighbors."
          />
          <Usp
            icon={LogoKubernetes}
            title="Kubernetes as a service"
            description="Together with SAP Gardener create your own managed Kubernetes at scale."
          />
          <Usp
            icon={NetworkPublic}
            title="Open Source"
            description="Prevent vendor-locks and increase your transparency. Reach out and connect to our community."
          />

          <Usp
            icon={Network_4}
            title="BGP Networking"
            description="State-of-the-art networking with routing-to-the-host and load balancing capabilities.
				Right out of the box."
          />
        </Container>
      </Row>
    </Section>
  );
}
