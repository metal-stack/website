import { TabGroup, TabList, TabPanels } from "@headlessui/react";
import Container from "../components/Container";
import Row from "../components/Row";
import Section from "../components/Section";
import SectionIntro from "../components/SectionIntro";
import Tab from "../components/Tab";
import { useState } from "react";
import TabPanel from "../components/TabPanel";

export default function Features() {
  const [selectedIndex, setSelectedIndex] = useState(0);

  return (
    <Section
      id="distinguishing-features"
      className="bg-neutral-100 dark:bg-neutral-950"
    >
      <SectionIntro
        title="Cloud superpowers for your servers."
        description="metal-stack enables you to operate your own cloud infrastructure
                  on bare-metal servers, making you independent from hyperscalers
                  and cloud providers."
      />
      <Row>
        <Container>
          <TabGroup
            selectedIndex={selectedIndex}
            onChange={setSelectedIndex}
            className="w-full"
          >
            <TabList className="p-2 rounded-lg bg-black/5 dark:bg-neutral-900 dark:border-white/10 border overflow-x-auto flex items-center justify-between gap-2">
              <Tab selected={selectedIndex == 0}>No virtualization</Tab>
              <Tab selected={selectedIndex == 1}>Open source</Tab>
              <Tab selected={selectedIndex == 2}>Cost effective</Tab>
            </TabList>
            <TabPanels className="mt-4">
              <TabPanel title="Maximum performance and reliability without a virtualization layer">
                <div className="lg:columns-2 gap-10">
                  <div className="space-y-4">
                    <p>
                      In combination with Kubernetes, the bare-metal approach
                      fully eliminates the need for a hypervisor. As servers can
                      be provisioned within minutes, hardware can be replaced
                      quickly while Kubernetes automatically cares for your
                      applications to run reliably all the time.
                    </p>
                    <p>
                      Our bare-metal design offers physical tenant separation as
                      well as resistency against malicious attacks like Spectre
                      and Meltdown.
                    </p>
                    <p>
                      The rack cabling is part of our solution, too. It is
                      failure redundant and allows to easily scale up and extend
                      your infrastructure with more racks as you grow.
                    </p>
                  </div>
                </div>
                <div className="mt-8 bg-black/5 dark:bg-neutral-800 p-4 rounded-lg">
                  <h5>Built for Kubernetes at heart</h5>
                  <p>
                    Together with our friends from the open-source project
                    Gardener, metal-stack can serve as a cloud provider for
                    delivering bare-metal Kubernetes clusters at scale. We
                    strive for being a serious, on-premise solution to
                    hyperscaler offerings.
                  </p>
                </div>
              </TabPanel>
              <TabPanel
                title="Production-Grade machine provisioning made open source – with software developed and
          driven in Europe"
              >
                <div className="lg:columns-2 gap-10 mt-2 space-y-4">
                  <p dir="auto">
                    For years, we have been using the metal-stack solution
                    successfully on productive, critical infrastructure. We are
                    so proud of this solution that we even created an own cloud
                    offering with it &ndash; we named it&nbsp;
                    <a href="https://metalstack.cloud" target="_blank">
                      metalstack.cloud
                    </a>
                    . Feel free to try out there if you want to experience
                    metal-stack in action.
                  </p>
                  <p dir="auto">
                    We are highly convinced that open source produces
                    sustainable software and are honored to give something back
                    to the public. Our repositories are transparently hosted on
                    Github. As an open-source software, you may adapt and extend
                    metal-stack to your needs with the help of the community.
                  </p>
                  <p dir="auto">
                    Be warmly invited joining our Slack workspace and reach out
                    to us if you are having questions or want to talk.
                  </p>
                </div>
                <div className="mt-8 bg-black/5 dark:bg-neutral-800 p-4 rounded-lg">
                  <h5>Our cloud offering for metal-stack</h5>
                  <p>
                    metalstack.cloud is our hosted version of metal-stack. It is
                    fully managed and provides a ready-made bare-metal cloud
                    solution for running Kubernetes clusters.
                  </p>
                </div>
              </TabPanel>
              <TabPanel title="Unlocking the key to infrastructure automation is a money-saver">
                <div className="lg:columns-2 gap-10 mt-2 space-y-4">
                  <p dir="auto">
                    The API of metal-stack provides hardware for users as
                    self-service. The underlying automation reaches down to the
                    network switch infrastructure and the server hardware. It is
                    self-inventorizing and prevents growing chaos over time. The
                    DevOps-driven data center enables even small platform teams
                    to operate huge infrastructural landscapes while keeping
                    operational costs low.
                  </p>
                  <p dir="auto">
                    In addition to that, managing your own hardware at scale can
                    give you a striking cost-performance ratio as it enables you
                    to scale out rapidly.
                  </p>
                </div>
                <div className="mt-8 bg-black/5 dark:bg-neutral-800 p-4 rounded-lg">
                  <h5>
                    State-of-the-art networking with BGP in the data center
                  </h5>
                  <p>
                    On the switch hardware and the servers, metal-stack is
                    running BGP with routing-to-the-host, offering load
                    balancing capabilities right out of the box.
                  </p>
                  <p className="mt-4">
                    As a special decision in infrastructure architecture, we
                    enforce firewalling on dedicated physical machines before
                    users can reach out of their private tenant network. Say
                    goodbye to large firewalls with outgrowing sets of rules.
                    Instead, let the users manage them directly through
                    Kubernetes with dedicated custom resources.
                  </p>
                </div>
              </TabPanel>
            </TabPanels>
          </TabGroup>
        </Container>
      </Row>
    </Section>
  );
}
