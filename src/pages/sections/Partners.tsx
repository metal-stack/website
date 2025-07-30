import Container from "../components/Container";
import Row from "../components/Row";
import Section from "../components/Section";
import SectionIntro from "../components/SectionIntro";

const partners = [
  {
    src: "/img/partners/fits.svg",
    alt: "FITS",
    href: "https://www.f-i-ts.de/",
  },
  {
    src: "/img/partners/xcellent.svg",
    alt: "x-cellent technologies",
    href: "https://www.x-cellent.com/",
  },
  {
    src: "/img/partners/metalstack-cloud.svg",
    alt: "metalstack.cloud",
    href: "https://metalstack.cloud/",
  },
  {
    src: "/img/partners/uni-innsbruck.png",
    alt: "Universität Innsbruck",
    href: "https://www.uibk.ac.at/",
  },
];

export default function Partners() {
  return (
    <Section
      id="sponsors-adopters"
      className="bg-neutral-100 dark:bg-neutral-950"
    >
      <SectionIntro
        title="Partners and adopters"
        description="We are proud to have the following partners and adopters on board."
      />
      <Row>
        <Container className="!block">
          <div className="flex overflow-x-auto scrollbar relative justify-start items-center gap-x-8 lg:gap-x-16">
            {partners.map((partner) => (
              <a
                href={partner.href}
                target="_blank"
                className="group hover:dark:bg-white transition-all p-4 rounded-md w-2/3 sm:w-auto flex items-center justify-center flex-shrink-0"
              >
                <img
                  src={partner.src}
                  alt=""
                  className="w-auto group-hover:grayscale-0 group-hover:dark:invert-0 h-10 rounded-sm grayscale dark:invert transition-all"
                />
              </a>
            ))}
          </div>
        </Container>
      </Row>
    </Section>
  );
}
